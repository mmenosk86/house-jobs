// Guided "new semester" setup: dates → who lives in the house → pins & chairs → review & start.
// It only builds a plan; App.jsx's startNewSemester() archives the old semester and writes the new schedules.
import {Fragment,useMemo,useState} from "react";
import {generateWeekLabels} from "./dates.js";

const FLOORS=[["basement","Basement"],["first","1st floor"],["second","2nd floor"],["third","3rd floor"]];
const STEPS=["Dates","Members","House","Pins & chairs","Review"];
// Chapter status for the coming semester. Anyone not active comes off the Sunday pins and the house roster.
// Co-op and inactive members are remembered so a later semester can bring them back.
const STATUSES=[["active","Active"],["graduating","Graduating"],["coop","Co-op"],["inactive","Inactive"],["earlyalum","Early alum"]];
const STATUS_LABEL=Object.fromEntries(STATUSES);
const RETURNABLE=new Set(["coop","inactive"]);

// Next semester's name and rough dates from the current one ("Fall 2026" → "Spring 2027", mid-Jan to early May).
function suggest(currentName){
  const m=String(currentName||"").match(/(Fall|Spring)\s+(\d{4})/i);
  const fall=!m||/fall/i.test(m[1]),year=m?Number(m[2]):new Date().getFullYear();
  const y=fall?year+1:year;
  if(fall){
    const jan=new Date(y,0,8);while(jan.getDay()!==1)jan.setDate(jan.getDate()+1); // 2nd Monday-ish of January
    return{name:`Spring ${y}`,start:iso(jan),end:`${y}-05-02`};
  }
  const aug=new Date(y,7,24);while(aug.getDay()!==1)aug.setDate(aug.getDate()+1);
  return{name:`Fall ${y}`,start:iso(aug),end:`${y}-12-13`};
}
const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;

export default function SemesterWizard({semesterName,brothers,evenPins,oddPins,away=[],jobs,chairs,onStart,onCancel,busy}){
  const s=useMemo(()=>suggest(semesterName),[semesterName]);
  const[step,setStep]=useState(0);
  const[name,setName]=useState(s.name),[start,setStart]=useState(s.start),[end,setEnd]=useState(s.end),[breaks,setBreaks]=useState("");
  // Whole chapter: current pins (active by default) plus members who were away (still away by default).
  const[members,setMembers]=useState(()=>{
    const list=[...evenPins.map(n=>({name:n,group:"even",status:"active"})),...oddPins.map(n=>({name:n,group:"odd",status:"active"}))];
    const seen=new Set(list.map(m=>m.name));
    away.forEach(a=>{if(!seen.has(a.name)){seen.add(a.name);list.push({name:a.name,group:a.group||"even",status:a.reason||"coop",wasAway:true,since:a.since});}});
    return list;
  });
  const[memberQuery,setMemberQuery]=useState(""),[newMember,setNewMember]=useState(""),[newGroup,setNewGroup]=useState("even");
  const leaving=new Map(members.filter(m=>m.status!=="active").map(m=>[m.name,m.status]));
  const[roster,setRoster]=useState(()=>brothers.map(b=>typeof b==="string"?{name:b,floor:"first"}:{...b}).map(b=>({...b,keep:true})));
  const[newName,setNewName]=useState(""),[newFloor,setNewFloor]=useState("first");
  const[startGroup,setStartGroup]=useState("even");
  const chairJobs=jobs.filter(j=>/kitchen|library/i.test(j.name));
  const[newChairs,setNewChairs]=useState(()=>({...chairs}));
  const[archive,setArchive]=useState(true);
  const[confirmText,setConfirmText]=useState("");

  const weeks=useMemo(()=>generateWeekLabels(start,end,breaks),[start,end,breaks]);
  const active=members.filter(m=>m.status==="active");
  const newEven=active.filter(m=>m.group==="even").map(m=>m.name),newOdd=active.filter(m=>m.group==="odd").map(m=>m.name);
  const pinNames=active.map(m=>m.name).sort();
  // Anyone marked graduating / co-op / inactive / early alum is automatically off the house roster too.
  const kept=roster.filter(b=>b.keep&&!leaving.has(b.name));
  const notOnPins=kept.filter(b=>!pinNames.includes(b.name)).map(b=>b.name);
  const validChairs=Object.fromEntries(Object.entries(newChairs).filter(([,n])=>n&&kept.some(b=>b.name===n)));
  const problems=[!name.trim()&&"Give the semester a name.",!weeks.length&&"Pick a valid first and last day.",!kept.length&&"Add at least one brother living in the house.",!newEven.length&&!newOdd.length&&"No active members are on the pin lists."].filter(Boolean);
  const byStatus=st=>members.filter(m=>m.status===st).map(m=>m.name);
  const returning=members.filter(m=>m.wasAway&&m.status==="active").map(m=>m.name);

  function addBrother(){
    const n=newName.trim();if(!n||roster.some(b=>b.name.toLowerCase()===n.toLowerCase()))return;
    setRoster([...roster,{name:n,floor:newFloor,keep:true}]);setNewName("");
  }
  function addMember(){
    const n=newMember.trim();if(!n)return;
    if(members.some(m=>m.name.toLowerCase()===n.toLowerCase())){setMembers(members.map(m=>m.name.toLowerCase()===n.toLowerCase()?{...m,status:"active",group:newGroup}:m));}
    else setMembers([...members,{name:n,group:newGroup,status:"active",isNew:true}]);
    setNewMember("");
  }
  const setMember=(name,changes)=>setMembers(members.map(m=>m.name===name?{...m,...changes}:m));
  const shown=members.filter(m=>m.name.toLowerCase().includes(memberQuery.trim().toLowerCase()));
  const next=()=>setStep(Math.min(STEPS.length-1,step+1)),back=()=>step?setStep(step-1):onCancel();

  return <section className="wizard fu">
    <button className="back-link" onClick={onCancel}>‹ Manager</button>
    <h2 className="page-title">Start a new semester</h2>
    <ol className="wizard-steps" aria-label="Steps">{STEPS.map((t,i)=><li key={t} aria-current={i===step?"step":undefined} className={i<step?"done":""}><span>{i+1}</span>{t}</li>)}</ol>

    {step===0&&<div className="hm-card wizard-card">
      <label>Semester name<input value={name} onChange={e=>setName(e.target.value)} placeholder="Spring 2027"/></label>
      <div className="wizard-row">
        <label>First Monday<input type="date" value={start} onChange={e=>setStart(e.target.value)}/></label>
        <label>Last day<input type="date" value={end} onChange={e=>setEnd(e.target.value)}/></label>
      </div>
      <label>Break weeks to skip <small>(any date in that week, comma separated)</small><input value={breaks} onChange={e=>setBreaks(e.target.value)} placeholder="2027-03-08, 2027-03-15"/></label>
      <p className="wizard-note">{weeks.length?`${weeks.length} weeks: ${weeks[0]} through ${weeks[weeks.length-1]}`:"Pick a first Monday and a last day."}</p>
      {weeks.length>0&&<div className="chip-row">{weeks.map(w=><span key={w} className="chip">{w}</span>)}</div>}
    </div>}

    {step===1&&<div className="hm-card wizard-card">
      <p className="wizard-note">Go through the chapter roster. Anyone graduating, going on co-op, inactive or taking early alum comes off the Sunday pins and the house roster. Co-op and inactive members are remembered so you can bring them back next semester.</p>
      <div className="member-counts"><span>{active.length} active</span>{STATUSES.slice(1).map(([st,l])=>byStatus(st).length>0&&<span key={st}>{byStatus(st).length} {l.toLowerCase()}</span>)}</div>
      <input className="member-search" value={memberQuery} onChange={e=>setMemberQuery(e.target.value)} placeholder={`Search ${members.length} members…`} aria-label="Search members"/>
      <div className="member-list">{shown.map(m=><div key={m.name} className={"member-row"+(m.status==="active"?"":" off")}>
        <div className="member-name">{m.name}<small>{m.group==="even"?"Even":"Odd"} pin{m.isNew?" · new":""}{m.wasAway?` · was ${STATUS_LABEL[m.status]?.toLowerCase()||"away"}${m.since?` (${m.since})`:""}`:""}</small></div>
        <select aria-label={`Status for ${m.name}`} value={m.status} onChange={e=>setMember(m.name,{status:e.target.value})}>{STATUSES.map(([v,l])=><option key={v} value={v}>{m.wasAway&&v==="active"?"Coming back":l}</option>)}</select>
      </div>)}{!shown.length&&<p className="wizard-note">No one matches “{memberQuery}”.</p>}</div>
      <div className="wizard-row add-row">
        <input value={newMember} onChange={e=>setNewMember(e.target.value)} placeholder="Add a new member" onKeyDown={e=>{if(e.key==="Enter")addMember();}}/>
        <select aria-label="Pin group for new member" value={newGroup} onChange={e=>setNewGroup(e.target.value)}><option value="even">Even</option><option value="odd">Odd</option></select>
        <button className="wizard-secondary" onClick={addMember} disabled={!newMember.trim()}>Add</button>
      </div>
    </div>}

    {step===2&&<div className="hm-card wizard-card">
      <p className="wizard-note">Who lives in the house next semester? Uncheck anyone moving out. Floors decide who rotates through which floor's jobs.</p>
      {roster.map((b,i)=>{const gone=leaving.get(b.name);return <div key={b.name} className={"roster-row"+(b.keep&&!gone?"":" off")}>
        <label className="check"><input type="checkbox" disabled={!!gone} checked={b.keep&&!gone} onChange={e=>setRoster(roster.map((x,k)=>k===i?{...x,keep:e.target.checked}:x))}/>{b.name}{gone&&<small className="gone-tag">{STATUS_LABEL[gone]}</small>}</label>
        <select aria-label={`Floor for ${b.name}`} value={b.floor} disabled={!b.keep||!!gone} onChange={e=>setRoster(roster.map((x,k)=>k===i?{...x,floor:e.target.value}:x))}>{FLOORS.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select>
      </div>;})}
      <div className="wizard-row add-row">
        <input list="wizard-pin-names" value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Add someone moving in" onKeyDown={e=>{if(e.key==="Enter")addBrother();}}/>
        <datalist id="wizard-pin-names">{pinNames.filter(n=>!roster.some(b=>b.name===n)).map(n=><option key={n} value={n}/>)}</datalist>
        <select aria-label="Floor for new brother" value={newFloor} onChange={e=>setNewFloor(e.target.value)}>{FLOORS.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select>
        <button className="wizard-secondary" onClick={addBrother} disabled={!newName.trim()}>Add</button>
      </div>
      <p className="wizard-note">{kept.length} brothers in the house{roster.length-kept.length?` · ${roster.length-kept.length} not returning`:""}</p>
    </div>}

    {step===3&&<div className="hm-card wizard-card">
      <p className="wizard-note">Sunday pins next semester: {newEven.length} even, {newOdd.length} odd.</p>
      {notOnPins.length>0&&<p className="wizard-warn">Living in the house but not on a pin list, so no Sunday jobs: {notOnPins.join(", ")}. Add them in the Members step if they should clean Sundays.</p>}
      <fieldset className="wizard-choice"><legend>First Sunday is</legend>
        {["even","odd"].map(g=><label key={g}><input type="radio" name="start-group" checked={startGroup===g} onChange={()=>setStartGroup(g)}/>{g==="even"?"Even pins":"Odd pins"}</label>)}
      </fieldset>
      {chairJobs.map(j=><label key={j.id}>{j.name} chair
        <select value={validChairs[j.id]||""} onChange={e=>setNewChairs({...newChairs,[j.id]:e.target.value})}>
          <option value="">No chair (normal rotation)</option>{kept.map(b=><option key={b.name} value={b.name}>{b.name}</option>)}
        </select></label>)}
    </div>}

    {step===4&&<div className="hm-card wizard-card">
      <dl className="wizard-summary">
        <dt>Semester</dt><dd>{name} · {weeks.length} weeks ({weeks[0]} – {weeks[weeks.length-1]})</dd>
        <dt>Members</dt><dd>{active.length} active ({newEven.length} even, {newOdd.length} odd){returning.length?` · back: ${returning.join(", ")}`:""}</dd>
        {STATUSES.slice(1).map(([st,l])=>byStatus(st).length>0&&<Fragment key={st}><dt>{l}</dt><dd>{byStatus(st).join(", ")}</dd></Fragment>)}
        <dt>In the house</dt><dd>{kept.length} brothers{roster.length-kept.length?`, not returning: ${roster.filter(b=>!kept.includes(b)).map(b=>b.name).join(", ")}`:""}</dd>
        <dt>First Sunday</dt><dd>{startGroup==="even"?"Even":"Odd"} pins, then alternating</dd>
        <dt>Chairs</dt><dd>{chairJobs.map(j=>`${j.name}: ${validChairs[j.id]||"none"}`).join(" · ")||"None"}</dd>
        <dt>Starts fresh</dt><dd>Weekly jobs, Sunday cleaning and house projects for every week. Multi-week manager assignments are cleared.</dd>
        <dt>Kept</dt><dd>Job lists, projects list, announcements, issues, requests and maintenance.</dd>
      </dl>
      <label className="check"><input type="checkbox" checked={archive} onChange={e=>setArchive(e.target.checked)}/>Save {semesterName} to the archive first (recommended)</label>
      {problems.map(p=><p key={p} className="wizard-warn">{p}</p>)}
      <label>Type <b>START</b> to replace this semester's schedule<input value={confirmText} onChange={e=>setConfirmText(e.target.value)} autoCapitalize="characters" placeholder="START"/></label>
    </div>}

    <div className="wizard-nav">
      <button className="wizard-secondary" onClick={back} disabled={busy}>{step?"Back":"Cancel"}</button>
      {step<STEPS.length-1
        ?<button className="wizard-primary" onClick={next} disabled={step===0&&!weeks.length||step===2&&!kept.length}>Next</button>
        :<button className="wizard-primary" disabled={busy||problems.length>0||confirmText.trim().toUpperCase()!=="START"}
          onClick={()=>onStart({semesterName:name.trim(),weeks,brothers:kept.map(({keep,...b})=>b),chairs:validChairs,startGroup,archive,
            evenPins:newEven,oddPins:newOdd,
            away:members.filter(m=>RETURNABLE.has(m.status)).map(m=>({name:m.name,group:m.group,reason:m.status,since:m.wasAway&&m.since?m.since:semesterName}))})}>{busy?"Starting…":`Start ${name.trim()||"semester"}`}</button>}
    </div>
  </section>;
}