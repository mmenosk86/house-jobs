import { useState, useEffect, useMemo, useCallback, useRef } from "react";

/*
 * HOUSE JOBS — Firebase Realtime Database Edition
 * With Sunday Cleaning + House Projects
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
const DEFAULT_WEEKS = ["8/25-8/31","9/1-9/7","9/8-9/14","9/15-9/21","9/22-9/28","9/29-10/5","10/6-10/12","10/13-10/19","10/20-10/26","10/27-11/2","11/3-11/9","11/10-11/16","11/17-11/23","12/1-12/7","12/8-12/14"];
const DEFAULT_BROTHERS = [
  {name:"Mason M",floor:"basement"},{name:"Ethan D",floor:"basement"},{name:"Gabe D",floor:"basement"},{name:"Daniel M",floor:"first"},{name:"Mitchell S",floor:"first"},{name:"Evan R",floor:"first"},
  {name:"John",floor:"first"},{name:"Aiden",floor:"second"},{name:"Reese C",floor:"second"},{name:"Keely S",floor:"second"},{name:"Sergio G",floor:"second"},{name:"Nic D",floor:"third"},
  {name:"Rylan Z",floor:"third"},{name:"Tyler L",floor:"third"},{name:"Ryan M",floor:"third"},{name:"Henry",floor:"first"},{name:"Gavin",floor:"second"},{name:"Cole",floor:"third"},{name:"Jake",floor:"basement"},{name:"Nate B",floor:"second"}
];

const DEFAULT_JOBS = [
  { id:"basement", name:"Basement", area:"basement", people:2, desc:"Sweep, mop, wipe surfaces, empty trash", rotating:false, floorRotate:true },
  { id:"1bath", name:"1st Floor Bathroom", area:"first", people:1, desc:"Scrub toilet, sink, mirror, mop floor", rotating:false, floorRotate:true },
  { id:"pool", name:"Pool Room", area:"first", people:1, desc:"Vacuum, wipe tables, organize", rotating:false, floorRotate:true },
  { id:"entrance", name:"Entrance / Basement Stairs", area:"first", people:1, desc:"Sweep stairs, clean entryway, wipe rails", rotating:false, floorRotate:true },
  { id:"front", name:"Outside Front / Porch", area:"outside", people:1, desc:"Sweep porch, pick up trash, check chairs", rotating:false, floorRotate:false },
  { id:"2hall", name:"2nd Floor Hall / Stairs", area:"second", people:1, desc:"Vacuum hall, wipe rails, clean light switches", rotating:false, floorRotate:true },
  { id:"2bath", name:"2nd Floor Bathroom", area:"second", people:2, desc:"Scrub toilet, shower, sink, mop floor", rotating:false, floorRotate:true },
  { id:"3hall", name:"3rd Floor Hall / Stairs", area:"third", people:2, desc:"Vacuum hall, wipe rails, clean light switches", rotating:false, floorRotate:true },
  { id:"3bath", name:"3rd Floor Bathroom", area:"third", people:1, desc:"Scrub toilet, shower, sink, mop floor", rotating:false, floorRotate:true },
  { id:"cups", name:"Big Red Cup Cleaning", area:"common", people:1, desc:"Collect and wash all red cups", rotating:false, floorRotate:false },
  { id:"kitchen", name:"Kitchen", area:"common", people:1, desc:"Dishes, wipe counters, sweep, take out trash", rotating:false, floorRotate:false },
  { id:"library", name:"Library", area:"common", people:1, desc:"Dust shelves, organize, vacuum", rotating:false, floorRotate:false },
  { id:"towels", name:"Clean Towels / Rags", area:"common", people:1, desc:"Wash, dry, fold, distribute", rotating:false, floorRotate:false },
  { id:"back", name:"Outside Back / Fire Escape", area:"outside", people:1, desc:"Sweep, clear debris, check fire escape", rotating:false, floorRotate:false },
  { id:"chapter", name:"Chapter Room / MiniMub", area:"common", people:2, desc:"Deep clean after events, vacuum, wipe surfaces", rotating:true, floorRotate:false },
];

const DEFAULT_EVEN_PINS = ["Michael M","Derek G","Evan R","Andrew M","Sergio G","Grant M","Nate B","Jacob C","Nic D","Jack D","Daniel K","Michael T","Zach U","Morgan B","Cohl B","Jacob Ch","Michael J","Adlai K","Tyler P","David S","Alex M","James T","Thomas W"];
const DEFAULT_ODD_PINS = ["Ryan M","Tyler L","Daniel M","Jim B","Jordan G","Zach M","Noah C","Reese C","Ethan D","Gabe D","Toby J","Mason Meyer","Brandon G","Rylan Z","Thomas A","Lucas C","Madden H","Sean K","Mason Men","Vance S","Bobo B","Griffin S","Connor U"];

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

// ─── HOUSE PROJECTS (smaller weekly tasks from the PDF) ───
const DEFAULT_PROJECTS = [
  // Basement
  { id:"p01", name:"Replace basement hallway light bulbs", area:"Basement", difficulty:"easy" },
  { id:"p02", name:"Rehang fire extinguisher to west wall by stairs", area:"Basement", difficulty:"easy" },
  { id:"p03", name:"Install door stoppers in basement hallway (x2)", area:"Basement", difficulty:"easy" },
  { id:"p04", name:"Add 3 more coat hangers to the coat rack", area:"Basement", difficulty:"easy" },
  { id:"p05", name:"Spackle and paint basement hallway walls", area:"Basement", difficulty:"medium" },
  { id:"p06", name:"Replace batteries in thermostat and mount it properly", area:"Basement", difficulty:"easy" },
  { id:"p07", name:"Relocate extra smoke detector to the Den", area:"Basement", difficulty:"easy" },
  { id:"p08", name:"Replace the 1 bulb in the Den", area:"Basement", difficulty:"easy" },
  { id:"p09", name:"Install curtain rod and curtain in the Den", area:"Basement", difficulty:"medium" },
  { id:"p10", name:"Update/refresh the bulletin board in basement hallway", area:"Basement", difficulty:"easy" },
  { id:"p11", name:"Replace 3 bulbs in basement bathroom", area:"Basement", difficulty:"easy" },
  { id:"p12", name:"Wash the tile in basement bathroom", area:"Basement", difficulty:"medium" },
  { id:"p13", name:"Fix the door handle in basement bathroom (new screw)", area:"Basement", difficulty:"easy" },
  { id:"p14", name:"Install fly trap in basement bathroom", area:"Basement", difficulty:"easy" },
  { id:"p15", name:"Replace batteries in server room clock", area:"Basement", difficulty:"easy" },
  { id:"p16", name:"Vacuum out the server room floor", area:"Basement", difficulty:"medium" },
  { id:"p17", name:"Install smoke detector in server room", area:"Basement", difficulty:"easy" },
  { id:"p18", name:"Reorganize the ski rack in game room", area:"Basement", difficulty:"medium" },
  { id:"p19", name:"Set up dedicated helmet rack in game room", area:"Basement", difficulty:"medium" },
  { id:"p20", name:"Reorganize game room cabinets", area:"Basement", difficulty:"medium" },
  { id:"p21", name:"Clean the bar area in game room", area:"Basement", difficulty:"medium" },
  { id:"p22", name:"Install curtain rod for game room cubby", area:"Basement", difficulty:"easy" },
  { id:"p23", name:"Replace 2 bulbs in beat-off bathroom", area:"Basement", difficulty:"easy" },
  { id:"p24", name:"Replace light fixture cover in beat-off bathroom", area:"Basement", difficulty:"easy" },
  { id:"p25", name:"Restart the dirty towels job in laundry room", area:"Basement", difficulty:"easy" },
  { id:"p26", name:"Restock rack of bath towels, blankets, microfibers", area:"Basement", difficulty:"medium" },
  { id:"p27", name:"Replace 3 bulbs in laundry room", area:"Basement", difficulty:"easy" },
  { id:"p28", name:"Replace cracked ceiling tile on basement stairs", area:"Basement", difficulty:"easy" },
  { id:"p29", name:"Replace stair bulb to basement", area:"Basement", difficulty:"easy" },
  { id:"p30", name:"Spackle drywall under trophy shelf on stairs", area:"Basement", difficulty:"easy" },
  { id:"p31", name:"Remove nails from stairway drywall and spackle", area:"Basement", difficulty:"easy" },
  { id:"p32", name:"Organize under the stairs area", area:"Basement", difficulty:"medium" },
  // 1st Floor
  { id:"p33", name:"Patch the hole in main entry hallway wall", area:"1st Floor", difficulty:"medium" },
  { id:"p34", name:"Install new doorstop in main entry hallway", area:"1st Floor", difficulty:"easy" },
  { id:"p35", name:"Remove zyns from hallway wall", area:"1st Floor", difficulty:"easy" },
  { id:"p36", name:"Sort and take care of the mail", area:"1st Floor", difficulty:"easy" },
  { id:"p37", name:"Get rid of the minifridge in chapter room", area:"1st Floor", difficulty:"easy" },
  { id:"p38", name:"Get rid of cabinets in chapter room", area:"1st Floor", difficulty:"medium" },
  { id:"p39", name:"Move the podium in chapter room", area:"1st Floor", difficulty:"easy" },
  { id:"p40", name:"Replace ceiling tiles that dont match in MiniMub", area:"1st Floor", difficulty:"medium" },
  { id:"p41", name:"Dust trophy cabinet in MiniMub", area:"1st Floor", difficulty:"easy" },
  { id:"p42", name:"Install door stopper in kitchen breezeway", area:"1st Floor", difficulty:"easy" },
  { id:"p43", name:"Deep clean fridge (monthly)", area:"1st Floor", difficulty:"medium" },
  { id:"p44", name:"Clean all stainless steel with Bar Keepers Friend", area:"1st Floor", difficulty:"medium" },
  { id:"p45", name:"Replace 2 bulbs in kitchen closet", area:"1st Floor", difficulty:"easy" },
  { id:"p46", name:"Replace 2 bulbs and cover in kitchen", area:"1st Floor", difficulty:"easy" },
  { id:"p47", name:"Install missing trim in time machine room", area:"1st Floor", difficulty:"medium" },
  { id:"p48", name:"Set up label maker and restart mail system", area:"1st Floor", difficulty:"easy" },
  { id:"p49", name:"Install TP dispenser in time machine", area:"1st Floor", difficulty:"easy" },
  { id:"p50", name:"Install smoke detector in time machine", area:"1st Floor", difficulty:"easy" },
  { id:"p51", name:"Organize time machine cabinets", area:"1st Floor", difficulty:"medium" },
  { id:"p52", name:"Throw away junk pool cues, keep only good ones", area:"1st Floor", difficulty:"easy" },
  { id:"p53", name:"Replace 3 bulbs in pool room", area:"1st Floor", difficulty:"easy" },
  { id:"p54", name:"Go through game cabinet in pool room", area:"1st Floor", difficulty:"easy" },
  { id:"p55", name:"Fix smoke detector in pool room", area:"1st Floor", difficulty:"easy" },
  { id:"p56", name:"Replace curtain rod and curtains in pool room", area:"1st Floor", difficulty:"medium" },
  { id:"p57", name:"Remove zip ties and tape in pool room", area:"1st Floor", difficulty:"easy" },
  { id:"p58", name:"Remove traffic cone from pool room", area:"1st Floor", difficulty:"easy" },
  { id:"p59", name:"Clean ceiling vent in 1st floor bathroom", area:"1st Floor", difficulty:"easy" },
  { id:"p60", name:"Replace 1 bulb in 1st floor bathroom", area:"1st Floor", difficulty:"easy" },
  { id:"p61", name:"Spackle walls in 1st floor bathroom", area:"1st Floor", difficulty:"medium" },
  { id:"p62", name:"Remove the toilet mirror in 1st floor bathroom", area:"1st Floor", difficulty:"easy" },
  { id:"p63", name:"Clean out the breezeway entrance area", area:"1st Floor", difficulty:"easy" },
  // 2nd Floor
  { id:"p64", name:"Replace missing ceiling tiles in SDC", area:"2nd Floor", difficulty:"medium" },
  { id:"p65", name:"Replace light bulbs and covers in library", area:"2nd Floor", difficulty:"easy" },
  { id:"p66", name:"Redo cable management cover in library", area:"2nd Floor", difficulty:"medium" },
  { id:"p67", name:"Organize items on library outer table", area:"2nd Floor", difficulty:"easy" },
  { id:"p68", name:"Dust off the printer in library", area:"2nd Floor", difficulty:"easy" },
  { id:"p69", name:"Organize sigma binders in library", area:"2nd Floor", difficulty:"easy" },
  { id:"p70", name:"Fix broken ceiling tiles in library", area:"2nd Floor", difficulty:"medium" },
  // Sunday cleaning extras
  { id:"p71", name:"Clean out radiator vents of dust (sunday extra)", area:"Common", difficulty:"medium" },
  { id:"p72", name:"Dust ceilings and remove cobwebs (buy dusters)", area:"Common", difficulty:"medium" },
];

const PROJECTS_PER_WEEK = 5;

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
const DIFF_COLORS = { easy:{ bg:"#10B98118", color:"#10B981", border:"#10B98140", pts:1 }, medium:{ bg:"#F59E0B18", color:"#F59E0B", border:"#F59E0B40", pts:2 } };

// ─── HELPERS ───
function shuffle(arr) { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }

// Map job areas to brother floors
const AREA_TO_FLOOR = { basement:"basement", first:"first", second:"second", third:"third" };

function getBrotherNames(brothers){ return brothers.map(b=>typeof b==="string"?b:b.name); }

function generateAssignments(brothers, jobs, weeks) {
  const bList = brothers.map(b=>typeof b==="string"?{name:b,floor:"first"}:b);
  const allNames = shuffle(bList.map(b=>b.name));
  const byFloor = {};
  bList.forEach(b=>{if(!byFloor[b.floor])byFloor[b.floor]=[];byFloor[b.floor].push(b.name);});
  Object.keys(byFloor).forEach(f=>{byFloor[f]=shuffle(byFloor[f]);});

  // Track total assignments per brother for balancing
  const workload = {};
  allNames.forEach(n=>{workload[n]=0;});

  // Pick the N least-loaded brothers from a pool
  function pickLeastLoaded(pool, count){
    const sorted = [...pool].sort((a,b)=>(workload[a]||0)-(workload[b]||0));
    const picked = sorted.slice(0, count);
    picked.forEach(n=>{workload[n]=(workload[n]||0)+1;});
    return picked;
  }

  const asg = {};

  weeks.forEach((week)=>{
    asg[week]={};
    jobs.forEach(job=>{
      let assigned;
      if(job.rotating){
        // Global rotating: pick least-loaded from ALL brothers
        assigned = pickLeastLoaded(allNames, job.people);
      }else if(job.floorRotate){
        // Floor rotating: pick least-loaded from floor pool
        const floor = AREA_TO_FLOOR[job.area];
        const pool = floor && byFloor[floor]?.length ? byFloor[floor] : allNames;
        assigned = pickLeastLoaded(pool, job.people);
      }else{
        // Static: pick least-loaded from floor pool (or all), but same every week
        // For static, we assign once and reuse — but still balance initially
        const floor = AREA_TO_FLOOR[job.area];
        const pool = floor && byFloor[floor]?.length ? byFloor[floor] : allNames;
        assigned = pickLeastLoaded(pool, job.people);
      }
      asg[week][job.id]={assigned, status:"pending"};
    });
  });
  return asg;
}

function generateSundayAssignments(ep,op,sj,weeks) {
  const asg={};
  weeks.forEach((week,wi)=>{
    const isE=wi%2===0;
    const pool=shuffle(isE?[...ep]:[...op]);
    const wa={group:isE?"even":"odd",bothGroups:false,jobs:{}};
    wa.jobs = assignEveryoneToSundayJobs(pool, sj);
    asg[week]=wa;
  });
  return asg;
}

function assignEveryoneToSundayJobs(pool, sj){
  // Distribute ALL people across jobs, expanding job sizes as needed
  const jobs={};
  if(!sj.length||!pool.length) return jobs;
  
  // Start with base people counts
  const jobSlots = sj.map(j=>({id:j.id, count:j.people, assigned:[]}));
  const totalBase = jobSlots.reduce((s,j)=>s+j.count,0);
  
  // If more people than slots, distribute extras round-robin
  let extra = pool.length - totalBase;
  if(extra > 0){
    let idx=0;
    while(extra>0){ jobSlots[idx%jobSlots.length].count++; idx++; extra--; }
  }
  
  // Assign people using least-loaded approach
  let pi=0;
  jobSlots.forEach(slot=>{
    for(let p=0;p<slot.count&&pi<pool.length;p++){
      slot.assigned.push(pool[pi]); pi++;
    }
    jobs[slot.id]={assigned:slot.assigned,status:"pending"};
  });
  
  // If somehow still people left (shouldn't happen), add to first job
  while(pi<pool.length){
    if(jobs[sj[0].id]) jobs[sj[0].id].assigned.push(pool[pi]);
    pi++;
  }
  return jobs;
}

function regenerateSundayWeek(wa,ep,op,sj) {
  const pool=shuffle(wa.bothGroups?[...ep,...op]:wa.group==="even"?[...ep]:[...op]);
  const jobs = assignEveryoneToSundayJobs(pool, sj);
  return{...wa,jobs};
}

function generateWeeklyProjects(projects, weeks) {
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

async function hashPassword(pw){const e=new TextEncoder().encode(pw);const b=await crypto.subtle.digest("SHA-256",e);return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,"0")).join("");}

// Firebase key sanitization
function sanitizeKey(k){return k.replace(/[.#$/\[\]]/g,"_");}
function sanitizeObjKeys(o){const r={};Object.entries(o).forEach(([k,v])=>{r[sanitizeKey(k)]=v;});return r;}
function desanitizeObjKeys(o,keys){const m={};keys.forEach(k=>{m[sanitizeKey(k)]=k;});const r={};Object.entries(o).forEach(([sk,v])=>{r[m[sk]||sk]=v;});return r;}

// Firebase
let db=null,firebaseReady=false;
async function initFirebase(){if(firebaseReady)return true;if(FIREBASE_CONFIG.apiKey==="YOUR_API_KEY")return false;try{const{initializeApp}=await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js");const{getDatabase}=await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js");db=getDatabase(initializeApp(FIREBASE_CONFIG));firebaseReady=true;return true;}catch(e){return false;}}
async function fbSet(p,d){if(!firebaseReady)return;const{ref,set}=await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js");return set(ref(db,p),d);}
async function fbGet(p){if(!firebaseReady)return null;const{ref,get}=await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js");const s=await get(ref(db,p));return s.exists()?s.val():null;}
async function fbOnValue(p,cb){if(!firebaseReady)return()=>{};const{ref,onValue}=await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js");return onValue(ref(db,p),s=>{cb(s.exists()?s.val():null);});}

// ─── COMPONENTS ───
function StatusBadge({status,onClick,disabled}){const c=STATUS_CONFIG[status];return<button onClick={disabled?undefined:onClick} style={{background:c.bg,border:`1.5px solid ${c.border}`,color:c.text,borderRadius:6,padding:"3px 10px",fontSize:12,fontWeight:600,cursor:disabled?"default":"pointer",fontFamily:"inherit",opacity:disabled?.7:1}}>{c.label}</button>;}
function Input({value,onChange,placeholder,style,type="text"}){return<input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{background:"#0F172A",border:"1px solid #334155",color:"#E2E8F0",borderRadius:8,padding:"10px 14px",fontSize:14,fontFamily:"inherit",width:"100%",outline:"none",...style}} onFocus={e=>e.target.style.borderColor="#10B981"} onBlur={e=>e.target.style.borderColor="#334155"}/>;}
function SmallBtn({children,onClick,color="#10B981"}){return<button onClick={onClick} style={{background:`${color}18`,border:`1px solid ${color}50`,color,borderRadius:6,padding:"5px 12px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>{children}</button>;}
function SyncDot({connected}){return<div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:7,height:7,borderRadius:"50%",background:connected?"#10B981":"#EF4444",boxShadow:connected?"0 0 6px #10B98180":"0 0 6px #EF444480"}}/><span style={{fontSize:10,color:"#64748B",fontFamily:"'Space Mono',monospace"}}>{connected?"LIVE":"LOCAL"}</span></div>;}
function GroupBadge({group,bothGroups}){if(bothGroups)return<span style={{fontSize:11,fontWeight:700,color:"#F59E0B",background:"#F59E0B18",padding:"2px 8px",borderRadius:4,border:"1px solid #F59E0B30"}}>BOTH GROUPS</span>;const e=group==="even";return<span style={{fontSize:11,fontWeight:700,color:e?"#8B5CF6":"#06B6D4",background:e?"#8B5CF618":"#06B6D418",padding:"2px 8px",borderRadius:4,border:`1px solid ${e?"#8B5CF630":"#06B6D430"}`}}>{e?"EVEN PINS":"ODD PINS"}</span>;}
function DiffBadge({d}){const c=DIFF_COLORS[d]||DIFF_COLORS.easy;return<span style={{fontSize:10,fontWeight:700,color:c.color,background:c.bg,padding:"1px 7px",borderRadius:4,border:`1px solid ${c.border}`}}>{d==="easy"?"1 PT":"2 PTS"}</span>;}

// ─── MAIN ───
export default function HouseJobsApp(){
  const[loading,setLoading]=useState(true);
  const[fbConnected,setFbConnected]=useState(false);
  const[view,setView]=useState("dashboard");
  const[semesterName,setSemesterName]=useState("Fall 2026");
  const[brothers,setBrothers]=useState(DEFAULT_BROTHERS);
  const[jobs,setJobs]=useState(DEFAULT_JOBS);
  const[weeks,setWeeks]=useState(DEFAULT_WEEKS);
  const[assignments,setAssignments]=useState({});
  const[currentWeekIdx,setCurrentWeekIdx]=useState(0);
  const[selectedBrother,setSelectedBrother]=useState(null);
  const[showJobDetail,setShowJobDetail]=useState(null);
  const[areaFilter,setAreaFilter]=useState(null);
  // Sunday
  const[evenPins,setEvenPins]=useState(DEFAULT_EVEN_PINS);
  const[oddPins,setOddPins]=useState(DEFAULT_ODD_PINS);
  const[sundayJobs,setSundayJobs]=useState(DEFAULT_SUNDAY_JOBS);
  const[sundayAssignments,setSundayAssignments]=useState({});
  const[sundayEditingJob,setSundayEditingJob]=useState(null);
  const[sundayEditNames,setSundayEditNames]=useState("");
  const[makeupName,setMakeupName]=useState("");
  // Projects
  const[projects,setProjects]=useState(DEFAULT_PROJECTS);
  const[weeklyProjects,setWeeklyProjects]=useState({});
  const[projClaimName,setProjClaimName]=useState("");
  // Setup
  const[adminUnlocked,setAdminUnlocked]=useState(false);
  const[pwInput,setPwInput]=useState("");
  const[pwError,setPwError]=useState(false);
  const[editName,setEditName]=useState("");
  const[editFloor,setEditFloor]=useState("first");
  const[editJobName,setEditJobName]=useState("");
  const[editJobArea,setEditJobArea]=useState("common");
  const[editJobPeople,setEditJobPeople]=useState(1);
  const[editJobRotating,setEditJobRotating]=useState(false);
  const[editJobFloorRotate,setEditJobFloorRotate]=useState(false);
  const[editJobDesc,setEditJobDesc]=useState("");
  const[editWeekStart,setEditWeekStart]=useState("");
  const[editWeekEnd,setEditWeekEnd]=useState("");
  const[confirmRegen,setConfirmRegen]=useState(false);
  const[setupTab,setSetupTab]=useState("brothers");
  const[saving,setSaving]=useState(false);
  // Weekly job manual override
  const[weeklyEditingJob,setWeeklyEditingJob]=useState(null);
  const[weeklyEditNames,setWeeklyEditNames]=useState("");
  const[weeklyEditDuration,setWeeklyEditDuration]=useState("1");
  const[editingJobIdx,setEditingJobIdx]=useState(null);
  const[sunSetupTab,setSunSetupTab]=useState("even");
  const[sunEditName,setSunEditName]=useState("");
  const[sunEditJobName,setSunEditJobName]=useState("");
  const[sunEditJobPeople,setSunEditJobPeople]=useState(2);
  const[sunEditJobDesc,setSunEditJobDesc]=useState("");
  const[editingSunJobIdx,setEditingSunJobIdx]=useState(null);
  // Project setup
  const[projEditName,setProjEditName]=useState("");
  const[projEditArea,setProjEditArea]=useState("Basement");
  const[projEditDiff,setProjEditDiff]=useState("easy");

  const skipSync=useRef(false);
  const skipSunSync=useRef(false);
  const skipProjSync=useRef(false);

  // ─── INIT ───
  useEffect(()=>{(async()=>{
    const connected=await initFirebase(); setFbConnected(connected);
    if(connected){
      const cfg=await fbGet("config"),asg=await fbGet("assignments"),sunCfg=await fbGet("sundayConfig"),sunAsg=await fbGet("sundayAssignments"),projCfg=await fbGet("projectsConfig"),projAsg=await fbGet("weeklyProjects");
      const w=cfg?.weeks||DEFAULT_WEEKS;
      if(cfg){setBrothers(cfg.brothers||DEFAULT_BROTHERS);setJobs(cfg.jobs||DEFAULT_JOBS);setWeeks(w);setSemesterName(cfg.semesterName||"Fall 2026");}
      if(asg)setAssignments(desanitizeObjKeys(asg,w));else{const a=generateAssignments(cfg?.brothers||DEFAULT_BROTHERS,cfg?.jobs||DEFAULT_JOBS,w);setAssignments(a);await fbSet("assignments",sanitizeObjKeys(a));}
      if(sunCfg){setEvenPins(sunCfg.evenPins||DEFAULT_EVEN_PINS);setOddPins(sunCfg.oddPins||DEFAULT_ODD_PINS);setSundayJobs(sunCfg.sundayJobs||DEFAULT_SUNDAY_JOBS);}
      if(sunAsg)setSundayAssignments(desanitizeObjKeys(sunAsg,w));else{const sa=generateSundayAssignments(sunCfg?.evenPins||DEFAULT_EVEN_PINS,sunCfg?.oddPins||DEFAULT_ODD_PINS,sunCfg?.sundayJobs||DEFAULT_SUNDAY_JOBS,w);setSundayAssignments(sa);await fbSet("sundayAssignments",sanitizeObjKeys(sa));}
      if(projCfg)setProjects(projCfg);
      if(projAsg)setWeeklyProjects(desanitizeObjKeys(projAsg,w));else{const wp=generateWeeklyProjects(projCfg||DEFAULT_PROJECTS,w);setWeeklyProjects(wp);await fbSet("weeklyProjects",sanitizeObjKeys(wp));}
      fbOnValue("assignments",d=>{if(skipSync.current){skipSync.current=false;return;}if(d)setAssignments(desanitizeObjKeys(d,w));});
      fbOnValue("config",d=>{if(d){setBrothers(d.brothers||DEFAULT_BROTHERS);setJobs(d.jobs||DEFAULT_JOBS);setWeeks(d.weeks||DEFAULT_WEEKS);setSemesterName(d.semesterName||"Fall 2026");}});
      fbOnValue("sundayAssignments",d=>{if(skipSunSync.current){skipSunSync.current=false;return;}if(d)setSundayAssignments(desanitizeObjKeys(d,w));});
      fbOnValue("sundayConfig",d=>{if(d){setEvenPins(d.evenPins||DEFAULT_EVEN_PINS);setOddPins(d.oddPins||DEFAULT_ODD_PINS);setSundayJobs(d.sundayJobs||DEFAULT_SUNDAY_JOBS);}});
      fbOnValue("weeklyProjects",d=>{if(skipProjSync.current){skipProjSync.current=false;return;}if(d)setWeeklyProjects(desanitizeObjKeys(d,w));});
      fbOnValue("projectsConfig",d=>{if(d)setProjects(d);});
    }else{
      try{
        const cfg=await window.storage.get("housejobs:config"),asg=await window.storage.get("housejobs:assignments");
        if(cfg?.value){const p=JSON.parse(cfg.value);setBrothers(p.brothers||DEFAULT_BROTHERS);setJobs(p.jobs||DEFAULT_JOBS);setWeeks(p.weeks||DEFAULT_WEEKS);setSemesterName(p.semesterName||"Fall 2026");}
        if(asg?.value)setAssignments(JSON.parse(asg.value));else setAssignments(generateAssignments(DEFAULT_BROTHERS,DEFAULT_JOBS,DEFAULT_WEEKS));
        const sunAsg=await window.storage.get("housejobs:sundayAssignments");
        if(sunAsg?.value)setSundayAssignments(JSON.parse(sunAsg.value));else setSundayAssignments(generateSundayAssignments(DEFAULT_EVEN_PINS,DEFAULT_ODD_PINS,DEFAULT_SUNDAY_JOBS,DEFAULT_WEEKS));
        const wp=await window.storage.get("housejobs:weeklyProjects");
        if(wp?.value)setWeeklyProjects(JSON.parse(wp.value));else setWeeklyProjects(generateWeeklyProjects(DEFAULT_PROJECTS,DEFAULT_WEEKS));
      }catch{setAssignments(generateAssignments(DEFAULT_BROTHERS,DEFAULT_JOBS,DEFAULT_WEEKS));setSundayAssignments(generateSundayAssignments(DEFAULT_EVEN_PINS,DEFAULT_ODD_PINS,DEFAULT_SUNDAY_JOBS,DEFAULT_WEEKS));setWeeklyProjects(generateWeeklyProjects(DEFAULT_PROJECTS,DEFAULT_WEEKS));}
    }
    setLoading(false);
  })();},[]);

  // ─── SAVE ───
  const saveA=useCallback(async a=>{try{if(fbConnected){skipSync.current=true;await fbSet("assignments",sanitizeObjKeys(a));}else{await window.storage.set("housejobs:assignments",JSON.stringify(a));}}catch(e){console.error("saveA error:",e);}},[fbConnected]);
  const saveCfg=useCallback(async(b,j,w,sn)=>{try{
    const cleanJobs=j.map(job=>({...job,rotating:!!job.rotating,floorRotate:!!job.floorRotate}));
    if(fbConnected)await fbSet("config",{brothers:b,jobs:cleanJobs,weeks:w,semesterName:sn});else await window.storage.set("housejobs:config",JSON.stringify({brothers:b,jobs:cleanJobs,weeks:w,semesterName:sn}));}catch(e){console.error("saveCfg error:",e);}},[fbConnected]);
  const saveSunA=useCallback(async a=>{try{if(fbConnected){skipSunSync.current=true;await fbSet("sundayAssignments",sanitizeObjKeys(a));}else await window.storage.set("housejobs:sundayAssignments",JSON.stringify(a));}catch(e){console.error("saveSunA error:",e);}},[fbConnected]);
  const saveSunCfg=useCallback(async(ep,op,sj)=>{try{if(fbConnected)await fbSet("sundayConfig",{evenPins:ep,oddPins:op,sundayJobs:sj});else await window.storage.set("housejobs:sundayConfig",JSON.stringify({evenPins:ep,oddPins:op,sundayJobs:sj}));}catch(e){console.error("saveSunCfg error:",e);}},[fbConnected]);
  const saveProjA=useCallback(async a=>{try{if(fbConnected){skipProjSync.current=true;await fbSet("weeklyProjects",sanitizeObjKeys(a));}else await window.storage.set("housejobs:weeklyProjects",JSON.stringify(a));}catch(e){console.error("saveProjA error:",e);}},[fbConnected]);
  const saveProjCfg=useCallback(async p=>{try{if(fbConnected)await fbSet("projectsConfig",p);}catch(e){console.error("saveProjCfg error:",e);}},[fbConnected]);

  async function checkPassword(){const h=await hashPassword(pwInput);if(h==="d85802bb9e9169949367f292bfdf4ca200139b4c44bc47a50700535f16fba13e"){setAdminUnlocked(true);setPwError(false);}else setPwError(true);}

  const currentWeek=weeks[currentWeekIdx]||"";
  const weekData=assignments[currentWeek]||{};
  const sunWeekData=sundayAssignments[currentWeek]||{group:"even",bothGroups:false,jobs:{}};
  const projWeekData=weeklyProjects[currentWeek]||{projects:[]};

  function cycleStatus(week,jobId,isAdmin){
    const u=JSON.parse(JSON.stringify(assignments));
    if(u[week]?.[jobId]){const c=u[week][jobId].status;if(isAdmin)u[week][jobId].status=STATUS_CYCLE[(STATUS_CYCLE.indexOf(c)+1)%STATUS_CYCLE.length];else{if(c==="pending")u[week][jobId].status="done";else if(c==="done")u[week][jobId].status="pending";}}
    setAssignments(u);saveA(u);
  }
  function overrideWeeklyJob(week,jobId,names,duration){
    const u=JSON.parse(JSON.stringify(assignments));
    const startIdx=weeks.indexOf(week);
    if(startIdx===-1)return;
    
    // Apply override for the specified duration
    const numWeeks = duration==="semester" ? weeks.length-startIdx : Math.min(parseInt(duration)||1, weeks.length-startIdx);
    for(let w=0;w<numWeeks;w++){
      const wk=weeks[startIdx+w];
      if(u[wk]?.[jobId]) u[wk][jobId].assigned=names;
    }
    
    // Reshuffle remaining weeks after the override period for this job
    const reshuffleStart = startIdx+numWeeks;
    if(reshuffleStart<weeks.length){
      const bList=brothers.map(b=>typeof b==="string"?{name:b,floor:"first"}:b);
      const job=jobs.find(j=>j.id===jobId);
      if(job){
        const allNames=shuffle(bList.map(b=>b.name));
        const byFloor={};
        bList.forEach(b=>{if(!byFloor[b.floor])byFloor[b.floor]=[];byFloor[b.floor].push(b.name);});
        Object.keys(byFloor).forEach(f=>{byFloor[f]=shuffle(byFloor[f]);});
        const floor=AREA_TO_FLOOR[job.area];
        const pool=floor&&byFloor[floor]?.length?byFloor[floor]:allNames;
        
        // Count existing workload for balancing
        const wl={};pool.forEach(n=>{wl[n]=0;});
        Object.values(u).forEach(wj=>{if(wj?.[jobId]?.assigned)wj[jobId].assigned.forEach(n=>{if(wl[n]!==undefined)wl[n]++;});});
        
        for(let w=reshuffleStart;w<weeks.length;w++){
          const wk=weeks[w];
          if(u[wk]?.[jobId]&&u[wk][jobId].status==="pending"){
            const sorted=[...pool].sort((a,b)=>(wl[a]||0)-(wl[b]||0));
            const picked=sorted.slice(0,job.people);
            picked.forEach(n=>{wl[n]=(wl[n]||0)+1;});
            u[wk][jobId].assigned=picked;
          }
        }
      }
    }
    
    setAssignments(u);
    saveA(u);
  }
  function reshuffleWeeklyAssignments(){
    const a=generateAssignments(brothers,jobs,weeks);
    // Preserve any existing statuses that aren't pending
    Object.keys(assignments).forEach(week=>{
      if(a[week]&&assignments[week]){
        Object.keys(assignments[week]).forEach(jobId=>{
          if(a[week][jobId]&&assignments[week][jobId].status!=="pending"){
            a[week][jobId].status=assignments[week][jobId].status;
          }
        });
      }
    });
    setAssignments(a);saveA(a);
  }
  function cycleSundayStatus(week,jobId,isAdmin){
    const u=JSON.parse(JSON.stringify(sundayAssignments));
    if(u[week]?.jobs?.[jobId]){const c=u[week].jobs[jobId].status;if(isAdmin)u[week].jobs[jobId].status=STATUS_CYCLE[(STATUS_CYCLE.indexOf(c)+1)%STATUS_CYCLE.length];else{if(c==="pending")u[week].jobs[jobId].status="done";else if(c==="done")u[week].jobs[jobId].status="pending";}}
    setSundayAssignments(u);saveSunA(u);
  }
  function toggleBothGroups(week){const u=JSON.parse(JSON.stringify(sundayAssignments));if(u[week]){u[week].bothGroups=!u[week].bothGroups;const r=regenerateSundayWeek(u[week],evenPins,oddPins,sundayJobs);u[week]=r;}setSundayAssignments(u);saveSunA(u);}
  function overrideSundayJob(week,jobId,names){const u=JSON.parse(JSON.stringify(sundayAssignments));if(u[week]?.jobs?.[jobId])u[week].jobs[jobId].assigned=names;setSundayAssignments(u);saveSunA(u);}
  function reshuffleSundayWeek(week){const u=JSON.parse(JSON.stringify(sundayAssignments));if(u[week])u[week]=regenerateSundayWeek(u[week],evenPins,oddPins,sundayJobs);setSundayAssignments(u);saveSunA(u);}

  // Makeup functions — adds someone to next week's Sunday cleaning
  function addMakeup(name){
    const nextIdx=currentWeekIdx+1;
    if(nextIdx>=weeks.length||!name.trim())return;
    const nextWeek=weeks[nextIdx];
    const u=JSON.parse(JSON.stringify(sundayAssignments));
    if(!u[nextWeek])return;
    if(!u[nextWeek].makeups)u[nextWeek].makeups=[];
    if(!u[nextWeek].makeups.includes(name.trim())){u[nextWeek].makeups.push(name.trim());}
    setSundayAssignments(u);saveSunA(u);
    setMakeupName("");
  }
  function removeMakeup(week,name){
    const u=JSON.parse(JSON.stringify(sundayAssignments));
    if(u[week]?.makeups){u[week].makeups=u[week].makeups.filter(n=>n!==name);}
    setSundayAssignments(u);saveSunA(u);
  }
  // Project actions
  function claimProject(week,projIdx,name){
    const u=JSON.parse(JSON.stringify(weeklyProjects));if(u[week]?.projects?.[projIdx]&&u[week].projects[projIdx].status==="available"){u[week].projects[projIdx].status="claimed";u[week].projects[projIdx].claimedBy=name;}setWeeklyProjects(u);saveProjA(u);
  }
  function completeProject(week,projIdx){
    const u=JSON.parse(JSON.stringify(weeklyProjects));if(u[week]?.projects?.[projIdx]&&u[week].projects[projIdx].status==="claimed"){u[week].projects[projIdx].status="done";u[week].projects[projIdx].completedBy=u[week].projects[projIdx].claimedBy;}setWeeklyProjects(u);saveProjA(u);
  }
  function verifyProject(week,projIdx){
    const u=JSON.parse(JSON.stringify(weeklyProjects));if(u[week]?.projects?.[projIdx])u[week].projects[projIdx].status="verified";setWeeklyProjects(u);saveProjA(u);
  }
  function unclaimProject(week,projIdx){
    const u=JSON.parse(JSON.stringify(weeklyProjects));if(u[week]?.projects?.[projIdx]){u[week].projects[projIdx].status="available";u[week].projects[projIdx].claimedBy=null;u[week].projects[projIdx].completedBy=null;}setWeeklyProjects(u);saveProjA(u);
  }

  async function regenerate(){
    setSaving(true);
    try{
      const a=generateAssignments(brothers,jobs,weeks);
      const sa=generateSundayAssignments(evenPins,oddPins,sundayJobs,weeks);
      const wp=generateWeeklyProjects(projects,weeks);
      setAssignments(a);setSundayAssignments(sa);setWeeklyProjects(wp);
      await Promise.all([
        saveA(a),
        saveSunA(sa),
        saveProjA(wp),
        saveCfg(brothers,jobs,weeks,semesterName),
        saveSunCfg(evenPins,oddPins,sundayJobs),
        saveProjCfg(projects),
      ]);
    }catch(e){
      console.error("Regenerate error:",e);
    }
    setConfirmRegen(false);setCurrentWeekIdx(0);setView("dashboard");setSaving(false);
  }

  // ─── STATS ───
  const brotherNames=useMemo(()=>getBrotherNames(brothers),[brothers]);
  const stats=useMemo(()=>{const s={};brotherNames.forEach(b=>{s[b]={total:0,done:0,missed:0,verified:0,pending:0};});Object.values(assignments).forEach(wj=>{if(!wj||typeof wj!=="object")return;Object.values(wj).forEach(e=>{if(!e?.assigned)return;e.assigned.forEach(b=>{if(s[b]){s[b].total++;s[b][e.status]++;}});});});return s;},[assignments,brotherNames]);

  const projectStats=useMemo(()=>{
    const s={};
    Object.values(weeklyProjects).forEach(wd=>{
      (wd.projects||[]).forEach(p=>{
        if((p.status==="done"||p.status==="verified")&&p.completedBy){
          if(!s[p.completedBy])s[p.completedBy]={count:0,points:0};
          s[p.completedBy].count++;
          s[p.completedBy].points+=(p.difficulty==="medium"?2:1);
        }
      });
    });
    return s;
  },[weeklyProjects]);

  const weekStats=useMemo(()=>{const t=Object.keys(weekData).length;const d=Object.values(weekData).filter(j=>j?.status==="done"||j?.status==="verified").length;const m=Object.values(weekData).filter(j=>j?.status==="missed").length;return{total:t,done:d,missed:m,pending:t-d-m};},[weekData]);
  const completionPct=weekStats.total>0?Math.round((weekStats.done/weekStats.total)*100):0;

  if(loading)return<div style={{fontFamily:"'DM Sans',sans-serif",background:"#0F1117",color:"#64748B",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12}}><div style={{width:28,height:28,border:"3px solid #334155",borderTop:"3px solid #10B981",borderRadius:"50%",animation:"spin .8s linear infinite"}}/><span>Connecting...</span><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;

  return(
    <div className="app-shell" style={{fontFamily:"'DM Sans','Segoe UI',sans-serif",background:"#0F1117",color:"#E2E8F0",minHeight:"100vh",margin:"0 auto"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,500;0,9..40,700;1,9..40,400&family=Space+Mono:wght@400;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#334155;border-radius:4px}@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}@keyframes spin{to{transform:rotate(360deg)}}.fu{animation:fadeUp .3s ease both}.ch{transition:transform .15s,box-shadow .15s}.ch:hover{transform:translateY(-2px);box-shadow:0 8px 25px rgba(0,0,0,.3)}select{appearance:none;-webkit-appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center}
.app-shell{max-width:520px}
.job-grid{display:flex;flex-direction:column;gap:8px}
.roster-grid{display:flex;flex-direction:column;gap:6px}
.board-list{display:flex;flex-direction:column;gap:6px}
.header-inner{max-width:100%}
@media(min-width:768px){
  .app-shell{max-width:900px;padding:0 20px}
  .job-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .roster-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .board-list{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .header-inner{max-width:900px;margin:0 auto}
}
@media(min-width:1200px){
  .app-shell{max-width:1100px}
  .job-grid{grid-template-columns:1fr 1fr 1fr}
  .roster-grid{grid-template-columns:1fr 1fr 1fr}
}
`}</style>

      {/* HEADER */}
      <div style={{background:"linear-gradient(135deg,#1E293B,#0F172A)",borderBottom:"1px solid #1E293B",padding:"20px 20px 16px",position:"sticky",top:0,zIndex:50}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10}}><h1 style={{fontFamily:"'Space Mono',monospace",fontSize:20,fontWeight:700,color:"#F8FAFC",letterSpacing:"-0.02em"}}>HOUSE JOBS</h1><SyncDot connected={fbConnected}/></div>
            <p style={{fontSize:12,color:"#64748B",marginTop:2,fontFamily:"'Space Mono',monospace"}}>{semesterName} • Week {currentWeekIdx+1}/{weeks.length}</p>
          </div>
          {!["setup","sunday_setup","project_setup"].includes(view)&&<div style={{width:52,height:52,borderRadius:"50%",background:`conic-gradient(#10B981 ${completionPct*3.6}deg,#1E293B ${completionPct*3.6}deg)`,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:42,height:42,borderRadius:"50%",background:"#0F172A",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#10B981",fontFamily:"'Space Mono',monospace"}}>{completionPct}%</div></div>}
        </div>
        {!["setup","sunday_setup","project_setup"].includes(view)&&<div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={()=>setCurrentWeekIdx(Math.max(0,currentWeekIdx-1))} style={{background:"#1E293B",border:"1px solid #334155",color:"#94A3B8",borderRadius:6,width:32,height:32,cursor:"pointer",fontSize:16,fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
          <div style={{flex:1,background:"#1E293B",border:"1px solid #334155",borderRadius:8,padding:"8px 14px",textAlign:"center",fontSize:14,fontWeight:600,color:"#CBD5E1",fontFamily:"'Space Mono',monospace"}}>{currentWeek}</div>
          <button onClick={()=>setCurrentWeekIdx(Math.min(weeks.length-1,currentWeekIdx+1))} style={{background:"#1E293B",border:"1px solid #334155",color:"#94A3B8",borderRadius:6,width:32,height:32,cursor:"pointer",fontSize:16,fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
        </div>}
      </div>

      {/* NAV */}
      <div style={{display:"flex",gap:1,padding:"12px 12px 0",borderBottom:"1px solid #1E293B",background:"#0F1117",overflowX:"auto"}}>
        {[{key:"dashboard",label:"Weekly"},{key:"sunday",label:"Sunday"},{key:"projects",label:"Projects"},{key:"roster",label:"Roster"},{key:"leaderboard",label:"Board"},{key:"setup",label:"⚙"}].map(tab=>
          <button key={tab.key} onClick={()=>{setView(tab.key);setSelectedBrother(null);}} style={{flex:1,padding:"10px 0 12px",background:"none",border:"none",minWidth:0,color:view===tab.key?"#F8FAFC":"#64748B",fontSize:11,fontWeight:view===tab.key?700:500,cursor:"pointer",fontFamily:"inherit",borderBottom:view===tab.key?`2px solid ${tab.key==="setup"?"#F59E0B":tab.key==="projects"?"#EC4899":tab.key==="sunday"?"#8B5CF6":"#10B981"}`:"2px solid transparent"}}>{tab.label}</button>
        )}
      </div>

      <div style={{padding:"16px 20px 100px"}}>

        {/* ══════ DASHBOARD ══════ */}
        {view==="dashboard"&&<div className="fu">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div/>
            {adminUnlocked&&<SmallBtn onClick={reshuffleWeeklyAssignments} color="#10B981">🔄 Reshuffle</SmallBtn>}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20}}>
            {[{n:weekStats.done,l:"Done",c:"#10B981"},{n:weekStats.pending,l:"Pending",c:"#F59E0B"},{n:weekStats.missed,l:"Missed",c:"#EF4444"}].map(s=><div key={s.l} style={{background:"#1E293B",borderRadius:10,padding:"14px 12px",textAlign:"center",border:"1px solid #334155"}}><div style={{fontSize:26,fontWeight:700,color:s.c,fontFamily:"'Space Mono',monospace",lineHeight:1}}>{s.n}</div><div style={{fontSize:11,color:"#64748B",marginTop:4}}>{s.l}</div></div>)}
          </div>
          <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
            <button onClick={()=>setAreaFilter(null)} style={{background:!areaFilter?"#334155":"#1E293B",border:`1px solid ${!areaFilter?"#475569":"#334155"}`,color:!areaFilter?"#F8FAFC":"#94A3B8",borderRadius:20,padding:"5px 14px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>All</button>
            {AREA_KEYS.map(k=><button key={k} onClick={()=>setAreaFilter(areaFilter===k?null:k)} style={{background:areaFilter===k?AREA_META[k].color+"22":"#1E293B",border:`1px solid ${areaFilter===k?AREA_META[k].color:"#334155"}`,color:areaFilter===k?AREA_META[k].color:"#94A3B8",borderRadius:20,padding:"5px 14px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{AREA_META[k].label}</button>)}
          </div>
          <div className="job-grid">
            {jobs.filter(j=>!areaFilter||j.area===areaFilter).map((job,i)=>{const data=weekData[job.id];if(!data)return null;const area=AREA_META[job.area]||{label:"?",color:"#6B7280"};const isEd=weeklyEditingJob===job.id;return(
              <div key={job.id} className="ch fu" onClick={()=>setShowJobDetail(showJobDetail===job.id?null:job.id)} style={{background:"#1E293B",borderRadius:12,padding:"14px 16px",border:`1px solid ${data.status==="missed"?"#EF444440":"#334155"}`,animationDelay:`${i*.03}s`,cursor:"pointer"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:8,height:8,borderRadius:"50%",background:area.color,boxShadow:`0 0 6px ${area.color}60`,flexShrink:0}}/><span style={{fontSize:14,fontWeight:600,color:"#F1F5F9"}}>{job.name}</span>{job.rotating&&<span style={{fontSize:10,color:"#F59E0B",background:"#F59E0B18",padding:"1px 7px",borderRadius:4,fontWeight:600,border:"1px solid #F59E0B30"}}>ROT</span>}{job.floorRotate&&<span style={{fontSize:10,color:"#06B6D4",background:"#06B6D418",padding:"1px 7px",borderRadius:4,fontWeight:600,border:"1px solid #06B6D430"}}>FLOOR</span>}</div>
                    <div style={{fontSize:13,color:"#94A3B8",marginTop:4,marginLeft:16}}>{data.assigned?.join(", ")}</div>
                  </div>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    {adminUnlocked&&<button onClick={e=>{e.stopPropagation();if(isEd)setWeeklyEditingJob(null);else{setWeeklyEditingJob(job.id);setWeeklyEditNames(data.assigned?.join(", ")||"");}}} style={{background:"none",border:"none",color:"#64748B",cursor:"pointer",fontSize:14,padding:"0 4px"}}>✏️</button>}
                    <StatusBadge status={data.status} onClick={e=>{e.stopPropagation();cycleStatus(currentWeek,job.id,adminUnlocked);}}/>
                  </div>
                </div>
                {isEd&&adminUnlocked&&<div onClick={e=>e.stopPropagation()} style={{marginTop:10,paddingTop:10,borderTop:"1px solid #334155",display:"flex",flexDirection:"column",gap:8}}>
                  <div style={{display:"flex",gap:8}}>
                    <Input value={weeklyEditNames} onChange={setWeeklyEditNames} placeholder="Names, comma separated" style={{flex:1,padding:"6px 10px",fontSize:12}}/>
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <label style={{fontSize:11,color:"#94A3B8",whiteSpace:"nowrap"}}>Duration:</label>
                    <select value={weeklyEditDuration} onChange={e=>setWeeklyEditDuration(e.target.value)} style={{background:"#0F172A",border:"1px solid #334155",color:"#E2E8F0",borderRadius:6,padding:"5px 24px 5px 8px",fontSize:12,fontFamily:"inherit",flex:1}}>
                      <option value="1">This week only</option>
                      <option value="2">2 weeks</option>
                      <option value="3">3 weeks</option>
                      <option value="4">4 weeks</option>
                      <option value="6">6 weeks</option>
                      <option value="8">8 weeks</option>
                      <option value="semester">Rest of semester</option>
                    </select>
                    <SmallBtn onClick={()=>{overrideWeeklyJob(currentWeek,job.id,weeklyEditNames.split(",").map(n=>n.trim()).filter(Boolean),weeklyEditDuration);setWeeklyEditingJob(null);setWeeklyEditDuration("1");}}>Save</SmallBtn>
                  </div>
                </div>}
                {showJobDetail===job.id&&!isEd&&<div style={{marginTop:12,paddingTop:12,borderTop:"1px solid #334155",fontSize:12,color:"#64748B",lineHeight:1.6}}><span style={{color:"#94A3B8",fontWeight:600}}>What to do: </span>{job.desc}</div>}
              </div>);})}
          </div>
        </div>}

        {/* ══════ SUNDAY ══════ */}
        {view==="sunday"&&<div className="fu">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div><h2 style={{fontSize:16,fontWeight:700,color:"#F1F5F9",marginBottom:4}}>Sunday Cleaning</h2><GroupBadge group={sunWeekData.group} bothGroups={sunWeekData.bothGroups}/></div>
            {adminUnlocked&&<div style={{display:"flex",gap:6}}><SmallBtn onClick={()=>toggleBothGroups(currentWeek)} color="#F59E0B">{sunWeekData.bothGroups?"Split":"Both"}</SmallBtn><SmallBtn onClick={()=>reshuffleSundayWeek(currentWeek)} color="#8B5CF6">Shuffle</SmallBtn></div>}
          </div>
          {!adminUnlocked&&<div style={{background:"#1E293B",borderRadius:10,padding:"10px 14px",border:"1px solid #334155",marginBottom:16,display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:12,color:"#64748B"}}>🔒 HM access for edits. </span><Input type="password" value={pwInput} onChange={v=>{setPwInput(v);setPwError(false);}} placeholder="Password" style={{flex:1,padding:"6px 10px",fontSize:12}}/><SmallBtn onClick={checkPassword}>Unlock</SmallBtn></div>}
          <div className="job-grid">
            {sundayJobs.map((job,i)=>{const data=sunWeekData.jobs?.[job.id];if(!data)return null;const isEd=sundayEditingJob===job.id;return(
              <div key={job.id} className="fu" style={{background:"#1E293B",borderRadius:12,padding:"14px 16px",border:"1px solid #334155",animationDelay:`${i*.03}s`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:8,height:8,borderRadius:"50%",background:"#8B5CF6",boxShadow:"0 0 6px #8B5CF660",flexShrink:0}}/><span style={{fontSize:14,fontWeight:600,color:"#F1F5F9"}}>{job.name}</span></div>
                    <div style={{fontSize:13,color:"#94A3B8",marginTop:4,marginLeft:16}}>{data.assigned?.join(", ")}</div>
                    <div style={{fontSize:11,color:"#475569",marginTop:4,marginLeft:16,lineHeight:1.4}}>{job.desc}</div>
                  </div>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    {adminUnlocked&&<button onClick={()=>{if(isEd)setSundayEditingJob(null);else{setSundayEditingJob(job.id);setSundayEditNames(data.assigned?.join(", ")||"");}}} style={{background:"none",border:"none",color:"#64748B",cursor:"pointer",fontSize:14,padding:"0 4px"}}>✏️</button>}
                    <StatusBadge status={data.status} onClick={e=>{e.stopPropagation();cycleSundayStatus(currentWeek,job.id,adminUnlocked);}}/>
                  </div>
                </div>
                {isEd&&adminUnlocked&&<div style={{marginTop:10,paddingTop:10,borderTop:"1px solid #334155",display:"flex",gap:8}}><Input value={sundayEditNames} onChange={setSundayEditNames} placeholder="Names, comma separated" style={{flex:1,padding:"6px 10px",fontSize:12}}/><SmallBtn onClick={()=>{overrideSundayJob(currentWeek,job.id,sundayEditNames.split(",").map(n=>n.trim()).filter(Boolean));setSundayEditingJob(null);}}>Save</SmallBtn></div>}
              </div>);})}
          </div>

          {/* MAKEUP SECTION */}
          <div style={{marginTop:20,background:"#1E293B",borderRadius:12,padding:16,border:"1px solid #F59E0B40"}}>
            <h3 style={{fontSize:13,fontWeight:700,color:"#F59E0B",marginBottom:4,letterSpacing:"0.05em"}}>MISSED SUNDAY?</h3>
            <p style={{fontSize:12,color:"#64748B",lineHeight:1.6,marginBottom:12}}>
              If you missed this week's cleaning, enter your name below to be added to <span style={{color:"#CBD5E1",fontWeight:600}}>next week's</span> Sunday cleaning regardless of your pin group. You must also fill out the absence form.
            </p>
            {currentWeekIdx<weeks.length-1?<>
              <div style={{display:"flex",gap:8,marginBottom:10}}>
                <Input value={makeupName} onChange={setMakeupName} placeholder="Your full name..." style={{flex:1,padding:"8px 12px",fontSize:13}}/>
                <SmallBtn onClick={()=>addMakeup(makeupName)} color="#F59E0B">Add Me</SmallBtn>
              </div>
            </>:<p style={{fontSize:12,color:"#64748B",fontStyle:"italic"}}>Last week of the semester — no makeup available.</p>}

            {/* Show who's signed up for makeup next week */}
            {currentWeekIdx<weeks.length-1&&(()=>{
              const nextWeek=weeks[currentWeekIdx+1];
              const nextData=sundayAssignments[nextWeek];
              const makeups=nextData?.makeups||[];
              if(makeups.length===0)return null;
              return<div style={{marginTop:8}}>
                <div style={{fontSize:11,color:"#94A3B8",fontWeight:600,marginBottom:6}}>SIGNED UP FOR NEXT WEEK ({nextWeek}):</div>
                {makeups.map((name,i)=><div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"#0F172A",borderRadius:6,padding:"6px 10px",marginBottom:4,border:"1px solid #334155"}}>
                  <span style={{fontSize:13,color:"#FCD34D"}}>{name}</span>
                  {(adminUnlocked)&&<button onClick={()=>removeMakeup(nextWeek,name)} style={{background:"none",border:"none",color:"#EF4444",cursor:"pointer",fontSize:16,padding:"0 4px",lineHeight:1}}>×</button>}
                </div>)}
              </div>;
            })()}

            {/* Show makeups for current week if any */}
            {(sunWeekData.makeups||[]).length>0&&<div style={{marginTop:10,paddingTop:10,borderTop:"1px solid #334155"}}>
              <div style={{fontSize:11,color:"#94A3B8",fontWeight:600,marginBottom:6}}>MAKEUP MEMBERS THIS WEEK:</div>
              {sunWeekData.makeups.map((name,i)=><div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"#0F172A",borderRadius:6,padding:"6px 10px",marginBottom:4,border:"1px solid #F59E0B30"}}>
                <span style={{fontSize:13,color:"#FCD34D"}}>{name}</span>
                {adminUnlocked&&<button onClick={()=>removeMakeup(currentWeek,name)} style={{background:"none",border:"none",color:"#EF4444",cursor:"pointer",fontSize:16,padding:"0 4px",lineHeight:1}}>×</button>}
              </div>)}
            </div>}
          </div>

          {adminUnlocked&&<button onClick={()=>setView("sunday_setup")} style={{marginTop:20,width:"100%",background:"#1E293B",border:"1px solid #334155",color:"#94A3B8",borderRadius:10,padding:"12px",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>⚙ Edit Sunday Roster & Jobs</button>}
        </div>}

        {/* ══════ SUNDAY SETUP ══════ */}
        {view==="sunday_setup"&&adminUnlocked&&<div className="fu">
          <button onClick={()=>setView("sunday")} style={{background:"none",border:"none",color:"#8B5CF6",fontSize:13,cursor:"pointer",fontFamily:"inherit",marginBottom:12,fontWeight:600,padding:0}}>← Back</button>
          <h2 style={{fontSize:16,fontWeight:700,color:"#F1F5F9",marginBottom:16}}>Sunday Setup</h2>
          <div style={{display:"flex",gap:6,marginBottom:16}}>
            {[{key:"even",label:`Even (${evenPins.length})`},{key:"odd",label:`Odd (${oddPins.length})`},{key:"sunjobs",label:`Jobs (${sundayJobs.length})`}].map(t=><button key={t.key} onClick={()=>setSunSetupTab(t.key)} style={{flex:1,padding:"8px 0",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",background:sunSetupTab===t.key?"#8B5CF618":"#1E293B",border:`1px solid ${sunSetupTab===t.key?"#8B5CF6":"#334155"}`,color:sunSetupTab===t.key?"#8B5CF6":"#94A3B8"}}>{t.label}</button>)}
          </div>
          {sunSetupTab==="even"&&<div><div style={{display:"flex",gap:8,marginBottom:12}}><Input value={sunEditName} onChange={setSunEditName} placeholder="Add even pin..." style={{flex:1}}/><SmallBtn onClick={()=>{if(sunEditName.trim()){const n=[...evenPins,sunEditName.trim()];setEvenPins(n);saveSunCfg(n,oddPins,sundayJobs);setSunEditName("");}}} color="#8B5CF6">+ Add</SmallBtn></div><div style={{display:"flex",flexDirection:"column",gap:4}}>{evenPins.map((b,i)=><div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"#1E293B",borderRadius:8,padding:"8px 12px",border:"1px solid #334155"}}><span style={{fontSize:14,color:"#CBD5E1"}}>{b}</span><button onClick={()=>{const n=evenPins.filter((_,j)=>j!==i);setEvenPins(n);saveSunCfg(n,oddPins,sundayJobs);}} style={{background:"none",border:"none",color:"#EF4444",cursor:"pointer",fontSize:18,padding:"0 4px",lineHeight:1}}>×</button></div>)}</div></div>}
          {sunSetupTab==="odd"&&<div><div style={{display:"flex",gap:8,marginBottom:12}}><Input value={sunEditName} onChange={setSunEditName} placeholder="Add odd pin..." style={{flex:1}}/><SmallBtn onClick={()=>{if(sunEditName.trim()){const n=[...oddPins,sunEditName.trim()];setOddPins(n);saveSunCfg(evenPins,n,sundayJobs);setSunEditName("");}}} color="#06B6D4">+ Add</SmallBtn></div><div style={{display:"flex",flexDirection:"column",gap:4}}>{oddPins.map((b,i)=><div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"#1E293B",borderRadius:8,padding:"8px 12px",border:"1px solid #334155"}}><span style={{fontSize:14,color:"#CBD5E1"}}>{b}</span><button onClick={()=>{const n=oddPins.filter((_,j)=>j!==i);setOddPins(n);saveSunCfg(evenPins,n,sundayJobs);}} style={{background:"none",border:"none",color:"#EF4444",cursor:"pointer",fontSize:18,padding:"0 4px",lineHeight:1}}>×</button></div>)}</div></div>}
          {sunSetupTab==="sunjobs"&&<div>
            <div style={{background:"#1E293B",borderRadius:10,padding:14,border:"1px solid #334155",marginBottom:12}}><Input value={sunEditJobName} onChange={setSunEditJobName} placeholder="Job name..." style={{marginBottom:8}}/><Input value={sunEditJobDesc} onChange={setSunEditJobDesc} placeholder="Description..." style={{marginBottom:8}}/><div style={{display:"flex",gap:12,alignItems:"center"}}><div style={{display:"flex",alignItems:"center",gap:6}}><label style={{fontSize:12,color:"#94A3B8"}}>People:</label><select value={sunEditJobPeople} onChange={e=>setSunEditJobPeople(+e.target.value)} style={{background:"#0F172A",border:"1px solid #334155",color:"#E2E8F0",borderRadius:6,padding:"6px 24px 6px 10px",fontSize:13,fontFamily:"inherit"}}>{[1,2,3,4,5,6,7,8].map(n=><option key={n} value={n}>{n}</option>)}</select></div><div style={{flex:1}}/><SmallBtn onClick={()=>{if(sunEditJobName.trim()){const n=[...sundayJobs,{id:"sun_"+Date.now(),name:sunEditJobName.trim(),people:sunEditJobPeople,desc:sunEditJobDesc.trim()}];setSundayJobs(n);saveSunCfg(evenPins,oddPins,n);setSunEditJobName("");setSunEditJobDesc("");setSunEditJobPeople(2);}}} color="#8B5CF6">+ Add</SmallBtn></div></div>
            <div style={{display:"flex",flexDirection:"column",gap:4}}>{sundayJobs.map((j,i)=>{
              const isEd=editingSunJobIdx===i;
              return<div key={j.id} style={{background:"#1E293B",borderRadius:8,padding:isEd?"12px":"8px 12px",border:`1px solid ${isEd?"#8B5CF6":"#334155"}`}}>
                {!isEd?<div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{cursor:"pointer",flex:1}} onClick={()=>setEditingSunJobIdx(i)}>
                    <span style={{fontSize:13,color:"#CBD5E1"}}>{j.name}</span>
                    <span style={{fontSize:11,color:"#64748B",marginLeft:8}}>×{j.people}</span>
                  </div>
                  <div style={{display:"flex",gap:4,alignItems:"center",flexShrink:0}}>
                    <button onClick={()=>setEditingSunJobIdx(i)} style={{background:"none",border:"none",color:"#64748B",cursor:"pointer",fontSize:13,padding:"0 4px"}}>✏️</button>
                    <button onClick={()=>{const n=sundayJobs.filter((_,k)=>k!==i);setSundayJobs(n);saveSunCfg(evenPins,oddPins,n);}} style={{background:"none",border:"none",color:"#EF4444",cursor:"pointer",fontSize:18,padding:"0 4px",lineHeight:1}}>×</button>
                  </div>
                </div>
                :<div style={{display:"flex",flexDirection:"column",gap:8}}>
                  <Input value={j.name} onChange={v=>{const n=[...sundayJobs];n[i]={...n[i],name:v};setSundayJobs(n);}} placeholder="Job name" style={{padding:"8px 10px",fontSize:13}}/>
                  <Input value={j.desc||""} onChange={v=>{const n=[...sundayJobs];n[i]={...n[i],desc:v};setSundayJobs(n);}} placeholder="Description" style={{padding:"8px 10px",fontSize:12}}/>
                  <div style={{display:"flex",gap:10,alignItems:"center"}}>
                    <div style={{display:"flex",alignItems:"center",gap:4}}>
                      <label style={{fontSize:11,color:"#94A3B8"}}>People:</label>
                      <select value={j.people} onChange={e=>{const n=[...sundayJobs];n[i]={...n[i],people:+e.target.value};setSundayJobs(n);}} style={{background:"#0F172A",border:"1px solid #334155",color:"#E2E8F0",borderRadius:4,padding:"4px 20px 4px 6px",fontSize:12,fontFamily:"inherit"}}>
                        {[1,2,3,4,5,6,7,8].map(x=><option key={x} value={x}>{x}</option>)}
                      </select>
                    </div>
                    <div style={{flex:1}}/>
                    <SmallBtn onClick={()=>{saveSunCfg(evenPins,oddPins,sundayJobs);setEditingSunJobIdx(null);}} color="#10B981">Done</SmallBtn>
                    <button onClick={()=>{const n=sundayJobs.filter((_,k)=>k!==i);setSundayJobs(n);saveSunCfg(evenPins,oddPins,n);setEditingSunJobIdx(null);}} style={{background:"none",border:"none",color:"#EF4444",cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:600}}>Delete</button>
                  </div>
                </div>}
              </div>;})}
            </div>
          </div>}
          <button onClick={()=>{const sa=generateSundayAssignments(evenPins,oddPins,sundayJobs,weeks);setSundayAssignments(sa);saveSunA(sa);setView("sunday");}} style={{marginTop:20,width:"100%",background:"linear-gradient(135deg,#8B5CF6,#7C3AED)",border:"none",color:"#FFF",borderRadius:10,padding:"14px",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>🔄 Regenerate Sunday</button>
        </div>}

        {/* ══════ PROJECTS ══════ */}
        {view==="projects"&&<div className="fu">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <h2 style={{fontSize:16,fontWeight:700,color:"#F1F5F9"}}>House Projects</h2>
            {adminUnlocked&&<SmallBtn onClick={()=>setView("project_setup")} color="#EC4899">⚙ Edit</SmallBtn>}
          </div>
          <p style={{fontSize:12,color:"#64748B",marginBottom:16,lineHeight:1.5}}>Claim a project, finish it, get points. Whoever has the most points at the end of the semester wins a prize!</p>

          <div className="job-grid">
            {(projWeekData.projects||[]).map((proj,i)=>{
              const dc=DIFF_COLORS[proj.difficulty]||DIFF_COLORS.easy;
              const isAvail=proj.status==="available";
              const isClaimed=proj.status==="claimed";
              const isDone=proj.status==="done";
              const isVerified=proj.status==="verified";
              return(
                <div key={i} className="fu" style={{background:"#1E293B",borderRadius:12,padding:"14px 16px",border:`1px solid ${isVerified?"#3B82F640":isDone?"#10B98140":"#334155"}`,animationDelay:`${i*.04}s`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                        <span style={{fontSize:14,fontWeight:600,color:"#F1F5F9"}}>{proj.name}</span>
                        <DiffBadge d={proj.difficulty}/>
                      </div>
                      <div style={{fontSize:11,color:"#475569",marginTop:4}}>{proj.area}</div>
                      {(isClaimed||isDone||isVerified)&&<div style={{fontSize:12,color:isVerified?"#3B82F6":isDone?"#10B981":"#F59E0B",marginTop:6,fontWeight:600}}>
                        {isVerified?"✓ Verified":isDone?"✓ Done":"⏳ Claimed"} — {proj.claimedBy}
                      </div>}
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:4,alignItems:"flex-end"}}>
                      {isAvail&&<div style={{display:"flex",gap:4,alignItems:"center"}}>
                        <Input value={projClaimName} onChange={setProjClaimName} placeholder="Your name" style={{width:100,padding:"5px 8px",fontSize:11}}/>
                        <SmallBtn onClick={()=>{if(projClaimName.trim()){claimProject(currentWeek,i,projClaimName.trim());}}} color="#EC4899">Claim</SmallBtn>
                      </div>}
                      {isClaimed&&<SmallBtn onClick={()=>completeProject(currentWeek,i)} color="#10B981">Mark Done</SmallBtn>}
                      {isClaimed&&<SmallBtn onClick={()=>unclaimProject(currentWeek,i)} color="#EF4444">Unclaim</SmallBtn>}
                      {isDone&&adminUnlocked&&<SmallBtn onClick={()=>verifyProject(currentWeek,i)} color="#3B82F6">Verify</SmallBtn>}
                      {isVerified&&<span style={{fontSize:11,color:"#3B82F6",fontWeight:700}}>✓ VERIFIED</span>}
                    </div>
                  </div>
                </div>);
            })}
            {(projWeekData.projects||[]).length===0&&<div style={{textAlign:"center",color:"#64748B",padding:20,fontSize:13}}>No projects assigned this week.</div>}
          </div>

          {/* Project Leaderboard */}
          <div style={{marginTop:24,background:"#1E293B",borderRadius:12,padding:16,border:"1px solid #EC489940"}}>
            <h3 style={{fontSize:13,fontWeight:700,color:"#EC4899",marginBottom:10,letterSpacing:"0.05em"}}>🏆 PROJECT LEADERBOARD</h3>
            {Object.entries(projectStats).sort(([,a],[,b])=>b.points-a.points).length===0
              ?<div style={{fontSize:13,color:"#64748B",textAlign:"center",padding:10}}>No projects completed yet — be the first!</div>
              :Object.entries(projectStats).sort(([,a],[,b])=>b.points-a.points).map(([name,s],i)=>{
                const medal=i<3?["🥇","🥈","🥉"][i]:null;
                return<div key={name} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid #334155"}}>
                  <span style={{width:24,textAlign:"center",fontSize:medal?16:13,color:"#64748B",fontWeight:700,fontFamily:"'Space Mono',monospace"}}>{medal||(i+1)}</span>
                  <span style={{flex:1,fontSize:14,fontWeight:600,color:"#F1F5F9"}}>{name}</span>
                  <span style={{fontSize:12,color:"#EC4899",fontWeight:700,fontFamily:"'Space Mono',monospace"}}>{s.points} pts</span>
                  <span style={{fontSize:11,color:"#64748B"}}>{s.count} done</span>
                </div>;
              })}
          </div>
        </div>}

        {/* ══════ PROJECT SETUP ══════ */}
        {view==="project_setup"&&adminUnlocked&&<div className="fu">
          <button onClick={()=>setView("projects")} style={{background:"none",border:"none",color:"#EC4899",fontSize:13,cursor:"pointer",fontFamily:"inherit",marginBottom:12,fontWeight:600,padding:0}}>← Back</button>
          <h2 style={{fontSize:16,fontWeight:700,color:"#F1F5F9",marginBottom:16}}>Manage Projects ({projects.length})</h2>
          <div style={{background:"#1E293B",borderRadius:10,padding:14,border:"1px solid #334155",marginBottom:12}}>
            <Input value={projEditName} onChange={setProjEditName} placeholder="Project name..." style={{marginBottom:8}}/>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <select value={projEditArea} onChange={e=>setProjEditArea(e.target.value)} style={{background:"#0F172A",border:"1px solid #334155",color:"#E2E8F0",borderRadius:6,padding:"8px 28px 8px 10px",fontSize:13,fontFamily:"inherit",flex:1}}>
                {["Basement","1st Floor","2nd Floor","3rd Floor","Common","Outside"].map(a=><option key={a} value={a}>{a}</option>)}
              </select>
              <select value={projEditDiff} onChange={e=>setProjEditDiff(e.target.value)} style={{background:"#0F172A",border:"1px solid #334155",color:"#E2E8F0",borderRadius:6,padding:"8px 28px 8px 10px",fontSize:13,fontFamily:"inherit"}}>
                <option value="easy">Easy (1pt)</option><option value="medium">Medium (2pts)</option>
              </select>
              <SmallBtn onClick={()=>{if(projEditName.trim()){const n=[...projects,{id:"p_"+Date.now(),name:projEditName.trim(),area:projEditArea,difficulty:projEditDiff}];setProjects(n);saveProjCfg(n);setProjEditName("");}}} color="#EC4899">+ Add</SmallBtn>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:4}}>
            {projects.map((p,i)=><div key={p.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"#1E293B",borderRadius:8,padding:"8px 12px",border:"1px solid #334155"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,flex:1,minWidth:0}}>
                <span style={{fontSize:13,color:"#CBD5E1",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</span>
                <DiffBadge d={p.difficulty}/>
              </div>
              <button onClick={()=>{const n=projects.filter((_,k)=>k!==i);setProjects(n);saveProjCfg(n);}} style={{background:"none",border:"none",color:"#EF4444",cursor:"pointer",fontSize:18,padding:"0 4px",lineHeight:1,flexShrink:0}}>×</button>
            </div>)}
          </div>
          <button onClick={()=>{const wp=generateWeeklyProjects(projects,weeks);setWeeklyProjects(wp);saveProjA(wp);setView("projects");}} style={{marginTop:20,width:"100%",background:"linear-gradient(135deg,#EC4899,#DB2777)",border:"none",color:"#FFF",borderRadius:10,padding:"14px",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>🔄 Reshuffle Projects Across Weeks</button>
        </div>}

        {/* ══════ ROSTER ══════ */}
        {view==="roster"&&!selectedBrother&&<div className="fu">
          <h2 style={{fontSize:16,fontWeight:700,color:"#F1F5F9",marginBottom:4}}>Full Roster</h2>
          <p style={{fontSize:12,color:"#64748B",marginBottom:16}}>Tap a name to see their full schedule</p>
          <div className="roster-grid">
            {brothers.map((bObj,i)=>{const b=typeof bObj==="string"?{name:bObj,floor:"first"}:bObj;const s=stats[b.name]||{total:0,done:0,verified:0};const pct=s.total>0?Math.round(((s.done+(s.verified||0))/s.total)*100):0;const fc=AREA_META[b.floor]||{color:"#6B7280",label:"?"};return(
              <div key={b.name} className="ch fu" onClick={()=>setSelectedBrother(b.name)} style={{background:"#1E293B",borderRadius:10,padding:"12px 16px",border:"1px solid #334155",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",animationDelay:`${i*.025}s`}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:36,height:36,borderRadius:"50%",background:`linear-gradient(135deg,${fc.color}44,${fc.color}22)`,border:`1px solid ${fc.color}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:fc.color}}>{b.name[0]}</div>
                  <div>
                    <div style={{fontSize:14,fontWeight:600,color:"#F1F5F9"}}>{b.name}</div>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2}}>
                      <span style={{fontSize:10,color:fc.color,background:`${fc.color}18`,padding:"1px 6px",borderRadius:4,fontWeight:600}}>{fc.label}</span>
                      <span style={{fontSize:11,color:"#64748B"}}>{s.done+(s.verified||0)}/{s.total}</span>
                    </div>
                  </div>
                </div>
                <div style={{fontSize:15,fontWeight:700,fontFamily:"'Space Mono',monospace",color:pct>=80?"#10B981":pct>=50?"#F59E0B":"#EF4444"}}>{pct}%</div>
              </div>);})}
          </div>
        </div>}

        {view==="roster"&&selectedBrother&&<div className="fu">
          <button onClick={()=>setSelectedBrother(null)} style={{background:"none",border:"none",color:"#10B981",fontSize:13,cursor:"pointer",fontFamily:"inherit",marginBottom:12,fontWeight:600,padding:0}}>← Back</button>
          <div style={{background:"#1E293B",borderRadius:14,padding:20,border:"1px solid #334155",marginBottom:16}}>
            <h2 style={{fontSize:20,fontWeight:700,color:"#F8FAFC",marginBottom:14}}>{selectedBrother}</h2>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8}}>
              {[{n:stats[selectedBrother]?.done||0,l:"Done",c:"#10B981"},{n:stats[selectedBrother]?.verified||0,l:"Verified",c:"#3B82F6"},{n:stats[selectedBrother]?.missed||0,l:"Missed",c:"#EF4444"},{n:stats[selectedBrother]?.pending||0,l:"Pending",c:"#F59E0B"}].map(s=>
                <div key={s.l} style={{textAlign:"center"}}><div style={{fontSize:22,fontWeight:700,color:s.c,fontFamily:"'Space Mono',monospace"}}>{s.n}</div><div style={{fontSize:10,color:"#64748B",marginTop:2}}>{s.l}</div></div>
              )}
            </div>
          </div>
          <h3 style={{fontSize:13,fontWeight:700,color:"#94A3B8",marginBottom:10,letterSpacing:"0.05em"}}>WEEKLY ASSIGNMENTS</h3>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {weeks.map((week,wi)=>{const wj=assignments[week];if(!wj)return null;const myJobs=jobs.filter(j=>wj[j.id]?.assigned?.includes(selectedBrother));if(!myJobs.length)return null;return(
              <div key={week} style={{background:wi===currentWeekIdx?"#1E293B":"#151922",borderRadius:10,padding:"10px 14px",border:wi===currentWeekIdx?"1px solid #10B981":"1px solid #1E293B"}}>
                <div style={{fontSize:11,color:wi===currentWeekIdx?"#10B981":"#64748B",fontWeight:600,fontFamily:"'Space Mono',monospace",marginBottom:6}}>{week} {wi===currentWeekIdx&&"← Current"}</div>
                {myJobs.map(j=><div key={j.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0"}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:6,height:6,borderRadius:"50%",background:(AREA_META[j.area]||{color:"#6B7280"}).color}}/><span style={{fontSize:13,color:"#CBD5E1"}}>{j.name}</span></div>
                  <StatusBadge status={wj[j.id].status} onClick={()=>cycleStatus(week,j.id,adminUnlocked)}/>
                </div>)}
              </div>);})}
          </div>
        </div>}

        {/* ══════ LEADERBOARD ══════ */}
        {view==="leaderboard"&&<div className="fu">
          <h2 style={{fontSize:16,fontWeight:700,color:"#F1F5F9",marginBottom:4}}>Accountability Board</h2>
          <p style={{fontSize:12,color:"#64748B",marginBottom:16}}>Weekly jobs ranked by completion</p>
          {brotherNames.map(b=>({name:b,...stats[b],pct:stats[b]?.total>0?((stats[b].done+(stats[b].verified||0))/stats[b].total)*100:0})).sort((a,b)=>b.pct-a.pct).map((b,i)=>{
            const medal=i<3?["🥇","🥈","🥉"][i]:null;
            return<div key={b.name} className="fu" style={{display:"flex",alignItems:"center",gap:12,background:"#1E293B",borderRadius:10,padding:"12px 16px",border:i<3?`1px solid ${["#F59E0B","#94A3B8","#CD7F32"][i]}40`:"1px solid #334155",marginBottom:6,animationDelay:`${i*.03}s`}}>
              <div style={{width:28,fontSize:medal?18:14,textAlign:"center",color:"#64748B",fontWeight:700,fontFamily:"'Space Mono',monospace"}}>{medal||(i+1)}</div>
              <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:"#F1F5F9"}}>{b.name}</div><div style={{display:"flex",gap:10,marginTop:4}}><span style={{fontSize:11,color:"#10B981"}}>✓ {b.done+(b.verified||0)}</span><span style={{fontSize:11,color:"#EF4444"}}>✗ {b.missed}</span><span style={{fontSize:11,color:"#F59E0B"}}>○ {b.pending}</span></div></div>
              <div style={{width:80}}><div style={{height:6,background:"#0F172A",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",borderRadius:3,width:`${Math.round(b.pct)}%`,background:b.pct>=80?"#10B981":b.pct>=50?"#F59E0B":"#EF4444"}}/></div><div style={{fontSize:11,textAlign:"right",marginTop:3,fontWeight:700,fontFamily:"'Space Mono',monospace",color:b.pct>=80?"#10B981":b.pct>=50?"#F59E0B":"#EF4444"}}>{Math.round(b.pct)}%</div></div>
            </div>;})}
          <div style={{marginTop:20,background:"#1E293B",borderRadius:12,padding:16,border:"1px solid #334155"}}>
            <h3 style={{fontSize:13,fontWeight:700,color:"#EF4444",marginBottom:8,letterSpacing:"0.05em"}}>FINE TRACKER</h3>
            <p style={{fontSize:12,color:"#64748B",lineHeight:1.6,marginBottom:12}}>Per Amendment 22: missed jobs = fines. 3+ misses flagged for Standards.</p>
            {brotherNames.filter(b=>(stats[b]?.missed||0)>0).length===0?<div style={{fontSize:13,color:"#10B981",textAlign:"center",padding:10}}>No missed jobs yet!</div>
            :brotherNames.filter(b=>(stats[b]?.missed||0)>0).sort((a,b)=>(stats[b]?.missed||0)-(stats[a]?.missed||0)).map(b=><div key={b} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid #334155"}}><span style={{fontSize:13,color:"#CBD5E1"}}>{b}</span><span style={{fontSize:12,fontWeight:700,fontFamily:"'Space Mono',monospace",color:(stats[b]?.missed||0)>=3?"#EF4444":"#F59E0B"}}>{stats[b]?.missed||0} miss{(stats[b]?.missed||0)!==1?"es":""}{(stats[b]?.missed||0)>=3&&" ⚠️"}</span></div>)}
          </div>
        </div>}

        {/* ══════ SETUP ══════ */}
        {view==="setup"&&!adminUnlocked&&<div className="fu" style={{maxWidth:340,margin:"40px auto",textAlign:"center"}}>
          <div style={{width:64,height:64,borderRadius:16,background:"#F59E0B18",border:"1px solid #F59E0B40",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",fontSize:28}}>🔒</div>
          <h2 style={{fontSize:18,fontWeight:700,color:"#F1F5F9",marginBottom:6}}>House Manager Access</h2>
          <p style={{fontSize:13,color:"#64748B",marginBottom:24}}>Enter the admin password to edit settings.</p>
          <Input type="password" value={pwInput} onChange={v=>{setPwInput(v);setPwError(false);}} placeholder="Enter password..." style={{textAlign:"center",fontSize:16,letterSpacing:"0.1em",marginBottom:12,borderColor:pwError?"#EF4444":"#334155"}}/>
          {pwError&&<p style={{fontSize:12,color:"#EF4444",marginBottom:12}}>Wrong password.</p>}
          <button onClick={checkPassword} style={{width:"100%",background:"linear-gradient(135deg,#F59E0B,#D97706)",border:"none",color:"#FFF",borderRadius:10,padding:"14px",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Unlock</button>
        </div>}

        {view==="setup"&&adminUnlocked&&<div className="fu">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <h2 style={{fontSize:16,fontWeight:700,color:"#F1F5F9"}}>Weekly Setup</h2>
            <button onClick={()=>{setAdminUnlocked(false);setPwInput("");}} style={{background:"#1E293B",border:"1px solid #334155",color:"#94A3B8",borderRadius:6,padding:"5px 10px",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>🔒 Lock</button>
          </div>
          <div style={{marginBottom:20}}><label style={{fontSize:12,color:"#94A3B8",fontWeight:600,display:"block",marginBottom:6}}>SEMESTER NAME</label><Input value={semesterName} onChange={setSemesterName} placeholder="e.g. Spring 2027"/></div>
          <div style={{display:"flex",gap:6,marginBottom:16}}>
            {[{key:"brothers",label:`Brothers (${brothers.length})`},{key:"jobs",label:`Jobs (${jobs.length})`},{key:"weeks",label:`Weeks (${weeks.length})`}].map(t=><button key={t.key} onClick={()=>setSetupTab(t.key)} style={{flex:1,padding:"8px 0",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",background:setupTab===t.key?"#F59E0B18":"#1E293B",border:`1px solid ${setupTab===t.key?"#F59E0B":"#334155"}`,color:setupTab===t.key?"#F59E0B":"#94A3B8"}}>{t.label}</button>)}
          </div>
          {setupTab==="brothers"&&<div>
            <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
              <Input value={editName} onChange={setEditName} placeholder="Add a brother..." style={{flex:1,minWidth:140}}/>
              <select value={editFloor} onChange={e=>setEditFloor(e.target.value)} style={{background:"#0F172A",border:"1px solid #334155",color:"#E2E8F0",borderRadius:8,padding:"10px 28px 10px 10px",fontSize:13,fontFamily:"inherit"}}>
                <option value="basement">Basement</option><option value="first">1st Floor</option><option value="second">2nd Floor</option><option value="third">3rd Floor</option>
              </select>
              <SmallBtn onClick={()=>{if(editName.trim()&&!brotherNames.includes(editName.trim())){setBrothers([...brothers,{name:editName.trim(),floor:editFloor}]);setEditName("");}}}>+ Add</SmallBtn>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:4}}>
              {brothers.map((b,i)=>{const bo=typeof b==="string"?{name:b,floor:"first"}:b;const fc=AREA_META[bo.floor]||{color:"#6B7280",label:"?"};return(
                <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"#1E293B",borderRadius:8,padding:"8px 12px",border:"1px solid #334155"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:fc.color}}/>
                    <span style={{fontSize:14,color:"#CBD5E1"}}>{bo.name}</span>
                    <span style={{fontSize:10,color:fc.color,background:`${fc.color}18`,padding:"1px 6px",borderRadius:4,fontWeight:600}}>{fc.label}</span>
                  </div>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    <select value={bo.floor} onChange={e=>{const n=[...brothers];n[i]=typeof b==="string"?{name:b,floor:e.target.value}:{...b,floor:e.target.value};setBrothers(n);}} style={{background:"#0F172A",border:"1px solid #334155",color:"#94A3B8",borderRadius:4,padding:"2px 20px 2px 6px",fontSize:11,fontFamily:"inherit"}}>
                      <option value="basement">BSMT</option><option value="first">1F</option><option value="second">2F</option><option value="third">3F</option>
                    </select>
                    <button onClick={()=>setBrothers(brothers.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:"#EF4444",cursor:"pointer",fontSize:18,padding:"0 4px",lineHeight:1}}>×</button>
                  </div>
                </div>);})}
            </div>
          </div>}
          {setupTab==="jobs"&&<div>
            <div style={{background:"#1E293B",borderRadius:10,padding:14,border:"1px solid #334155",marginBottom:12}}>
              <div style={{display:"flex",gap:8,marginBottom:8}}><Input value={editJobName} onChange={setEditJobName} placeholder="Job name..." style={{flex:1}}/><select value={editJobArea} onChange={e=>setEditJobArea(e.target.value)} style={{background:"#0F172A",border:"1px solid #334155",color:"#E2E8F0",borderRadius:8,padding:"10px 28px 10px 14px",fontSize:13,fontFamily:"inherit"}}>{AREA_KEYS.map(k=><option key={k} value={k}>{AREA_META[k].label}</option>)}</select></div>
              <Input value={editJobDesc} onChange={setEditJobDesc} placeholder="Description..." style={{marginBottom:8}}/>
              <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}><div style={{display:"flex",alignItems:"center",gap:6}}><label style={{fontSize:12,color:"#94A3B8"}}>People:</label><select value={editJobPeople} onChange={e=>setEditJobPeople(+e.target.value)} style={{background:"#0F172A",border:"1px solid #334155",color:"#E2E8F0",borderRadius:6,padding:"6px 24px 6px 10px",fontSize:13,fontFamily:"inherit"}}><option value={1}>1</option><option value={2}>2</option><option value={3}>3</option></select></div><label style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:"#94A3B8",cursor:"pointer"}}><input type="checkbox" checked={editJobRotating} onChange={e=>{setEditJobRotating(e.target.checked);if(e.target.checked)setEditJobFloorRotate(false);}} style={{accentColor:"#F59E0B"}}/> Rotating</label><label style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:"#94A3B8",cursor:"pointer"}}><input type="checkbox" checked={editJobFloorRotate} onChange={e=>{setEditJobFloorRotate(e.target.checked);if(e.target.checked)setEditJobRotating(false);}} style={{accentColor:"#06B6D4"}}/> Floor Rotate</label><div style={{flex:1}}/><SmallBtn onClick={()=>{if(editJobName.trim()){setJobs([...jobs,{id:editJobName.trim().toLowerCase().replace(/\s+/g,"_")+"_"+Date.now(),name:editJobName.trim(),area:editJobArea,people:editJobPeople,desc:editJobDesc.trim(),rotating:editJobRotating,floorRotate:editJobFloorRotate}]);setEditJobName("");setEditJobDesc("");setEditJobPeople(1);setEditJobRotating(false);setEditJobFloorRotate(false);}}}>+ Add</SmallBtn></div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:4}}>{jobs.map((j,i)=>{
              const isEd=editingJobIdx===i;
              const fc=AREA_META[j.area]||{color:"#6B7280"};
              return<div key={j.id} style={{background:"#1E293B",borderRadius:8,padding:isEd?"12px":"8px 12px",border:`1px solid ${isEd?"#F59E0B":"#334155"}`}}>
                {!isEd?<div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,flex:1,minWidth:0,cursor:"pointer"}} onClick={()=>setEditingJobIdx(i)}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:fc.color,flexShrink:0}}/>
                    <span style={{fontSize:13,color:"#CBD5E1",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{j.name}</span>
                    <span style={{fontSize:11,color:"#64748B"}}>×{j.people}</span>
                    {j.rotating&&<span style={{fontSize:10,color:"#F59E0B"}}>ROT</span>}
                    {j.floorRotate&&<span style={{fontSize:10,color:"#06B6D4"}}>FLOOR</span>}
                  </div>
                  <div style={{display:"flex",gap:4,alignItems:"center",flexShrink:0}}>
                    <button onClick={()=>setEditingJobIdx(i)} style={{background:"none",border:"none",color:"#64748B",cursor:"pointer",fontSize:13,padding:"0 4px"}}>✏️</button>
                    <button onClick={()=>setJobs(jobs.filter((_,k)=>k!==i))} style={{background:"none",border:"none",color:"#EF4444",cursor:"pointer",fontSize:18,padding:"0 4px",lineHeight:1}}>×</button>
                  </div>
                </div>
                :<div style={{display:"flex",flexDirection:"column",gap:8}}>
                  <div style={{display:"flex",gap:8}}>
                    <Input value={j.name} onChange={v=>{const n=[...jobs];n[i]={...n[i],name:v};setJobs(n);}} placeholder="Job name" style={{flex:1,padding:"8px 10px",fontSize:13}}/>
                    <select value={j.area} onChange={e=>{const n=[...jobs];n[i]={...n[i],area:e.target.value};setJobs(n);}} style={{background:"#0F172A",border:"1px solid #334155",color:"#E2E8F0",borderRadius:6,padding:"6px 24px 6px 8px",fontSize:12,fontFamily:"inherit"}}>
                      {AREA_KEYS.map(k=><option key={k} value={k}>{AREA_META[k].label}</option>)}
                    </select>
                  </div>
                  <Input value={j.desc||""} onChange={v=>{const n=[...jobs];n[i]={...n[i],desc:v};setJobs(n);}} placeholder="Description" style={{padding:"8px 10px",fontSize:12}}/>
                  <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
                    <div style={{display:"flex",alignItems:"center",gap:4}}>
                      <label style={{fontSize:11,color:"#94A3B8"}}>People:</label>
                      <select value={j.people} onChange={e=>{const n=[...jobs];n[i]={...n[i],people:+e.target.value};setJobs(n);}} style={{background:"#0F172A",border:"1px solid #334155",color:"#E2E8F0",borderRadius:4,padding:"4px 20px 4px 6px",fontSize:12,fontFamily:"inherit"}}>
                        {[1,2,3,4].map(x=><option key={x} value={x}>{x}</option>)}
                      </select>
                    </div>
                    <label style={{display:"flex",alignItems:"center",gap:4,fontSize:11,color:"#94A3B8",cursor:"pointer"}}>
                      <input type="checkbox" checked={!!j.rotating} onChange={e=>{const n=[...jobs];n[i]={...n[i],rotating:e.target.checked,floorRotate:e.target.checked?false:n[i].floorRotate};setJobs(n);}} style={{accentColor:"#F59E0B"}}/> Rotating
                    </label>
                    <label style={{display:"flex",alignItems:"center",gap:4,fontSize:11,color:"#94A3B8",cursor:"pointer"}}>
                      <input type="checkbox" checked={!!j.floorRotate} onChange={e=>{const n=[...jobs];n[i]={...n[i],floorRotate:e.target.checked,rotating:e.target.checked?false:n[i].rotating};setJobs(n);}} style={{accentColor:"#06B6D4"}}/> Floor Rotate
                    </label>
                    <div style={{flex:1}}/>
                    <SmallBtn onClick={()=>setEditingJobIdx(null)} color="#10B981">Done</SmallBtn>
                    <button onClick={()=>{setJobs(jobs.filter((_,k)=>k!==i));setEditingJobIdx(null);}} style={{background:"none",border:"none",color:"#EF4444",cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:600}}>Delete</button>
                  </div>
                </div>}
              </div>;})}
            </div>
          </div>}
          {setupTab==="weeks"&&<div><div style={{display:"flex",gap:8,marginBottom:12,alignItems:"center"}}><Input value={editWeekStart} onChange={setEditWeekStart} placeholder="Start" style={{flex:1}}/><span style={{color:"#64748B"}}>–</span><Input value={editWeekEnd} onChange={setEditWeekEnd} placeholder="End" style={{flex:1}}/><SmallBtn onClick={()=>{if(editWeekStart.trim()&&editWeekEnd.trim()){setWeeks([...weeks,`${editWeekStart.trim()}-${editWeekEnd.trim()}`]);setEditWeekStart("");setEditWeekEnd("");}}}>+ Add</SmallBtn></div><div style={{display:"flex",flexDirection:"column",gap:4}}>{weeks.map((w,i)=><div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:i===currentWeekIdx?"#10B98118":"#1E293B",borderRadius:8,padding:"8px 12px",border:`1px solid ${i===currentWeekIdx?"#10B981":"#334155"}`}}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:11,color:"#64748B",fontFamily:"'Space Mono',monospace",width:24}}>{i+1}</span><span style={{fontSize:13,color:"#CBD5E1",fontFamily:"'Space Mono',monospace"}}>{w}</span></div><button onClick={()=>setWeeks(weeks.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:"#EF4444",cursor:"pointer",fontSize:18,padding:"0 4px",lineHeight:1}}>×</button></div>)}</div></div>}
          <div style={{marginTop:24,display:"flex",flexDirection:"column",gap:10}}>
            {!confirmRegen?<button onClick={()=>setConfirmRegen(true)} disabled={saving} style={{background:"linear-gradient(135deg,#10B981,#059669)",border:"none",color:"#FFF",borderRadius:10,padding:"14px 20px",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"inherit",opacity:saving?.6:1}}>{saving?"Saving...":"🔄 Regenerate All"}</button>
            :<div style={{background:"#7F1D1D20",border:"1px solid #EF444450",borderRadius:10,padding:16}}><p style={{fontSize:13,color:"#FCA5A5",marginBottom:12,lineHeight:1.5}}>This erases ALL tracking and creates fresh assignments. Sure?</p><div style={{display:"flex",gap:8}}><button onClick={regenerate} disabled={saving} style={{flex:1,background:"#EF4444",border:"none",color:"#FFF",borderRadius:8,padding:"10px",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{saving?"...":"Yes"}</button><button onClick={()=>setConfirmRegen(false)} style={{flex:1,background:"#1E293B",border:"1px solid #334155",color:"#94A3B8",borderRadius:8,padding:"10px",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button></div></div>}
          </div>
        </div>}

      </div>
    </div>
  );
}
