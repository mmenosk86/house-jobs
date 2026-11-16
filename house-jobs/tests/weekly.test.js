// Weekly house job rules. Run with: npm test
import {test} from "node:test";
import assert from "node:assert/strict";
import {scheduleWeekly,MAX_PER_JOB} from "../src/weeklyCore.js";
import {DEFAULT_BROTHERS,DEFAULT_JOBS} from "../src/constants.js";

const weeks=Array.from({length:15},(_,i)=>"w"+i);
const chairs={kitchen:"Mason M",library:"Aiden"};
const locks=[{id:"x",jobId:"pool",names:["Cole"],start:"w3",end:"w5"}];
const everyone=week=>Object.values(week).flatMap(e=>e.assigned||[]);

test("nobody gets two weekly jobs in the same week, and no job has more than 2 people",()=>{
  const s=scheduleWeekly({brothers:DEFAULT_BROTHERS,jobs:DEFAULT_JOBS,weeks,chairs,locks});
  for(const w of weeks){
    const all=everyone(s[w]);
    assert.equal(all.length,new Set(all).size,`${w} has someone twice`);
    for(const [id,e] of Object.entries(s[w]))assert.ok(e.assigned.length<=MAX_PER_JOB,`${w} ${id} has ${e.assigned.length}`);
  }
});

test("chairs always do their own job and nothing else",()=>{
  const s=scheduleWeekly({brothers:DEFAULT_BROTHERS,jobs:DEFAULT_JOBS,weeks,chairs});
  for(const w of weeks){
    assert.deepEqual(s[w].kitchen.assigned,["Mason M"]);
    assert.deepEqual(s[w].library.assigned,["Aiden"]);
  }
});

test("manager assignments hold for their weeks",()=>{
  const s=scheduleWeekly({brothers:DEFAULT_BROTHERS,jobs:DEFAULT_JOBS,weeks,chairs,locks});
  for(const w of ["w3","w4","w5"])assert.deepEqual(s[w].pool.assigned,["Cole"]);
});

test("reshuffling keeps earlier weeks and finished jobs",()=>{
  const s=scheduleWeekly({brothers:DEFAULT_BROTHERS,jobs:DEFAULT_JOBS,weeks,chairs,locks});
  s.w6.front={...s.w6.front,status:"done"};
  const r=scheduleWeekly({brothers:DEFAULT_BROTHERS,jobs:DEFAULT_JOBS,weeks,chairs,locks,existing:s,fromIdx:6});
  assert.deepEqual(r.w2,s.w2);
  assert.deepEqual(r.w6.front,s.w6.front);
  const all=everyone(r.w6);assert.equal(all.length,new Set(all).size);
});
