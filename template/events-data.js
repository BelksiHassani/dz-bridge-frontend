/* Shared event data for events.html, event.html and the home page.
   SAMPLE stands in for GET /api/events/public (empty in this template). published() adds the events institutions send from
   org-dashboard.html ('dzt-public-events'), once DZ-Expertise has approved them (mock: 1 minute after sending).
   Each label is [en, fr, ar]. Dates are offsets from today so the sample always shows upcoming events.

   needs: the event still looks for experts. roles: 'speaker' and/or 'collab'. until: last day to offer (offset or ISO date).
   When needs is open, event.html shows a Contribute button next to Attend.
   Contributions ('dzt-contrib') stand in for POST /api/events/:id/contributions. */
(function(){
'use strict';
var TYPES={work:['Workshop','Atelier','ورشة'],sem:['Seminar','Séminaire','ندوة'],conf:['Conference','Conférence','مؤتمر'],forum:['Forum','Forum','منتدى'],day:['Research day','Journée de recherche','يوم بحثي'],
  collab:['Collaboration opportunity','Opportunité de collaboration','فرصة تعاون']};
var DOM={agri:['Agriculture','Agriculture','الفلاحة'],water:['Water','Eau','المياه'],energy:['Energy','Énergie','الطاقة'],ai:['AI & data','IA et données','الذكاء الاصطناعي'],health:['Health','Santé','الصحة'],diaspora:['Diaspora','Diaspora','الجالية']};
var AUDS={stu:['Students','Étudiants','الطلبة'],res:['Researchers','Chercheurs','الباحثون'],ind:['Industry','Industrie','الصناعة'],pub:['Open to the public','Ouvert au public','مفتوح للجمهور']};
var CITY={Biskra:['Biskra','Biskra','بسكرة'],Algiers:['Algiers','Alger','الجزائر'],Blida:['Blida','Blida','البليدة'],Oran:['Oran','Oran','وهران'],'Sétif':['Sétif','Sétif','سطيف'],Constantine:['Constantine','Constantine','قسنطينة']};
var ROLES={speaker:['Speakers','Intervenants','متحدثون'],collab:['Collaborators','Collaborateurs','متعاونون']};

// events published by institutions come from GET /api/events/public (template: none)
var SAMPLE=[];

function iso(d){return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);}
function plus(n){var d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+n);return d;}
function today(){return iso(plus(0));}
function initials(s){return (s||'').split(/\s+/).filter(function(w){return /^[A-ZÀ-Ý]/.test(w);}).map(function(w){return w[0];}).join('').slice(0,2);}

function published(){
  var l=[];try{l=JSON.parse(localStorage.getItem('dzt-public-events')||'[]');}catch(e){}
  if(!Array.isArray(l))return [];
  return l.filter(function(x){return x.status==='live'||(x.status==='review'&&Date.now()-x.at>60000);}).map(function(x){
    return {id:x.id,from:x.from,to:x.to||x.from,type:x.type,dom:'',aud:x.aud,org:x.org,ini:initials(x.org),
      city:(x.place&&x.place.en)||'',place:x.place,x:x.named?x.xName:'',anon:!!x.xName&&!x.named,title:x.title,link:x.link,isNew:true,
      descText:x.desc||'',needs:x.needs||null};
  });
}
function all(){
  return SAMPLE.map(function(e){
    var n=e.needs?{roles:e.needs.roles,skills:e.needs.skills||[],until:iso(plus(e.needs.until))}:null;
    return {id:e.id,from:iso(plus(e.d)),to:iso(plus(e.d+e.len-1)),type:e.type,dom:e.dom,aud:e.aud,org:e.org,ini:e.ini,city:e.city,online:e.online,x:e.x||'',t:e.t,link:e.link,desc:e.desc,needs:n};
  }).concat(published());
}
function get(id){return all().filter(function(e){return e.id===id;})[0]||null;}
// the Contribute button shows while the event still needs experts and the deadline has not passed
function needsOpen(e){return !!(e&&e.needs&&e.needs.roles&&e.needs.roles.length&&(!e.needs.until||e.needs.until>=today())&&e.to>=today());}

/* who is looking: login.html stores the session; the role comes from the account created on signup.html (demo account = expert) */
function viewer(){
  var s=null,a=null;try{s=JSON.parse(sessionStorage.getItem('dzt-session')||'null');a=JSON.parse(localStorage.getItem('dzt-account')||'null');}catch(e){}
  if(!s||!s.email)return null;
  var mine=a&&a.email&&a.email.toLowerCase()===s.email.toLowerCase();
  return {email:s.email,role:mine?a.role:'expert'};
}
function contribs(){try{var l=JSON.parse(localStorage.getItem('dzt-contrib')||'[]');return Array.isArray(l)?l:[];}catch(e){return [];}}
function contribsFor(id){return contribs().filter(function(c){return c.ev===id;});}
function myContrib(id,email){return contribs().filter(function(c){return c.ev===id&&c.email&&email&&c.email.toLowerCase()===email.toLowerCase();})[0]||null;}
function addContrib(c){var l=contribs();l.push(c);try{localStorage.setItem('dzt-contrib',JSON.stringify(l));}catch(e){}}

window.DZEV={TYPES:TYPES,DOM:DOM,AUDS:AUDS,CITY:CITY,ROLES:ROLES,all:all,get:get,needsOpen:needsOpen,today:today,
  viewer:viewer,contribsFor:contribsFor,myContrib:myContrib,addContrib:addContrib};
})();
