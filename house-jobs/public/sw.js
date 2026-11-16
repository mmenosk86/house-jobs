// Service worker for the installed app. It deliberately does not cache pages, so brothers always see the
// latest schedule; it exists so the app can be installed and can show reminder notifications.
self.addEventListener("install",()=>self.skipWaiting());
self.addEventListener("activate",event=>event.waitUntil(self.clients.claim()));
self.addEventListener("fetch",()=>{}); // network as usual

// Reminder notifications (sent as data-only Firebase Cloud Messaging pushes: {title, body, url}).
self.addEventListener("push",event=>{
  let msg={};
  try{const raw=event.data?event.data.json():{};msg=raw.data||raw.notification||raw;}catch{msg={body:event.data?.text()};}
  event.waitUntil(self.registration.showNotification(msg.title||"ΣΦΕ House",{
    body:msg.body||"",icon:"/icons/icon-192.png",badge:"/icons/icon-192.png",tag:msg.tag||undefined,data:{url:msg.url||"/"},
  }));
});
self.addEventListener("notificationclick",event=>{
  event.notification.close();
  const url=event.notification.data?.url||"/";
  event.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(list=>{
    const open=list.find(c=>"focus" in c);
    return open?open.focus().then(c=>c.navigate?.(url)):self.clients.openWindow(url);
  }));
});
