// Weekly house job assignment rules.
//  - Nobody gets more than one weekly job in the same week.
//  - No job ever has more than MAX_PER_JOB people.
//  - Chairs (e.g. kitchen chair, library chair) always do their own job and nothing else.
//  - Manager assignments ("locks") pin names to a job for a range of weeks; reshuffles keep them.
//  - Floor-rotate jobs draw from brothers on that floor; rotating jobs draw from everyone each week;
//    other jobs keep the same people all semester when possible.
//  - Jobs that are already done/verified/missed/excused are never changed.

export const MAX_PER_JOB=2;
const AREA_TO_FLOOR={basement:"basement",first:"first",second:"second",third:"third"};

export const crewSize=job=>Math.max(1,Math.min(MAX_PER_JOB,Number(job?.people)||1));
const asBrothers=list=>(list||[]).map(b=>typeof b==="string"?{name:b,floor:"first"}:b);
const shuffle=list=>{const a=[...list];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};

export function locksForWeek(locks,weeks,week){
  const idx=weeks.indexOf(week);
  return (locks||[]).filter(l=>{const s=weeks.indexOf(l.start),e=weeks.indexOf(l.end);return s>=0&&idx>=s&&idx<=(e<0?weeks.length-1:e);});
}

// Counts how often each person has had each job (and any job) in the given weeks, for fairness.
function tally(assignments,weeks){
  const perJob={},total={};
  weeks.forEach(w=>Object.entries(assignments?.[w]||{}).forEach(([id,e])=>(e?.assigned||[]).forEach(n=>{
    perJob[n]??={};perJob[n][id]=(perJob[n][id]||0)+1;total[n]=(total[n]||0)+1;
  })));
  return{perJob,total};
}

// Builds one week. With repair=true, existing pending assignments are kept where they still follow
// the rules and only the gaps are filled; otherwise pending jobs are picked fresh.
function buildWeek({week,prevWeek,jobs,brothers,chairs,locks,weeks,existing,repair,stats,steady}){
  const out={},used=new Set(),bros=asBrothers(brothers),all=bros.map(b=>b.name);
  const byFloor={};bros.forEach(b=>{(byFloor[b.floor]??=[]).push(b.name);});
  const take=(id,names)=>{const fresh=names.filter(n=>n&&!used.has(n));fresh.forEach(n=>used.add(n));return fresh;};
  const pending=[];

  // 1. Finished/reviewed jobs stay exactly as they are.
  jobs.forEach(job=>{
    const e=existing?.[job.id];
    if(e&&e.status&&e.status!=="pending"){out[job.id]=e;(e.assigned||[]).forEach(n=>used.add(n));}
    else pending.push(job);
  });
  // 2. Manager assignments for this week, then 3. chairs.
  const active=locksForWeek(locks,weeks,week);
  const lockFor=id=>active.filter(l=>l.jobId===id).pop();
  const fixed=new Set();
  pending.forEach(job=>{const l=lockFor(job.id);if(l){out[job.id]={assigned:take(job.id,(l.names||[]).slice(0,MAX_PER_JOB)),status:"pending"};fixed.add(job.id);}});
  pending.forEach(job=>{if(!fixed.has(job.id)&&chairs?.[job.id]){out[job.id]={assigned:take(job.id,[chairs[job.id]]),status:"pending"};fixed.add(job.id);}});
  // Chairs never pick up a second job, even in weeks where their own job is locked to someone else.
  Object.values(chairs||{}).forEach(n=>n&&used.add(n));

  // 4. Everyone else. Semester-long jobs first (so the same people keep them), then floor jobs, then rotating.
  const mode=job=>job.floorRotate?1:job.rotating?2:0;
  const open=pending.filter(j=>!fixed.has(j.id)).sort((a,b)=>mode(a)-mode(b));
  const prevJob={};Object.entries(prevWeek||{}).forEach(([id,e])=>(e?.assigned||[]).forEach(n=>{prevJob[n]=id;}));
  const order=shuffle(all);
  const rank=(job,n)=>[(stats.perJob[n]?.[job.id]||0)+(prevJob[n]===job.id?100:0),stats.total[n]||0,order.indexOf(n)];
  const better=(job)=>(a,b)=>{const x=rank(job,a),y=rank(job,b);return x[0]-y[0]||x[1]-y[1]||x[2]-y[2];};
  open.forEach(job=>{
    const floor=job.floorRotate||!job.rotating?AREA_TO_FLOOR[job.area]:null;
    const pool=floor&&byFloor[floor]?.length?byFloor[floor]:all;
    let keep=[];
    if(repair)keep=existing?.[job.id]?.assigned||[];
    else if(!job.rotating&&!job.floorRotate)keep=steady[job.id]||[];
    const assigned=take(job.id,keep.slice(0,crewSize(job)));
    const free=list=>list.filter(n=>!used.has(n)).sort(better(job));
    // Fill from the job's own pool first, then from anyone free so the job still gets done.
    while(assigned.length<crewSize(job)){const next=free(pool)[0]??free(all)[0];if(!next)break;assigned.push(next);used.add(next);}
    out[job.id]={assigned,status:"pending"};
    if(!job.rotating&&!job.floorRotate&&assigned.length)steady[job.id]=assigned;
  });
  // Count this week for fairness in the weeks that follow.
  Object.entries(out).forEach(([id,e])=>(e.assigned||[]).forEach(n=>{stats.perJob[n]??={};stats.perJob[n][id]=(stats.perJob[n][id]||0)+1;stats.total[n]=(stats.total[n]||0)+1;}));
  return out;
}

// Regenerates weeks fromIdx..end. Earlier weeks are copied unchanged.
// repairTo: weeks fromIdx..repairTo are repaired (keep current people where valid) instead of reshuffled,
// and weeks after repairTo are copied unchanged.
export function scheduleWeekly({brothers,jobs,weeks,chairs={},locks=[],existing={},fromIdx=0,repairTo=null}){
  const out={},stats=tally(existing,weeks.slice(0,fromIdx)),steady={};
  // Semester-long jobs continue with whoever had them the week before the reshuffle point.
  const before=existing?.[weeks[fromIdx-1]];
  jobs.forEach(j=>{if(!j.rotating&&!j.floorRotate&&before?.[j.id]?.assigned?.length)steady[j.id]=before[j.id].assigned;});
  weeks.forEach((week,i)=>{
    if(i<fromIdx||(repairTo!==null&&i>repairTo)){if(existing?.[week])out[week]=existing[week];return;}
    out[week]=buildWeek({week,prevWeek:i>0?out[weeks[i-1]]:null,jobs,brothers,chairs,locks,weeks,existing:existing?.[week],repair:repairTo!==null,stats,steady});
  });
  return out;
}
