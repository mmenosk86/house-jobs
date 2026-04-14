import { useState, useEffect, useMemo, useCallback, useRef } from "react";

/*
 * ════════════════════════════════════════════════════════
 *  HOUSE JOBS — Firebase Realtime Database Edition
 *  With Sunday Cleaning System
 * ════════════════════════════════════════════════════════
 */

// ▼▼▼ PASTE YOUR FIREBASE CONFIG HERE ▼▼▼
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAUWn9oU5uFAkckIWMsYMBHmvffxnYEZ_k",
  authDomain: "house-jobs-19e96.firebaseapp.com",
  databaseURL: "https://house-jobs-19e96-default-rtdb.firebaseio.com",
  projectId: "house-jobs-19e96",
  storageBucket: "house-jobs-19e96.firebasestorage.app",
  messagingSenderId: "568801873290",
  appId: "1:568801873290:web:7db8c4c0910ceeb29f0c73"
};
// ▲▲▲ PASTE YOUR FIREBASE CONFIG HERE ▲▲▲

// ─── DEFAULTS ───
const DEFAULT_WEEKS = [
  "8/25-8/31","9/1-9/7","9/8-9/14","9/15-9/21","9/22-9/28",
  "9/29-10/5","10/6-10/12","10/13-10/19","10/20-10/26",
  "10/27-11/2","11/3-11/9","11/10-11/16","11/17-11/23",
  "12/1-12/7","12/8-12/14"
];

const DEFAULT_BROTHERS = [
  "Mason M","Ethan D","Gabe D","Daniel M","Mitchell S","Evan R","John",
  "Aiden","Reese C","Keely S","Sergio G","Nic D","Rylan Z","Tyler L",
  "Ryan M","Henry","Gavin","Cole","Jake","Nate B"
];

const DEFAULT_JOBS = [
  { id:"basement", name:"Basement", area:"basement", people:2, desc:"Sweep, mop, wipe surfaces, empty trash", rotating:false },
  { id:"1bath", name:"1st Floor Bathroom", area:"first", people:1, desc:"Scrub toilet, sink, mirror, mop floor", rotating:false },
  { id:"pool", name:"Pool Room", area:"first", people:1, desc:"Vacuum, wipe tables, organize", rotating:false },
  { id:"entrance", name:"Entrance / Basement Stairs", area:"first", people:1, desc:"Sweep stairs, clean entryway, wipe rails", rotating:false },
  { id:"front", name:"Outside Front / Porch", area:"outside", people:1, desc:"Sweep porch, pick up trash, check chairs", rotating:false },
  { id:"2hall", name:"2nd Floor Hall / Stairs", area:"second", people:1, desc:"Vacuum hall, wipe rails, clean light switches", rotating:false },
  { id:"2bath", name:"2nd Floor Bathroom", area:"second", people:2, desc:"Scrub toilet, shower, sink, mop floor", rotating:false },
  { id:"3hall", name:"3rd Floor Hall / Stairs", area:"third", people:2, desc:"Vacuum hall, wipe rails, clean light switches", rotating:false },
  { id:"3bath", name:"3rd Floor Bathroom", area:"third", people:1, desc:"Scrub toilet, shower, sink, mop floor", rotating:false },
  { id:"cups", name:"Big Red Cup Cleaning", area:"common", people:1, desc:"Collect and wash all red cups", rotating:false },
  { id:"kitchen", name:"Kitchen", area:"common", people:1, desc:"Dishes, wipe counters, sweep, take out trash", rotating:false },
  { id:"library", name:"Library", area:"common", people:1, desc:"Dust shelves, organize, vacuum", rotating:false },
  { id:"towels", name:"Clean Towels / Rags", area:"common", people:1, desc:"Wash, dry, fold, distribute", rotating:false },
  { id:"back", name:"Outside Back / Fire Escape", area:"outside", people:1, desc:"Sweep, clear debris, check fire escape", rotating:false },
  { id:"chapter", name:"Chapter Room / MiniMub", area:"common", people:2, desc:"Deep clean after events, vacuum, wipe surfaces", rotating:true },
];

// ─── SUNDAY CLEANING DEFAULTS ───
const DEFAULT_EVEN_PINS = [
  "Michael M","Derek G","Evan R","Andrew M","Sergio G","Grant M",
  "Nate B","Jacob C","Nic D","Jack D","Daniel K","Michael T",
  "Zach U","Morgan B","Cohl B","Jacob Ch","Michael J",
  "Adlai K","Tyler P","David S","Alex M","James T","Thomas W"
];

const DEFAULT_ODD_PINS = [
  "Ryan M","Tyler L","Daniel M","Jim B","Jordan G","Zach M",
  "Noah C","Reese C","Ethan D","Gabe D","Toby J","Mason Meyer",
  "Brandon G","Rylan Z","Thomas A","Lucas C","Madden H",
  "Sean K","Mason Men","Vance S","Bobo B","Griffin S","Connor U"
];

const DEFAULT_SUNDAY_JOBS = [
  { id:"sun_chapter", name:"Chapter Room / MiniMub", people:4, desc:"Sweep and mop everywhere, move all furniture and clean behind them. Put furniture back into place." },
  { id:"sun_basement", name:"Basement", people:3, desc:"Sweep and mop basement, tidy up everything. Make sure closet by laundry room door is neat." },
  { id:"sun_kitchen", name:"Kitchen", people:3, desc:"Sweep and mop kitchen, do all dishes, clean all surfaces. Put/throw away any left out spices, food etc. Empty grease trap into trash bag and put in dumpster." },
  { id:"sun_timemachine", name:"Time Machine", people:2, desc:"Clean the time machine thoroughly." },
  { id:"sun_2hall", name:"2nd Floor Hall / Stairs", people:2, desc:"Vacuum second floor hallway and sweep stairs." },
  { id:"sun_trash", name:"Take Out All Trash", people:2, desc:"Collect all trash from every room and common area, take to dumpster." },
  { id:"sun_1bath", name:"1st Floor Bathroom", people:2, desc:"Deep clean toilet, sink, shower, mirror, mop floor." },
  { id:"sun_2bath", name:"2nd Floor Bathroom", people:2, desc:"Deep clean toilet, sink, shower, mirror, mop floor." },
  { id:"sun_3bath", name:"3rd Floor Bathroom", people:2, desc:"Deep clean toilet, sink, shower, mirror, mop floor." },
  { id:"sun_movieroom", name:"Movie Room / Den", people:2, desc:"Clean the movie room / den area." },
  { id:"sun_3hall", name:"3rd Floor Hall / Stairs", people:2, desc:"Clean 3rd floor hallway and stairs." },
  { id:"sun_entry", name:"Entry Way", people:2, desc:"Vacuum entry way and clean up." },
  { id:"sun_porch", name:"Porch / Sidewalk", people:2, desc:"Sweep porch and sidewalk. Shovel if needed in winter." },
];

const AREA_META = {
  basement:{ label:"Basement", color:"#6B7280" },
  first:{ label:"1st Floor", color:"#8B5CF6" },
  second:{ label:"2nd Floor", color:"#3B82F6" },
  third:{ label:"3rd Floor", color:"#06B6D4" },
  common:{ label:"Common", color:"#F59E0B" },
  outside:{ label:"Outside", color:"#10B981" },
};
const AREA_KEYS = Object.keys(AREA_META);
const STATUS_CYCLE = ["pending","done","missed","verified"];
const STATUS_CONFIG = {
  pending:{ bg:"#FEF3C7", border:"#F59E0B", text:"#92400E", label:"Pending" },
  done:{ bg:"#D1FAE5", border:"#10B981", text:"#065F46", label:"Done" },
  missed:{ bg:"#FEE2E2", border:"#EF4444", text:"#991B1B", label:"Missed" },
  verified:{ bg:"#DBEAFE", border:"#3B82F6", text:"#1E40AF", label:"Verified" },
};

// ─── HELPERS ───
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length-1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}

function generateAssignments(brothers, jobs, weeks) {
  const pool = shuffle(brothers);
  const asg = {};
  let bi = 0;
  const staticMap = {};
  jobs.filter(j => !j.rotating).forEach(job => {
    const assigned = [];
    for (let p = 0; p < job.people; p++) { assigned.push(pool[bi % pool.length]); bi++; }
    staticMap[job.id] = assigned;
  });
  let ri = 0;
  weeks.forEach(week => {
    asg[week] = {};
    jobs.forEach(job => {
      if (!job.rotating) {
        asg[week][job.id] = { assigned: staticMap[job.id], status:"pending" };
      } else {
        const assigned = [];
        for (let p = 0; p < job.people; p++) { assigned.push(pool[(ri+p) % pool.length]); }
        asg[week][job.id] = { assigned, status:"pending" };
        ri += job.people;
      }
    });
  });
  return asg;
}

function generateSundayAssignments(evenPins, oddPins, sundayJobs, weeks) {
  const asg = {};
  weeks.forEach((week, wi) => {
    const isEvenWeek = wi % 2 === 0;
    const pool = shuffle(isEvenWeek ? [...evenPins] : [...oddPins]);
    const weekAsg = { group: isEvenWeek ? "even" : "odd", bothGroups: false, jobs: {} };
    let pi = 0;
    sundayJobs.forEach(job => {
      const assigned = [];
      for (let p = 0; p < job.people; p++) {
        assigned.push(pool[pi % pool.length]);
        pi++;
      }
      weekAsg.jobs[job.id] = { assigned, status: "pending" };
    });
    asg[week] = weekAsg;
  });
  return asg;
}

function regenerateSundayWeek(weekAsg, evenPins, oddPins, sundayJobs) {
  const isBoth = weekAsg.bothGroups;
  const group = weekAsg.group;
  let pool;
  if (isBoth) { pool = shuffle([...evenPins, ...oddPins]); }
  else { pool = shuffle(group === "even" ? [...evenPins] : [...oddPins]); }
  const jobs = {};
  let pi = 0;
  sundayJobs.forEach(job => {
    const assigned = [];
    for (let p = 0; p < job.people; p++) { assigned.push(pool[pi % pool.length]); pi++; }
    jobs[job.id] = { assigned, status: "pending" };
  });
  return { ...weekAsg, jobs };
}

async function hashPassword(pw) {
  const enc = new TextEncoder().encode(pw);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,"0")).join("");
}

// ─── FIREBASE KEY SANITIZATION ───
function sanitizeKey(key) { return key.replace(/[.#$/\[\]]/g, "_"); }
function sanitizeObjKeys(obj) {
  const out = {};
  Object.entries(obj).forEach(([k, v]) => { out[sanitizeKey(k)] = v; });
  return out;
}
function desanitizeObjKeys(obj, keys) {
  const map = {};
  keys.forEach(k => { map[sanitizeKey(k)] = k; });
  const out = {};
  Object.entries(obj).forEach(([sk, v]) => { out[map[sk] || sk] = v; });
  return out;
}

// ─── FIREBASE MODULE ───
let db = null;
let firebaseReady = false;

async function initFirebase() {
  if (firebaseReady) return true;
  if (FIREBASE_CONFIG.apiKey === "YOUR_API_KEY") return false;
  try {
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js");
    const { getDatabase } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js");
    const app = initializeApp(FIREBASE_CONFIG);
    db = getDatabase(app);
    firebaseReady = true;
    return true;
  } catch (e) { console.error("Firebase init failed:", e); return false; }
}

async function fbSet(path, data) {
  if (!firebaseReady) return;
  const { ref, set } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js");
  return set(ref(db, path), data);
}

async function fbGet(path) {
  if (!firebaseReady) return null;
  const { ref, get } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js");
  const snap = await get(ref(db, path));
  return snap.exists() ? snap.val() : null;
}

async function fbOnValue(path, callback) {
  if (!firebaseReady) return () => {};
  const { ref, onValue } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js");
  return onValue(ref(db, path), snap => { callback(snap.exists() ? snap.val() : null); });
}

// ─── SMALL COMPONENTS ───
function StatusBadge({ status, onClick, disabled }) {
  const c = STATUS_CONFIG[status];
  return (
    <button onClick={disabled ? undefined : onClick} style={{
      background:c.bg, border:`1.5px solid ${c.border}`, color:c.text,
      borderRadius:6, padding:"3px 10px", fontSize:12, fontWeight:600,
      cursor:disabled?"default":"pointer", fontFamily:"inherit", letterSpacing:"0.02em",
      opacity:disabled?0.7:1,
    }}>{c.label}</button>
  );
}

function Input({ value, onChange, placeholder, style, type="text" }) {
  return <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    style={{ background:"#0F172A", border:"1px solid #334155", color:"#E2E8F0", borderRadius:8, padding:"10px 14px", fontSize:14, fontFamily:"inherit", width:"100%", outline:"none", ...style }}
    onFocus={e => e.target.style.borderColor="#10B981"} onBlur={e => e.target.style.borderColor="#334155"} />;
}

function SmallBtn({ children, onClick, color="#10B981" }) {
  return <button onClick={onClick} style={{ background:`${color}18`, border:`1px solid ${color}50`, color, borderRadius:6, padding:"5px 12px", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>{children}</button>;
}

function SyncDot({ connected }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:5 }}>
      <div style={{ width:7, height:7, borderRadius:"50%", background:connected?"#10B981":"#EF4444", boxShadow:connected?"0 0 6px #10B98180":"0 0 6px #EF444480", animation:connected?undefined:"pulse 1.5s infinite" }}/>
      <span style={{ fontSize:10, color:"#64748B", fontFamily:"'Space Mono',monospace" }}>{connected?"LIVE":"LOCAL"}</span>
    </div>
  );
}

function GroupBadge({ group, bothGroups }) {
  if (bothGroups) return <span style={{ fontSize:11, fontWeight:700, color:"#F59E0B", background:"#F59E0B18", padding:"2px 8px", borderRadius:4, border:"1px solid #F59E0B30" }}>BOTH GROUPS</span>;
  const isEven = group === "even";
  return <span style={{ fontSize:11, fontWeight:700, color:isEven?"#8B5CF6":"#06B6D4", background:isEven?"#8B5CF618":"#06B6D418", padding:"2px 8px", borderRadius:4, border:`1px solid ${isEven?"#8B5CF630":"#06B6D430"}` }}>{isEven?"EVEN PINS":"ODD PINS"}</span>;
}

// ─── MAIN APP ───
export default function HouseJobsApp() {
  const [loading, setLoading] = useState(true);
  const [fbConnected, setFbConnected] = useState(false);
  const [view, setView] = useState("dashboard");
  const [semesterName, setSemesterName] = useState("Fall 2026");
  const [brothers, setBrothers] = useState(DEFAULT_BROTHERS);
  const [jobs, setJobs] = useState(DEFAULT_JOBS);
  const [weeks, setWeeks] = useState(DEFAULT_WEEKS);
  const [assignments, setAssignments] = useState({});
  const [currentWeekIdx, setCurrentWeekIdx] = useState(0);
  const [selectedBrother, setSelectedBrother] = useState(null);
  const [showJobDetail, setShowJobDetail] = useState(null);
  const [areaFilter, setAreaFilter] = useState(null);

  // Sunday state
  const [evenPins, setEvenPins] = useState(DEFAULT_EVEN_PINS);
  const [oddPins, setOddPins] = useState(DEFAULT_ODD_PINS);
  const [sundayJobs, setSundayJobs] = useState(DEFAULT_SUNDAY_JOBS);
  const [sundayAssignments, setSundayAssignments] = useState({});
  const [sundayEditingJob, setSundayEditingJob] = useState(null);
  const [sundayEditNames, setSundayEditNames] = useState("");

  // Setup
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState(false);
  const [editName, setEditName] = useState("");
  const [editJobName, setEditJobName] = useState("");
  const [editJobArea, setEditJobArea] = useState("common");
  const [editJobPeople, setEditJobPeople] = useState(1);
  const [editJobRotating, setEditJobRotating] = useState(false);
  const [editJobDesc, setEditJobDesc] = useState("");
  const [editWeekStart, setEditWeekStart] = useState("");
  const [editWeekEnd, setEditWeekEnd] = useState("");
  const [confirmRegen, setConfirmRegen] = useState(false);
  const [setupTab, setSetupTab] = useState("brothers");
  const [saving, setSaving] = useState(false);
  // Sunday setup
  const [sunSetupTab, setSunSetupTab] = useState("even");
  const [sunEditName, setSunEditName] = useState("");
  const [sunEditJobName, setSunEditJobName] = useState("");
  const [sunEditJobPeople, setSunEditJobPeople] = useState(2);
  const [sunEditJobDesc, setSunEditJobDesc] = useState("");

  const skipSync = useRef(false);
  const skipSunSync = useRef(false);

  // ─── INIT ───
  useEffect(() => {
    (async () => {
      const connected = await initFirebase();
      setFbConnected(connected);
      if (connected) {
        const cfg = await fbGet("config");
        const asg = await fbGet("assignments");
        const sunCfg = await fbGet("sundayConfig");
        const sunAsg = await fbGet("sundayAssignments");
        const w = cfg?.weeks || DEFAULT_WEEKS;
        if (cfg) { setBrothers(cfg.brothers||DEFAULT_BROTHERS); setJobs(cfg.jobs||DEFAULT_JOBS); setWeeks(w); setSemesterName(cfg.semesterName||"Fall 2026"); }
        if (asg) { setAssignments(desanitizeObjKeys(asg, w)); } else { const a = generateAssignments(cfg?.brothers||DEFAULT_BROTHERS, cfg?.jobs||DEFAULT_JOBS, w); setAssignments(a); await fbSet("assignments", sanitizeObjKeys(a)); }
        if (sunCfg) { setEvenPins(sunCfg.evenPins||DEFAULT_EVEN_PINS); setOddPins(sunCfg.oddPins||DEFAULT_ODD_PINS); setSundayJobs(sunCfg.sundayJobs||DEFAULT_SUNDAY_JOBS); }
        if (sunAsg) { setSundayAssignments(desanitizeObjKeys(sunAsg, w)); } else { const sa = generateSundayAssignments(sunCfg?.evenPins||DEFAULT_EVEN_PINS, sunCfg?.oddPins||DEFAULT_ODD_PINS, sunCfg?.sundayJobs||DEFAULT_SUNDAY_JOBS, w); setSundayAssignments(sa); await fbSet("sundayAssignments", sanitizeObjKeys(sa)); }

        fbOnValue("assignments", data => { if(skipSync.current){skipSync.current=false;return;} if(data){setAssignments(desanitizeObjKeys(data,w));} });
        fbOnValue("config", data => { if(data){setBrothers(data.brothers||DEFAULT_BROTHERS);setJobs(data.jobs||DEFAULT_JOBS);setWeeks(data.weeks||DEFAULT_WEEKS);setSemesterName(data.semesterName||"Fall 2026");} });
        fbOnValue("sundayAssignments", data => { if(skipSunSync.current){skipSunSync.current=false;return;} if(data){setSundayAssignments(desanitizeObjKeys(data,w));} });
        fbOnValue("sundayConfig", data => { if(data){setEvenPins(data.evenPins||DEFAULT_EVEN_PINS);setOddPins(data.oddPins||DEFAULT_ODD_PINS);setSundayJobs(data.sundayJobs||DEFAULT_SUNDAY_JOBS);} });
      } else {
        try {
          const cfg = await window.storage.get("housejobs:config");
          const asg = await window.storage.get("housejobs:assignments");
          const sunCfg = await window.storage.get("housejobs:sundayConfig");
          const sunAsg = await window.storage.get("housejobs:sundayAssignments");
          if(cfg?.value){const p=JSON.parse(cfg.value);setBrothers(p.brothers||DEFAULT_BROTHERS);setJobs(p.jobs||DEFAULT_JOBS);setWeeks(p.weeks||DEFAULT_WEEKS);setSemesterName(p.semesterName||"Fall 2026");}
          if(asg?.value) setAssignments(JSON.parse(asg.value)); else setAssignments(generateAssignments(DEFAULT_BROTHERS,DEFAULT_JOBS,DEFAULT_WEEKS));
          if(sunCfg?.value){const p=JSON.parse(sunCfg.value);setEvenPins(p.evenPins||DEFAULT_EVEN_PINS);setOddPins(p.oddPins||DEFAULT_ODD_PINS);setSundayJobs(p.sundayJobs||DEFAULT_SUNDAY_JOBS);}
          if(sunAsg?.value) setSundayAssignments(JSON.parse(sunAsg.value)); else setSundayAssignments(generateSundayAssignments(DEFAULT_EVEN_PINS,DEFAULT_ODD_PINS,DEFAULT_SUNDAY_JOBS,DEFAULT_WEEKS));
        } catch { setAssignments(generateAssignments(DEFAULT_BROTHERS,DEFAULT_JOBS,DEFAULT_WEEKS)); setSundayAssignments(generateSundayAssignments(DEFAULT_EVEN_PINS,DEFAULT_ODD_PINS,DEFAULT_SUNDAY_JOBS,DEFAULT_WEEKS)); }
      }
      setLoading(false);
    })();
  }, []);

  // ─── SAVE ───
  const saveAssignments = useCallback(async a => { if(fbConnected){skipSync.current=true;await fbSet("assignments",sanitizeObjKeys(a));}else{try{await window.storage.set("housejobs:assignments",JSON.stringify(a));}catch{}} }, [fbConnected]);
  const saveConfig = useCallback(async (b,j,w,sn) => { if(fbConnected){await fbSet("config",{brothers:b,jobs:j,weeks:w,semesterName:sn});}else{try{await window.storage.set("housejobs:config",JSON.stringify({brothers:b,jobs:j,weeks:w,semesterName:sn}));}catch{}} }, [fbConnected]);
  const saveSundayAssignments = useCallback(async a => { if(fbConnected){skipSunSync.current=true;await fbSet("sundayAssignments",sanitizeObjKeys(a));}else{try{await window.storage.set("housejobs:sundayAssignments",JSON.stringify(a));}catch{}} }, [fbConnected]);
  const saveSundayConfig = useCallback(async (ep,op,sj) => { if(fbConnected){await fbSet("sundayConfig",{evenPins:ep,oddPins:op,sundayJobs:sj});}else{try{await window.storage.set("housejobs:sundayConfig",JSON.stringify({evenPins:ep,oddPins:op,sundayJobs:sj}));}catch{}} }, [fbConnected]);

  // ─── PASSWORD ───
  async function checkPassword() {
    const hash = await hashPassword(pwInput);
    if (hash === "d85802bb9e9169949367f292bfdf4ca200139b4c44bc47a50700535f16fba13e") { setAdminUnlocked(true); setPwError(false); } else { setPwError(true); }
  }

  const currentWeek = weeks[currentWeekIdx] || "";
  const weekData = assignments[currentWeek] || {};
  const sunWeekData = sundayAssignments[currentWeek] || { group:"even", bothGroups:false, jobs:{} };

  function cycleStatus(week, jobId, isAdmin) {
    setAssignments(prev => {
      const u=JSON.parse(JSON.stringify(prev));
      if(u[week]?.[jobId]){
        const c=u[week][jobId].status;
        if(isAdmin){
          // Admin can cycle through all: pending→done→missed→verified→pending
          u[week][jobId].status=STATUS_CYCLE[(STATUS_CYCLE.indexOf(c)+1)%STATUS_CYCLE.length];
        } else {
          // Brothers can only toggle pending↔done
          if(c==="pending") u[week][jobId].status="done";
          else if(c==="done") u[week][jobId].status="pending";
          // Can't change missed or verified without admin
        }
      }
      saveAssignments(u); return u;
    });
  }

  function cycleSundayStatus(week, jobId, isAdmin) {
    setSundayAssignments(prev => {
      const u=JSON.parse(JSON.stringify(prev));
      if(u[week]?.jobs?.[jobId]){
        const c=u[week].jobs[jobId].status;
        if(isAdmin){
          u[week].jobs[jobId].status=STATUS_CYCLE[(STATUS_CYCLE.indexOf(c)+1)%STATUS_CYCLE.length];
        } else {
          if(c==="pending") u[week].jobs[jobId].status="done";
          else if(c==="done") u[week].jobs[jobId].status="pending";
        }
      }
      saveSundayAssignments(u); return u;
    });
  }

  function toggleBothGroups(week) {
    setSundayAssignments(prev => {
      const u = JSON.parse(JSON.stringify(prev));
      if (u[week]) {
        u[week].bothGroups = !u[week].bothGroups;
        // Regenerate assignments for this week with new pool
        const regen = regenerateSundayWeek(u[week], evenPins, oddPins, sundayJobs);
        u[week] = regen;
      }
      saveSundayAssignments(u);
      return u;
    });
  }

  function overrideSundayJob(week, jobId, newNames) {
    setSundayAssignments(prev => {
      const u = JSON.parse(JSON.stringify(prev));
      if (u[week]?.jobs?.[jobId]) { u[week].jobs[jobId].assigned = newNames; }
      saveSundayAssignments(u);
      return u;
    });
  }

  function reshuffleSundayWeek(week) {
    setSundayAssignments(prev => {
      const u = JSON.parse(JSON.stringify(prev));
      if (u[week]) { u[week] = regenerateSundayWeek(u[week], evenPins, oddPins, sundayJobs); }
      saveSundayAssignments(u);
      return u;
    });
  }

  async function regenerate() {
    setSaving(true);
    const a = generateAssignments(brothers, jobs, weeks);
    const sa = generateSundayAssignments(evenPins, oddPins, sundayJobs, weeks);
    setAssignments(a); setSundayAssignments(sa);
    await saveAssignments(a); await saveSundayAssignments(sa);
    await saveConfig(brothers, jobs, weeks, semesterName);
    await saveSundayConfig(evenPins, oddPins, sundayJobs);
    setConfirmRegen(false); setCurrentWeekIdx(0); setView("dashboard"); setSaving(false);
  }

  // ─── STATS ───
  const stats = useMemo(() => {
    const s = {};
    brothers.forEach(b => { s[b] = { total:0, done:0, missed:0, verified:0, pending:0 }; });
    Object.values(assignments).forEach(wj => { if(!wj||typeof wj!=="object")return; Object.values(wj).forEach(entry => { if(!entry?.assigned)return; entry.assigned.forEach(b => { if(s[b]){s[b].total++;s[b][entry.status]++;} }); }); });
    return s;
  }, [assignments, brothers]);

  const weekStats = useMemo(() => {
    const total = Object.keys(weekData).length;
    const done = Object.values(weekData).filter(j => j?.status==="done"||j?.status==="verified").length;
    const missed = Object.values(weekData).filter(j => j?.status==="missed").length;
    return { total, done, missed, pending:total-done-missed };
  }, [weekData]);

  const completionPct = weekStats.total>0 ? Math.round((weekStats.done/weekStats.total)*100) : 0;

  if (loading) return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", background:"#0F1117", color:"#64748B", minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12 }}>
      <div style={{ width:28, height:28, border:"3px solid #334155", borderTop:"3px solid #10B981", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
      <span>Connecting...</span>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const showFirebaseWarning = !fbConnected && FIREBASE_CONFIG.apiKey === "YOUR_API_KEY";

  return (
    <div style={{ fontFamily:"'DM Sans','Segoe UI',sans-serif", background:"#0F1117", color:"#E2E8F0", minHeight:"100vh", maxWidth:520, margin:"0 auto" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,500;0,9..40,700;1,9..40,400&family=Space+Mono:wght@400;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#334155;border-radius:4px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .fu{animation:fadeUp .3s ease both}
        .ch{transition:transform .15s,box-shadow .15s}.ch:hover{transform:translateY(-2px);box-shadow:0 8px 25px rgba(0,0,0,.3)}
        select{appearance:none;-webkit-appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center}
      `}</style>

      {/* HEADER */}
      <div style={{ background:"linear-gradient(135deg,#1E293B,#0F172A)", borderBottom:"1px solid #1E293B", padding:"20px 20px 16px", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <h1 style={{ fontFamily:"'Space Mono',monospace", fontSize:20, fontWeight:700, color:"#F8FAFC", letterSpacing:"-0.02em" }}>HOUSE JOBS</h1>
              <SyncDot connected={fbConnected} />
            </div>
            <p style={{ fontSize:12, color:"#64748B", marginTop:2, fontFamily:"'Space Mono',monospace" }}>{semesterName} • Week {currentWeekIdx+1}/{weeks.length}</p>
          </div>
          {!["setup","sunday_setup"].includes(view) && (
            <div style={{ width:52, height:52, borderRadius:"50%", background:`conic-gradient(#10B981 ${completionPct*3.6}deg,#1E293B ${completionPct*3.6}deg)`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <div style={{ width:42, height:42, borderRadius:"50%", background:"#0F172A", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"#10B981", fontFamily:"'Space Mono',monospace" }}>{completionPct}%</div>
            </div>
          )}
        </div>
        {!["setup","sunday_setup"].includes(view) && (
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <button onClick={() => setCurrentWeekIdx(Math.max(0,currentWeekIdx-1))} style={{ background:"#1E293B", border:"1px solid #334155", color:"#94A3B8", borderRadius:6, width:32, height:32, cursor:"pointer", fontSize:16, fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center" }}>‹</button>
            <div style={{ flex:1, background:"#1E293B", border:"1px solid #334155", borderRadius:8, padding:"8px 14px", textAlign:"center", fontSize:14, fontWeight:600, color:"#CBD5E1", fontFamily:"'Space Mono',monospace" }}>{currentWeek}</div>
            <button onClick={() => setCurrentWeekIdx(Math.min(weeks.length-1,currentWeekIdx+1))} style={{ background:"#1E293B", border:"1px solid #334155", color:"#94A3B8", borderRadius:6, width:32, height:32, cursor:"pointer", fontSize:16, fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center" }}>›</button>
          </div>
        )}
      </div>

      {showFirebaseWarning && (
        <div style={{ margin:"12px 20px 0", background:"#78350F30", border:"1px solid #F59E0B50", borderRadius:10, padding:"12px 16px" }}>
          <p style={{ fontSize:12, color:"#FCD34D", fontWeight:600, marginBottom:4 }}>⚠ Firebase not configured</p>
          <p style={{ fontSize:11, color:"#D97706", lineHeight:1.5 }}>Data stored locally only. Paste Firebase config to enable live sync.</p>
        </div>
      )}

      {/* NAV */}
      <div style={{ display:"flex", gap:1, padding:"12px 16px 0", borderBottom:"1px solid #1E293B", background:"#0F1117", overflowX:"auto" }}>
        {[
          { key:"dashboard", label:"Weekly" },
          { key:"sunday", label:"Sunday" },
          { key:"roster", label:"Roster" },
          { key:"leaderboard", label:"Board" },
          { key:"setup", label:"⚙" },
        ].map(tab => (
          <button key={tab.key} onClick={() => { setView(tab.key); setSelectedBrother(null); }} style={{
            flex:1, padding:"10px 0 12px", background:"none", border:"none", minWidth:0,
            color:view===tab.key?"#F8FAFC":"#64748B", fontSize:12, fontWeight:view===tab.key?700:500,
            cursor:"pointer", fontFamily:"inherit",
            borderBottom:view===tab.key?`2px solid ${tab.key==="setup"?"#F59E0B":tab.key==="sunday"?"#8B5CF6":"#10B981"}`:"2px solid transparent",
          }}>{tab.label}</button>
        ))}
      </div>

      {/* CONTENT */}
      <div style={{ padding:"16px 20px 100px" }}>

        {/* ══════ DASHBOARD ══════ */}
        {view === "dashboard" && (
          <div className="fu">
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:20 }}>
              {[{n:weekStats.done,l:"Done",c:"#10B981"},{n:weekStats.pending,l:"Pending",c:"#F59E0B"},{n:weekStats.missed,l:"Missed",c:"#EF4444"}].map(s => (
                <div key={s.l} style={{ background:"#1E293B", borderRadius:10, padding:"14px 12px", textAlign:"center", border:"1px solid #334155" }}>
                  <div style={{ fontSize:26, fontWeight:700, color:s.c, fontFamily:"'Space Mono',monospace", lineHeight:1 }}>{s.n}</div>
                  <div style={{ fontSize:11, color:"#64748B", marginTop:4, fontWeight:500 }}>{s.l}</div>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:6, marginBottom:16, flexWrap:"wrap" }}>
              <button onClick={() => setAreaFilter(null)} style={{ background:!areaFilter?"#334155":"#1E293B", border:`1px solid ${!areaFilter?"#475569":"#334155"}`, color:!areaFilter?"#F8FAFC":"#94A3B8", borderRadius:20, padding:"5px 14px", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>All</button>
              {AREA_KEYS.map(k => (
                <button key={k} onClick={() => setAreaFilter(areaFilter===k?null:k)} style={{ background:areaFilter===k?AREA_META[k].color+"22":"#1E293B", border:`1px solid ${areaFilter===k?AREA_META[k].color:"#334155"}`, color:areaFilter===k?AREA_META[k].color:"#94A3B8", borderRadius:20, padding:"5px 14px", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>{AREA_META[k].label}</button>
              ))}
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {jobs.filter(j => !areaFilter||j.area===areaFilter).map((job,i) => {
                const data = weekData[job.id]; if(!data) return null;
                const area = AREA_META[job.area]||{label:"?",color:"#6B7280"};
                return (
                  <div key={job.id} className="ch fu" onClick={() => setShowJobDetail(showJobDetail===job.id?null:job.id)} style={{ background:"#1E293B", borderRadius:12, padding:"14px 16px", border:`1px solid ${data.status==="missed"?"#EF444440":"#334155"}`, animationDelay:`${i*.03}s`, cursor:"pointer" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <div style={{ width:8,height:8,borderRadius:"50%",background:area.color,boxShadow:`0 0 6px ${area.color}60`,flexShrink:0 }}/>
                          <span style={{ fontSize:14,fontWeight:600,color:"#F1F5F9" }}>{job.name}</span>
                          {job.rotating && <span style={{ fontSize:10,color:"#F59E0B",background:"#F59E0B18",padding:"1px 7px",borderRadius:4,fontWeight:600,border:"1px solid #F59E0B30" }}>ROT</span>}
                        </div>
                        <div style={{ fontSize:13,color:"#94A3B8",marginTop:4,marginLeft:16 }}>{data.assigned?.join(", ")}</div>
                      </div>
                      <StatusBadge status={data.status} onClick={e => { e.stopPropagation(); cycleStatus(currentWeek,job.id,adminUnlocked); }} />
                    </div>
                    {showJobDetail===job.id && (
                      <div style={{ marginTop:12,paddingTop:12,borderTop:"1px solid #334155",fontSize:12,color:"#64748B",lineHeight:1.6 }}>
                        <span style={{ color:"#94A3B8",fontWeight:600 }}>What to do: </span>{job.desc}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════ SUNDAY CLEANING ══════ */}
        {view === "sunday" && (
          <div className="fu">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <div>
                <h2 style={{ fontSize:16, fontWeight:700, color:"#F1F5F9", marginBottom:4 }}>Sunday Cleaning</h2>
                <GroupBadge group={sunWeekData.group} bothGroups={sunWeekData.bothGroups} />
              </div>
              {adminUnlocked && (
                <div style={{ display:"flex", gap:6 }}>
                  <SmallBtn onClick={() => toggleBothGroups(currentWeek)} color="#F59E0B">{sunWeekData.bothGroups ? "Split" : "Both"}</SmallBtn>
                  <SmallBtn onClick={() => reshuffleSundayWeek(currentWeek)} color="#8B5CF6">Shuffle</SmallBtn>
                </div>
              )}
            </div>

            {!adminUnlocked && (
              <div style={{ background:"#1E293B", borderRadius:10, padding:"10px 14px", border:"1px solid #334155", marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:12, color:"#64748B" }}>🔒 HM access required to edit. </span>
                <Input type="password" value={pwInput} onChange={v=>{setPwInput(v);setPwError(false);}} placeholder="Password" style={{ flex:1, padding:"6px 10px", fontSize:12 }} />
                <SmallBtn onClick={checkPassword}>Unlock</SmallBtn>
              </div>
            )}

            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {sundayJobs.map((job, i) => {
                const data = sunWeekData.jobs?.[job.id];
                if (!data) return null;
                const isEditing = sundayEditingJob === job.id;
                return (
                  <div key={job.id} className="fu" style={{ background:"#1E293B", borderRadius:12, padding:"14px 16px", border:"1px solid #334155", animationDelay:`${i*.03}s` }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <div style={{ width:8, height:8, borderRadius:"50%", background:"#8B5CF6", boxShadow:"0 0 6px #8B5CF660", flexShrink:0 }}/>
                          <span style={{ fontSize:14, fontWeight:600, color:"#F1F5F9" }}>{job.name}</span>
                          <span style={{ fontSize:10, color:"#64748B" }}>×{job.people}</span>
                        </div>
                        <div style={{ fontSize:13, color:"#94A3B8", marginTop:4, marginLeft:16 }}>{data.assigned?.join(", ")}</div>
                        <div style={{ fontSize:11, color:"#475569", marginTop:4, marginLeft:16, lineHeight:1.4 }}>{job.desc}</div>
                      </div>
                      <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                        {adminUnlocked && (
                          <button onClick={() => { if(isEditing){setSundayEditingJob(null);}else{setSundayEditingJob(job.id);setSundayEditNames(data.assigned?.join(", ")||"");} }}
                            style={{ background:"none", border:"none", color:"#64748B", cursor:"pointer", fontSize:14, padding:"0 4px" }}>✏️</button>
                        )}
                        <StatusBadge status={data.status} onClick={e => { e.stopPropagation(); cycleSundayStatus(currentWeek, job.id, adminUnlocked); }} />
                      </div>
                    </div>
                    {isEditing && adminUnlocked && (
                      <div style={{ marginTop:10, paddingTop:10, borderTop:"1px solid #334155", display:"flex", gap:8 }}>
                        <Input value={sundayEditNames} onChange={setSundayEditNames} placeholder="Names, comma separated" style={{ flex:1, padding:"6px 10px", fontSize:12 }} />
                        <SmallBtn onClick={() => { overrideSundayJob(currentWeek, job.id, sundayEditNames.split(",").map(n=>n.trim()).filter(Boolean)); setSundayEditingJob(null); }}>Save</SmallBtn>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {adminUnlocked && (
              <button onClick={() => setView("sunday_setup")} style={{ marginTop:20, width:"100%", background:"#1E293B", border:"1px solid #334155", color:"#94A3B8", borderRadius:10, padding:"12px", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
                ⚙ Edit Sunday Roster & Jobs
              </button>
            )}
          </div>
        )}

        {/* ══════ SUNDAY SETUP ══════ */}
        {view === "sunday_setup" && adminUnlocked && (
          <div className="fu">
            <button onClick={() => setView("sunday")} style={{ background:"none",border:"none",color:"#8B5CF6",fontSize:13,cursor:"pointer",fontFamily:"inherit",marginBottom:12,fontWeight:600,padding:0 }}>← Back to Sunday</button>
            <h2 style={{ fontSize:16, fontWeight:700, color:"#F1F5F9", marginBottom:16 }}>Sunday Cleaning Setup</h2>

            <div style={{ display:"flex", gap:6, marginBottom:16 }}>
              {[{key:"even",label:`Even (${evenPins.length})`},{key:"odd",label:`Odd (${oddPins.length})`},{key:"sunjobs",label:`Jobs (${sundayJobs.length})`}].map(t => (
                <button key={t.key} onClick={() => setSunSetupTab(t.key)} style={{ flex:1,padding:"8px 0",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",background:sunSetupTab===t.key?"#8B5CF618":"#1E293B",border:`1px solid ${sunSetupTab===t.key?"#8B5CF6":"#334155"}`,color:sunSetupTab===t.key?"#8B5CF6":"#94A3B8" }}>{t.label}</button>
              ))}
            </div>

            {sunSetupTab === "even" && (
              <div>
                <div style={{ display:"flex",gap:8,marginBottom:12 }}>
                  <Input value={sunEditName} onChange={setSunEditName} placeholder="Add even pin brother..." style={{ flex:1 }} />
                  <SmallBtn onClick={() => { if(sunEditName.trim()&&!evenPins.includes(sunEditName.trim())){const n=[...evenPins,sunEditName.trim()];setEvenPins(n);saveSundayConfig(n,oddPins,sundayJobs);setSunEditName("");} }} color="#8B5CF6">+ Add</SmallBtn>
                </div>
                <div style={{ display:"flex",flexDirection:"column",gap:4 }}>
                  {evenPins.map((b,i) => (
                    <div key={i} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",background:"#1E293B",borderRadius:8,padding:"8px 12px",border:"1px solid #334155" }}>
                      <span style={{ fontSize:14,color:"#CBD5E1" }}>{b}</span>
                      <button onClick={() => {const n=evenPins.filter((_,j)=>j!==i);setEvenPins(n);saveSundayConfig(n,oddPins,sundayJobs);}} style={{ background:"none",border:"none",color:"#EF4444",cursor:"pointer",fontSize:18,fontFamily:"inherit",padding:"0 4px",lineHeight:1 }}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {sunSetupTab === "odd" && (
              <div>
                <div style={{ display:"flex",gap:8,marginBottom:12 }}>
                  <Input value={sunEditName} onChange={setSunEditName} placeholder="Add odd pin brother..." style={{ flex:1 }} />
                  <SmallBtn onClick={() => { if(sunEditName.trim()&&!oddPins.includes(sunEditName.trim())){const n=[...oddPins,sunEditName.trim()];setOddPins(n);saveSundayConfig(evenPins,n,sundayJobs);setSunEditName("");} }} color="#06B6D4">+ Add</SmallBtn>
                </div>
                <div style={{ display:"flex",flexDirection:"column",gap:4 }}>
                  {oddPins.map((b,i) => (
                    <div key={i} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",background:"#1E293B",borderRadius:8,padding:"8px 12px",border:"1px solid #334155" }}>
                      <span style={{ fontSize:14,color:"#CBD5E1" }}>{b}</span>
                      <button onClick={() => {const n=oddPins.filter((_,j)=>j!==i);setOddPins(n);saveSundayConfig(evenPins,n,sundayJobs);}} style={{ background:"none",border:"none",color:"#EF4444",cursor:"pointer",fontSize:18,fontFamily:"inherit",padding:"0 4px",lineHeight:1 }}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {sunSetupTab === "sunjobs" && (
              <div>
                <div style={{ background:"#1E293B",borderRadius:10,padding:14,border:"1px solid #334155",marginBottom:12 }}>
                  <Input value={sunEditJobName} onChange={setSunEditJobName} placeholder="Job name..." style={{ marginBottom:8 }} />
                  <Input value={sunEditJobDesc} onChange={setSunEditJobDesc} placeholder="Description..." style={{ marginBottom:8 }} />
                  <div style={{ display:"flex",gap:12,alignItems:"center" }}>
                    <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                      <label style={{ fontSize:12,color:"#94A3B8" }}>People:</label>
                      <select value={sunEditJobPeople} onChange={e => setSunEditJobPeople(+e.target.value)} style={{ background:"#0F172A",border:"1px solid #334155",color:"#E2E8F0",borderRadius:6,padding:"6px 24px 6px 10px",fontSize:13,fontFamily:"inherit" }}>
                        {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                    <div style={{ flex:1 }}/>
                    <SmallBtn onClick={() => {
                      if(sunEditJobName.trim()){
                        const n=[...sundayJobs,{id:"sun_"+sunEditJobName.trim().toLowerCase().replace(/\s+/g,"_")+"_"+Date.now(),name:sunEditJobName.trim(),people:sunEditJobPeople,desc:sunEditJobDesc.trim()}];
                        setSundayJobs(n);saveSundayConfig(evenPins,oddPins,n);setSunEditJobName("");setSunEditJobDesc("");setSunEditJobPeople(2);
                      }
                    }} color="#8B5CF6">+ Add</SmallBtn>
                  </div>
                </div>
                <div style={{ display:"flex",flexDirection:"column",gap:4 }}>
                  {sundayJobs.map((j,i) => (
                    <div key={j.id} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",background:"#1E293B",borderRadius:8,padding:"8px 12px",border:"1px solid #334155" }}>
                      <div>
                        <span style={{ fontSize:13,color:"#CBD5E1" }}>{j.name}</span>
                        <span style={{ fontSize:11,color:"#64748B",marginLeft:8 }}>×{j.people}</span>
                      </div>
                      <button onClick={() => {const n=sundayJobs.filter((_,k)=>k!==i);setSundayJobs(n);saveSundayConfig(evenPins,oddPins,n);}} style={{ background:"none",border:"none",color:"#EF4444",cursor:"pointer",fontSize:18,fontFamily:"inherit",padding:"0 4px",lineHeight:1 }}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => { const sa=generateSundayAssignments(evenPins,oddPins,sundayJobs,weeks); setSundayAssignments(sa); saveSundayAssignments(sa); setView("sunday"); }} style={{ marginTop:20,width:"100%",background:"linear-gradient(135deg,#8B5CF6,#7C3AED)",border:"none",color:"#FFF",borderRadius:10,padding:"14px",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"inherit" }}>
              🔄 Regenerate Sunday Assignments
            </button>
          </div>
        )}

        {/* ══════ ROSTER ══════ */}
        {view === "roster" && !selectedBrother && (
          <div className="fu">
            <h2 style={{ fontSize:16,fontWeight:700,color:"#F1F5F9",marginBottom:4 }}>Full Roster</h2>
            <p style={{ fontSize:12,color:"#64748B",marginBottom:16 }}>Weekly house jobs roster. Tap for details.</p>
            <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
              {brothers.map((b,i) => {
                const s = stats[b]||{total:0,done:0,verified:0};
                const pct = s.total>0?Math.round(((s.done+(s.verified||0))/s.total)*100):0;
                return (
                  <div key={b} className="ch fu" onClick={() => setSelectedBrother(b)} style={{ background:"#1E293B",borderRadius:10,padding:"12px 16px",border:"1px solid #334155",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",animationDelay:`${i*.025}s` }}>
                    <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                      <div style={{ width:36,height:36,borderRadius:"50%",background:`linear-gradient(135deg,${Object.values(AREA_META)[i%6].color}44,${Object.values(AREA_META)[i%6].color}22)`,border:`1px solid ${Object.values(AREA_META)[i%6].color}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:Object.values(AREA_META)[i%6].color }}>{b[0]}</div>
                      <div>
                        <div style={{ fontSize:14,fontWeight:600,color:"#F1F5F9" }}>{b}</div>
                        <div style={{ fontSize:11,color:"#64748B" }}>{s.done+(s.verified||0)}/{s.total} completed</div>
                      </div>
                    </div>
                    <div style={{ fontSize:15,fontWeight:700,fontFamily:"'Space Mono',monospace",color:pct>=80?"#10B981":pct>=50?"#F59E0B":"#EF4444" }}>{pct}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {view === "roster" && selectedBrother && (
          <div className="fu">
            <button onClick={() => setSelectedBrother(null)} style={{ background:"none",border:"none",color:"#10B981",fontSize:13,cursor:"pointer",fontFamily:"inherit",marginBottom:12,fontWeight:600,padding:0 }}>← Back</button>
            <div style={{ background:"#1E293B",borderRadius:14,padding:20,border:"1px solid #334155",marginBottom:16 }}>
              <h2 style={{ fontSize:20,fontWeight:700,color:"#F8FAFC",marginBottom:14 }}>{selectedBrother}</h2>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8 }}>
                {[{n:stats[selectedBrother]?.done||0,l:"Done",c:"#10B981"},{n:stats[selectedBrother]?.verified||0,l:"Verified",c:"#3B82F6"},{n:stats[selectedBrother]?.missed||0,l:"Missed",c:"#EF4444"},{n:stats[selectedBrother]?.pending||0,l:"Pending",c:"#F59E0B"}].map(s => (
                  <div key={s.l} style={{ textAlign:"center" }}>
                    <div style={{ fontSize:22,fontWeight:700,color:s.c,fontFamily:"'Space Mono',monospace" }}>{s.n}</div>
                    <div style={{ fontSize:10,color:"#64748B",marginTop:2 }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
            <h3 style={{ fontSize:13,fontWeight:700,color:"#94A3B8",marginBottom:10,letterSpacing:"0.05em" }}>WEEKLY ASSIGNMENTS</h3>
            <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
              {weeks.map((week,wi) => {
                const wj = assignments[week]; if(!wj) return null;
                const myJobs = jobs.filter(j => wj[j.id]?.assigned?.includes(selectedBrother));
                if(!myJobs.length) return null;
                return (
                  <div key={week} style={{ background:wi===currentWeekIdx?"#1E293B":"#151922",borderRadius:10,padding:"10px 14px",border:wi===currentWeekIdx?"1px solid #10B981":"1px solid #1E293B" }}>
                    <div style={{ fontSize:11,color:wi===currentWeekIdx?"#10B981":"#64748B",fontWeight:600,fontFamily:"'Space Mono',monospace",marginBottom:6 }}>{week} {wi===currentWeekIdx&&"← Current"}</div>
                    {myJobs.map(j => (
                      <div key={j.id} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0" }}>
                        <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                          <div style={{ width:6,height:6,borderRadius:"50%",background:(AREA_META[j.area]||{color:"#6B7280"}).color }}/>
                          <span style={{ fontSize:13,color:"#CBD5E1" }}>{j.name}</span>
                        </div>
                        <StatusBadge status={wj[j.id].status} onClick={() => cycleStatus(week,j.id,adminUnlocked)} />
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════ LEADERBOARD ══════ */}
        {view === "leaderboard" && (
          <div className="fu">
            <h2 style={{ fontSize:16,fontWeight:700,color:"#F1F5F9",marginBottom:4 }}>Accountability Board</h2>
            <p style={{ fontSize:12,color:"#64748B",marginBottom:16 }}>Weekly jobs ranked by completion</p>
            {brothers.map(b => ({name:b,...stats[b],pct:stats[b]?.total>0?((stats[b].done+(stats[b].verified||0))/stats[b].total)*100:0})).sort((a,b) => b.pct-a.pct).map((b,i) => {
              const medal = i<3?["🥇","🥈","🥉"][i]:null;
              return (
                <div key={b.name} className="fu" style={{ display:"flex",alignItems:"center",gap:12,background:"#1E293B",borderRadius:10,padding:"12px 16px",border:i<3?`1px solid ${["#F59E0B","#94A3B8","#CD7F32"][i]}40`:"1px solid #334155",marginBottom:6,animationDelay:`${i*.03}s` }}>
                  <div style={{ width:28,fontSize:medal?18:14,textAlign:"center",color:"#64748B",fontWeight:700,fontFamily:"'Space Mono',monospace" }}>{medal||(i+1)}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14,fontWeight:600,color:"#F1F5F9" }}>{b.name}</div>
                    <div style={{ display:"flex",gap:10,marginTop:4 }}>
                      <span style={{ fontSize:11,color:"#10B981" }}>✓ {b.done+(b.verified||0)}</span>
                      <span style={{ fontSize:11,color:"#EF4444" }}>✗ {b.missed}</span>
                      <span style={{ fontSize:11,color:"#F59E0B" }}>○ {b.pending}</span>
                    </div>
                  </div>
                  <div style={{ width:80 }}>
                    <div style={{ height:6,background:"#0F172A",borderRadius:3,overflow:"hidden" }}><div style={{ height:"100%",borderRadius:3,width:`${Math.round(b.pct)}%`,background:b.pct>=80?"#10B981":b.pct>=50?"#F59E0B":"#EF4444" }}/></div>
                    <div style={{ fontSize:11,textAlign:"right",marginTop:3,fontWeight:700,fontFamily:"'Space Mono',monospace",color:b.pct>=80?"#10B981":b.pct>=50?"#F59E0B":"#EF4444" }}>{Math.round(b.pct)}%</div>
                  </div>
                </div>
              );
            })}
            <div style={{ marginTop:20,background:"#1E293B",borderRadius:12,padding:16,border:"1px solid #334155" }}>
              <h3 style={{ fontSize:13,fontWeight:700,color:"#EF4444",marginBottom:8,letterSpacing:"0.05em" }}>FINE TRACKER</h3>
              <p style={{ fontSize:12,color:"#64748B",lineHeight:1.6,marginBottom:12 }}>Per Amendment 22: missed jobs = fines. 3+ misses flagged for Standards.</p>
              {brothers.filter(b => (stats[b]?.missed||0)>0).length===0
                ? <div style={{ fontSize:13,color:"#10B981",textAlign:"center",padding:10 }}>No missed jobs yet!</div>
                : brothers.filter(b => (stats[b]?.missed||0)>0).sort((a,b) => (stats[b]?.missed||0)-(stats[a]?.missed||0)).map(b => (
                  <div key={b} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid #334155" }}>
                    <span style={{ fontSize:13,color:"#CBD5E1" }}>{b}</span>
                    <span style={{ fontSize:12,fontWeight:700,fontFamily:"'Space Mono',monospace",color:(stats[b]?.missed||0)>=3?"#EF4444":"#F59E0B" }}>{stats[b]?.missed||0} miss{(stats[b]?.missed||0)!==1?"es":""}{(stats[b]?.missed||0)>=3&&" ⚠️"}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ══════ SETUP (PASSWORD) ══════ */}
        {view === "setup" && !adminUnlocked && (
          <div className="fu" style={{ maxWidth:340,margin:"40px auto",textAlign:"center" }}>
            <div style={{ width:64,height:64,borderRadius:16,background:"#F59E0B18",border:"1px solid #F59E0B40",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",fontSize:28 }}>🔒</div>
            <h2 style={{ fontSize:18,fontWeight:700,color:"#F1F5F9",marginBottom:6 }}>House Manager Access</h2>
            <p style={{ fontSize:13,color:"#64748B",marginBottom:24,lineHeight:1.5 }}>Enter the admin password to edit settings.</p>
            <Input type="password" value={pwInput} onChange={v=>{setPwInput(v);setPwError(false);}} placeholder="Enter password..." style={{ textAlign:"center",fontSize:16,letterSpacing:"0.1em",marginBottom:12,borderColor:pwError?"#EF4444":"#334155" }} />
            {pwError && <p style={{ fontSize:12,color:"#EF4444",marginBottom:12 }}>Wrong password.</p>}
            <button onClick={checkPassword} style={{ width:"100%",background:"linear-gradient(135deg,#F59E0B,#D97706)",border:"none",color:"#FFF",borderRadius:10,padding:"14px",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"inherit" }}>Unlock</button>
          </div>
        )}

        {view === "setup" && adminUnlocked && (
          <div className="fu">
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
              <h2 style={{ fontSize:16,fontWeight:700,color:"#F1F5F9" }}>Weekly Setup</h2>
              <button onClick={() => {setAdminUnlocked(false);setPwInput("");}} style={{ background:"#1E293B",border:"1px solid #334155",color:"#94A3B8",borderRadius:6,padding:"5px 10px",fontSize:11,cursor:"pointer",fontFamily:"inherit" }}>🔒 Lock</button>
            </div>

            <div style={{ marginBottom:20 }}>
              <label style={{ fontSize:12,color:"#94A3B8",fontWeight:600,display:"block",marginBottom:6 }}>SEMESTER NAME</label>
              <Input value={semesterName} onChange={setSemesterName} placeholder="e.g. Spring 2027" />
            </div>

            <div style={{ display:"flex",gap:6,marginBottom:16 }}>
              {[{key:"brothers",label:`Brothers (${brothers.length})`},{key:"jobs",label:`Jobs (${jobs.length})`},{key:"weeks",label:`Weeks (${weeks.length})`}].map(t => (
                <button key={t.key} onClick={() => setSetupTab(t.key)} style={{ flex:1,padding:"8px 0",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",background:setupTab===t.key?"#F59E0B18":"#1E293B",border:`1px solid ${setupTab===t.key?"#F59E0B":"#334155"}`,color:setupTab===t.key?"#F59E0B":"#94A3B8" }}>{t.label}</button>
              ))}
            </div>

            {setupTab === "brothers" && (
              <div>
                <div style={{ display:"flex",gap:8,marginBottom:12 }}>
                  <Input value={editName} onChange={setEditName} placeholder="Add a brother..." style={{ flex:1 }} />
                  <SmallBtn onClick={() => { if(editName.trim()&&!brothers.includes(editName.trim())){setBrothers([...brothers,editName.trim()]);setEditName("");} }}>+ Add</SmallBtn>
                </div>
                <div style={{ display:"flex",flexDirection:"column",gap:4 }}>
                  {brothers.map((b,i) => (
                    <div key={i} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",background:"#1E293B",borderRadius:8,padding:"8px 12px",border:"1px solid #334155" }}>
                      <span style={{ fontSize:14,color:"#CBD5E1" }}>{b}</span>
                      <button onClick={() => setBrothers(brothers.filter((_,j)=>j!==i))} style={{ background:"none",border:"none",color:"#EF4444",cursor:"pointer",fontSize:18,fontFamily:"inherit",padding:"0 4px",lineHeight:1 }}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {setupTab === "jobs" && (
              <div>
                <div style={{ background:"#1E293B",borderRadius:10,padding:14,border:"1px solid #334155",marginBottom:12 }}>
                  <div style={{ display:"flex",gap:8,marginBottom:8 }}>
                    <Input value={editJobName} onChange={setEditJobName} placeholder="Job name..." style={{ flex:1 }} />
                    <select value={editJobArea} onChange={e=>setEditJobArea(e.target.value)} style={{ background:"#0F172A",border:"1px solid #334155",color:"#E2E8F0",borderRadius:8,padding:"10px 28px 10px 14px",fontSize:13,fontFamily:"inherit" }}>
                      {AREA_KEYS.map(k => <option key={k} value={k}>{AREA_META[k].label}</option>)}
                    </select>
                  </div>
                  <Input value={editJobDesc} onChange={setEditJobDesc} placeholder="Description..." style={{ marginBottom:8 }} />
                  <div style={{ display:"flex",gap:12,alignItems:"center",flexWrap:"wrap" }}>
                    <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                      <label style={{ fontSize:12,color:"#94A3B8" }}>People:</label>
                      <select value={editJobPeople} onChange={e=>setEditJobPeople(+e.target.value)} style={{ background:"#0F172A",border:"1px solid #334155",color:"#E2E8F0",borderRadius:6,padding:"6px 24px 6px 10px",fontSize:13,fontFamily:"inherit" }}>
                        <option value={1}>1</option><option value={2}>2</option><option value={3}>3</option>
                      </select>
                    </div>
                    <label style={{ display:"flex",alignItems:"center",gap:6,fontSize:12,color:"#94A3B8",cursor:"pointer" }}>
                      <input type="checkbox" checked={editJobRotating} onChange={e=>setEditJobRotating(e.target.checked)} style={{ accentColor:"#F59E0B" }} /> Rotating
                    </label>
                    <div style={{ flex:1 }}/>
                    <SmallBtn onClick={() => {
                      if(editJobName.trim()){setJobs([...jobs,{id:editJobName.trim().toLowerCase().replace(/\s+/g,"_")+"_"+Date.now(),name:editJobName.trim(),area:editJobArea,people:editJobPeople,desc:editJobDesc.trim(),rotating:editJobRotating}]);setEditJobName("");setEditJobDesc("");setEditJobPeople(1);setEditJobRotating(false);}
                    }}>+ Add</SmallBtn>
                  </div>
                </div>
                <div style={{ display:"flex",flexDirection:"column",gap:4 }}>
                  {jobs.map((j,i) => (
                    <div key={j.id} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",background:"#1E293B",borderRadius:8,padding:"8px 12px",border:"1px solid #334155" }}>
                      <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                        <div style={{ width:8,height:8,borderRadius:"50%",background:(AREA_META[j.area]||{color:"#6B7280"}).color }}/>
                        <span style={{ fontSize:13,color:"#CBD5E1" }}>{j.name}</span>
                        <span style={{ fontSize:11,color:"#64748B" }}>×{j.people}</span>
                        {j.rotating && <span style={{ fontSize:10,color:"#F59E0B" }}>ROT</span>}
                      </div>
                      <button onClick={() => setJobs(jobs.filter((_,k)=>k!==i))} style={{ background:"none",border:"none",color:"#EF4444",cursor:"pointer",fontSize:18,fontFamily:"inherit",padding:"0 4px",lineHeight:1 }}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {setupTab === "weeks" && (
              <div>
                <div style={{ display:"flex",gap:8,marginBottom:12,alignItems:"center" }}>
                  <Input value={editWeekStart} onChange={setEditWeekStart} placeholder="Start" style={{ flex:1 }} />
                  <span style={{ color:"#64748B" }}>–</span>
                  <Input value={editWeekEnd} onChange={setEditWeekEnd} placeholder="End" style={{ flex:1 }} />
                  <SmallBtn onClick={() => { if(editWeekStart.trim()&&editWeekEnd.trim()){setWeeks([...weeks,`${editWeekStart.trim()}-${editWeekEnd.trim()}`]);setEditWeekStart("");setEditWeekEnd("");} }}>+ Add</SmallBtn>
                </div>
                <div style={{ display:"flex",flexDirection:"column",gap:4 }}>
                  {weeks.map((w,i) => (
                    <div key={i} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",background:i===currentWeekIdx?"#10B98118":"#1E293B",borderRadius:8,padding:"8px 12px",border:`1px solid ${i===currentWeekIdx?"#10B981":"#334155"}` }}>
                      <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                        <span style={{ fontSize:11,color:"#64748B",fontFamily:"'Space Mono',monospace",width:24 }}>{i+1}</span>
                        <span style={{ fontSize:13,color:"#CBD5E1",fontFamily:"'Space Mono',monospace" }}>{w}</span>
                      </div>
                      <button onClick={() => setWeeks(weeks.filter((_,j)=>j!==i))} style={{ background:"none",border:"none",color:"#EF4444",cursor:"pointer",fontSize:18,fontFamily:"inherit",padding:"0 4px",lineHeight:1 }}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginTop:24,display:"flex",flexDirection:"column",gap:10 }}>
              {!confirmRegen ? (
                <button onClick={() => setConfirmRegen(true)} disabled={saving} style={{ background:"linear-gradient(135deg,#10B981,#059669)",border:"none",color:"#FFF",borderRadius:10,padding:"14px 20px",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 4px 15px rgba(16,185,129,0.3)",opacity:saving?0.6:1 }}>{saving?"Saving...":"🔄 Regenerate All Assignments"}</button>
              ) : (
                <div style={{ background:"#7F1D1D20",border:"1px solid #EF444450",borderRadius:10,padding:16 }}>
                  <p style={{ fontSize:13,color:"#FCA5A5",marginBottom:12,lineHeight:1.5 }}>This will erase ALL tracking (weekly + Sunday) and create fresh assignments. Are you sure?</p>
                  <div style={{ display:"flex",gap:8 }}>
                    <button onClick={regenerate} disabled={saving} style={{ flex:1,background:"#EF4444",border:"none",color:"#FFF",borderRadius:8,padding:"10px",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit" }}>{saving?"Saving...":"Yes, Regenerate"}</button>
                    <button onClick={() => setConfirmRegen(false)} style={{ flex:1,background:"#1E293B",border:"1px solid #334155",color:"#94A3B8",borderRadius:8,padding:"10px",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
