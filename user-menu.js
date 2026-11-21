/* Logged-in user in the header (events.html, event.html): replaces the "Log in" button (#hdrLogin)
   with the user's photo and name, and a menu with Dashboard and Log out. Same look as homepage.html.
   login.html keeps the session ('dzb-session'); name and role come from the account made on signup.html
   (the demo account is the sample expert). Photo: the one uploaded in the expert profile set-up, else initials.
   Labels follow the page language (<html lang>). */
(function(){
'use strict';
var L={en:{dash:'Dashboard',out:'Log out',exp:'Expert',org:'Institution',dExp:'Expert dashboard',dOrg:'%s dashboard'},
  fr:{dash:'Tableau de bord',out:'Se déconnecter',exp:'Expert',org:'Institution',dExp:'Tableau de bord expert',dOrg:'Tableau de bord · %s'},
  ar:{dash:'لوحة التحكم',out:'تسجيل الخروج',exp:'خبير',org:'مؤسسة',dExp:'لوحة تحكم الخبير',dOrg:'لوحة تحكم · %s'}};
function who(){
  var s=null,a=null,d=null;
  try{s=JSON.parse(sessionStorage.getItem('dzb-session')||'null');a=JSON.parse(localStorage.getItem('dzb-account')||'null');d=JSON.parse(localStorage.getItem('dzb-expert-draft')||'null');}catch(e){}
  if(!s||!s.email)return null;
  // an expert who switched to an institution they created (org-dashboard.html?org=…) is shown as that institution
  var act=null,orgs=[],lo=null;try{act=JSON.parse(sessionStorage.getItem('dzb-active')||'null');orgs=JSON.parse(localStorage.getItem('dzb-expert-orgs')||'[]');}catch(e){}
  if(act&&act.org&&Array.isArray(orgs))lo=orgs.filter(function(o){return o&&o.id===act.org;})[0]||null;
  // demo@dz-bridge.dz and institution@dz-bridge.dz are the institution demo accounts (login.html); every other unknown login is the sample expert
  var mine=!!(a&&a.email&&a.email.toLowerCase()===s.email.toLowerCase()),role=['demo@dz-bridge.dz','institution@dz-bridge.dz'].indexOf(s.email.toLowerCase())>-1?'org':mine?a.role:'expert';
  // one login, several profiles: an expert who added institutions gets one dashboard link per profile in the menu
  var linked=role==='expert'&&Array.isArray(orgs)?orgs.filter(function(o){return o&&o.id;}):[];
  var dashes=linked.length?[{exp:true,href:'expert-dashboard.html#dashboard',cur:!lo}].concat(linked.map(function(o){return {name:o.short||'',href:'org-dashboard.html?org='+encodeURIComponent(o.id)+'#dashboard',cur:!!lo&&o.id===lo.id};})):[];
  if(lo&&role==='expert'){var logo=lo.profile&&lo.profile.org&&lo.profile.org.logo;
    return {name:lo.short||'',ini:lo.ini,role:'org',photo:/^data:image\//.test(logo||'')?logo:'',dash:'org-dashboard.html?org='+encodeURIComponent(lo.id)+'#dashboard',dashes:dashes};}
  var name=(mine&&((a.fn||'')+' '+(a.ln||'')).trim())||(role==='org'?'Belkis Hassani':'Pr. Bachir Halimi');
  var ph=role==='expert'&&d&&d.d&&d.d.photo;
  return {name:name,role:role,photo:/^data:image\//.test(ph||'')?ph:'',dash:role==='org'?'org-dashboard.html':'expert-dashboard.html',dashes:dashes};
}
var u=who(),login=document.getElementById('hdrLogin');
if(!u||!login)return;

var css='.user{position:relative}'+
'.user-btn{display:flex;align-items:center;gap:10px;min-height:44px;padding:4px 12px 4px 4px;border:1px solid var(--border);border-radius:999px;background:var(--bg-surface);cursor:pointer;font:600 14.5px var(--sans);color:var(--text-primary);transition:border-color .15s,box-shadow .15s}'+
':root[dir="rtl"] .user-btn{padding:4px 4px 4px 12px}:root[lang="ar"] .user-btn{font-family:var(--arabic)}'+
'.user-btn:hover{border-color:var(--border-strong);box-shadow:0 6px 16px -10px rgba(40,1,31,.4)}'+
'.user-btn .chev{width:14px;height:14px;color:var(--text-secondary);transition:transform .2s}.user-btn[aria-expanded="true"] .chev{transform:rotate(180deg)}'+
'.uav{display:grid;place-items:center;flex:none;width:36px;height:36px;border-radius:50%;background:var(--brand) center/cover no-repeat;color:var(--text-on-brand);font:600 13px/1 var(--sans);letter-spacing:.02em}'+
'.uname{max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
'.user-menu{position:absolute;top:calc(100% + 8px);inset-inline-end:0;min-width:220px;margin:0;padding:8px;list-style:none;background:var(--bg-surface);border:1px solid var(--border);border-radius:14px;box-shadow:0 18px 40px -16px rgba(40,1,31,.3);opacity:0;transform:translateY(-6px);pointer-events:none;transition:opacity .16s,transform .16s;z-index:50}'+
'.user.open .user-menu{opacity:1;transform:none;pointer-events:auto}'+
'.user-menu .uhead{display:grid;gap:2px;padding:8px 12px 12px;margin-bottom:6px;border-bottom:1px solid var(--border)}'+
'.user-menu .uhead b{font-size:15px}.user-menu .uhead small{font-size:13px;color:var(--text-secondary)}'+
'.user-menu a{display:flex;align-items:center;gap:12px;min-height:44px;padding:0 12px;border-radius:9px;font-size:15px;color:var(--text-primary);text-decoration:none}'+
':root[lang="ar"] .user-menu{font-family:var(--arabic)}'+
'.user-menu a:hover,.user-menu a:focus-visible{background:var(--bg-subtle);outline:none}'+
'.user-menu svg{width:18px;height:18px;flex:none;color:var(--text-secondary)}'+
'.user-menu .uck{width:16px;height:16px;margin-inline-start:auto;color:var(--text-brand)}'+
'.user-menu{width:max-content;max-width:min(320px,calc(100vw - 32px))}'+
'@media (max-width:640px){.uname,.user-btn .chev{display:none}.user-btn,:root[dir="rtl"] .user-btn{padding:3px}}';
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

var ini=u.ini||u.name.replace(/^(Pr|Dr)\.\s*/,'').split(/\s+/).map(function(w){return w[0];}).join('').slice(0,2).toUpperCase();
var DIC='<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><rect x="3.5" y="3.5" width="7" height="8" rx="1.8"/><rect x="13.5" y="3.5" width="7" height="5" rx="1.8"/><rect x="3.5" y="14.5" width="7" height="6" rx="1.8"/><rect x="13.5" y="11.5" width="7" height="9" rx="1.8"/></g></svg>',
  CK='<svg class="uck" viewBox="0 0 20 20" aria-hidden="true"><path d="M4.5 10.5l3.5 3.5 7.5-8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
var w=document.createElement('div');w.className='user';w.id='user';
w.innerHTML='<button class="user-btn" id="userBtn" type="button" aria-haspopup="menu" aria-expanded="false" aria-controls="userMenu"><span class="uav" id="uAv" aria-hidden="true"></span><span class="uname"></span>'+
  '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>'+
  '<ul class="user-menu" id="userMenu" role="menu" aria-labelledby="userBtn"><li class="uhead" role="none"><b></b><small></small></li>'+
  (u.dashes.length?u.dashes.map(function(d,i){return '<li role="none"><a role="menuitem" data-dx="'+i+'" href="'+d.href+'"'+(d.cur?' aria-current="true"':'')+'>'+DIC+'<span></span>'+(d.cur?CK:'')+'</a></li>';}).join(''):
  '<li role="none"><a role="menuitem" data-k="dash" href="'+u.dash+'"><svg viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><rect x="3.5" y="3.5" width="7" height="8" rx="1.8"/><rect x="13.5" y="3.5" width="7" height="5" rx="1.8"/><rect x="3.5" y="14.5" width="7" height="6" rx="1.8"/><rect x="13.5" y="11.5" width="7" height="9" rx="1.8"/></g></svg><span></span></a></li>')+
  '<li role="none"><a role="menuitem" data-k="out" href="login.html"><svg viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4.5h3.5a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H14M10 16l-4-4 4-4M6 12h10"/></g></svg><span></span></a></li></ul>';
login.style.display='none';login.parentNode.insertBefore(w,login.nextSibling);
var btn=w.querySelector('#userBtn'),av=w.querySelector('#uAv');
if(u.photo)av.style.backgroundImage='url("'+u.photo.replace(/"/g,'')+'")';else av.textContent=ini;
w.querySelector('.uname').textContent=u.name;w.querySelector('.uhead b').textContent=u.name;btn.setAttribute('aria-label',u.name);
function labels(){
  var t=L[document.documentElement.lang]||L.en;
  w.querySelector('.uhead small').textContent=u.role==='org'?t.org:t.exp;
  var dk=w.querySelector('[data-k="dash"] span');if(dk)dk.textContent=t.dash;
  [].forEach.call(w.querySelectorAll('[data-dx]'),function(a){var d=u.dashes[+a.getAttribute('data-dx')];a.querySelector('span').textContent=d.exp?t.dExp:t.dOrg.replace('%s',d.name);});w.querySelector('[data-k="out"] span').textContent=t.out;
  login.style.display='none';
}
labels();
new MutationObserver(labels).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});

var items=[].slice.call(w.querySelectorAll('.user-menu a'));
function close(refocus){w.classList.remove('open');btn.setAttribute('aria-expanded','false');if(refocus)btn.focus();}
btn.addEventListener('click',function(){var o=w.classList.toggle('open');btn.setAttribute('aria-expanded',String(o));if(o)items[0].focus();});
document.addEventListener('click',function(e){if(!w.contains(e.target))close(false);});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&w.classList.contains('open'))close(true);});
w.querySelector('.user-menu').addEventListener('keydown',function(e){var i=items.indexOf(document.activeElement);
  if(e.key==='ArrowDown'){e.preventDefault();items[(i+1)%items.length].focus();}else if(e.key==='ArrowUp'){e.preventDefault();items[(i-1+items.length)%items.length].focus();}else if(e.key==='Tab')close(false);});
})();
