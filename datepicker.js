/* DZ-Expertise date picker: one styled calendar for every <input type="date"> on the page
   (admin, expert and org dashboards), in place of the browser's own picker, which cannot be styled.
   The input stays a real date field (value "2026-11-15", min, max, form checks); this only changes how a date is picked.
   - opens on click, Enter, Space, Alt+ArrowDown or ArrowDown; Escape or a click outside closes it
   - arrow keys move by day / week, PageUp / PageDown by month, Home / End to the start / end of the week
   - the month-and-year title opens a year grid, then the 12 months, to jump to any year quickly
   - "Today" and "Clear"; days outside min / max are disabled
   - month and weekday names follow the page language (<html lang>: en, fr, ar) and direction (RTL)
   - colours come from the design-system tokens, so light and dark themes both work
   The page's own dateUI() still shows the picked value as "15 Nov 2026" over the field. */
(function(){
'use strict';
var LOC={en:'en-GB',fr:'fr-FR',ar:'ar-DZ'},FIRST={en:1,fr:1,ar:6};
var TX={en:{ph:'Select a date',today:'Today',clear:'Clear',prev:'Previous month',next:'Next month',dlg:'Choose a date',pickY:'Choose the year and month',prevY:'Previous year',nextY:'Next year',prevYs:'Previous years',nextYs:'Next years'},
  fr:{ph:'Choisir une date',today:'Aujourd’hui',clear:'Effacer',prev:'Mois précédent',next:'Mois suivant',dlg:'Choisir une date',pickY:'Choisir l’année et le mois',prevY:'Année précédente',nextY:'Année suivante',prevYs:'Années précédentes',nextYs:'Années suivantes'},
  ar:{ph:'اختر تاريخًا',today:'اليوم',clear:'مسح',prev:'الشهر السابق',next:'الشهر التالي',dlg:'اختر تاريخًا',pickY:'اختر السنة والشهر',prevY:'السنة السابقة',nextY:'السنة التالية',prevYs:'السنوات السابقة',nextYs:'السنوات التالية'}};
function lang(){var l=(document.documentElement.lang||'en').slice(0,2);return TX[l]?l:'en';}
function t(k){return TX[lang()][k];}

var css=
/* the field: native text and icon hidden, our calendar icon and placeholder instead */
'input[type=date]{position:relative;cursor:pointer}'+
'input[type=date]::-webkit-calendar-picker-indicator{display:none}'+
'input[type=date]::-webkit-datetime-edit{opacity:0}'+
'.dw>.dv{z-index:1}'+
'.dw:not(.has)>.dv::before{content:var(--dp-ph,"Select a date");color:var(--text-muted)}'+
'.dw::after{content:"";position:absolute;inset-inline-end:13px;top:50%;width:18px;height:18px;margin-top:-9px;pointer-events:none;background:var(--text-secondary);'+
  '-webkit-mask:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27%3E%3Cg fill=%27none%27 stroke=%27black%27 stroke-width=%271.7%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3E%3Crect x=%273.5%27 y=%275%27 width=%2717%27 height=%2715.5%27 rx=%272%27/%3E%3Cpath d=%27M3.5 10h17M8 3v4M16 3v4%27/%3E%3C/g%3E%3C/svg%3E") center/contain no-repeat;'+
  'mask:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27%3E%3Cg fill=%27none%27 stroke=%27black%27 stroke-width=%271.7%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3E%3Crect x=%273.5%27 y=%275%27 width=%2717%27 height=%2715.5%27 rx=%272%27/%3E%3Cpath d=%27M3.5 10h17M8 3v4M16 3v4%27/%3E%3C/g%3E%3C/svg%3E") center/contain no-repeat}'+
'.dw:focus-within::after,.dw.dp-on::after{background:var(--text-brand)}'+
/* the calendar */
'.dp{position:fixed;z-index:1000;width:304px;padding:0;margin:0;border:1px solid var(--border);border-radius:16px;background:var(--bg-surface);color:var(--text-primary);box-shadow:0 22px 48px -18px rgba(40,1,31,.45);font:400 14px/1.2 var(--sans);overflow:hidden;animation:dpIn .14s ease-out}'+
':root[lang="ar"] .dp{font-family:var(--arabic,var(--sans))}'+
'@keyframes dpIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}'+
'@media (prefers-reduced-motion:reduce){.dp{animation:none}}'+
'.dp-h{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 10px 10px 16px;background:var(--accent-lavender);color:var(--text-brand)}'+
':root[dir="rtl"] .dp-h{padding:10px 16px 10px 10px}'+
'.dp-t{display:inline-flex;align-items:center;gap:6px;min-height:34px;padding:0 10px;margin-inline-start:-10px;border:0;border-radius:10px;background:none;color:var(--text-brand);font:600 15px/22px var(--sans);text-transform:capitalize;cursor:pointer}'+
':root[lang="ar"] .dp-t{font-family:var(--arabic,var(--sans))}'+
'.dp-t:hover{background:rgba(255,255,255,.5)}:root[data-theme="dark"] .dp-t:hover{background:rgba(255,255,255,.08)}'+
'.dp-t svg{transition:transform .15s}.dp-t[aria-expanded="true"] svg{transform:rotate(180deg)}'+
'.dp-t:focus-visible{outline:2px solid var(--text-brand);outline-offset:1px}'+
'.dp-g.ym{grid-template-columns:repeat(3,1fr);gap:6px;padding:12px}'+
'.dp-g.ym button{height:46px;border-radius:12px;font-size:14px;text-transform:capitalize}'+
':root[lang="ar"] .dp-g.ym button{font-family:var(--arabic,var(--sans))}'+
'.dp-nav{display:flex;gap:2px}'+
'.dp-nav button{display:grid;place-items:center;width:34px;height:34px;border:0;border-radius:10px;background:none;color:var(--text-brand);cursor:pointer}'+
'.dp-nav button:hover{background:rgba(255,255,255,.5)}:root[data-theme="dark"] .dp-nav button:hover{background:rgba(255,255,255,.08)}'+
'.dp-nav button:disabled{opacity:.35;cursor:default;background:none}'+
':root[dir="rtl"] .dp-nav svg{transform:scaleX(-1)}'+
'.dp-g{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;padding:10px 12px 6px}'+
'.dp-g .wd{display:grid;place-items:center;height:28px;font:500 11.5px/1 var(--mono);text-transform:uppercase;letter-spacing:.02em;color:var(--text-muted)}'+
':root[lang="ar"] .dp-g .wd{font-family:var(--arabic,var(--sans));text-transform:none}'+
'.dp-g button{display:grid;place-items:center;height:36px;padding:0;border:0;border-radius:10px;background:none;color:var(--text-primary);font:500 13.5px/1 var(--sans);font-variant-numeric:tabular-nums;cursor:pointer}'+
'.dp-g button:hover{background:var(--bg-subtle)}'+
'.dp-g button.out{color:var(--text-muted)}'+
'.dp-g button.now{box-shadow:inset 0 0 0 1.5px var(--text-brand);color:var(--text-brand);font-weight:600}'+
'.dp-g button[aria-selected="true"]{background:var(--brand);color:var(--text-on-brand);box-shadow:none;font-weight:600}'+
'.dp-g button:disabled{color:var(--text-muted);opacity:.35;background:none;cursor:default}'+
'.dp-g button:focus-visible,.dp-nav button:focus-visible,.dp-f button:focus-visible{outline:2px solid var(--text-brand);outline-offset:1px}'+
'.dp-f{display:flex;justify-content:space-between;gap:8px;padding:8px 12px 12px}'+
'.dp-f button{min-height:34px;padding:0 12px;border:1px solid var(--border);border-radius:999px;background:var(--bg-surface);color:var(--text-primary);font:500 13px/1 var(--sans);cursor:pointer}'+
':root[lang="ar"] .dp-f button{font-family:var(--arabic,var(--sans))}'+
'.dp-f button:hover{border-color:var(--border-strong);background:var(--bg-subtle)}'+
'.dp-f button:disabled{opacity:.4;cursor:default}';
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

/* placeholder text follows the page language */
function setPh(){document.documentElement.style.setProperty('--dp-ph',JSON.stringify(t('ph')));if(pop&&inp)render(false);}
new MutationObserver(setPh).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});

/* dates as "YYYY-MM-DD" strings, built in local time */
function pad(n){return (n<10?'0':'')+n;}
function iso(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());}
function parse(s){var m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s||'');return m?new Date(+m[1],+m[2]-1,+m[3]):null;}
function addDays(d,n){return new Date(d.getFullYear(),d.getMonth(),d.getDate()+n);}
function addMonths(d,n){var x=new Date(d.getFullYear(),d.getMonth()+n,1),last=new Date(x.getFullYear(),x.getMonth()+1,0).getDate();x.setDate(Math.min(d.getDate(),last));return x;}

var pop=null,inp=null,view=null,focusD=null,mode='days';
var ICL='<svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true"><path d="M12 5l-5 5 5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    ICD='<svg width="14" height="14" viewBox="0 0 20 20" aria-hidden="true"><path d="M5 8l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    ICR='<svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true"><path d="M8 5l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function bounds(){return {min:inp.min||'',max:inp.max||''};}
function okDay(s){var b=bounds();return !(b.min&&s<b.min)&&!(b.max&&s>b.max);}
function clampD(d){var b=bounds(),s=iso(d);if(b.min&&s<b.min)return parse(b.min);if(b.max&&s>b.max)return parse(b.max);return d;}

function head(title,dPrev,dNext,okP,okN,lp,ln){
  return '<div class="dp-h"><button class="dp-t" type="button" data-a="mode" aria-expanded="'+(mode!=='days')+'" aria-label="'+title+' · '+t('pickY')+'"><span id="dpT" aria-live="polite">'+title+'</span>'+ICD+'</button><div class="dp-nav">'+
    '<button type="button" data-m="'+dPrev+'" aria-label="'+lp+'"'+(okP?'':' disabled')+'>'+ICL+'</button>'+
    '<button type="button" data-m="'+dNext+'" aria-label="'+ln+'"'+(okN?'':' disabled')+'>'+ICR+'</button></div></div>';
}
function foot(today){return '<div class="dp-f"><button type="button" data-a="today"'+(okDay(today)?'':' disabled')+'>'+t('today')+'</button><button type="button" data-a="clear"'+(inp.value?'':' disabled')+'>'+t('clear')+'</button></div>';}
function renderYM(keepFocus){
  var l=lang(),loc=LOC[l],y=view.getFullYear(),b=bounds(),sel=parse(inp.value),now=new Date(),today=iso(now),h='',i,cur;
  var minY=b.min?+b.min.slice(0,4):-Infinity,maxY=b.max?+b.max.slice(0,4):Infinity,nf=new Intl.NumberFormat(loc,{useGrouping:false});
  if(mode==='years'){
    var y0=y-(((y%12)+12)%12);
    h=head(nf.format(y0)+' – '+nf.format(y0+11),-12,12,y0-1>=minY,y0+12<=maxY,t('prevYs'),t('nextYs'))+'<div class="dp-g ym" role="grid" aria-labelledby="dpT">';
    for(i=0;i<12;i++){var yy=y0+i;cur=yy===y;
      h+='<button type="button" role="gridcell" data-y="'+yy+'" class="'+(yy===now.getFullYear()?'now':'')+'" tabindex="'+(cur?'0':'-1')+'" aria-selected="'+(!!sel&&sel.getFullYear()===yy)+'"'+(yy<minY||yy>maxY?' disabled':'')+'>'+nf.format(yy)+'</button>';}
  }else{
    var mf=new Intl.DateTimeFormat(loc,{month:'short'}),ml=new Intl.DateTimeFormat(loc,{month:'long',year:'numeric'});
    h=head(nf.format(y),-12,12,y-1>=minY,y+1<=maxY,t('prevY'),t('nextY'))+'<div class="dp-g ym" role="grid" aria-labelledby="dpT">';
    for(i=0;i<12;i++){var md=new Date(y,i,1),first=iso(md),last=iso(new Date(y,i+1,0));cur=i===focusD.getMonth();
      h+='<button type="button" role="gridcell" data-mo="'+i+'" class="'+(y===now.getFullYear()&&i===now.getMonth()?'now':'')+'" tabindex="'+(cur?'0':'-1')+'" aria-label="'+ml.format(md)+'" aria-selected="'+(!!sel&&sel.getFullYear()===y&&sel.getMonth()===i)+'"'+((b.min&&last<b.min)||(b.max&&first>b.max)?' disabled':'')+'>'+mf.format(md).replace(/\.$/,'')+'</button>';}
  }
  pop.innerHTML=h+'</div>'+foot(today);pop.setAttribute('aria-label',t('dlg'));
  if(keepFocus){var f=pop.querySelector('.dp-g button[tabindex="0"]:not(:disabled)')||pop.querySelector('.dp-g button:not(:disabled)');if(f)f.focus();}
}
function render(keepFocus){
  if(mode!=='days'){renderYM(keepFocus);return;}
  var l=lang(),loc=LOC[l],first=FIRST[l],y=view.getFullYear(),m=view.getMonth();
  var title=new Intl.DateTimeFormat(loc,{month:'long',year:'numeric'}).format(view);
  var wdF=new Intl.DateTimeFormat(loc,{weekday:'narrow'}),wdL=new Intl.DateTimeFormat(loc,{weekday:'long'});
  var start=new Date(y,m,1),off=(start.getDay()-first+7)%7,g0=addDays(start,-off),b=bounds();
  var prevOk=!b.min||iso(new Date(y,m,0))>=b.min,nextOk=!b.max||iso(new Date(y,m+1,1))<=b.max;
  var sel=inp.value,today=iso(new Date()),fd=iso(focusD),dayF=new Intl.DateTimeFormat(loc,{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  var h=head(title,-1,1,prevOk,nextOk,t('prev'),t('next'))+'<div class="dp-g" role="grid" aria-labelledby="dpT">';
  for(var i=0;i<7;i++){var wd=addDays(g0,i);h+='<span class="wd" role="columnheader" aria-label="'+wdL.format(wd)+'">'+wdF.format(wd)+'</span>';}
  for(i=0;i<42;i++){var d=addDays(g0,i),s=iso(d),cls=(d.getMonth()!==m?'out ':'')+(s===today?'now':'');
    h+='<button type="button" role="gridcell" data-d="'+s+'" class="'+cls.trim()+'" tabindex="'+(s===fd?'0':'-1')+'" aria-selected="'+(s===sel)+'" aria-label="'+dayF.format(d)+'"'+(okDay(s)?'':' disabled')+'>'+new Intl.NumberFormat(loc).format(d.getDate())+'</button>';}
  h+='</div>'+foot(today);
  pop.innerHTML=h;pop.setAttribute('aria-label',t('dlg'));
  if(keepFocus){var f=pop.querySelector('[data-d="'+fd+'"]');if(f&&!f.disabled)f.focus();else{var a=pop.querySelector('.dp-g button:not(:disabled)');if(a)a.focus();}}
}
function place(){
  if(!pop||!inp)return;
  var r=inp.getBoundingClientRect(),w=pop.offsetWidth,h=pop.offsetHeight,vw=document.documentElement.clientWidth,vh=window.innerHeight;
  var rtl=getComputedStyle(inp).direction==='rtl',left=rtl?r.right-w:r.left;
  left=Math.max(8,Math.min(left,vw-w-8));
  var top=r.bottom+6;if(top+h>vh-8&&r.top-h-6>8)top=r.top-h-6;
  top=Math.max(8,Math.min(top,vh-h-8));
  pop.style.left=left+'px';pop.style.top=top+'px';
}
function open(i){
  if(i.disabled||i.readOnly)return;
  if(pop&&inp===i)return;
  close(false);inp=i;
  var cur=parse(i.value)||clampD(new Date());focusD=cur;mode='days';view=new Date(cur.getFullYear(),cur.getMonth(),1);
  pop=document.createElement('div');pop.className='dp';pop.setAttribute('role','dialog');pop.setAttribute('aria-modal','false');
  // inside a modal <dialog>, the calendar has to live in it to show above its backdrop
  (i.closest('dialog[open]')||document.body).appendChild(pop);
  if(i.parentNode.classList.contains('dw'))i.parentNode.classList.add('dp-on');
  i.setAttribute('aria-expanded','true');
  render(true);place();
}
function close(refocus){
  if(!pop)return;
  pop.remove();pop=null;
  if(inp){inp.setAttribute('aria-expanded','false');if(inp.parentNode.classList.contains('dw'))inp.parentNode.classList.remove('dp-on');if(refocus)inp.focus();}
  inp=null;
}
function pick(s){
  var i=inp;i.value=s;
  i.dispatchEvent(new Event('input',{bubbles:true}));i.dispatchEvent(new Event('change',{bubbles:true}));
  close(true);
}
function move(d){
  d=clampD(d);focusD=d;
  if(d.getMonth()!==view.getMonth()||d.getFullYear()!==view.getFullYear())view=new Date(d.getFullYear(),d.getMonth(),1);
  render(true);
}

/* the field */
document.addEventListener('click',function(e){
  var i=e.target.closest&&e.target.closest('input[type=date]');
  if(i){e.preventDefault();if(pop&&inp===i)close(false);else open(i);return;}
  if(pop&&!pop.contains(e.target))close(false);
},true);
document.addEventListener('keydown',function(e){
  var i=e.target;
  if(!(i&&i.tagName==='INPUT'&&i.type==='date'))return;
  if(e.key==='Enter'||e.key===' '||e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();open(i);}
  else if((e.key==='Backspace'||e.key==='Delete')&&i.value){e.preventDefault();i.value='';i.dispatchEvent(new Event('input',{bubbles:true}));i.dispatchEvent(new Event('change',{bubbles:true}));}
  else if(e.key==='Escape'&&pop){e.preventDefault();e.stopPropagation();close(true);}
  else if(e.key.length===1&&!e.ctrlKey&&!e.metaKey)e.preventDefault(); // no typing into the hidden native segments
},true);
/* the calendar */
document.addEventListener('click',function(e){
  if(!pop||!pop.contains(e.target))return;
  var b=e.target.closest('button');if(!b||b.disabled)return;
  if(b.hasAttribute('data-d'))pick(b.getAttribute('data-d'));
  else if(b.getAttribute('data-a')==='mode'){mode=mode==='days'?'years':'days';render(false);var tb=pop.querySelector('.dp-t');if(tb)tb.focus();}
  else if(b.hasAttribute('data-y')){view=new Date(+b.getAttribute('data-y'),focusD.getMonth(),1);mode='months';render(true);}
  else if(b.hasAttribute('data-mo')){view=new Date(view.getFullYear(),+b.getAttribute('data-mo'),1);var dd=Math.min(focusD.getDate(),new Date(view.getFullYear(),view.getMonth()+1,0).getDate());
    focusD=clampD(new Date(view.getFullYear(),view.getMonth(),dd));mode='days';render(true);}
  else if(b.hasAttribute('data-m')&&mode!=='days'){view=new Date(view.getFullYear()+(mode==='years'?+b.getAttribute('data-m'):Math.sign(+b.getAttribute('data-m'))),view.getMonth(),1);render(false);b=pop.querySelector('[data-m="'+b.getAttribute('data-m')+'"]');if(b&&!b.disabled)b.focus();}
  else if(b.hasAttribute('data-m')){view=new Date(view.getFullYear(),view.getMonth()+(+b.getAttribute('data-m')),1);focusD=clampD(new Date(view.getFullYear(),view.getMonth(),Math.min(focusD.getDate(),28)));render(false);b=pop.querySelector('[data-m="'+b.getAttribute('data-m')+'"]');if(b&&!b.disabled)b.focus();}
  else if(b.getAttribute('data-a')==='today')pick(iso(new Date()));
  else if(b.getAttribute('data-a')==='clear')pick('');
});
document.addEventListener('keydown',function(e){
  if(!pop||!pop.contains(e.target))return;
  var rtl=getComputedStyle(pop).direction==='rtl',onDay=e.target.hasAttribute&&e.target.hasAttribute('data-d'),k=e.key;
  if(k==='Escape'){e.preventDefault();e.stopPropagation();close(true);return;}
  if(k==='Tab'){ // keep focus in the calendar
    var f=[].slice.call(pop.querySelectorAll('button:not(:disabled)')).filter(function(b){return !b.hasAttribute('data-d')||b.tabIndex===0;});
    var ix=f.indexOf(document.activeElement);
    if(e.shiftKey&&ix<=0){e.preventDefault();f[f.length-1].focus();}else if(!e.shiftKey&&ix===f.length-1){e.preventDefault();f[0].focus();}
    return;}
  var ym=e.target.hasAttribute&&(e.target.hasAttribute('data-y')||e.target.hasAttribute('data-mo'));
  if(ym){var bs=[].slice.call(pop.querySelectorAll('.dp-g button')),ix2=bs.indexOf(e.target),st2={ArrowLeft:rtl?1:-1,ArrowRight:rtl?-1:1,ArrowUp:-3,ArrowDown:3}[k];
    if(st2){e.preventDefault();var n2=bs[ix2+st2];if(n2&&!n2.disabled){bs.forEach(function(x){x.tabIndex=-1;});n2.tabIndex=0;n2.focus();}}
    return;}
  if(!onDay)return;
  var d=parse(e.target.getAttribute('data-d')),l=lang(),first=FIRST[l];
  if(k==='ArrowLeft'){e.preventDefault();move(addDays(d,rtl?1:-1));}
  else if(k==='ArrowRight'){e.preventDefault();move(addDays(d,rtl?-1:1));}
  else if(k==='ArrowUp'){e.preventDefault();move(addDays(d,-7));}
  else if(k==='ArrowDown'){e.preventDefault();move(addDays(d,7));}
  else if(k==='PageUp'){e.preventDefault();move(addMonths(d,e.shiftKey?-12:-1));}
  else if(k==='PageDown'){e.preventDefault();move(addMonths(d,e.shiftKey?12:1));}
  else if(k==='Home'){e.preventDefault();move(addDays(d,-((d.getDay()-first+7)%7)));}
  else if(k==='End'){e.preventDefault();move(addDays(d,6-((d.getDay()-first+7)%7)));}
},true);
window.addEventListener('resize',place);
window.addEventListener('scroll',function(e){if(pop&&!pop.contains(e.target))place();},true);
/* a dialog closing (or the field leaving the page) closes the calendar */
new MutationObserver(function(){if(pop&&inp&&!document.contains(inp))close(false);}).observe(document.body,{childList:true,subtree:true});
document.addEventListener('close',function(){if(pop&&inp&&!inp.closest('dialog[open]')&&pop.parentNode.tagName==='DIALOG')close(false);},true);

setPh();
})();
