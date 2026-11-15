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

// Regular jobs plus this week's temp jobs (generated makeup slots are handled separately).
export function sundayJobList(definitions,week){
  return [...definitions,...(week?.tempJobs||[]).filter(t=>!String(t.id).startsWith("makeup_"))];
}
