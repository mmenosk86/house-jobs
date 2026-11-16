// Sends house job reminders to brothers who turned them on in the app.
// Run by .github/workflows/reminders.yml:
//   --kind=weekly  on the weekly due day: "Your Kitchen is due today at 6:00 PM"
//   --kind=sunday  on Saturday evening:   "Sunday cleaning tomorrow: you're on Basement"
//   --kind=test    with --only="Name": a test notification to that brother's devices
// Options: --dry (print instead of send), --only="Name" (just one brother, for testing), --force (ignore the day check)
// Needs FIREBASE_SERVICE_ACCOUNT (the service account JSON) in the environment.
import admin from "firebase-admin";
import {detectCurrentWeek} from "../house-jobs/src/dates.js";
import {buildReminders,key} from "./reminders-core.mjs";

const DATABASE_URL="https://house-jobs-19e96-default-rtdb.firebaseio.com";
const TZ="America/Detroit";

const args=Object.fromEntries(process.argv.slice(2).map(a=>{const[k,...v]=a.replace(/^--/,"").split("=");return[k,v.length?v.join("="):"true"];}));
const kind=args.kind,dry=args.dry==="true";
if(!["weekly","sunday","test"].includes(kind)){console.error("Use --kind=weekly, --kind=sunday or --kind=test");process.exit(1);}
if(!process.env.FIREBASE_SERVICE_ACCOUNT){console.error("FIREBASE_SERVICE_ACCOUNT is not set.");process.exit(1);}

// "Today" in Houghton, as a local date at noon (the runner itself is on UTC).
const p=Object.fromEntries(new Intl.DateTimeFormat("en-US",{timeZone:TZ,year:"numeric",month:"numeric",day:"numeric",weekday:"short"}).formatToParts(new Date()).map(x=>[x.type,x.value]));
const today=new Date(Number(p.year),Number(p.month)-1,Number(p.day),12);
const weekday=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].indexOf(p.weekday);

admin.initializeApp({credential:admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),databaseURL:DATABASE_URL});
const db=admin.database();
const read=async path=>(await db.ref(path).get()).val();

const [config,settings,tokens,sundayConfig]=await Promise.all([read("config"),read("houseSettings"),read("pushTokens"),read("sundayConfig")]);
const weeks=config?.weeks||[];
const week=weeks[detectCurrentWeek(weeks,today)];
if(!week){console.log("No weeks on the schedule; nothing to send.");process.exit(0);}
const [rows,sunday]=await Promise.all([kind==="weekly"?read(`assignments/${key(week)}`):null,kind==="sunday"?read(`sundayAssignments/${key(week)}`):null]);

const result=buildReminders({kind,week,weekday,force:args.force==="true",only:args.only,settings,config,rows,sunday,sundayConfig,tokens});
if(result.skip){console.log(result.skip+" Nothing to send.");process.exit(0);}

let sent=0;const stale=[];
for(const m of result.messages){
  if(dry){console.log(`[dry run] ${m.name}: ${m.body}`);sent++;continue;}
  try{
    await admin.messaging().send({token:m.token,data:{title:m.title,body:m.body,url:"/",tag:m.tag},webpush:{headers:{Urgency:"high",TTL:"43200"}}});
    sent++;console.log(`Sent to ${m.name}: ${m.body}`);
  }catch(e){
    const code=e?.errorInfo?.code||e?.code||"";
    console.warn(`Couldn't reach ${m.name} (${code||"error"}): ${e?.message||e}`);
    if(/registration-token-not-registered|invalid-registration-token|invalid-argument/.test(code))stale.push(m.uid);
  }
}
// Forget devices that uninstalled the app or turned notifications off.
if(!dry)for(const uid of stale)await db.ref(`pushTokens/${uid}`).remove();
console.log(`${kind} reminders for ${week}: ${sent} ${dry?"would be ":""}sent, ${stale.length} stale devices removed.`);
process.exit(0);
