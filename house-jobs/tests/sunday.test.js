// Sunday cleaning rules: assignment, cancelling a Sunday, makeups. Run with: npm test
import {test} from "node:test";
import assert from "node:assert/strict";
import {assignSundayJobs,cancelSunday,restoreSunday,KITCHEN_MAX} from "../src/sundayCore.js";
import {reconcileMakeups,weekKey} from "../src/houseOpsCore.js";
import {generateSundayAssignments} from "../src/schedule.js";
import {DEFAULT_SUNDAY_JOBS,DEFAULT_EVEN_PINS,DEFAULT_ODD_PINS} from "../src/constants.js";

const sortKeys=v=>Array.isArray(v)?v.map(sortKeys):v&&typeof v==="object"?Object.fromEntries(Object.keys(v).sort().map(k=>[k,sortKeys(v[k])])):v;
const same=(a,b,msg)=>assert.equal(JSON.stringify(sortKeys(a)),JSON.stringify(sortKeys(b)),msg);

for(const size of [5,13,14,23,46]){
  test(`everyone gets exactly one job (${size} people), kitchen ≤ ${KITCHEN_MAX}, crews even`,()=>{
    const people=Array.from({length:size},(_,i)=>"P"+i);
    const out=assignSundayJobs({pool:[...people,people[0]],jobs:DEFAULT_SUNDAY_JOBS,kitchenTeam:people.slice(0,4),
      existing:{jobs:{sun_porch:{assigned:[people[1]],status:"verified"}}}});
    const all=Object.values(out).flatMap(e=>e.assigned);
    assert.equal(all.length,new Set(all).size,"someone has two jobs");
    assert.equal(new Set(all).size,size,"someone was left out");
    assert.ok(out.sun_kitchen.assigned.length<=KITCHEN_MAX);
    assert.deepEqual(out.sun_porch.assigned,[people[1]],"finished job changed");
    const sizes=Object.entries(out).filter(([id])=>!["sun_kitchen","sun_porch"].includes(id)).map(([,e])=>e.assigned.length);
    assert.ok(Math.max(...sizes)-Math.min(...sizes)<=1,`uneven crews ${sizes}`);
  });
}

test("a fresh semester alternates even and odd pins",()=>{
  const weeks=["9/1-9/7","9/8-9/14","9/15-9/21","9/22-9/28"];
  const s=generateSundayAssignments(DEFAULT_EVEN_PINS,DEFAULT_ODD_PINS,DEFAULT_SUNDAY_JOBS,weeks);
  assert.deepEqual(weeks.map(w=>s[w].group),["even","odd","even","odd"]);
});

const weeks=["11/9-11/15","11/16-11/22","11/23-11/29","11/30-12/6","12/7-12/13"];
const plan=(group,k)=>({group,bothGroups:false,jobs:{sun_kitchen:{assigned:[k+"1",k+"2"],status:"pending"},sun_trash:{assigned:[k+"3"],status:"pending"}}});
const schedule={
  [weeks[0]]:{...plan("even","A"),jobs:{sun_kitchen:{assigned:["A1"],status:"verified"}}},
  [weeks[1]]:plan("odd","B"),[weeks[2]]:plan("even","C"),[weeks[3]]:plan("odd","D"),
  [weeks[4]]:{...plan("even","E"),tempJobs:[{id:"temp_1",name:"Gutters"}],jobs:{...plan("even","E").jobs,temp_1:{assigned:["X"],status:"pending"}}},
};

test("cancelling a Sunday slides later plans one week, keeping the order",()=>{
  const c=cancelSunday(schedule,weeks,weeks[1]);
  assert.ok(c[weeks[1]].cancelled);
  assert.equal(c[weeks[2]].group,"odd");assert.deepEqual(c[weeks[2]].jobs.sun_kitchen.assigned,["B1","B2"]);
  assert.equal(c[weeks[3]].group,"even");assert.equal(c[weeks[4]].group,"odd");
  assert.deepEqual(c[weeks[4]].jobs.temp_1.assigned,["X"],"temp job should stay on its date");
  same(c[weeks[0]],schedule[weeks[0]],"earlier week changed");
});

test("restoring a cancelled Sunday puts everything back exactly",()=>{
  const r=restoreSunday(cancelSunday(schedule,weeks,weeks[1]),weeks,weeks[1]);
  for(const w of weeks)same(r.schedule[w],schedule[w],w);
  assert.equal(r.needsPlan,null);
});

test("a Sunday with finished jobs can't be cancelled",()=>{
  assert.throws(()=>cancelSunday(schedule,weeks,weeks[0]));
});

test("makeups skip a cancelled Sunday",()=>{
  const c=cancelSunday(schedule,weeks,weeks[1]);
  c[weeks[0]]={...c[weeks[0]],attendance:{x:{name:"Z",status:"absent"}}};
  const stored=Object.fromEntries(Object.entries(c).map(([k,v])=>[weekKey(k),v]));
  const m=reconcileMakeups(stored,weeks,DEFAULT_SUNDAY_JOBS);
  assert.ok(!(m[weekKey(weeks[1])].makeups||[]).includes("Z"));
  assert.ok((m[weekKey(weeks[2])].makeups||[]).includes("Z"));
});
