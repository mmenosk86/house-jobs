// Firebase connection, database helpers, and the on-device fallback store.
// ▼▼▼ PASTE YOUR FIREBASE CONFIG HERE ▼▼▼
export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAUWn9oU5uFAkckIWMsYMBHmvffxnYEZ_k",
  authDomain: "house-jobs-19e96.firebaseapp.com",
  databaseURL: "https://house-jobs-19e96-default-rtdb.firebaseio.com",
  projectId: "house-jobs-19e96",
  messagingSenderId: "568801873290",
  appId: "1:568801873290:web:7db8c4c0910ceeb29f0c73"
};
// ▲▲▲ PASTE YOUR FIREBASE CONFIG HERE ▲▲▲

// Local fallback used when Firebase is unavailable.
export async function localStoreGet(key){try{const value=localStorage.getItem(key);return value===null?null:{value};}catch{return null;}}
export async function localStoreSet(key,value){
  try{localStorage.setItem(key,value);}
  catch(error){throw new Error(`This device could not save ${key}. ${error?.message||"Storage is unavailable."}`);}
}

// Firebase key sanitization
export function sanitizeKey(k){return k.replace(/[.#$/\[\]]/g,"_");}
export function sanitizeObjKeys(o){const r={};Object.entries(o).forEach(([k,v])=>{r[sanitizeKey(k)]=v;});return r;}
export function desanitizeObjKeys(o,keys){const m={};keys.forEach(k=>{m[sanitizeKey(k)]=k;});const r={};Object.entries(o).forEach(([sk,v])=>{r[m[sk]||sk]=v;});return r;}

// Firebase
export let db=null,auth=null,firebaseReady=false,fbApp=null;
export async function initFirebase(){
  if(firebaseReady)return true;
  if(FIREBASE_CONFIG.apiKey==="YOUR_API_KEY")return false;
  try{
    const{initializeApp}=await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js");
    const{getDatabase}=await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js");
    const{getAuth,signInAnonymously}=await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js");
    const app=initializeApp(FIREBASE_CONFIG);fbApp=app;
    db=getDatabase(app);auth=getAuth(app);
    if(!auth.currentUser)await signInAnonymously(auth);
    firebaseReady=true;return true;
  }catch(e){console.error("Firebase initialization failed:",e);return false;}
}
export async function firebaseWriteWithAuthRetry(operation){
  try{return await operation();}
  catch(error){
    const denied=String(error?.code||error?.message||"").toLowerCase().includes("permission");
    if(!denied||!auth?.currentUser)throw error;
    await auth.currentUser.getIdToken(true);
    return operation();
  }
}
export async function fbSet(p,d){if(!firebaseReady)return;const{ref,set}=await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js");return firebaseWriteWithAuthRetry(()=>set(p?ref(db,p):ref(db),d));}
export async function fbUpdate(p,d){if(!firebaseReady)return;const{ref,update}=await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js");return firebaseWriteWithAuthRetry(()=>update(p?ref(db,p):ref(db),d));}
export async function fbTransaction(p,updater){if(!firebaseReady)return null;const{ref,runTransaction}=await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js");return firebaseWriteWithAuthRetry(()=>runTransaction(p?ref(db,p):ref(db),updater));}
export async function fbGet(p){if(!firebaseReady)return null;const{ref,get}=await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js");const s=await get(p?ref(db,p):ref(db));return s.exists()?s.val():null;}
export async function fbOnValue(p,cb,onError){if(!firebaseReady)return()=>{};const{ref,onValue}=await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js");return onValue(p?ref(db,p):ref(db),s=>{cb(s.exists()?s.val():null);},onError);}
export const OPS_API={get:fbGet,set:fbSet,update:fbUpdate,transaction:fbTransaction,subscribe:fbOnValue};
export async function fbOnAuth(cb){if(!auth)return()=>{};const{onAuthStateChanged}=await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js");return onAuthStateChanged(auth,cb);}
export async function fbWriteUser(){
  if(!firebaseReady||!auth)throw new Error("Firebase is not connected.");
  if(!auth.currentUser){
    const{signInAnonymously}=await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js");
    await signInAnonymously(auth);
  }
  if(!auth.currentUser)throw new Error("Firebase sign-in did not finish.");
  return auth.currentUser;
}
export function completionErrorText(error){
  const code=String(error?.code||"").toLowerCase(),message=String(error?.message||"");
  if(code.includes("permission")||message.toLowerCase().includes("permission_denied"))return"Firebase rejected this submission. Refresh the app and try once more. If it still fails, send the manager error code: permission-denied.";
  if(code.includes("network")||code.includes("unavailable")||message.toLowerCase().includes("network"))return"The app could not reach Firebase. Check your connection and try again.";
  if(message.startsWith("This job is already"))return message;
  const detail=(message||String(error||"")).slice(0,180);
  return`Could not submit this job${code?` (${code})`:""}.${detail?` ${detail}`:" Refresh and try again."}`;
}

// ─── Job reminders (push notifications) ───
// Public "Web Push certificate" key from Firebase console → Project settings → Cloud Messaging.
// Reminders stay hidden in the app until this is filled in.
export const VAPID_KEY="BGGX15PEUStrKmR41vqnBGtGSowio6GVBfCu3ummC8giFc1R72OWEMNCJe-_60AFVb-5-nTw0-HYBXUAvJWnmZ4";
const MESSAGING="https://www.gstatic.com/firebasejs/11.8.1/firebase-messaging.js";
// "unsupported" (browser can't), "install" (iPhone: needs the home-screen app), "denied", "default" (not asked), "granted"
export function pushSupport(){
  if(typeof window==="undefined")return"unsupported";
  const ios=/iphone|ipad|ipod/i.test(navigator.userAgent),standalone=window.matchMedia?.("(display-mode: standalone)").matches||navigator.standalone;
  if(!("serviceWorker" in navigator)||!("Notification" in window)||!("PushManager" in window))return ios&&!standalone?"install":"unsupported";
  return Notification.permission;
}
// Ask permission, subscribe this device and save it under the brother's name so the reminder script can find it.
export async function enablePush(name){
  if(!VAPID_KEY)throw new Error("Reminders aren't set up yet.");
  if(!firebaseReady||!auth?.currentUser)throw new Error("Connect to the internet and try again.");
  const permission=await Notification.requestPermission();
  if(permission!=="granted")throw new Error(permission==="denied"?"Notifications are blocked for this site. Allow them in your browser or phone settings.":"Notifications weren't allowed.");
  const{getMessaging,getToken,isSupported}=await import(MESSAGING);
  if(!(await isSupported()))throw new Error("This browser can't receive reminders.");
  const registration=await navigator.serviceWorker.ready;
  const token=await getToken(getMessaging(fbApp),{vapidKey:VAPID_KEY,serviceWorkerRegistration:registration});
  if(!token)throw new Error("Couldn't turn on reminders. Try again.");
  await fbSet(`pushTokens/${auth.currentUser.uid}`,{name,token,updatedAt:new Date().toISOString(),device:navigator.userAgent.slice(0,120)});
  return token;
}
export async function disablePush(){
  try{const{getMessaging,deleteToken}=await import(MESSAGING);await deleteToken(getMessaging(fbApp));}catch{}
  if(auth?.currentUser)await fbSet(`pushTokens/${auth.currentUser.uid}`,null);
}