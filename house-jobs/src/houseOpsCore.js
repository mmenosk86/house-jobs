// Pure data operations. Firebase keys are encoded without name collisions.
export const keyOf=value=>Array.from(new TextEncoder().encode(String(value))).map(n=>n.toString(16).padStart(2,"0")).join("");
export const weekKey=value=>String(value).replace(/[.#$/\[\]]/g,"_");
export const clone=value=>JSON.parse(JSON.stringify(value||{}));
export const unique=values=>[...new Set((values||[]).filter(Boolean))];
export function addDays(iso,days){
  const date=new Date(iso+"T12:00:00Z");
  if(!/^\d{4}-\d{2}-\d{2}$/.test(iso)||!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==iso)throw Error("Enter a valid date.");
  date.setUTCDate(date.getUTCDate()+Number(days));return date.toISOString().slice(0,10);
}
export function sundayDate(week,year){
  const [m,d]=String(week).split("-")[0].split("/").map(Number);
  const date=new Date(Date.UTC(year,m-1,d,12));
  if(!Number.isFinite(date.getTime()))throw Error("Invalid week.");
  date.setUTCDate(date.getUTCDate()+(7-date.getUTCDay())%7);
  return date.toISOString().slice(0,10);
}
export function expectedNames(data,even,odd){
  if(!data)return [];
  return unique([...(data?.bothGroups?[...even,...odd]:data?.group==="even"?even:odd),...Object.values(data?.jobs||{}).flatMap(j=>j.assigned||[]),...(data?.makeups||[])]);
}
export function reconcileMakeups(input,weeks,jobDefinitions){
  const all=clone(input),wanted={};
  // Legacy manually-entered makeups remain valid. Subsequent runs derive automatic
  // entries only from attendance, so refreshing cannot append duplicates.
  for(const data of Object.values(all)){
    if(!data.makeupVersion){data.manualMakeups=unique(data.makeups);data.makeupVersion=1;}
  }
  weeks.forEach((week,index)=>{
    const data=all[weekKey(week)];if(!data)return;
    for(const record of Object.values(data.attendance||{})){
      if(!["absent","excused"].includes(record.status)||record.makeupRequired===false)continue;
      const next=weeks[index+1];if(!next)continue;
      const wk=weekKey(next),pk=keyOf(record.name);
      wanted[wk]??={};wanted[wk][pk]??={name:record.name,sources:[]};
      wanted[wk][pk].sources.push(week);
    }
  });
  for(const wk of unique([...Object.keys(all),...Object.keys(wanted)])){
    if(!all[wk])all[wk]={group:weeks.findIndex(w=>weekKey(w)===wk)%2===0?"even":"odd",bothGroups:false,jobs:{},makeupVersion:1};
    const data=all[wk];data.jobs??={};data.autoMakeupAssignments??={};
    data.makeupSources=wanted[wk]||{};
    const names=unique([...(data.manualMakeups||[]),...Object.values(data.makeupSources).map(x=>x.name)]);
    // Undo only assignments this process inserted, and only while still pending.
    for(const [pk,added] of Object.entries(data.autoMakeupAssignments)){
      if(names.includes(added.name))continue;
      const job=data.jobs[added.jobId];
      if(job?.status==="pending"){
        job.assigned=(job.assigned||[]).filter(n=>n!==added.name);
        if(added.jobId.startsWith("makeup_")&&!job.assigned.length){
          delete data.jobs[added.jobId];
          data.tempJobs=(data.tempJobs||[]).filter(j=>j.id!==added.jobId);
        }
      }
      delete data.autoMakeupAssignments[pk];
    }
    data.makeups=names;
    for(const name of names){
      if(Object.values(data.jobs).some(j=>(j.assigned||[]).includes(name)))continue;
      const candidates=jobDefinitions.filter(j=>j.id!=="sun_kitchen"&&data.jobs[j.id]?.status==="pending")
        .sort((a,b)=>(data.jobs[a.id].assigned||[]).length-(data.jobs[b.id].assigned||[]).length);
      let id=candidates[0]?.id;
      if(!id){
        id="makeup_"+keyOf(name);
        data.jobs[id]={assigned:[],status:"pending"};
        data.tempJobs=[...(data.tempJobs||[]).filter(j=>j.id!==id),{id,name:"Sunday makeup",desc:"Check in with the house manager for the cleaning area.",people:1}];
      }
      data.jobs[id].assigned=unique([...(data.jobs[id].assigned||[]),name]);
      data.autoMakeupAssignments[keyOf(name)]={name,jobId:id};
    }
  }
  return all;
}
export function setAttendance(input,weeks,jobs,week,names,status,makeupRequired,uid,now){
  if(!weeks.includes(week))throw Error("That week is no longer in the schedule.");
  if(!["present","absent","excused","unmarked"].includes(status))throw Error("Invalid attendance status.");
  const data=clone(input),wk=weekKey(week);
  if(!data[wk])throw Error("Create this Sunday's schedule first.");
  data[wk].attendance??={};
  for(const name of unique(names)){
    if(status==="unmarked")delete data[wk].attendance[keyOf(name)];
    else data[wk].attendance[keyOf(name)]={name,status,makeupRequired:status!=="present"&&makeupRequired,updatedBy:uid,updatedAt:now};
  }
  return reconcileMakeups(data,weeks,jobs);
}
export function approveRequest(input,id,uid,now){
  const root=clone(input),request=root.houseOps?.requests?.[id];
  if(!request||request.status!=="pending")throw Error("This request has already been processed.");
  const weeks=root.config?.weeks||[],jobs=root.sundayConfig?.sundayJobs||[];
  if(request.kind==="swap"){
    if(request.response?.decision!=="accepted"||request.response.name!==request.targetName||request.response.uid===request.requesterUid)throw Error("The other brother must accept first.");
    if(!["weekly","sunday"].includes(request.jobType)||request.fromJob===request.toJob)throw Error("Invalid swap.");
    const wk=weekKey(request.week),rows=request.jobType==="weekly"?root.assignments?.[wk]:root.sundayAssignments?.[wk]?.jobs;
    const from=rows?.[request.fromJob],to=rows?.[request.toJob];
    if(!from||!to||from.status!=="pending"||to.status!=="pending")throw Error("Both jobs must still be pending.");
    if(!(from.assigned||[]).includes(request.requesterName)||!(to.assigned||[]).includes(request.targetName))throw Error("Assignments changed. Reject this request and ask for a new one.");
    if((from.assigned||[]).includes(request.targetName)||(to.assigned||[]).includes(request.requesterName))throw Error("A participant already has both jobs.");
    if(request.jobType==="sunday"&&(request.fromJob==="sun_kitchen"||request.toJob==="sun_kitchen"||[request.fromJob,request.toJob].some(x=>x.startsWith("makeup_"))))throw Error("Kitchen and makeup jobs require direct manager assignment.");
    from.assigned=from.assigned.map(n=>n===request.requesterName?request.targetName:n);
    to.assigned=to.assigned.map(n=>n===request.targetName?request.requesterName:n);
  }else if(request.kind==="absence"){
    addDays(request.start,0);addDays(request.end,0);
    if(request.end<request.start)throw Error("Invalid absence dates.");
    const year=Number((root.config?.semesterName||"").match(/20\d{2}/)?.[0]||new Date(now).getFullYear());
    let affected=0;
    for(const week of weeks){
      const date=sundayDate(week,year),row=root.sundayAssignments?.[weekKey(week)];
      if(date<request.start||date>request.end||!row)continue;
      const names=expectedNames(row,root.sundayConfig?.evenPins||[],root.sundayConfig?.oddPins||[]);
      if(!names.includes(request.requesterName))continue;
      if(row.attendance?.[keyOf(request.requesterName)]?.status==="present")throw Error("Attendance is already marked present. Resolve the attendance record first.");
      root.sundayAssignments=setAttendance(root.sundayAssignments,weeks,jobs,week,[request.requesterName],"excused",request.waiveMakeup!==true,uid,now);
      affected++;
    }
    if(!affected)throw Error("No scheduled Sunday assignments fall within these dates.");
  }else throw Error("Unknown request type.");
  request.status="approved";request.reviewedBy=uid;request.reviewedAt=now;
  return root;
}
export function completeMaintenance(record,uid,now,expectedDue){
  if(!record||record.nextDue!==expectedDue)throw Error("This maintenance item changed. Refresh before completing it.");
  const interval=Number(record.intervalDays);
  if(!Number.isInteger(interval)||interval<1||interval>3660)throw Error("Interval must be 1–3660 days.");
  const next=clone(record);
  next.history??={};next.history[keyOf(record.nextDue)]={due:record.nextDue,completedAt:now,completedBy:uid};
  // Advance from the scheduled due date, skipping missed intervals without drift.
  let date=addDays(record.nextDue,interval);
  while(date<=now.slice(0,10))date=addDays(date,interval);
  next.nextDue=date;return next;
}
