import {PROJECTS_PER_WEEK} from "./constants.js";
import {scheduleWeekly} from "./weeklyCore.js";
import {KITCHEN_ID,KITCHEN_MAX,assignSundayJobs,sundayPool,sundayJobList} from "./sundayCore.js";

// Building the weekly, Sunday and project schedules (the rules themselves live in weeklyCore.js / sundayCore.js).
export function shuffle(arr) { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }

export function getBrotherNames(brothers){ return brothers.map(b=>typeof b==="string"?b:b.name); }

// Fresh weekly schedule for the whole semester; rules live in weeklyCore.js.
export function generateAssignments(brothers,jobs,weeks,chairs={},locks=[]){return scheduleWeekly({brothers,jobs,weeks,chairs,locks});}

export function kitchenPoolKey(pool){return[...new Set(pool)].sort().join("|");}
export function pickKitchenTeam(pool,count,history=[]){
  if(!pool.length||count<=0)return[];
  const usage={}; pool.forEach(name=>{usage[name]=0;});
  history.forEach(name=>{if(usage[name]!==undefined)usage[name]++;});
  const unused=pool.filter(name=>!history.includes(name));
  const candidates=unused.length>=count?shuffle(unused):shuffle(pool).sort((a,b)=>(usage[a]||0)-(usage[b]||0));
  return candidates.slice(0,count);
}
// existing: current schedule, so weeks keep their pin group and finished jobs stay put.
export function generateSundayAssignments(ep,op,sj,weeks,existing={}){
  const asg={},kitchenHistory={};
  let active=0; // cancelled Sundays don't count toward the even/odd alternation
  weeks.forEach(week=>{
    const prev=existing?.[week];
    if(prev?.cancelled){asg[week]=prev;return;}
    const turn=active++%2===0?"even":"odd";
    const wa=prev?{...prev,group:prev.group||turn,bothGroups:!!prev.bothGroups}:{group:turn,bothGroups:false,jobs:{}};
    const pool=shuffle(sundayPool(wa,ep,op)),key=kitchenPoolKey(pool),history=kitchenHistory[key]||[];
    const kitchenTeam=pickKitchenTeam(pool,KITCHEN_MAX,history);
    wa.jobs=assignSundayJobs({pool,jobs:sundayJobList(sj,wa),kitchenTeam,existing:prev});
    kitchenHistory[key]=[...history,...(wa.jobs[KITCHEN_ID]?.assigned||[])];
    asg[week]=wa;
  });
  return asg;
}
export function getKitchenHistory(assignments,weeks,targetWeek,pool){
  const targetIndex=weeks.indexOf(targetWeek); if(targetIndex<0)return[];
  const names=new Set(pool),history=[];
  weeks.slice(0,targetIndex).forEach(week=>{
    const assigned=assignments?.[week]?.jobs?.sun_kitchen?.assigned||[];
    assigned.forEach(name=>{if(names.has(name))history.push(name);});
  });
  return history;
}
export function regenerateSundayWeek(wa,ep,op,sj,history=[]){
  if(wa?.cancelled)return wa;
  const pool=shuffle(sundayPool(wa,ep,op));
  const jobs=assignSundayJobs({pool,jobs:sundayJobList(sj,wa),kitchenTeam:pickKitchenTeam(pool,KITCHEN_MAX,history),existing:wa});
  // Keep generated makeup slots; their people are not in this week's pin group.
  Object.entries(wa.jobs||{}).forEach(([id,job])=>{if(id.startsWith("makeup_"))jobs[id]=job;});
  return{...wa,jobs};
}

export function generateWeeklyProjects(projects, weeks) {
  const available=[...projects]; const wp={};
  const shuffled=shuffle(available);
  // Sort easy first so weekly picks tend to be doable
  const easy=shuffled.filter(p=>p.difficulty==="easy");
  const medium=shuffled.filter(p=>p.difficulty==="medium");
  const sorted=[...easy,...medium];
  let idx=0;
  weeks.forEach(week=>{
    const picks=[];
    for(let i=0;i<PROJECTS_PER_WEEK&&idx<sorted.length;i++){picks.push({...sorted[idx],status:"available",claimedBy:null,completedBy:null});idx++;}
    wp[week]={projects:picks};
  });
  return wp;
}
