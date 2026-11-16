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
