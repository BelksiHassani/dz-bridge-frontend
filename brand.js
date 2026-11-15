/* Platform branding: name, logo, colour theme and default appearance.
   An admin sets them in admin-dashboard.html#settings. They are stored in localStorage 'dzb-brand'
   (stands in for GET /api/platform/branding) and applied to every page that loads this file.
   Load it at the end of <head>, after the page's own <style>, so its colour tokens win. */
(function(){
'use strict';
var KEY='dzb-brand',ORIG='DZ-Expertise';
var DEFAULTS={name:ORIG,mark:'DZ',logo:null,theme:'plum',appearance:'system'};

/* Colour themes. 'plum' is the built-in palette, so it overrides nothing.
   Each theme replaces the brand ramp (plum-*), its tints (lav-*) and the dark-mode surfaces;
   the gold accent stays. c1/c2 are chart series colours, checked with the dataviz palette validator
   (lightness band, chroma, colour-blind separation, contrast) in light and dark. */
var THEMES={
  plum:{sw:['#3A0233','#EEDDEE','#C9A24B'],dk:['#160511','#21091B']},
  green:{sw:['#0B3D2B','#D6E8DE','#C9A24B'],dk:['#07140F','#0D1F18'],
    light:{'--plum-900':'#06291C','--plum-800':'#0B3D2B','--plum-700':'#145238','--plum-600':'#1F5E45','--lav-100':'#EAF3EE','--lav-200':'#D6E8DE','--c1':'#1E8456','--c2':'#8E3F84'},
    dark:{'--bg-page':'#07140F','--bg-surface':'#0D1F18','--bg-subtle':'#142B22','--bg-inverse':'#040C09','--border':'#1F3A2E','--border-strong':'#3F6354','--accent-lavender':'#1F3A2E','--accent-lavender-subtle':'#142B22','--text-brand':'#D6E8DE','--text-primary':'#EAF3EE','--c1':'#36A372','--c2':'#BE6FB2','--grid':'#1F3A2E'}},
  blue:{sw:['#12305A','#DBE5F4','#C9A24B'],dk:['#081120','#0E1A2E'],
    light:{'--plum-900':'#0A1F3A','--plum-800':'#12305A','--plum-700':'#1C4174','--plum-600':'#2A4E80','--lav-100':'#EDF2FA','--lav-200':'#DBE5F4','--c1':'#3566A8','--c2':'#B07F1E'},
    dark:{'--bg-page':'#081120','--bg-surface':'#0E1A2E','--bg-subtle':'#15243D','--bg-inverse':'#050B15','--border':'#1F3150','--border-strong':'#435A80','--accent-lavender':'#1F3150','--accent-lavender-subtle':'#15243D','--text-brand':'#DBE5F4','--text-primary':'#EDF2FA','--c1':'#5B8FD6','--c2':'#B08A34','--grid':'#1F3150'}},
  terra:{sw:['#5A1F0E','#F3DED4','#C9A24B'],dk:['#170905','#22100A'],
    light:{'--plum-900':'#3A1208','--plum-800':'#5A1F0E','--plum-700':'#742B16','--plum-600':'#803A22','--lav-100':'#FAEFEA','--lav-200':'#F3DED4','--c1':'#B04A2E','--c2':'#3566A8'},
    dark:{'--bg-page':'#170905','--bg-surface':'#22100A','--bg-subtle':'#2E1710','--bg-inverse':'#0E0503','--border':'#40231A','--border-strong':'#6E4536','--accent-lavender':'#40231A','--accent-lavender-subtle':'#2E1710','--text-brand':'#F3DED4','--text-primary':'#FAEFEA','--c1':'#D07658','--c2':'#5B8FD6','--grid':'#40231A'}}
};

function get(){
  var b=null;try{b=JSON.parse(localStorage.getItem(KEY)||'null');}catch(e){}
  var o={};Object.keys(DEFAULTS).forEach(function(k){o[k]=b&&b[k]!=null&&b[k]!==''?b[k]:DEFAULTS[k];});
  if(!THEMES[o.theme])o.theme='plum';
  return o;
}
function save(b){try{localStorage.setItem(KEY,JSON.stringify(b));}catch(e){return false;}return true;}
function reset(){try{localStorage.removeItem(KEY);}catch(e){}}
var B=get();

/* ---- colours: injected right away, before the page paints ---- */
function decl(m){return Object.keys(m).map(function(k){return k+':'+m[k];}).join(';');}
var style=document.createElement('style');style.id='dzb-brand-css';
var t=THEMES[B.theme];
style.textContent=(t.light?':root{'+decl(t.light)+'}:root[data-theme="dark"]{'+decl(t.dark)+'}':'')+
  '.mark.mark-img{background:transparent!important;overflow:hidden;padding:0}.mark.mark-img img{display:block;width:100%;height:100%;object-fit:contain}';
document.head.appendChild(style);

/* ---- name, logo and mark: applied once the page is built, and again whenever it re-renders ---- */
var custom=B.name!==ORIG,seen=new WeakMap(),SKIP={SCRIPT:1,STYLE:1,TEXTAREA:1,NOSCRIPT:1};
function swapName(){
  if(!custom)return;
  var w=document.createTreeWalker(document.documentElement,NodeFilter.SHOW_TEXT,null),n;
  while((n=w.nextNode())){
    var v=n.nodeValue;if(v.indexOf(ORIG)<0||seen.get(n)===v)continue;
    var p=n.parentNode;if(!p||SKIP[p.nodeName]||(p.closest&&p.closest('[data-nobrand]')))continue;
    v=v.split(ORIG).join(B.name);n.nodeValue=v;seen.set(n,v);
  }
  ['aria-label','title','placeholder','alt'].forEach(function(a){
    document.querySelectorAll('['+a+'*="'+ORIG+'"]').forEach(function(el){if(!el.closest('[data-nobrand]'))el.setAttribute(a,el.getAttribute(a).split(ORIG).join(B.name));});
  });
}
function swapMarks(){
  var sig=(B.logo?'L':'T')+B.mark+(B.logo?B.logo.length:0);
  document.querySelectorAll('.brand').forEach(function(br){
    if(br.closest('[data-nobrand]')||br.getAttribute('data-b')===sig)return;
    var m=br.querySelector('.mark'),img=br.querySelector(':scope>img');
    if(m){
      if(B.logo){m.classList.add('mark-img');m.innerHTML='<img src="'+B.logo+'" alt="">';}
      else{m.classList.remove('mark-img');m.textContent=B.mark;}
    }else if(img&&B.logo)img.src=B.logo;
    br.setAttribute('data-b',sig);
  });
  if(B.logo){var ic=document.querySelector('link[rel~="icon"]');if(ic&&ic.getAttribute('href')!==B.logo)ic.setAttribute('href',B.logo);}
}
var busy=false;
function apply(){if(busy)return;busy=true;try{swapName();if(B.logo||B.mark!=='DZ')swapMarks();}finally{busy=false;}}
function start(){
  // default appearance for visitors who never picked light or dark themselves
  var own=null;try{own=localStorage.getItem('dzb-theme');}catch(e){}
  if(!own&&(B.appearance==='light'||B.appearance==='dark'))document.documentElement.setAttribute('data-theme',B.appearance);
  apply();
  if(custom||B.logo||B.mark!=='DZ'){
    // runs before the browser paints, so the original name never flashes after a re-render
    new MutationObserver(function(){if(!busy)apply();})
      .observe(document.documentElement,{childList:true,subtree:true,characterData:true});
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();

/* ---- home page hero: photo and text in each language (homepage.html reads them) ----
   Stored in localStorage 'dzb-hero' (stands in for GET /api/platform/hero). Words wrapped in *stars* show in gold. */
var HKEY='dzb-hero';
var HERO_DEFAULTS={img:null,text:{
  en:{l1:'*Connecting*',l2:'Algerian *Experts* with Algerian *Institutions*',l3:'for Collaboration and Knowledge Transfer',cta:'Get started',cta2:'Explore events',link:'Learn more'},
  fr:{l1:'*Connecter*',l2:'les *experts* algériens aux *institutions* algériennes',l3:'pour la collaboration et le transfert de connaissances',cta:'Commencer',cta2:'Découvrir les événements',link:'En savoir plus'},
  ar:{l1:'*ربط*',l2:'*الخبراء* الجزائريين *بالمؤسسات* الجزائرية',l3:'من أجل التعاون ونقل المعرفة',cta:'ابدأ الآن',cta2:'استكشف الفعاليات',link:'اعرف المزيد'}}};
function hero(){
  var h=null;try{h=JSON.parse(localStorage.getItem(HKEY)||'null');}catch(e){}
  var o={img:h&&h.img||null,text:{},custom:!!h};
  Object.keys(HERO_DEFAULTS.text).forEach(function(l){o.text[l]={};Object.keys(HERO_DEFAULTS.text[l]).forEach(function(k){
    var v=h&&h.text&&h.text[l]&&h.text[l][k];o.text[l][k]=typeof v==='string'&&v.trim()?v.trim():HERO_DEFAULTS.text[l][k];});});
  return o;
}
function saveHero(h){
  var v={img:h.img||null,text:h.text};
  try{if(JSON.stringify(v)===JSON.stringify(HERO_DEFAULTS))localStorage.removeItem(HKEY);else localStorage.setItem(HKEY,JSON.stringify(v));}catch(e){return false;}
  return true;
}
function escH(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
/* the headline markup homepage.html expects: line 1, line 2 (.l2) and a smaller line 3 (.l3) */
function heroH1(t){function md(s){return escH(s).replace(/\*([^*]+)\*/g,'<b>$1</b>');}
  return md(t.l1)+' <span class="l2">'+md(t.l2)+'</span>'+(t.l3?' <span class="l3">'+escH(t.l3)+'</span>':'');}

window.DZBrand={KEY:KEY,ORIG:ORIG,DEFAULTS:DEFAULTS,THEMES:THEMES,get:get,save:save,reset:reset,
  HERO_DEFAULTS:HERO_DEFAULTS,hero:hero,saveHero:saveHero,heroH1:heroH1};
})();
