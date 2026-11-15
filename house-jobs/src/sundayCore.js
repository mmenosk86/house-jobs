// Sunday cleaning assignment rules.
//  - Everyone in the pool gets exactly one job; nobody gets two.
//  - No per-job headcount: people are spread evenly over the open jobs.
//  - Kitchen is the one job with a cap: up to KITCHEN_MAX, from the kitchen rotation first.
//  - Jobs already marked done/verified/missed/excused are kept exactly as they are.
export const KITCHEN_ID="sun_kitchen";
export const KITCHEN_MAX=4;
const unique=list=>[...new Set((list||[]).filter(Boolean))];

export function assignSundayJobs({pool,jobs,kitchenTeam=[],existing}){
  const out={},used=new Set(),open=[];
  jobs.forEach(job=>{
    const e=existing?.jobs?.[job.id];
    if(e?.status&&e.status!=="pending"){out[job.id]=e;(e.assigned||[]).forEach(n=>used.add(n));}
    else{open.push(job);out[job.id]={assigned:[],status:"pending"};}
  });
  const people=unique(pool).filter(n=>!used.has(n));
  if(!open.length||!people.length)return out;
  const kitchen=open.find(j=>j.id===KITCHEN_ID),others=open.filter(j=>j!==kitchen);
  let rest=people;
  if(kitchen){
    // Kitchen fills toward 4 but leaves at least one person for every other open job.
    const count=Math.max(1,Math.min(KITCHEN_MAX,people.length-others.length));
    const team=[...kitchenTeam.filter(n=>people.includes(n)),...people.filter(n=>!kitchenTeam.includes(n))].slice(0,count);
    out[kitchen.id].assigned=team;
    rest=people.filter(n=>!team.includes(n));
  }
  // Everyone left goes round-robin over the other jobs, so crews differ by at most one person.
  if(others.length)rest.forEach((n,i)=>out[others[i%others.length].id].assigned.push(n));
  return out;
}

// The pin group (or both) expected at a given Sunday, without duplicate names.
export function sundayPool(week,even,odd){
  return unique(week?.bothGroups?[...even,...odd]:week?.group==="odd"?odd:even);
}

// ─── Cancelling a Sunday (breaks, holidays) ───
// Cancelling slides every later Sunday's plan (pin group + who does which job) one week later, so the
// even/odd order and the kitchen rotation pick up exactly where they left off. The plan that falls off
// the end of the semester is saved on the cancelled week, so restoring puts everything back as it was.
// "Both groups" Sundays and other cancelled Sundays are fixed dates and are skipped over.
// Temp jobs, makeup slots and attendance stay with their date.
const clone=v=>JSON.parse(JSON.stringify(v??null));
const isDateBound=id=>id.startsWith("temp_")||id.startsWith("makeup_");
const planOf=w=>({group:w.group,jobs:Object.fromEntries(Object.entries(w.jobs||{}).filter(([id])=>!isDateBound(id)))});
const withPlan=(w,plan)=>({...w,group:plan.group,jobs:{...Object.fromEntries(Object.entries(w.jobs||{}).filter(([id])=>isDateBound(id))),...clone(plan.jobs)}});
const started=w=>Object.values(w?.jobs||{}).some(j=>j?.status&&j.status!=="pending")||Object.keys(w?.attendance||{}).length>0;
function slideChain(schedule,weeks,week){
  return weeks.slice(weeks.indexOf(week)+1).filter(w=>schedule[w]&&!schedule[w].cancelled&&!schedule[w].bothGroups);
}
export function cancelSunday(input,weeks,week){
  const s=clone(input),cur=s[week];
  if(!cur)throw Error("That Sunday isn't on the schedule.");
  if(cur.cancelled)throw Error("That Sunday is already cancelled.");
  if(started(cur))throw Error("Jobs or attendance are already recorded for this Sunday. Clear them before cancelling.");
  const later=cur.bothGroups?[]:slideChain(s,weeks,week);
  const blocked=later.find(w=>started(s[w]));
  if(blocked)throw Error(`The Sunday of ${blocked} already has work recorded, so the schedule can't slide past it.`);
  const plans=[cur,...later.map(w=>s[w])].map(planOf);
  later.forEach((w,i)=>{s[w]=withPlan(s[w],plans[i]);});
  s[week]={...cur,cancelled:true,cancelledPlan:plans[0],droppedPlan:later.length?plans[plans.length-1]:null,
    jobs:Object.fromEntries(Object.entries(cur.jobs||{}).filter(([id])=>isDateBound(id)))};
  return s;
}
// Undo a cancellation. Returns the schedule plus, if no saved plan exists for the last Sunday, its week label
// so the caller can generate one.
export function restoreSunday(input,weeks,week){
  const s=clone(input),cur=s[week];
  if(!cur?.cancelled)throw Error("That Sunday isn't cancelled.");
  const later=cur.bothGroups?[]:slideChain(s,weeks,week);
  const blocked=later.find(w=>started(s[w]));
  if(blocked)throw Error(`The Sunday of ${blocked} already has work recorded, so the schedule can't slide back past it.`);
  const plans=later.map(w=>planOf(s[w]));
  later.forEach((w,i)=>{s[w]=withPlan(s[w],i+1<plans.length?plans[i+1]:cur.droppedPlan||{group:plans[i]?.group==="even"?"odd":"even",jobs:{}});});
  const{cancelled,cancelledPlan,droppedPlan,...rest}=cur;
  s[week]=withPlan(rest,cancelledPlan||{group:cur.group,jobs:{}});
  return{schedule:s,needsPlan:later.length&&!cur.droppedPlan?later[later.length-1]:null};
}

// Regular jobs plus this week's temp jobs (generated makeup slots are handled separately).
export function sundayJobList(definitions,week){
  return [...definitions,...(week?.tempJobs||[]).filter(t=>!String(t.id).startsWith("makeup_"))];
}
