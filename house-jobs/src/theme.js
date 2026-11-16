// Color helpers and the seasonal theme.
// Translucent version of any color (hex or var(--x)), e.g. tint("var(--gold)",10) for a light gold wash.
export const tint=(color,pct)=>`color-mix(in srgb, ${color} ${pct}%, transparent)`;

// ─── HOLIDAY THEME ───
// Christmas look: red & pine accents, light snowfall, candy-cane header stripe. Set to false to go back to the normal theme.
export const HOLIDAY_THEME=true;
export const HOLIDAY_CSS=`
:root{--bg:#F8F4EE;--field:#F2ECE4;--line:#E8DDD2;--line-strong:#D3C4B4;--gold:#B3202A;--gold-deep:#8E1822;--gold-bg:#FBE4E3;--on-gold:#FFFFFF;--pine:#1E6B47;--pine-bg:#E2F1E8}
body{background:radial-gradient(circle at 15% 0,#FFFFFF 0,transparent 40%),var(--bg)}
.app-header{border-bottom:0}
.app-header::after{content:"";position:absolute;left:0;right:0;bottom:-5px;height:5px;background:repeating-linear-gradient(135deg,#C8232C 0 10px,#FFFFFF 10px 20px);opacity:.9}
.brand h1::after{content:" 🎄";font-family:'DM Sans',sans-serif}
.ring{background:conic-gradient(var(--pine) var(--pct),var(--line) var(--pct))!important}
.eyebrow,.task-card summary{color:var(--pine)}
.progress-track>div{background:linear-gradient(90deg,var(--gold),var(--pine))}
.focus-hero{background:radial-gradient(ellipse at top right,var(--pine-bg),transparent 60%),radial-gradient(ellipse at bottom left,var(--gold-bg),transparent 55%),var(--card)}
.house-links button{border-top:3px solid var(--pine)}.house-links button:nth-child(even){border-top-color:var(--gold)}
.snow{position:fixed;inset:0;pointer-events:none;z-index:30;overflow:hidden}
.snow::before,.snow::after{content:"";position:absolute;left:0;right:0;top:-100vh;height:200vh;
  background-image:radial-gradient(3px 3px at 20px 30px,#BFD0E4,transparent),radial-gradient(2px 2px at 90px 120px,#BFD0E4,transparent),radial-gradient(3px 3px at 160px 60px,#BFD0E4,transparent),radial-gradient(2px 2px at 230px 170px,#BFD0E4,transparent),radial-gradient(2.5px 2.5px at 300px 90px,#BFD0E4,transparent);
  background-size:320px 220px;filter:drop-shadow(0 0 1px rgba(90,120,160,.5));animation:snowfall 22s linear infinite;opacity:.85}
.snow::after{background-size:260px 300px;animation-duration:34s;opacity:.6;transform:translateX(40px)}
@keyframes snowfall{to{transform:translateY(100vh)}}
.lights{position:relative;display:flex;height:24px;margin:-8px -20px 6px;overflow:hidden;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='12'%3E%3Cpath d='M0 2 Q12 11 24 2' fill='none' stroke='%232F4A3A' stroke-width='1.6'/%3E%3C/svg%3E") repeat-x 0 0}
.lights span{flex:0 0 24px;position:relative}
.lights span::before{content:"";position:absolute;left:10px;top:5px;width:4px;height:4px;border-radius:1px;background:#2F4A3A}
.lights span::after{content:"";position:absolute;left:8px;top:8px;width:8px;height:12px;border-radius:50% 50% 50% 50%/40% 40% 60% 60%;background:var(--bulb);box-shadow:0 0 10px 3px var(--bulb);animation:twinkle var(--dur,2s) ease-in-out var(--delay,0s) infinite}
.lights span:nth-child(4n+1){--bulb:#E53935}.lights span:nth-child(4n+2){--bulb:#2EA55E}.lights span:nth-child(4n+3){--bulb:#F4B400}.lights span:nth-child(4n+4){--bulb:#2F7DE1}
@keyframes twinkle{0%,100%{opacity:1;filter:brightness(1.25);box-shadow:0 0 12px 4px var(--bulb)}45%{opacity:.9}55%{opacity:.2;filter:brightness(.6);box-shadow:0 0 0 0 transparent}70%{opacity:.85;filter:brightness(1.1)}}
@media(max-width:767px){.lights{margin:-6px -16px 6px}}
@media(prefers-reduced-motion:reduce){.lights span::after{animation-duration:calc(var(--dur,2s) * 2)}}
/* Snow falls for everyone (it was still on devices with reduced animations); it drifts slowly. */
`;
