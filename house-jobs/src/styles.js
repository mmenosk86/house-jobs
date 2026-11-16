// App-wide styles. Colors come from the CSS variables defined in BASE_CSS (:root).
export const BASE_CSS=`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,500;0,9..40,700;1,9..40,400&family=Space+Mono:wght@400;700&display=swap');:root{color-scheme:light;--bg:#F6F4EF;--card:#FFFFFF;--field:#F1EEE7;--line:#E4DFD4;--line-strong:#CDC6B8;--ink:#1D222C;--ink-2:#3B4250;--muted:#656C79;--gold:#9C7410;--gold-deep:#7A5A0A;--gold-bg:#F6EBCF;--on-gold:#FFFFFF;--amber:#B45309;--amber-deep:#92400E;--red:#C0262D;--red-bg:#FDECEC;--purple:#6D3FD8;--purple-bg:#EEE7FD;--blue:#1F5FCC;--cyan:#0E7490;--pink:#BE2368;--orange:#C2410C;--green:#15803D;--green-bg:#DCF3E6;--shadow:0 1px 2px rgba(29,34,44,.06),0 4px 14px rgba(29,34,44,.06)}*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:var(--line);border-radius:4px}@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}@keyframes spin{to{transform:rotate(360deg)}}.fu{animation:fadeUp .3s ease both}.ch{transition:transform .15s,box-shadow .15s}.ch:hover{transform:translateY(-2px);box-shadow:0 8px 25px rgba(0,0,0,.3)}select{appearance:none;-webkit-appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center}
.app-shell{max-width:520px}
.job-grid{display:flex;flex-direction:column;gap:8px}
.roster-grid{display:flex;flex-direction:column;gap:6px}
.board-list{display:flex;flex-direction:column;gap:6px}
.manager-grid,.stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.hm-card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px;min-width:0}
.scroll-row{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;scroll-snap-type:x proximity}
.scroll-row>*{scroll-snap-align:start}
.nav-tab{min-width:64px!important}
.proof-modal{position:fixed;inset:0;z-index:200;background:#080512CC;display:flex;align-items:flex-end;justify-content:center;padding:14px}
.proof-sheet{width:min(100%,500px);max-height:92vh;overflow-y:auto;background:var(--card);border:1px solid color-mix(in srgb, var(--gold) 33%, transparent);border-radius:18px 18px 12px 12px;padding:18px;box-shadow:0 -16px 45px #0008}
.header-inner{max-width:100%}
@media(max-width:767px){
  .app-shell{padding-bottom:24px}
  .manager-grid,.stat-grid{grid-template-columns:1fr 1fr}
  .hm-wide{grid-column:1/-1}
  input,textarea,select{font-size:16px!important}
  .manager-login-grid{grid-template-columns:1fr!important}
}
@media(min-width:768px){
  .app-shell{max-width:900px;padding:0 20px}
  .job-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .roster-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .board-list{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .header-inner{max-width:900px;margin:0 auto}
  .proof-modal{align-items:center}
  .proof-sheet{border-radius:18px}
}
@media(min-width:1200px){
  .app-shell{max-width:1100px}
  .job-grid{grid-template-columns:1fr 1fr 1fr}
  .roster-grid{grid-template-columns:1fr 1fr 1fr}
}
`;
export const APP_CSS=`
body{background:var(--bg)}
.app-shell{background:var(--bg)!important;color:var(--ink)!important;max-width:1120px}
.app-shell button,.app-shell input,.app-shell textarea,.app-shell select{font-family:inherit}
.app-shell button{touch-action:manipulation}
.app-shell button:focus-visible,.app-shell input:focus-visible,.app-shell summary:focus-visible{outline:3px solid var(--gold);outline-offset:3px}
.app-shell button:disabled{opacity:.5;cursor:wait}
.app-header{position:sticky;top:0;z-index:50;background:color-mix(in srgb,var(--card) 94%,transparent);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);border-bottom:1px solid var(--line);padding:calc(12px + env(safe-area-inset-top)) 20px 12px}
.hdr-row{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px}
.brand{display:flex;align-items:center;gap:10px}.brand h1{font-family:'Space Mono',monospace;font-size:19px;font-weight:700;color:var(--gold);letter-spacing:-.02em;white-space:nowrap}
.hdr-meta{font-size:12px;color:var(--muted);margin-top:2px}
.ring{width:46px;height:46px;border-radius:50%;display:grid;place-items:center;flex-shrink:0}.ring span{width:38px;height:38px;border-radius:50%;background:var(--card);display:grid;place-items:center;font-size:11px;font-weight:800;color:var(--gold-deep)}
.week-nav{display:grid;grid-template-columns:44px 1fr 44px;gap:8px}
.week-nav button{height:44px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--ink-2);font-size:22px;line-height:1;cursor:pointer}
.week-nav button:disabled{opacity:.35;cursor:default}
.week-nav .week-label{background:var(--field);border-color:transparent;font-size:15px;font-weight:700;color:var(--ink);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px}
.week-label small{font-size:10px;font-weight:600;color:var(--muted);letter-spacing:.02em}
.primary-nav{display:flex;gap:6px;padding:10px 20px;background:var(--bg);border-bottom:1px solid var(--line)}
.primary-nav button{position:relative;flex:1;min-height:48px;border:0;border-radius:12px;background:transparent;color:var(--muted);cursor:pointer;font-weight:600;font-size:13px;display:flex;align-items:center;justify-content:center;gap:8px}
.primary-nav button[aria-current]{background:var(--gold-bg);color:var(--gold-deep)}
.nav-ico{display:grid;place-items:center}
.primary-nav small{background:#a82240;color:white;border-radius:20px;padding:2px 6px;font-size:10px;font-weight:800}
.content{padding:16px 20px calc(96px + env(safe-area-inset-bottom));display:block}
.page-title{font-size:24px;font-weight:800;letter-spacing:-.03em;color:var(--ink);margin:2px 0 14px}
.back-link{background:none;border:0;color:var(--gold-deep);font-weight:700;font-size:14px;padding:6px 0;margin:-4px 0 8px;min-height:36px;cursor:pointer}
.toast{position:sticky;top:132px;z-index:40;margin:10px 20px 0;padding:11px 14px;border-radius:12px;font-size:13px;line-height:1.4;display:flex;align-items:center;justify-content:space-between;gap:10px;background:var(--card);border:1px solid var(--line);color:var(--ink-2);box-shadow:var(--shadow)}
.toast.saved{background:var(--green-bg);border-color:transparent;color:var(--green)}
.toast.error{background:var(--red-bg);border-color:color-mix(in srgb,var(--red) 30%,transparent);color:var(--red)}
.toast button{background:none;border:0;color:inherit;font-size:20px;min-width:36px;min-height:36px;cursor:pointer}
.job-grid>div,.roster-grid>div,.hm-card,.task-card,.house-links button{box-shadow:var(--shadow)}
.focus-hero{border:1px solid var(--line-strong);background:radial-gradient(ellipse at top right,var(--gold-bg),transparent 65%),var(--card);border-radius:22px;padding:26px;margin-bottom:20px}
.eyebrow{font-size:10px;letter-spacing:.14em;color:var(--gold);font-weight:800}
.focus-hero h2{font-size:clamp(25px,5vw,36px);line-height:1.14;letter-spacing:-.04em;margin:12px 0}
.focus-hero p,.manager-brief p{font-size:13px;line-height:1.6;color:var(--muted)}
.progress-track{height:5px;background:var(--line);border-radius:10px;margin:22px 0;overflow:hidden}
.progress-track>div{height:100%;background:var(--gold)}
.focus-actions{display:flex;gap:10px;flex-wrap:wrap}
.focus-actions button,.manager-brief button{background:var(--field);color:var(--ink);border:1px solid var(--line-strong);border-radius:10px;padding:11px 16px;cursor:pointer;min-height:44px}
.task-toolbar input{width:100%;background:var(--field);color:var(--ink);border:1px solid var(--line-strong);border-radius:12px;padding:14px;font-size:16px;margin-bottom:12px}
.filter-pills{display:flex;gap:6px;overflow:auto;margin:10px 0 18px;padding-bottom:3px}
.filter-pills button{white-space:nowrap;border:1px solid var(--line-strong);background:var(--card);color:var(--muted);border-radius:30px;min-height:44px;padding:10px 15px;cursor:pointer}
.filter-pills button[aria-pressed=true]{background:var(--ink);color:var(--card);border-color:var(--ink)}
.task-card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:20px;margin-bottom:12px}
.task-top{display:flex;align-items:center;justify-content:space-between;gap:8px}
.task-card h3{font-size:20px;letter-spacing:-.02em;margin:14px 0 8px}
.task-status{font-size:11px;padding:5px 8px;background:var(--field);color:var(--ink-2);border-radius:6px;white-space:nowrap}
.task-status.verified{background:var(--green-bg);color:var(--green)}.task-status.done{background:var(--purple-bg);color:var(--purple)}
.quiet{color:var(--muted);font-size:12px;line-height:1.6;margin:6px 0}
.late,.return-note{color:var(--red);font-size:12px;line-height:1.5}
.return-note{background:var(--red-bg);padding:10px;border-radius:8px;margin:10px 0}
.task-card details{margin:14px 0;border-top:1px solid var(--line);padding-top:12px}
.task-card summary{cursor:pointer;font-size:13px;color:var(--gold);min-height:36px}
.check-row{display:flex;align-items:flex-start;gap:12px;padding:10px 0;color:var(--ink);font-size:14px;line-height:1.5}
.check-row input{width:21px;height:21px;flex-shrink:0;accent-color:var(--gold)}
.primary-action{width:100%;border:0;background:var(--gold);color:var(--on-gold);border-radius:10px;padding:14px;font-weight:800;cursor:pointer;margin-top:14px;min-height:48px}
.empty-card{border:1px dashed var(--line-strong);border-radius:16px;padding:24px;text-align:center;color:var(--muted);font-size:14px;line-height:1.6;margin-bottom:16px}
.house-links{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.house-links button{background:var(--card);border:1px solid var(--line);border-radius:14px;text-align:left;padding:22px;color:var(--ink);cursor:pointer;min-width:0;display:flex;flex-direction:column;justify-content:flex-start}
.house-links strong{display:block;font-size:16px}.house-links span{display:block;color:var(--muted);font-size:12px;margin-top:8px;line-height:1.5}
.section-title{font-size:12px;letter-spacing:.09em;color:var(--muted);margin:22px 0 12px}
.activity-row{display:flex;gap:12px;align-items:center;border-bottom:1px solid var(--field);padding:15px 0;font-size:14px}
.activity-row p{font-size:12px;color:var(--muted);margin-top:5px;line-height:1.5}.activity-dot{width:7px;height:7px;border-radius:50%;background:var(--gold);flex-shrink:0}
.manager-brief{background:var(--card);border:1px solid var(--line-strong);border-radius:16px;padding:22px;margin:16px 0}.manager-brief h3{font-size:23px;letter-spacing:-.03em;margin:8px 0}.manager-brief button{margin-top:12px}
.hm-card{background:var(--card)!important;border-color:var(--line)!important}
.quick-links{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:6px}.quick-links button{min-height:46px}@media(max-width:767px){.quick-links{grid-template-columns:1fr 1fr}}
.install-banner{display:flex;align-items:center;gap:12px;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:12px 10px 12px 12px;margin-bottom:14px;box-shadow:var(--shadow)}.install-banner img{border-radius:11px;flex-shrink:0}.install-banner strong{font-size:14px;color:var(--ink)}.install-banner p{font-size:12px;color:var(--muted);margin-top:2px;line-height:1.4}.install-go{background:var(--gold);color:var(--on-gold);border:0;border-radius:10px;padding:10px 14px;font-weight:800;min-height:40px;cursor:pointer}.install-x{background:none;border:0;color:var(--muted);font-size:22px;min-width:36px;min-height:40px;cursor:pointer}
.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)}
@media(min-width:768px){.focus-workspace{max-width:760px;margin:auto}.app-shell{padding:0 24px}.primary-nav{position:sticky;top:129px;z-index:45}.toast{top:200px}.content{padding-bottom:60px}}
@media(max-width:767px){
.app-header{padding:calc(10px + env(safe-area-inset-top)) 16px 10px}.hdr-row{margin-bottom:10px}
.primary-nav{position:fixed;bottom:0;left:0;right:0;z-index:100;padding:6px 6px calc(6px + env(safe-area-inset-bottom));gap:2px;background:color-mix(in srgb,var(--card) 96%,transparent);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);border:0;border-top:1px solid var(--line)}
.primary-nav button{flex-direction:column;gap:2px;font-size:10.5px;min-height:52px;padding:4px 2px;border-radius:10px}
.primary-nav button[aria-current]{background:transparent}
.primary-nav button .nav-ico{width:48px;height:28px;border-radius:14px}
.primary-nav button[aria-current] .nav-ico{background:var(--gold-bg)}
.primary-nav small{position:absolute;right:calc(50% - 22px);top:0;font-size:9px}
.content{padding:14px 16px calc(84px + env(safe-area-inset-bottom))}
.toast{position:fixed;left:12px;right:12px;top:auto;bottom:calc(72px + env(safe-area-inset-bottom));margin:0;z-index:110}
.house-links{grid-template-columns:1fr 1fr;gap:10px}.house-links button{padding:16px 14px}.house-links strong{font-size:15px}
.focus-hero{padding:20px;border-radius:18px}.focus-hero h2{font-size:24px}.task-card{padding:17px}
.task-top .eyebrow{letter-spacing:.06em}
}
@media(prefers-reduced-motion:reduce){.fu{animation:none!important}*{scroll-behavior:auto!important}}
`;
