import {useEffect,useState} from "react";
import {keyOf,weekKey,unique,expectedNames,setAttendance,approveRequest,completeMaintenance,autoAssignEvent} from "./houseOpsCore.js";

const today=()=>new Date().toLocaleDateString("en-CA");
const stamp=()=>new Date().toISOString();
const newId=()=>globalThis.crypto.randomUUID();
const rows=data=>Object.entries(data||{}).map(([id,value])=>({...value,id}));
export function useHouseOperations(api,connected,uid){
  const[data,setData]=useState({}),[error,setError]=useState(""),[busy,setBusy]=useState(false);
  useEffect(()=>{setData({});if(!connected||!uid)return;let active=true,off;
    api.subscribe("houseOps",v=>{if(active){setData(v||{});setError("");}},e=>active&&setError(e.message)).then(fn=>{if(active)off=fn;else fn();}).catch(e=>active&&setError(e.message));
    return()=>{active=false;off?.();};
  },[api,connected,uid]);
  async function run(action){if(busy)return false;setError("");if(!connected||!uid){setError("Connect to Firebase before saving. No change was saved.");return false;}setBusy(true);try{await action();return true;}catch(e){setError(e.message||"Could not save. Try again.");return false;}finally{setBusy(false);}}
  // Errors thrown inside a Firebase transaction updater are not reliably surfaced (a throw during a
  // server-driven retry can leave the promise hanging), so capture them, abort, and rethrow afterwards.
  async function transact(path,fn){
    const existing=await api.get(path);if(!existing)throw Error("This record no longer exists. Refresh and try again.");
    let failure=null;
    const result=await api.transaction(path,current=>{failure=null;if(current==null)return current;try{return fn(current);}catch(e){failure=e;return undefined;}});
    if(failure)throw failure;
    if(!result?.committed||!result.snapshot?.exists())throw Error("The record changed. Refresh and try again.");
    return result;
  }
  return{data,error,busy,run,api,uid,transact};
}
function Shell({ops,children}){return <section className="ops"><style>{`
.ops{margin:16px 0;color:#e2e8f0;min-width:0}.ops h2{font-size:23px;margin-bottom:12px}.ops h3{font-size:16px;margin-bottom:10px}.ops p{font-size:13px;line-height:1.5;margin:8px 0;color:#b4bfd1}.ops article,.ops form,.ops .panel{background:#1c2332;border:1px solid #364258;border-radius:12px;padding:16px;margin:12px 0;min-width:0;overflow-wrap:anywhere}.ops label{display:block;font-size:13px;margin:10px 0}.ops input:not([type=checkbox]),.ops select,.ops textarea{display:block;width:100%;max-width:100%;min-width:0;background:#101720;color:#f1f5f9;border:1px solid #526077;border-radius:7px;padding:10px;font:inherit;margin-top:5px;min-height:44px}.ops textarea{resize:vertical}.ops button{min-height:44px;border:1px solid #53617a;border-radius:8px;background:#29354a;color:#f1f5f9;padding:8px 12px;font:inherit;font-size:13px;cursor:pointer}.ops button:disabled{opacity:.45;cursor:not-allowed}.ops .actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.ops .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:12px}.ops .names{max-height:210px;overflow:auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:4px}.ops .names label{padding:6px;display:flex;align-items:center;gap:8px;margin:0;min-height:44px}.ops input[type=checkbox]{width:20px;height:20px;flex-shrink:0}.ops .error{background:#502536;color:#ffd3d9;border-radius:8px;padding:12px}.ops small{color:#b4bfd1}.ops .roll{display:grid;grid-template-columns:minmax(100px,1fr) minmax(150px,1fr);align-items:center;gap:10px;border-top:1px solid #364258;padding:8px 0}.ops details{margin:12px 0}.ops summary{cursor:pointer;min-height:44px;padding:12px 0}.ops .pill{font-size:12px;background:#111b2a;border-radius:8px;padding:5px 8px;display:inline-block}.ops button:focus-visible,.ops input:focus-visible,.ops select:focus-visible,.ops textarea:focus-visible{outline:2px solid #e2b95b;outline-offset:2px}
`}</style>{ops.error&&<p className="error" role="alert">{ops.error}</p>}{children}</section>}
function Names({names,value,onChange}){return <div className="names">{names.map(n=><label key={n}><input type="checkbox" checked={value.includes(n)} onChange={e=>onChange(e.target.checked?unique([...value,n]):value.filter(x=>x!==n))}/>{n}</label>)}</div>}
function Field({label,...props}){return <label>{label}<input {...props}/></label>}

export function SundayAttendance({ops,admin,week,weeks,data,definitions,even,odd,onRequests}){
 const names=expectedNames(data,even,odd),next=weeks[weeks.indexOf(week)+1];
 const unmarked=names.filter(n=>!data?.attendance?.[keyOf(n)]);
 const missing=Object.values(data?.attendance||{}).filter(r=>["absent","excused"].includes(r.status)&&r.makeupRequired!==false);
 const save=(people,status,makeup=true)=>ops.run(()=>ops.transact("sundayAssignments",current=>current?setAttendance(current,weeks,definitions,week,people,status,makeup,ops.uid,stamp()):current));
 return <Shell ops={ops}><div className="panel"><h3>Sunday attendance</h3><p>Absent and excused members are added to the next scheduled Sunday, even if it is not their pin group. Kitchen rotation is unchanged.</p>
 {data?.makeups?.length>0&&<p><strong>Makeup this week:</strong> {data.makeups.join(", ")}</p>}
 {missing.length>0&&<p>{next?`Makeup on ${next}: `:"Next Sunday not scheduled — makeup still outstanding: "}{missing.map(r=>r.name).join(", ")}</p>}
 {!admin?<button onClick={onRequests}>Request an absence</button>:<>
 {names.map(n=>{const r=data?.attendance?.[keyOf(n)];return <div className="roll" key={n}><span>{n}</span><select aria-label={`Attendance for ${n}`} disabled={ops.busy} value={r?.status==="excused"&&r.makeupRequired===false?"waived":r?.status||"unmarked"} onChange={e=>save([n],e.target.value==="waived"?"excused":e.target.value,e.target.value!=="waived")}><option value="unmarked">Not recorded</option><option value="present">Present</option><option value="absent">Absent · makeup</option><option value="excused">Excused · makeup</option><option value="waived">Excused · makeup waived</option></select></div>;})}
 <button disabled={ops.busy||!unmarked.length||!data?.jobs} onClick={()=>{if(confirm(`Mark ${unmarked.length} unrecorded members absent and schedule their makeups?`))save(unmarked,"absent");}}>Finalize roll call ({unmarked.length} unrecorded)</button><p>Finalize only after checking attendance. Unrecorded names are not automatically marked absent.</p></>}
 </div></Shell>;
}

export function Requests({ops,admin,name,names,weeks,assignments,sundays,jobs,sundayJobs}){
 const[kind,setKind]=useState("absence"),[start,setStart]=useState(today()),[end,setEnd]=useState(today()),[reason,setReason]=useState("");
 const[week,setWeek]=useState(weeks[0]||""),[type,setType]=useState("weekly"),[from,setFrom]=useState(""),[target,setTarget]=useState("");
 const[waivers,setWaivers]=useState({}),[showHistory,setShowHistory]=useState(false);
 const assigned=type==="weekly"?assignments[week]||{}:sundays[week]?.jobs||{};
 const defs=type==="weekly"?jobs:sundayJobs;
 const eligible=Object.entries(assigned).filter(([id,j])=>j.status==="pending"&&(type!=="sunday"||id!=="sun_kitchen"&&!id.startsWith("makeup_")));
 const myJobs=eligible.filter(([,j])=>j.assigned?.includes(name));
 const targets=eligible.filter(([id])=>!!from&&id!==from).flatMap(([id,j])=>(j.assigned||[]).filter(n=>n!==name&&!assigned[from]?.assigned?.includes(n)&&!j.assigned.includes(name)).map(n=>({id,name:n,key:JSON.stringify([id,n])})));
 async function submit(e){e.preventDefault();await ops.run(async()=>{
  if(!names.includes(name))throw Error("Select your name in My jobs first.");
  let request={kind,status:"pending",requesterUid:ops.uid,requesterName:name,createdAt:stamp()};
  if(kind==="absence"){if(end<start||!reason.trim())throw Error("Enter a valid date range and reason.");Object.assign(request,{start,end,reason:reason.trim()});}
  else{const other=targets.find(x=>x.key===target);if(!myJobs.some(([id])=>id===from)||!other)throw Error("Choose both assignments.");Object.assign(request,{week,jobType:type,fromJob:from,toJob:other.id,targetName:other.name});}
  await ops.api.set(`houseOps/requests/${newId()}`,request);setReason("");setFrom("");setTarget("");
 });}
 // Approval touches only the schedule it changes (never the database root), then marks the request.
 const approve=r=>ops.run(async()=>{
  const now=stamp(),waive=!!waivers[r.id];
  const request=await ops.api.get(`houseOps/requests/${r.id}`);
  if(!request||request.status!=="pending")throw Error("This request has already been processed.");
  if(request.kind==="absence")request.waiveMakeup=waive;
  const base={houseOps:{requests:{[r.id]:request}}};
  if(request.kind==="absence"){
   const[config,sundayConfig]=await Promise.all([ops.api.get("config"),ops.api.get("sundayConfig")]);
   await ops.transact("sundayAssignments",current=>approveRequest({...base,config,sundayConfig,sundayAssignments:current},r.id,ops.uid,now).sundayAssignments);
  }else if(request.kind==="swap"){
   const wk=weekKey(request.week),field=request.jobType==="weekly"?"assignments":"sundayAssignments";
   await ops.transact(`${field}/${wk}`,current=>approveRequest({...base,[field]:{[wk]:current}},r.id,ops.uid,now)[field][wk]);
  }else throw Error("Unknown request type.");
  await ops.transact(`houseOps/requests/${r.id}`,current=>{if(current.status!=="pending")throw Error("This request has already been processed.");return{...current,...(current.kind==="absence"?{waiveMakeup:waive}:{}),status:"approved",reviewedBy:ops.uid,reviewedAt:now};});
 });
 const list=rows(ops.data.requests).filter(r=>admin||r.requesterUid===ops.uid||r.targetName===name).filter(r=>showHistory||r.status==="pending").sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
 return <Shell ops={ops}><h2>Requests</h2><p>Names are self-selected in this app. The manager checks each request before approving it. Request details are readable by signed-in app users.</p><form onSubmit={submit}><h3>New request</h3><p>Submitting as {name||"no name selected"}. Absences require manager approval; makeup is required unless the manager waives it.</p>
 <label>Request type<select value={kind} onChange={e=>setKind(e.target.value)}><option value="absence">Absence</option><option value="swap">Job swap</option></select></label>
 {kind==="absence"?<><div className="grid"><Field label="First day away" type="date" value={start} required onChange={e=>setStart(e.target.value)}/><Field label="Last day away" type="date" min={start} value={end} required onChange={e=>setEnd(e.target.value)}/></div><label>Reason (brief; do not include sensitive details)<textarea required maxLength={1000} value={reason} onChange={e=>setReason(e.target.value)}/></label></>:<>
 <label>Week<select value={week} onChange={e=>{setWeek(e.target.value);setFrom("");setTarget("");}}>{weeks.map(w=><option key={w}>{w}</option>)}</select></label><label>Schedule<select value={type} onChange={e=>{setType(e.target.value);setFrom("");setTarget("");}}><option value="weekly">Weekly</option><option value="sunday">Sunday</option></select></label>
 <label>Your job<select required value={from} onChange={e=>{setFrom(e.target.value);setTarget("");}}><option value="">Choose a job</option>{myJobs.map(([id])=><option key={id} value={id}>{defs.find(j=>j.id===id)?.name||id}</option>)}</select></label><label>Exchange with<select required value={target} onChange={e=>setTarget(e.target.value)}><option value="">Choose a brother and job</option>{targets.map(t=><option key={t.key} value={t.key}>{t.name} — {defs.find(j=>j.id===t.id)?.name||t.id}</option>)}</select></label><p>Only pending jobs can be swapped. Kitchen and makeup jobs need direct manager assignment.</p></>}
 <button disabled={ops.busy||!name}>Submit request</button></form>
 <label><input type="checkbox" checked={showHistory} onChange={e=>setShowHistory(e.target.checked)}/> Show processed requests</label>
 {!list.length&&<p>No requests to display.</p>}{list.map(r=><article key={r.id}><h3>{r.kind==="absence"?"Absence":"Job swap"} · {r.requesterName}</h3><span className="pill">{r.status}</span><p>{r.kind==="absence"?`${r.start} through ${r.end} — ${r.reason}`:`${r.week} · ${r.requesterName} ↔ ${r.targetName} · ${r.jobType}`}</p>{r.kind==="swap"&&<p>{(r.jobType==="weekly"?jobs:sundayJobs).find(j=>j.id===r.fromJob)?.name||r.fromJob} ↔ {(r.jobType==="weekly"?jobs:sundayJobs).find(j=>j.id===r.toJob)?.name||r.toJob}<br/>Recipient: {r.response?.decision||"awaiting response"}</p>}
 {r.status==="pending"&&<>
 {r.kind==="swap"&&r.targetName===name&&r.requesterUid!==ops.uid&&!r.response&&<div className="actions">{["accepted","declined"].map(decision=><button disabled={ops.busy} key={decision} onClick={()=>ops.run(()=>ops.api.set(`houseOps/requests/${r.id}/response`,{uid:ops.uid,name,decision}))}>{decision==="accepted"?"Accept exchange":"Decline exchange"}</button>)}</div>}
 {admin&&<>{r.kind==="absence"&&<label><input type="checkbox" checked={!!waivers[r.id]} onChange={e=>setWaivers({...waivers,[r.id]:e.target.checked})}/> Waive makeup for this absence</label>}<div className="actions"><button disabled={ops.busy||r.kind==="swap"&&r.response?.decision!=="accepted"} onClick={()=>approve(r)}>Approve {r.kind==="swap"?"and exchange jobs":"absence"}</button><button disabled={ops.busy} onClick={()=>ops.run(()=>ops.transact(`houseOps/requests/${r.id}`,current=>{if(!current||current.status!=="pending")throw Error("Request already processed.");return {...current,status:"rejected",reviewedBy:ops.uid,reviewedAt:stamp()};}))}>Reject</button></div></>}
 </>}
 </article>)}</Shell>;
}

export function Supplies({ops,admin,name,legacy=[]}){
 const[item,setItem]=useState(""),[location,setLocation]=useState(""),[severity,setSeverity]=useState("low"),[history,setHistory]=useState(false);
 const list=rows(ops.data.supplies).filter(r=>history||r.status==="open");
 async function submit(e){e.preventDefault();if(await ops.run(()=>ops.api.set(`houseOps/supplies/${newId()}`,{item:item.trim(),location:location.trim(),severity,status:"open",reporterUid:ops.uid,reporterName:name||"House member",createdAt:stamp()}))){setItem("");setLocation("");}}
 const old=legacy.filter(r=>!ops.data.supplies?.[r.id]);
 return <Shell ops={ops}><h2>Supplies</h2><p>Reports stay open until the manager marks them restocked. Verifying a cleaning job does not clear its supplies report.</p><form onSubmit={submit}><Field label="Item needed" required maxLength={200} value={item} onChange={e=>setItem(e.target.value)}/><Field label="Location" required maxLength={200} value={location} onChange={e=>setLocation(e.target.value)}/><label>Stock level<select value={severity} onChange={e=>setSeverity(e.target.value)}><option value="low">Low</option><option value="out">Out</option></select></label><button disabled={ops.busy}>Report supplies</button></form>
 {admin&&old.length>0&&<div className="panel"><p>{old.length} older job supply reports can be added to this list.</p><button disabled={ops.busy} onClick={()=>ops.run(async()=>{const changes={};old.forEach(r=>{changes[`houseOps/supplies/${r.id}`]=r;});await ops.api.update("",changes);})}>Import older reports</button></div>}
 <label><input type="checkbox" checked={history} onChange={e=>setHistory(e.target.checked)}/> Include restocked</label>{!list.length&&<p>No open supply reports.</p>}{list.map(r=><article key={r.id}><h3>{r.item}</h3><p>{r.location} · {r.severity} · {r.status}</p><small>{r.reporterName} · {r.createdAt?.slice(0,10)}</small>{admin&&<div className="actions"><button disabled={ops.busy} onClick={()=>ops.run(()=>ops.api.update(`houseOps/supplies/${r.id}`,{status:r.status==="open"?"restocked":"open",updatedBy:ops.uid,updatedAt:stamp()}))}>{r.status==="open"?"Mark restocked":"Reopen"}</button></div>}</article>)}</Shell>;
}

export function Maintenance({ops,admin,names}){
 const[title,setTitle]=useState(""),[due,setDue]=useState(today()),[interval,setInterval]=useState(30),[assigned,setAssigned]=useState([]),[editing,setEditing]=useState(null);
 async function submit(e){e.preventDefault();const changes={title:title.trim(),nextDue:due,intervalDays:Number(interval),assigned};if(await ops.run(()=>editing?ops.api.update(`houseOps/maintenance/${editing}`,changes):ops.api.set(`houseOps/maintenance/${newId()}`,{...changes,active:true,createdAt:stamp()}))){setTitle("");setAssigned([]);setEditing(null);}}
 return <Shell ops={ops}><h2>Recurring maintenance</h2>{admin&&<details open={editing?true:undefined}><summary>{editing?"Edit maintenance task":"Add maintenance task"}</summary><form onSubmit={submit}><Field label="Task" value={title} required maxLength={200} onChange={e=>setTitle(e.target.value)}/><div className="grid"><Field label="Next due" type="date" required value={due} onChange={e=>setDue(e.target.value)}/><Field label="Repeat every (days)" type="number" min="1" max="3660" required value={interval} onChange={e=>setInterval(e.target.value)}/></div><p>Assign to</p><Names names={names} value={assigned} onChange={setAssigned}/><button disabled={ops.busy}>{editing?"Save maintenance changes":"Create recurring task"}</button>{editing&&<button type="button" onClick={()=>{setEditing(null);setTitle("");setAssigned([]);}}>Cancel edit</button>}</form></details>}
 {!rows(ops.data.maintenance).length&&<p>No recurring tasks yet.</p>}{rows(ops.data.maintenance).sort((a,b)=>a.nextDue.localeCompare(b.nextDue)).map(r=><article key={r.id}><h3>{r.title}</h3><p>{r.active===false?"Paused":r.nextDue<today()?"Overdue":"Due"}: {r.nextDue} · every {r.intervalDays} days</p><p>{r.assigned?.join(", ")||"Unassigned"}</p>{admin&&<div className="actions"><button disabled={ops.busy||r.active===false} onClick={()=>ops.run(()=>ops.transact(`houseOps/maintenance/${r.id}`,current=>completeMaintenance(current,ops.uid,stamp(),r.nextDue)))}>Record completion</button><button onClick={()=>{setEditing(r.id);setTitle(r.title);setDue(r.nextDue);setInterval(r.intervalDays);setAssigned(r.assigned||[]);}}>Edit maintenance</button><button disabled={ops.busy} onClick={()=>ops.run(()=>ops.api.update(`houseOps/maintenance/${r.id}`,{active:r.active===false}))}>{r.active===false?"Resume":"Pause"}</button></div>}<details><summary>Completion history ({Object.keys(r.history||{}).length})</summary>{rows(r.history).sort((a,b)=>b.completedAt.localeCompare(a.completedAt)).map(h=><p key={h.id}>Due {h.due} · completed {h.completedAt.slice(0,10)}</p>)}</details></article>)}</Shell>;
}

function EventEditor({ops,kind,event,onClose}){
 const[title,setTitle]=useState(event?.title||(kind==="woth"?"WOTH Day":"Emergency cleaning")),[date,setDate]=useState(event?.date||(kind==="woth"?"2026-10-03":today()));
 const[time,setTime]=useState(event?.startTime||""),[details,setDetails]=useState(event?.details||"");
 async function submit(e){e.preventDefault();const changes={kind,title:title.trim(),date,allDay:kind==="woth",startTime:kind==="woth"?"":time,details:details.trim()};if(await ops.run(()=>event?ops.api.update(`houseOps/events/${event.id}`,changes):ops.api.set(`houseOps/events/${newId()}`,{...changes,status:"scheduled",createdAt:stamp()})))onClose();}
 return <form onSubmit={submit}><Field label="Event name" required maxLength={200} value={title} onChange={e=>setTitle(e.target.value)}/><Field label="Date" type="date" required value={date} onChange={e=>setDate(e.target.value)}/>{kind==="woth"?<p>All-day event</p>:<Field label="Start time (local)" type="time" required value={time} onChange={e=>setTime(e.target.value)}/>}<label>Instructions<textarea maxLength={2000} value={details} onChange={e=>setDetails(e.target.value)}/></label><div className="actions"><button disabled={ops.busy}>Save event</button><button type="button" onClick={onClose}>Cancel</button></div></form>;
}
function EventJobEditor({ops,eventId,task,names,onClose}){
 const[title,setTitle]=useState(task?.name||""),[desc,setDesc]=useState(task?.desc||""),[assigned,setAssigned]=useState(task?.assigned||[]);
 async function submit(e){e.preventDefault();if(await ops.run(()=>task?ops.api.update(`houseOps/events/${eventId}/tasks/${task.id}`,{name:title.trim(),desc:desc.trim(),assigned}):ops.api.set(`houseOps/events/${eventId}/tasks/${newId()}`,{name:title.trim(),desc:desc.trim(),assigned,status:"pending"})))onClose();}
 return <form onSubmit={submit}><Field label="Job name" value={title} required maxLength={200} onChange={e=>setTitle(e.target.value)}/><label>Instructions<textarea maxLength={2000} value={desc} onChange={e=>setDesc(e.target.value)}/></label><p>Assigned brothers</p><Names names={names} value={assigned} onChange={setAssigned}/><div className="actions"><button disabled={ops.busy}>Save job</button><button type="button" onClick={onClose}>Cancel</button></div></form>;
}
// Basement remodel crews for WOTH Day. Crew size is only a starting point for auto-assign.
const WOTH_TEMPLATE=[
 {key:"prep",name:"Move-out & floor prep",size:4,desc:"Clear everything off the basement floors (furniture, rugs, junk)\nPull the old baseboard trim with a pry bar and putty knife, pull the nails\nDo NOT tear up old tile unless the house manager says it was tested\nFill cracks and low spots, then sweep and shop-vac the floor clean"},
 {key:"paint",name:"Wall patch & paint",size:4,desc:"Spackle holes and dings, sand smooth\nTape edges, lay drop cloths\nCut in and roll walls in Birched White — two coats\nPaint before the floor goes down"},
 {key:"baseboard",name:"Pre-paint baseboards",size:2,desc:"Set boards on sawhorses away from the floor crew\nPaint all 26 base boards and the corner moulding, both coats\nLet them dry flat — trim crew installs them last"},
 {key:"floor",name:"Flooring install",size:5,desc:"Starts after prep and paint are done in a room\nRoll out BLOCK-IT underlayment, seams taped\nStart on the longest straight wall with 1/4 in spacers at every wall\nStagger plank seams at least 8 in; tapping block and pull bar, no hammering the edges\nSeam binders at doorways"},
 {key:"trim",name:"Trim install",size:3,desc:"After the floor is down: nail base to the wall, never into the floating floor\nMiter the corners, install door casings\nFill nail holes, caulk the top edge, touch up paint"},
 {key:"tools",name:"Tools & supply runner",size:1,desc:"Check what materials arrived against the wishlists\nHand out tools and track who has what\nMake the Menards run for anything missing"},
 {key:"haul",name:"Haul & cleanup",size:2,desc:"Trash and scrap runs all day, break down boxes\nShop-vac as rooms finish\nMove furniture back and return tools at the end"},
 {key:"food",name:"Lunch & water",size:1,desc:"Get a headcount, order or pick up lunch\nKeep water and snacks stocked in the basement"},
];
function shuffled(list){const a=[...list];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
const sameName=(a,b)=>a.trim().toLowerCase()===b.trim().toLowerCase();

function EventSetup({ops,event,names,projects}){
 const tasks=rows(event.tasks),open=tasks.filter(t=>t.status==="pending");
 const choices=[...(event.kind==="woth"?WOTH_TEMPLATE.map(t=>({...t,group:"Remodel crews"})):[]),...(projects||[]).map(p=>({key:"project:"+p.id,name:p.name,desc:"",size:1,group:(p.area||"House")+" projects"}))].filter(c=>!tasks.some(t=>sameName(t.name,c.name)));
 const groups=unique(choices.map(c=>c.group));
 const[picked,setPicked]=useState([]),[sizes,setSizes]=useState({}),[attendees,setAttendees]=useState(names),[fresh,setFresh]=useState(false),[plan,setPlan]=useState(null),[notice,setNotice]=useState("");
 const sizeOf=t=>sizes[t.id]??WOTH_TEMPLATE.find(x=>sameName(x.name,t.name))?.size??1;
 const toggleAll=(list,on)=>setPicked(on?unique([...picked,...list.map(c=>c.key)]):picked.filter(k=>!list.some(c=>c.key===k)));
 async function addJobs(){
  const changes={};choices.filter(c=>picked.includes(c.key)).forEach(c=>{changes[`houseOps/events/${event.id}/tasks/${newId()}`]={name:c.name,desc:c.desc,assigned:[],status:"pending"};});
  if(await ops.run(()=>ops.api.update("",changes))){setPicked([]);setNotice(`Added ${Object.keys(changes).length} jobs.`);}
 }
 function preview(){setPlan(autoAssignEvent(open,attendees,Object.fromEntries(open.map(t=>[t.id,sizeOf(t)])),{fresh,order:shuffled}));}
 async function savePlan(){
  const changes={};Object.entries(plan).filter(([id])=>open.some(t=>t.id===id)).forEach(([id,assigned])=>{changes[`houseOps/events/${event.id}/tasks/${id}/assigned`]=assigned;});
  if(await ops.run(()=>ops.api.update("",changes))){setPlan(null);setNotice("Assignments saved. Brothers will see their job under My jobs.");}
 }
 const placed=new Set(tasks.flatMap(t=>t.assigned||[])),idle=attendees.filter(n=>!placed.has(n));
 async function copyRoster(){
  const text=[`${event.title} · ${event.date}`,"",...tasks.map(t=>`${t.name}: ${(t.assigned||[]).join(", ")||"(open)"}`),...(idle.length?["",`Not assigned yet: ${idle.join(", ")}`]:[])].join("\n");
  try{await navigator.clipboard.writeText(text);setNotice("Roster copied. Paste it in the group chat.");}catch{setNotice("Copy is unavailable in this browser.");}
 }
 return <div className="panel"><h3>Set up this event</h3>{notice&&<p role="status">{notice}</p>}
 <details open={!tasks.length||undefined}><summary>1 · Add jobs ({choices.length} available)</summary>
  {!choices.length&&<p>Every crew and project is already on this event.</p>}
  {groups.map(g=>{const list=choices.filter(c=>c.group===g),on=list.filter(c=>picked.includes(c.key)).length;return <details key={g} open={g==="Remodel crews"||undefined}><summary>{g} · {on}/{list.length} selected</summary><div className="actions"><button type="button" onClick={()=>toggleAll(list,true)}>Select all</button><button type="button" onClick={()=>toggleAll(list,false)}>Clear</button></div>
   {list.map(c=><label key={c.key} style={{display:"flex",gap:8,alignItems:"flex-start"}}><input type="checkbox" checked={picked.includes(c.key)} onChange={e=>setPicked(e.target.checked?[...picked,c.key]:picked.filter(k=>k!==c.key))}/><span>{c.name}{c.group==="Remodel crews"&&<small> · crew of {c.size}</small>}</span></label>)}</details>;})}
  <button disabled={ops.busy||!picked.length} onClick={addJobs}>Add {picked.length} job{picked.length===1?"":"s"}</button>
 </details>
 <details><summary>2 · Auto-assign brothers ({attendees.length} attending)</summary>
  {!open.length?<p>Add jobs first.</p>:<>
  <p>Who is coming? Uncheck anyone who is out.</p><div className="actions"><button type="button" onClick={()=>setAttendees(names)}>Everyone</button><button type="button" onClick={()=>setAttendees([])}>Nobody</button></div><Names names={names} value={attendees} onChange={setAttendees}/>
  <p>Crew size per job. Extra people go to the biggest crews.</p>
  {open.map(t=><div className="roll" key={t.id}><span>{t.name}</span><input type="number" min="1" max="30" aria-label={`Crew size for ${t.name}`} value={sizeOf(t)} onChange={e=>{setSizes({...sizes,[t.id]:e.target.value});setPlan(null);}}/></div>)}
  <label><input type="checkbox" checked={fresh} onChange={e=>{setFresh(e.target.checked);setPlan(null);}}/> Start over (clear current assignments on open jobs)</label>
  <div className="actions"><button type="button" disabled={!attendees.length} onClick={preview}>{plan?"Shuffle again":"Preview assignments"}</button>{plan&&<button disabled={ops.busy} onClick={savePlan}>Save assignments</button>}</div>
  {plan&&<div className="panel">{open.map(t=><p key={t.id}><strong>{t.name}</strong> ({plan[t.id].length}/{sizeOf(t)}): {plan[t.id].join(", ")||"nobody"}</p>)}</div>}</>}
 </details>
 <details><summary>3 · Share the roster</summary><p>{tasks.length} jobs · {placed.size} brothers assigned{idle.length?` · ${idle.length} attending but unassigned`:""}</p><button type="button" disabled={!tasks.length} onClick={copyRoster}>Copy roster for the group chat</button></details>
 </div>;
}
function EventTask({ops,event,task,admin,name,names}){
 const[editing,setEditing]=useState(false),[note,setNote]=useState("");
 const submit=()=>ops.run(()=>ops.api.update(`houseOps/events/${event.id}/tasks/${task.id}`,{status:"done",proof:{submittedUid:ops.uid,submittedBy:name,submittedAt:stamp(),note:note.trim()}}));
 const review=status=>ops.run(()=>ops.transact(`houseOps/events/${event.id}/tasks/${task.id}`,current=>{if(!current||current.status!=="done")throw Error("This job is no longer waiting for review.");return{...current,status,reviewedBy:ops.uid,reviewedAt:stamp()};}));
 return <article><h3>{task.name}</h3><span className="pill">{{pending:"Assigned",done:"Awaiting review",verified:"Verified"}[task.status]||task.status}</span><p>{task.assigned?.join(", ")||"Unassigned"}</p><p style={{whiteSpace:"pre-line"}}>{task.desc}</p>{task.proof&&<p>Submitted by {task.proof.submittedBy}: {task.proof.note||"No note"}</p>}
 {event.status==="scheduled"&&task.status==="pending"&&(task.assigned||[]).includes(name)&&<><label>Completion note<textarea maxLength={2000} value={note} onChange={e=>setNote(e.target.value)}/></label><button disabled={ops.busy} onClick={submit}>Submit event job</button></>}
 {admin&&<div className="actions"><button disabled={ops.busy} onClick={()=>setEditing(!editing)}>Edit assignment</button><button disabled={ops.busy} onClick={()=>{if(confirm(`Remove "${task.name}" from this event?`))ops.run(()=>ops.api.set(`houseOps/events/${event.id}/tasks/${task.id}`,null));}}>Remove job</button>{task.status==="done"&&<><button disabled={ops.busy} onClick={()=>review("verified")}>Verify event job</button><button disabled={ops.busy} onClick={()=>review("pending")}>Return for cleaning</button></>}</div>}
 {editing&&<EventJobEditor ops={ops} eventId={event.id} task={task} names={names} onClose={()=>setEditing(false)}/>}</article>;
}
function EventCard({ops,event,admin,name,names,projects}){
 const[editing,setEditing]=useState(false),[adding,setAdding]=useState(false);
 const tasks=rows(event.tasks),pending=tasks.filter(t=>t.status!=="verified").length;
 return <div className="panel"><h3>{event.title}</h3><p>{event.date} · {event.allDay?"All day":event.startTime} · {event.status}</p><p>{event.details}</p><p>{tasks.length-pending}/{tasks.length} jobs verified</p>
 {admin&&<div className="actions"><button onClick={()=>setEditing(!editing)}>Edit event</button><button disabled={event.status!=="scheduled"} onClick={()=>setAdding(!adding)}>Add event job</button><button disabled={ops.busy||event.status!=="scheduled"||pending>0} onClick={()=>ops.run(()=>ops.transact(`houseOps/events/${event.id}`,current=>{if(!current||Object.values(current.tasks||{}).some(t=>t.status!=="verified"))throw Error("Verify all jobs before completing the event.");return {...current,status:"completed"};}))}>Complete event</button><button disabled={ops.busy} onClick={()=>{const status=event.status==="scheduled"?"cancelled":"scheduled";if(confirm(`${status==="cancelled"?"Cancel":"Reopen"} this event?`))ops.run(()=>ops.api.update(`houseOps/events/${event.id}`,{status}));}}>{event.status==="scheduled"?"Cancel event":"Reopen event"}</button></div>}
 {editing&&<EventEditor ops={ops} kind={event.kind} event={event} onClose={()=>setEditing(false)}/>}{adding&&<EventJobEditor ops={ops} eventId={event.id} names={names} onClose={()=>setAdding(false)}/>}
 {admin&&event.status==="scheduled"&&<EventSetup ops={ops} event={event} names={names} projects={projects}/>}
 {tasks.map(t=><EventTask key={t.id} ops={ops} event={event} task={t} admin={admin} name={name} names={names}/>)}{!tasks.length&&<p>No jobs assigned yet.</p>}</div>;
}
export function Events({ops,kind,admin,name,names,projects}){
 const[adding,setAdding]=useState(false),[history,setHistory]=useState(false);
 const events=rows(ops.data.events).filter(e=>e.kind===kind&&(history||e.status==="scheduled")).sort((a,b)=>a.date.localeCompare(b.date));
 return <Shell ops={ops}><h2>{kind==="woth"?"WOTH Day":"Emergency cleanings"}</h2>{kind==="woth"&&<p>Work on the house day · semester event</p>}{admin&&<button onClick={()=>setAdding(!adding)}>{kind==="woth"?"Schedule WOTH Day":"Schedule emergency cleaning"}</button>}{adding&&<EventEditor ops={ops} kind={kind} onClose={()=>setAdding(false)}/>}<label><input type="checkbox" checked={history} onChange={e=>setHistory(e.target.checked)}/> Include completed and cancelled events</label>{!events.length&&<p>No scheduled events.{admin&&kind==="woth"?" Schedule WOTH Day to save October 3, 2026, or choose another date.":""}</p>}{events.map(e=><EventCard key={e.id} ops={ops} event={e} admin={admin} name={name} names={names} projects={projects}/>)}</Shell>;
}
export function OpsPersonal({ops,name,onNavigate}){
 const tasks=rows(ops.data.events).filter(e=>e.status==="scheduled").sort((a,b)=>a.date.localeCompare(b.date)).flatMap(e=>rows(e.tasks).filter(t=>t.assigned?.includes(name)&&t.status!=="verified").map(t=>({event:e,task:t})));
 const maintenance=rows(ops.data.maintenance).filter(r=>r.active!==false&&r.assigned?.includes(name));
 const responses=rows(ops.data.requests).filter(r=>r.status==="pending"&&r.targetName===name&&!r.response&&r.requesterUid!==ops.uid);
 return <Shell ops={ops}><div className="actions"><button onClick={()=>onNavigate("requests")}>Swaps & absences{responses.length?` (${responses.length} to answer)`:""}</button><button onClick={()=>onNavigate("supplies")}>Report supplies</button></div>{tasks.length>0&&<h3 style={{marginTop:20}}>Event assignments</h3>}{tasks.map(({event,task})=><div key={event.id+task.id}><p>{event.title} · {event.date} · {event.allDay?"All day":event.startTime}</p><EventTask ops={ops} event={event} task={task} name={name} admin={false} names={[]}/></div>)}{maintenance.length>0&&<div className="panel"><h3>Your maintenance tasks</h3>{maintenance.map(r=><p key={r.id}>{r.title} · due {r.nextDue}</p>)}<button onClick={()=>onNavigate("maintenance")}>View maintenance</button></div>}</Shell>;
}
export function OpsManager({ops,onNavigate}){
 const requests=rows(ops.data.requests).filter(r=>r.status==="pending").length,supplies=rows(ops.data.supplies).filter(r=>r.status==="open").length,review=rows(ops.data.events).reduce((sum,e)=>sum+rows(e.tasks).filter(t=>t.status==="done").length,0);
 return <Shell ops={ops}><div className="panel"><h3>House operations</h3><p>{requests} pending requests · {supplies} supply reports · {review} event jobs awaiting review</p><div className="actions">{[["requests","Requests"],["supplies","Supplies"],["maintenance","Maintenance"],["woth","WOTH Day"],["emergency","Emergency cleanings"]].map(([key,label])=><button key={key} onClick={()=>onNavigate(key)}>{label}</button>)}</div></div></Shell>;
}
