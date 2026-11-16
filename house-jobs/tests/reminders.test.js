// Who gets which reminder (reminders/reminders-core.mjs). Run with: npm test
import {test} from "node:test";
import assert from "node:assert/strict";
import {buildReminders} from "../../reminders/reminders-core.mjs";

const config={jobs:[{id:"kitchen",name:"Kitchen"},{id:"2bath",name:"2nd Floor Bathroom"},{id:"cups",name:"Big Red Cup Cleaning"}]};
const tokens={u1:{name:"Mason Menosky",token:"t1"},u2:{name:"Reese C",token:"t2"},u3:{name:"Nobody",token:"t3"},u4:{name:"Reese C",token:"t4"}};
const rows={kitchen:{assigned:["Mason Menosky"],status:"pending"},"2bath":{assigned:["Reese C","Mason Menosky"],status:"pending"},cups:{assigned:["Reese C"],status:"done"}};

test("weekly: only on the due day, only pending jobs, every device of that brother",()=>{
  assert.ok(buildReminders({kind:"weekly",week:"11/9-11/15",weekday:4,config,rows,tokens}).skip);
  const {messages}=buildReminders({kind:"weekly",week:"11/9-11/15",weekday:5,config,rows,tokens});
  const mason=messages.find(m=>m.name==="Mason Menosky");
  assert.equal(mason.body,"Your Kitchen and 2nd Floor Bathroom are due today at 6:00 PM. Mark it done in the app.");
  assert.deepEqual(messages.filter(m=>m.name==="Reese C").map(m=>m.token),["t2","t4"]);
  assert.ok(messages.every(m=>!/Cup/.test(m.body)),"finished job reminded");
  assert.ok(!messages.some(m=>m.name==="Nobody"));
});

test("weekly: respects the manager's due day and time",()=>{
  const {messages}=buildReminders({kind:"weekly",week:"w",weekday:3,settings:{weeklyDueDay:3,weeklyDueTime:"21:30"},config,rows,tokens});
  assert.match(messages[0].body,/9:30 PM/);
});

test("sunday: Saturday only, skips cancelled Sundays, names temp jobs",()=>{
  const sunday={jobs:{sun_kitchen:{assigned:["Reese C"],status:"pending"},temp_1:{assigned:["Mason Menosky"],status:"pending"}},tempJobs:[{id:"temp_1",name:"Shovel the porch"}]};
  const sundayConfig={sundayJobs:[{id:"sun_kitchen",name:"Kitchen"}]};
  assert.ok(buildReminders({kind:"sunday",week:"w",weekday:5,sunday,sundayConfig,tokens}).skip);
  assert.ok(buildReminders({kind:"sunday",week:"w",weekday:6,sunday:{...sunday,cancelled:true},sundayConfig,tokens}).skip);
  const {messages}=buildReminders({kind:"sunday",week:"w",weekday:6,sunday,sundayConfig,tokens});
  assert.equal(messages.find(m=>m.name==="Mason Menosky").body,"You're on Shovel the porch. Due 3:00 PM Sunday.");
});

test("--only sends to just that brother",()=>{
  const {messages}=buildReminders({kind:"weekly",week:"w",weekday:5,only:"mason menosky",config,rows,tokens});
  assert.deepEqual(messages.map(m=>m.name),["Mason Menosky"]);
});

test("test kind: sends to that brother's devices even with no jobs, needs a name",()=>{
  assert.ok(buildReminders({kind:"test",week:"w",weekday:2,tokens}).skip);
  assert.ok(buildReminders({kind:"test",week:"w",weekday:2,only:"Nobody Here",tokens}).skip);
  const {messages}=buildReminders({kind:"test",week:"w",weekday:2,only:"reese c",tokens});
  assert.deepEqual(messages.map(m=>m.token),["t2","t4"]);
});
