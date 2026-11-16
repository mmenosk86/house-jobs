import {useState,useEffect} from "react";
import {STATUS_CONFIG,DIFF_COLORS} from "./constants.js";
import {tint} from "./theme.js";
import {formatDue} from "./dates.js";

// Small shared UI pieces: badges, buttons, nav icons and the My jobs task list.
// ─── COMPONENTS ───
export function StatusBadge({status,onClick,disabled}){const c=STATUS_CONFIG[status]||STATUS_CONFIG.pending;return<button onClick={disabled?undefined:onClick} style={{background:c.bg,border:`1.5px solid ${c.border}`,color:c.text,borderRadius:999,padding:"6px 12px",minHeight:34,fontSize:12,fontWeight:700,whiteSpace:"nowrap",cursor:disabled?"default":"pointer",fontFamily:"inherit",opacity:disabled?.7:1}}>{c.label}</button>;}
export function Input({value,onChange,placeholder,style,type="text"}){return<input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{background:"var(--field)",border:"1px solid var(--line)",color:"var(--ink)",borderRadius:8,padding:"10px 14px",fontSize:14,fontFamily:"inherit",width:"100%",outline:"none",...style}} onFocus={e=>e.target.style.borderColor="var(--gold)"} onBlur={e=>e.target.style.borderColor="var(--line)"}/>;}
export function SmallBtn({children,onClick,color="var(--gold)"}){return<button onClick={onClick} style={{background:tint(color,9),border:`1px solid ${tint(color,31)}`,color,borderRadius:8,padding:"8px 14px",minHeight:38,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>{children}</button>;}
export function SyncDot({connected}){return<div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:7,height:7,borderRadius:"50%",background:connected?"var(--gold)":"var(--red)",boxShadow:connected?"0 0 6px color-mix(in srgb, var(--gold) 50%, transparent)":"0 0 6px color-mix(in srgb, var(--red) 50%, transparent)"}}/><span style={{fontSize:10,color:"var(--muted)",fontFamily:"'Space Mono',monospace"}}>{connected?"LIVE":"LOCAL"}</span></div>;}
export function GroupBadge({group,bothGroups}){if(bothGroups)return<span style={{fontSize:11,fontWeight:700,color:"var(--amber)",background:"color-mix(in srgb, var(--amber) 9%, transparent)",padding:"2px 8px",borderRadius:4,border:"1px solid color-mix(in srgb, var(--amber) 19%, transparent)"}}>BOTH GROUPS</span>;const e=group==="even";return<span style={{fontSize:11,fontWeight:700,color:e?"var(--purple)":"var(--cyan)",background:e?"color-mix(in srgb, var(--purple) 9%, transparent)":"color-mix(in srgb, var(--cyan) 9%, transparent)",padding:"2px 8px",borderRadius:4,border:`1px solid ${e?"color-mix(in srgb, var(--purple) 19%, transparent)":"color-mix(in srgb, var(--cyan) 19%, transparent)"}`}}>{e?"EVEN PINS":"ODD PINS"}</span>;}
export function DiffBadge({d}){const c=DIFF_COLORS[d]||DIFF_COLORS.easy;return<span style={{fontSize:10,fontWeight:700,color:c.color,background:c.bg,padding:"1px 7px",borderRadius:4,border:`1px solid ${c.border}`}}>{d==="easy"?"1 PT":"2 PTS"}</span>;}


export const HOUSE_TABS=[{key:"me",label:"My jobs",icon:"check"},{key:"house",label:"House",icon:"home"},{key:"woth",label:"WOTH",icon:"hammer"},{key:"projects",label:"Projects",icon:"star"},{key:"issues",label:"Report",icon:"alert"},{key:"manager",label:"Manager",icon:"gear"}];
// Simple line icons for the tab bar (24×24, stroke = currentColor).
export const NAV_ICON_PATHS={
  check:"M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9",
  home:"M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z",
  hammer:"M14 4l6 6-3 3-6-6zM11 7l-8 8a2.1 2.1 0 0 0 3 3l8-8",
  star:"M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z",
  alert:"M12 3 2 20h20zM12 10v4M12 17.5v.01",
  gear:"M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z",
};
export function NavIcon({name}){return<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={NAV_ICON_PATHS[name]}/></svg>;}
// House sub-pages get a "‹ House" back link.
export const HOUSE_SUBVIEWS=["dashboard","sunday","roster","leaderboard","requests","supplies","maintenance","emergency"];
export const TASK_LABELS={pending:"To do",claimed:"In progress",done:"In review",verified:"Verified",missed:"Missed",excused:"Excused"};

export function TaskFocus({tasks,name,week,onComplete,onProjects}){
  const [filter,setFilter]=useState("active"),[query,setQuery]=useState("");
  const [checks,setChecks]=useState(()=>{try{return JSON.parse(localStorage.getItem("housejobs:checklists:v1")||"{}");}catch{return{};}});
  const [notice,setNotice]=useState("");
  const active=tasks.filter(t=>["pending","claimed"].includes(t.entry.status));
  const shown=tasks.filter(t=>(filter==="all"||filter==="active"&&["pending","claimed"].includes(t.entry.status)||filter==="review"&&t.entry.status==="done"||filter==="verified"&&t.entry.status==="verified")&&(t.name+" "+t.desc).toLowerCase().includes(query.toLowerCase()));
  const reviewed=tasks.filter(t=>t.entry.status==="verified").length;
  function toggle(key){
    const next={...checks,[key]:!checks[key]};setChecks(next);
    try{localStorage.setItem("housejobs:checklists:v1",JSON.stringify(next));}catch{setNotice("Checklist cannot be saved on this device.");}
  }
  async function copy(){
    const summary=[name+" — "+week,...tasks.map(t=>TASK_LABELS[t.entry.status]+": "+t.name+(t.due?" · "+formatDue(t.due):""))].join("\n");
    try{await navigator.clipboard.writeText(summary);setNotice("Your job list was copied.");}catch{setNotice("Copy is unavailable in this browser.");}
  }
  return <section className="focus-workspace">
    <div className="focus-hero"><div className="eyebrow">ASSIGNMENT SUMMARY</div><h2>{active.length?active.length+" incomplete assignment"+(active.length===1?"":"s"):tasks.length?"No incomplete assignments":"No assignments this week."}</h2><p>{tasks.length?reviewed+" verified · "+tasks.filter(t=>t.entry.status==="done").length+" awaiting review":"No assignments for the selected week."}</p><div className="progress-track"><div style={{width:(tasks.length?reviewed/tasks.length*100:0)+"%"}}/></div><div className="focus-actions"><button onClick={copy}>Copy my list</button><button onClick={onProjects}>View projects</button></div></div>
    <div className="task-toolbar"><label className="sr-only" htmlFor="task-search">Search your jobs</label><input id="task-search" placeholder="Search your jobs…" value={query} onChange={e=>setQuery(e.target.value)}/><div className="filter-pills">{[["active","To do"],["review","In review"],["verified","Verified"],["all","All"]].map(([key,label])=><button key={key} aria-pressed={filter===key} onClick={()=>setFilter(key)}>{label}</button>)}</div></div>
    <div role="status" className="quiet">{notice}</div>
    {!shown.length&&<div className="empty-card">{query?"No jobs match that search.":filter==="active"?"No incomplete jobs. Submitted jobs appear under In review.":"No jobs in this view."}</div>}
    {shown.map(t=>{
      const steps=String(t.desc||"").split(/[\n,;]+/).map(x=>x.trim()).filter(Boolean);
      const key=JSON.stringify([name,week,t.type,t.id]);
      const actionable=["pending","claimed"].includes(t.entry.status);
      const late=actionable&&t.due&&t.due<new Date();
      return <article className="task-card" key={key}><div className="task-top"><span className="eyebrow">{t.type==="sunday"?"SUNDAY CLEANING":t.type==="project"?"HOUSE PROJECT":"WEEKLY JOB"}</span><span className={"task-status "+t.entry.status}>{TASK_LABELS[t.entry.status]||t.entry.status}</span></div><h3>{t.name}</h3><p className={late?"late":"quiet"}>{t.due?(late?"Overdue · ":"Due ")+formatDue(t.due):"No deadline set"}</p>{t.entry.assigned?.length>1&&<p className="quiet">Team: {t.entry.assigned.join(", ")}</p>}{t.entry.rejectionNote&&actionable&&<p className="return-note">Manager note: {t.entry.rejectionNote}</p>}
      {steps.length>0&&<details><summary>Cleaning checklist · {steps.filter((x,i)=>checks[key+":"+i+":"+x]).length}/{steps.length}</summary><p className="quiet">Personal checklist, saved on this device. Submit below when the job is done.</p>{steps.map((step,i)=><label className="check-row" key={i}><input type="checkbox" checked={!!checks[key+":"+i+":"+step]} onChange={()=>toggle(key+":"+i+":"+step)}/><span>{step}</span></label>)}</details>}
      {actionable?<button className="primary-action" onClick={()=>onComplete(t)}>Submit completed work →</button>:<p className="quiet">{t.entry.status==="done"?"Awaiting manager review.":t.entry.status==="verified"?"Verified by manager.":t.entry.status==="excused"?"Cleared by manager — nothing to do.":"Contact your house manager about this assignment."}</p>}
      </article>;
    })}
  </section>;
}

// "Add to home screen" banner for phones. Android/Chrome gets a one-tap install button; iPhone gets the
// two-step Share → Add to Home Screen hint. Hidden once installed or dismissed on this device.
export function InstallBanner(){
  const standalone=typeof window!=="undefined"&&(window.matchMedia?.("(display-mode: standalone)").matches||window.navigator.standalone);
  const ios=typeof navigator!=="undefined"&&/iphone|ipad|ipod/i.test(navigator.userAgent);
  const[prompt,setPrompt]=useState(null);
  const[dismissed,setDismissed]=useState(()=>{try{return localStorage.getItem("housejobs:install-dismissed")==="1";}catch{return false;}});
  useEffect(()=>{const grab=e=>{e.preventDefault();setPrompt(e);};window.addEventListener("beforeinstallprompt",grab);return()=>window.removeEventListener("beforeinstallprompt",grab);},[]);
  if(standalone||dismissed||(!prompt&&!ios))return null;
  const dismiss=()=>{setDismissed(true);try{localStorage.setItem("housejobs:install-dismissed","1");}catch{}};
  return <div className="install-banner" role="region" aria-label="Install the app">
    <img src="/icons/icon-192.png" alt="" width="44" height="44"/>
    <div style={{flex:1,minWidth:0}}><strong>Get the House Jobs app</strong>
      <p>{prompt?"Install it for one-tap access and job reminders.":<>Tap <b>Share</b> <span aria-hidden="true">⎋</span> then <b>Add to Home Screen</b>.</>}</p></div>
    {prompt&&<button className="install-go" onClick={async()=>{prompt.prompt();await prompt.userChoice.catch(()=>{});setPrompt(null);}}>Install</button>}
    <button className="install-x" aria-label="Dismiss" onClick={dismiss}>×</button>
  </div>;
}