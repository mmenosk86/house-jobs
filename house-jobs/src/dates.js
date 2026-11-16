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
export function detectCurrentWeek(weeksList,today=new Date()){
  const range=(label,year)=>{
    const parts=String(label).split("-");if(parts.length!==2)return null;
    const parseDate=(s,y)=>{const p=s.trim().split("/");if(p.length!==2)return null;const d=new Date(y,parseInt(p[0])-1,parseInt(p[1]));return Number.isNaN(d.getTime())?null:d;};
    const start=parseDate(parts[0],year);let end=parseDate(parts[1],year);
    if(!start||!end)return null;
    if(end<start)end=parseDate(parts[1],year+1);
    end.setHours(23,59,59);
    return[start,end];
  };
  let lastPast=-1;
  for(let i=0;i<weeksList.length;i++){
    for(const y of [today.getFullYear(),today.getFullYear()-1]){
      const r=range(weeksList[i],y);if(!r)continue;
      if(today>=r[0]&&today<=r[1])return i;
      if(y===today.getFullYear()&&r[1]<today)lastPast=i;
    }
  }
  return lastPast>=0?lastPast:0;
}
