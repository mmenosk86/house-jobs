// Week detection and week label generation. Run with: npm test
import {test} from "node:test";
import assert from "node:assert/strict";
import {detectCurrentWeek,generateWeekLabels} from "../src/dates.js";

const fall=["11/2-11/8","11/9-11/15","11/30-12/6","12/7-12/13","12/29-1/4"];
const on=(y,m,d)=>new Date(y,m-1,d,12);

test("finds the week containing today",()=>{
  assert.equal(detectCurrentWeek(fall,on(2026,11,12)),1);
});
test("during an unlisted break week, stays on the most recent week",()=>{
  assert.equal(detectCurrentWeek(fall,on(2026,11,25)),1);
});
test("handles a week that crosses New Year",()=>{
  assert.equal(detectCurrentWeek(fall,on(2026,12,31)),4);
  assert.equal(detectCurrentWeek(fall,on(2027,1,2)),4);
});
test("after the semester, stays on the last week",()=>{
  assert.equal(detectCurrentWeek(["9/1-9/7","9/8-9/14"],on(2026,10,1)),1);
});
test("generates Monday–Sunday labels and skips break weeks",()=>{
  assert.deepEqual(generateWeekLabels("2027-01-11","2027-02-07","2027-01-26"),["1/11-1/17","1/18-1/24","2/1-2/7"]);
});
