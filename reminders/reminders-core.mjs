// Who gets which reminder. Pure function (no Firebase), so it can be tested.
export const DEFAULT_SETTINGS={weeklyDueDay:5,weeklyDueTime:"18:00",sundayDueTime:"15:00"};
export const key=s=>String(s).replace(/[.#$/\[\]]/g,"_");
export const clock=t=>{const[h,m]=String(t||"18:00").split(":").map(Number);return`${(h%12)||12}:${String(m||0).padStart(2,"0")} ${h<12?"AM":"PM"}`;};
const list=xs=>xs.length<2?xs[0]:xs.slice(0,-1).join(", ")+" and "+xs[xs.length-1];

// kind: "weekly" | "sunday". rows: assignments for the week; sunday: that week's Sunday record.
// Returns {skip:"reason"} or {messages:[{uid,name,token,title,body,tag}]}.
export function buildReminders({kind,week,weekday,force=false,only="",settings:raw,config,rows,sunday,sundayConfig,tokens}){
  const settings={...DEFAULT_SETTINGS,...(raw||{})};
  const want=String(only||"").trim().toLowerCase();
  const todo=new Map();
  const add=(names,job)=>(names||[]).forEach(n=>{const k=String(n).trim().toLowerCase();if(!want||k===want)todo.set(k,[...(todo.get(k)||[]),job]);});
  let title,bodyFor;
  if(kind==="test"){
    // Test notification to one brother's devices, whether or not he has jobs.
    if(!want)return{skip:"A test needs a name in 'Only send to'."};
    const messages=Object.entries(tokens||{}).filter(([,t])=>t?.token&&String(t.name||"").trim().toLowerCase()===want)
      .map(([uid,t])=>({uid,name:t.name,token:t.token,title:"ΣΦΕ House reminders",body:"Reminders are working on this device. 🎄",tag:"test"}));
    return messages.length?{messages}:{skip:`No devices with reminders turned on for "${only}". Turn them on in the app first.`};
  }
  if(kind==="weekly"){
    if(weekday!==Number(settings.weeklyDueDay)&&!force)return{skip:"Today isn't the weekly due day."};
    const names=Object.fromEntries((config?.jobs||[]).map(j=>[key(j.id),j.name]));
    for(const [id,e] of Object.entries(rows||{}))if(e?.status==="pending")add(e.assigned,names[id]||id);
    title="House job due today";
    bodyFor=jobs=>`Your ${list(jobs)} ${jobs.length>1?"are":"is"} due today at ${clock(settings.weeklyDueTime)}. Mark it done in the app.`;
  }else{
    if(weekday!==6&&!force)return{skip:"Sunday reminders go out on Saturday."};
    if(!sunday||sunday.cancelled)return{skip:`No Sunday cleaning for ${week}.`};
    const names=Object.fromEntries([...(sundayConfig?.sundayJobs||[]),...(sunday.tempJobs||[])].map(j=>[key(j.id),j.name]));
    for(const [id,e] of Object.entries(sunday.jobs||{}))if(e?.status==="pending")add(e.assigned,names[id]||"Sunday makeup");
    title="Sunday cleaning tomorrow";
    bodyFor=jobs=>`You're on ${list(jobs)}. Due ${clock(settings.sundayDueTime)} Sunday.`;
  }
  const messages=[];
  for(const [uid,t] of Object.entries(tokens||{})){
    const jobs=todo.get(String(t?.name||"").trim().toLowerCase());
    if(jobs&&t?.token)messages.push({uid,name:t.name,token:t.token,title,body:bodyFor(jobs),tag:`${kind}-${key(week)}`});
  }
  return{messages};
}

// ─── Manager alerts ───
// Everything that needs the manager: submitted jobs (weekly, Sunday, projects, WOTH/event jobs), pending absence and
// swap requests, open house issues and supply reports. Each item has a stable id and a timestamp.
export function managerItems({config,assignments,sundayAssignments,sundayConfig,weeklyProjects,houseOps,houseIssues}){
  const items=[];
  const weeklyNames=Object.fromEntries((config?.jobs||[]).map(j=>[key(j.id),j.name]));
  const by=p=>p?.submittedBy?` (${p.submittedBy})`:"";
  for(const [wk,rows] of Object.entries(assignments||{}))for(const [id,e] of Object.entries(rows||{}))
    if(e?.status==="done"&&e.proof?.submittedAt)items.push({id:`w:${wk}:${id}:${e.proof.submittedAt}`,ts:e.proof.submittedAt,group:"jobs",text:(weeklyNames[id]||id)+by(e.proof)});
  for(const [wk,row] of Object.entries(sundayAssignments||{})){
    const names=Object.fromEntries([...(sundayConfig?.sundayJobs||[]),...(row?.tempJobs||[])].map(j=>[key(j.id),j.name]));
    for(const [id,e] of Object.entries(row?.jobs||{}))
      if(e?.status==="done"&&e.proof?.submittedAt)items.push({id:`s:${wk}:${id}:${e.proof.submittedAt}`,ts:e.proof.submittedAt,group:"jobs",text:`Sunday ${names[id]||"job"}`+by(e.proof)});
  }
  for(const [wk,row] of Object.entries(weeklyProjects||{}))for(const p of Object.values(row?.projects||{}))
    if(p?.status==="done"&&p.proof?.submittedAt)items.push({id:`p:${wk}:${p.id}:${p.proof.submittedAt}`,ts:p.proof.submittedAt,group:"jobs",text:`Project: ${p.name}`+by(p.proof)});
  for(const [eid,ev] of Object.entries(houseOps?.events||{}))for(const [tid,t] of Object.entries(ev?.tasks||{}))
    if(t?.status==="done"&&t.proof?.submittedAt)items.push({id:`e:${eid}:${tid}:${t.proof.submittedAt}`,ts:t.proof.submittedAt,group:"jobs",text:`${ev.title||"Event"}: ${t.name}`+by(t.proof)});
  for(const [rid,r] of Object.entries(houseOps?.requests||{}))
    if(r?.status==="pending"&&r.createdAt)items.push({id:`r:${rid}`,ts:r.createdAt,group:"requests",text:r.kind==="absence"?`${r.requesterName} absence ${r.start||""}${r.end&&r.end!==r.start?"–"+r.end:""}`.trim():`${r.requesterName} wants to swap with ${r.targetName||"someone"}`});
  for(const [iid,i] of Object.entries(houseIssues||{}))
    if(i&&i.status!=="closed"&&i.createdAt)items.push({id:`i:${i.id??iid}`,ts:i.createdAt,group:"issues",urgent:i.priority==="urgent",text:`${i.priority==="urgent"?"URGENT: ":""}${String(i.description||"Issue").slice(0,70)}${i.location?` (${i.location})`:""}`});
  for(const [sid,s] of Object.entries(houseOps?.supplies||{}))
    if(s?.status==="open"&&s.createdAt)items.push({id:`u:${sid}`,ts:s.createdAt,group:"supplies",text:`${s.item}${s.severity==="out"?" (out)":" (low)"}`});
  return items;
}

const LOOKBACK_MIN=60,REMEMBER_MIN=120; // tolerate phones with slightly wrong clocks and late GitHub runs
// Returns {message|null, state}. state = {cursor, recent:[ids]} kept in the database between runs.
// The first run only records a starting point, so turning this on doesn't send a flood of old items.
export function buildManagerAlert(data,state,now=new Date()){
  const items=managerItems(data);
  const nowIso=now.toISOString();
  const recentCut=new Date(now-REMEMBER_MIN*60000).toISOString();
  const nextState={cursor:nowIso,recent:items.filter(i=>i.ts>recentCut).map(i=>i.id)};
  if(!state?.cursor)return{message:null,state:nextState};
  const since=new Date(new Date(state.cursor)-LOOKBACK_MIN*60000).toISOString();
  const seen=new Set(state.recent||[]);
  const fresh=items.filter(i=>i.ts>since&&!seen.has(i.id)).sort((a,b)=>a.ts.localeCompare(b.ts));
  if(!fresh.length)return{message:null,state:nextState};
  const groups=[["jobs","✓ Submitted"],["requests","📅 Requests"],["issues","⚠️ Issues"],["supplies","📦 Supplies"]];
  const lines=groups.map(([g,label])=>{const xs=fresh.filter(i=>i.group===g);if(!xs.length)return null;
    const shown=xs.slice(0,3).map(i=>i.text).join(", ");return`${label}: ${shown}${xs.length>3?` +${xs.length-3} more`:""}`;}).filter(Boolean);
  const urgent=fresh.some(i=>i.urgent);
  return{message:{title:`${urgent?"Urgent · ":""}House manager: ${fresh.length} new`,body:lines.join("\n"),url:"/?view=manager",tag:`manager-${nowIso}`},state:nextState,count:fresh.length};
}