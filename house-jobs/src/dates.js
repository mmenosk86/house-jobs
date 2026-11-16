// Week labels and due dates.
export function parseWeekStart(label,year=new Date().getFullYear()){
  const first=String(label||"").split("-")[0]?.trim().split("/");
  if(first?.length!==2)return null;
  const d=new Date(year,Number(first[0])-1,Number(first[1]),12);
  return Number.isNaN(d.getTime())?null:d;
}
export function getDueDate(label,type,settings){
  const start=parseWeekStart(label); if(!start)return null;
  const targetDay=type==="sunday"?Number(settings.sundayDueDay):Number(settings.weeklyDueDay);
  const time=type==="sunday"?settings.sundayDueTime:settings.weeklyDueTime;
  const due=new Date(start);
  due.setDate(start.getDate()+((targetDay-start.getDay()+7)%7));
  const[h,m]=String(time||"18:00").split(":").map(Number);
  due.setHours(h||0,m||0,0,0);
  return due;
}
export function formatDue(date){
  if(!date)return"";
  return date.toLocaleString([],{weekday:"short",hour:"numeric",minute:"2-digit"});
}
export function generateWeekLabels(startValue,endValue,excludedText=""){
  const start=new Date(startValue+"T12:00:00"),end=new Date(endValue+"T12:00:00");
  if(Number.isNaN(start.getTime())||Number.isNaN(end.getTime())||start>end)return[];
  const excluded=new Set(excludedText.split(",").map(x=>x.trim()).filter(Boolean));
  const labels=[]; const cursor=new Date(start);
  while(cursor<=end){
    const weekEnd=new Date(cursor);weekEnd.setDate(cursor.getDate()+6);
    const days=Array.from({length:7},(_,i)=>{const d=new Date(cursor);d.setDate(cursor.getDate()+i);return d.toISOString().slice(0,10);});
    if(!days.some(d=>excluded.has(d))){
      labels.push(`${cursor.getMonth()+1}/${cursor.getDate()}-${weekEnd.getMonth()+1}/${weekEnd.getDate()}`);
    }
    cursor.setDate(cursor.getDate()+7);
  }
  return labels;
}

// Week labels have no year. Handles weeks that cross New Year (12/29-1/4), and after the last
// listed week, or during an unlisted break week, stays on the most recent week instead of jumping to week 1.
// Labels are read in order, moving to the next year when the month goes backwards (12/29-1/4). The starting
// year is whichever puts the semester closest to today, so a spring schedule set up in November counts as
// upcoming (week 1), not as last spring (last week).
export function detectCurrentWeek(weeksList,today=new Date()){
  const md=s=>{const p=String(s).trim().split("/").map(Number);return p.length===2&&p.every(Number.isFinite)?p:null;};
  const datesFor=baseYear=>{
    let year=baseYear,prevMonth=0;
    return weeksList.map(label=>{
      const[a,b]=String(label).split("-").map(md);if(!a||!b)return null;
      if(a[0]<prevMonth)year++;
      const start=new Date(year,a[0]-1,a[1]);
      const endYear=b[0]<a[0]?year+1:year;
      const end=new Date(endYear,b[0]-1,b[1],23,59,59);
      prevMonth=b[0]<a[0]?b[0]:a[0];if(endYear>year)year=endYear;
      return[start,end];
    });
  };
  let best=null;
  for(const y of [today.getFullYear()-1,today.getFullYear(),today.getFullYear()+1]){
    const ranges=datesFor(y).filter(Boolean);if(!ranges.length)continue;
    const first=ranges[0][0],last=ranges[ranges.length-1][1];
    const distance=today<first?first-today:today>last?today-last:0;
    if(!best||distance<best.distance)best={distance,ranges:datesFor(y)};
  }
  if(!best)return 0;
  let lastPast=-1;
  for(let i=0;i<best.ranges.length;i++){
    const r=best.ranges[i];if(!r)continue;
    if(today>=r[0]&&today<=r[1])return i;
    if(r[1]<today)lastPast=i;
  }
  return lastPast>=0?lastPast:0; // before the semester → week 1; break or after it → most recent week
}
