// Manager alert digest (reminders/reminders-core.mjs). Run with: npm test
import {test} from "node:test";
import assert from "node:assert/strict";
import {buildManagerAlert} from "../../reminders/reminders-core.mjs";

const t0=new Date("2026-11-20T18:00:00Z");
const mins=m=>new Date(t0.getTime()+m*60000).toISOString();
const data=()=>({
  config:{jobs:[{id:"kitchen",name:"Kitchen"}]},
  assignments:{"11_16-11_22":{kitchen:{status:"done",proof:{submittedAt:mins(5),submittedBy:"Reese C"}}}},
  sundayAssignments:{},sundayConfig:{sundayJobs:[]},weeklyProjects:{},
  houseOps:{requests:{r1:{kind:"absence",status:"pending",requesterName:"Nate B",start:"2026-11-22",end:"2026-11-22",createdAt:mins(8)}},supplies:{}},
  houseIssues:{a:{id:1,status:"open",priority:"urgent",description:"Leak under the 2nd floor sink",createdAt:mins(9)}},
});

test("first run only starts the clock",()=>{
  const r=buildManagerAlert(data(),null,new Date(mins(10)));
  assert.equal(r.message,null);assert.ok(r.state.cursor);
});

test("new items are grouped into one alert, urgent first in the title",()=>{
  const r=buildManagerAlert(data(),{cursor:mins(0),recent:[]},new Date(mins(15)));
  assert.equal(r.count,3);
  assert.match(r.message.title,/^Urgent · House manager: 3 new/);
  assert.match(r.message.body,/Submitted: Kitchen \(Reese C\)/);
  assert.match(r.message.body,/Requests: Nate B absence 2026-11-22/);
  assert.match(r.message.body,/URGENT: Leak/);
  assert.equal(r.message.url,"/?view=manager");
});

test("the same items aren't sent twice on the next run",()=>{
  const first=buildManagerAlert(data(),{cursor:mins(0),recent:[]},new Date(mins(15)));
  const second=buildManagerAlert(data(),first.state,new Date(mins(30)));
  assert.equal(second.message,null);
});

test("finished or reviewed items don't alert",()=>{
  const d=data();d.assignments["11_16-11_22"].kitchen.status="verified";d.houseOps.requests.r1.status="approved";d.houseIssues.a.status="closed";
  assert.equal(buildManagerAlert(d,{cursor:mins(0),recent:[]},new Date(mins(15))).message,null);
});
