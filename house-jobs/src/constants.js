// Default roster, jobs and display settings for the house app.
// ─── DEFAULTS ───
export const DEFAULT_WEEKS = ["8/25-8/31","9/1-9/7","9/8-9/14","9/15-9/21","9/22-9/28","9/29-10/5","10/6-10/12","10/13-10/19","10/20-10/26","10/27-11/2","11/3-11/9","11/10-11/16","11/17-11/23","12/1-12/7","12/8-12/14"];
export const DEFAULT_BROTHERS = [
  {name:"Mason M",floor:"basement"},{name:"Ethan D",floor:"basement"},{name:"Gabe D",floor:"basement"},{name:"Daniel M",floor:"first"},{name:"Mitchell S",floor:"first"},{name:"Evan R",floor:"first"},
  {name:"John",floor:"first"},{name:"Aiden",floor:"second"},{name:"Reese C",floor:"second"},{name:"Keely S",floor:"second"},{name:"Sergio G",floor:"second"},{name:"Nic D",floor:"third"},
  {name:"Rylan Z",floor:"third"},{name:"Tyler L",floor:"third"},{name:"Ryan M",floor:"third"},{name:"Henry",floor:"first"},{name:"Gavin",floor:"second"},{name:"Cole",floor:"third"},{name:"Jake",floor:"basement"},{name:"Nate B",floor:"second"}
];

export const DEFAULT_JOBS = [
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

export const DEFAULT_EVEN_PINS = ["Michael M","Derek G","Evan R","Andrew M","Sergio G","Grant M","Nate B","Jacob C","Nic D","Jack D","Daniel K","Michael T","Zach U","Morgan B","Cohl B","Jacob Ch","Michael J","Adlai K","Tyler P","David S","Alex M","James T","Thomas W"];
export const DEFAULT_ODD_PINS = ["Ryan M","Tyler L","Daniel M","Jim B","Jordan G","Zach M","Noah C","Reese C","Ethan D","Gabe D","Toby J","Mason Meyer","Brandon G","Rylan Z","Thomas A","Lucas C","Madden H","Sean K","Mason Men","Vance S","Bobo B","Griffin S","Connor U"];

export const DEFAULT_SUNDAY_JOBS = [
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
export const DEFAULT_PROJECTS = [
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

export const PROJECTS_PER_WEEK = 5;

export const AREA_META = {
  basement:{ label:"Basement", color:"#6B7280" },
  first:{ label:"1st Floor", color:"var(--purple)" },
  second:{ label:"2nd Floor", color:"var(--blue)" },
  third:{ label:"3rd Floor", color:"var(--cyan)" },
  common:{ label:"Common", color:"var(--amber)" },
  outside:{ label:"Outside", color:"var(--gold)" },
};
export const AREA_KEYS = Object.keys(AREA_META);
export const STATUS_CYCLE = ["pending","done","missed","verified"];
export const STATUS_CONFIG = {
  pending:{ bg:"#FEF3C7", border:"var(--amber)", text:"#92400E", label:"Pending" },
  done:{ bg:"#FDF3D7", border:"var(--gold)", text:"#6B5220", label:"Done" },
  missed:{ bg:"#FEE2E2", border:"var(--red)", text:"#991B1B", label:"Missed" },
  verified:{ bg:"#DBEAFE", border:"var(--blue)", text:"#1E40AF", label:"Verified" },
  excused:{ bg:"#E5E7EB", border:"var(--muted)", text:"#374151", label:"Excused" },
};
export const DIFF_COLORS = { easy:{ bg:"color-mix(in srgb, var(--gold) 9%, transparent)", color:"var(--gold)", border:"color-mix(in srgb, var(--gold) 25%, transparent)", pts:1 }, medium:{ bg:"color-mix(in srgb, var(--amber) 9%, transparent)", color:"var(--amber)", border:"color-mix(in srgb, var(--amber) 25%, transparent)", pts:2 } };


export const DEFAULT_HOUSE_SETTINGS={
  weeklyDueDay:5,weeklyDueTime:"18:00",
  sundayDueDay:0,sundayDueTime:"15:00",
  kitchenRotationEnabled:true
};
export const ISSUE_CATEGORIES=["Maintenance","Cleaning","Supplies","Network","Safety","Other"];
export const ISSUE_PRIORITIES=["low","medium","high","urgent"];

// Comparable fingerprint of a saved weekly setup (same shape and key order as the app's own state).
export const setupSig=d=>JSON.stringify({brothers:d.brothers||DEFAULT_BROTHERS,jobs:d.jobs||DEFAULT_JOBS,weeks:d.weeks||DEFAULT_WEEKS,semesterName:d.semesterName||"Fall 2026",chairs:d.chairs||{},locks:d.locks||[]});
