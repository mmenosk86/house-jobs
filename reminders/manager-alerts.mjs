// Alerts managers about anything new that needs them: submitted jobs, absence/swap requests, issues, supplies.
// Run every ~15 minutes by .github/workflows/manager-alerts.yml. Options: --dry (print, send nothing, don't advance).
// Needs FIREBASE_SERVICE_ACCOUNT in the environment.
import admin from "firebase-admin";
import {buildManagerAlert} from "./reminders-core.mjs";

const DATABASE_URL="https://house-jobs-19e96-default-rtdb.firebaseio.com";
const dry=process.argv.includes("--dry");
if(!process.env.FIREBASE_SERVICE_ACCOUNT){console.error("FIREBASE_SERVICE_ACCOUNT is not set.");process.exit(1);}

admin.initializeApp({credential:admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),databaseURL:DATABASE_URL});
const db=admin.database();
const read=async path=>(await db.ref(path).get()).val();

const tokens=await read("managerTokens");
if(!tokens){console.log("No manager has turned on alerts; nothing to do.");process.exit(0);}
const [config,assignments,sundayAssignments,sundayConfig,weeklyProjects,houseOps,houseIssues,state]=await Promise.all(
  ["config","assignments","sundayAssignments","sundayConfig","weeklyProjects","houseOps","houseIssues","managerAlerts/state"].map(read));

const {message,state:next,count}=buildManagerAlert({config,assignments,sundayAssignments,sundayConfig,weeklyProjects,houseOps,houseIssues},state);
if(!state?.cursor)console.log("First run: starting the clock now (older items won't be sent).");

let sent=0;const stale=[];
if(message){
  for(const [uid,t] of Object.entries(tokens)){
    if(!t?.token)continue;
    if(dry){console.log(`[dry run] to ${t.label||uid}: ${message.title}\n${message.body}`);sent++;continue;}
    try{
      await admin.messaging().send({token:t.token,data:{title:message.title,body:message.body,url:message.url,tag:message.tag},webpush:{headers:{Urgency:"high",TTL:"21600"}}});
      sent++;
    }catch(e){
      const code=e?.errorInfo?.code||e?.code||"";
      console.warn(`Couldn't reach ${t.label||uid} (${code||"error"}): ${e?.message||e}`);
      if(/registration-token-not-registered|invalid-registration-token/.test(code))stale.push(uid);
    }
  }
}
if(!dry){
  await db.ref("managerAlerts/state").set(next);
  for(const uid of stale)await db.ref(`managerTokens/${uid}`).remove();
}
console.log(message?`${count} new item(s); alert ${dry?"would go":"sent"} to ${sent} device(s).`:"Nothing new.");
process.exit(0);
