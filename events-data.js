/* Shared event data for events.html, event.html and the home page.
   SAMPLE stands in for GET /api/events/public. published() adds the events institutions send from
   org-dashboard.html ('dzb-public-events'), once DZ-Expertise has approved them (mock: 1 minute after sending).
   Each label is [en, fr, ar]. Dates are offsets from today so the sample always shows upcoming events.

   needs: the event still looks for experts. roles: 'speaker' and/or 'collab'. until: last day to offer (offset or ISO date).
   When needs is open, event.html shows a Contribute button next to Attend.
   Contributions ('dzb-contrib') stand in for POST /api/events/:id/contributions. */
(function(){
'use strict';
var TYPES={work:['Workshop','Atelier','ورشة'],sem:['Seminar','Séminaire','ندوة'],conf:['Conference','Conférence','مؤتمر'],forum:['Forum','Forum','منتدى'],day:['Research day','Journée de recherche','يوم بحثي'],
  collab:['Collaboration opportunity','Opportunité de collaboration','فرصة تعاون']};
var DOM={agri:['Agriculture','Agriculture','الفلاحة'],water:['Water','Eau','المياه'],energy:['Energy','Énergie','الطاقة'],ai:['AI & data','IA et données','الذكاء الاصطناعي'],health:['Health','Santé','الصحة'],diaspora:['Diaspora','Diaspora','الجالية']};
var AUDS={stu:['Students','Étudiants','الطلبة'],res:['Researchers','Chercheurs','الباحثون'],ind:['Industry','Industrie','الصناعة'],pub:['Open to the public','Ouvert au public','مفتوح للجمهور']};
var CITY={Biskra:['Biskra','Biskra','بسكرة'],Algiers:['Algiers','Alger','الجزائر'],Blida:['Blida','Blida','البليدة'],Oran:['Oran','Oran','وهران'],'Sétif':['Sétif','Sétif','سطيف'],Constantine:['Constantine','Constantine','قسنطينة']};
var ROLES={speaker:['Speakers','Intervenants','متحدثون'],collab:['Collaborators','Collaborateurs','متعاونون']};

var SAMPLE=[
  {id:'s1',d:22,len:1,type:'work',dom:'agri',aud:'stu',org:'University of Biskra',ini:'UB',city:'Biskra',x:'Pr. Bachir Halimi',link:'https://www.univ-biskra.dz',
    t:['Solar irrigation workshop','Atelier d’irrigation solaire','ورشة الري بالطاقة الشمسية'],
    desc:['A hands-on day for agronomy students: sizing solar pumps, drip irrigation and maintenance in arid farms, with field visits around Biskra.',
      'Une journée pratique pour les étudiants en agronomie : dimensionnement des pompes solaires, goutte-à-goutte et maintenance dans les exploitations arides, avec visites de terrain autour de Biskra.',
      'يوم تطبيقي لطلبة الفلاحة: تحجيم المضخات الشمسية والري بالتقطير والصيانة في المزارع الجافة، مع زيارات ميدانية حول بسكرة.'],
    needs:{roles:['collab'],until:15,skills:[['Drip irrigation','Irrigation goutte-à-goutte','الري بالتقطير'],['Solar pumping','Pompage solaire','الضخ الشمسي']]}},
  {id:'s2',d:29,len:1,type:'day',dom:'energy',aud:'pub',org:'USTHB',ini:'US',city:'Algiers',link:'https://www.usthb.dz',
    t:['Green hydrogen research day','Journée de recherche sur l’hydrogène vert','يوم بحثي حول الهيدروجين الأخضر'],
    desc:['Researchers and industry share results on electrolysis, storage and the first Algerian pilot projects.',
      'Chercheurs et industriels partagent leurs résultats sur l’électrolyse, le stockage et les premiers projets pilotes algériens.',
      'يعرض الباحثون والصناعيون نتائجهم حول التحليل الكهربائي والتخزين وأولى المشاريع النموذجية الجزائرية.'],
    needs:{roles:['speaker'],until:20,skills:[['Electrolysis','Électrolyse','التحليل الكهربائي'],['Hydrogen storage','Stockage de l’hydrogène','تخزين الهيدروجين']]}},
  {id:'s3',d:35,len:3,type:'sem',dom:'water',aud:'res',org:'ENSH Blida',ini:'EN',city:'Blida',link:'https://www.ensh.dz',
    t:['Water reuse in arid cities','Réutilisation de l’eau dans les villes arides','إعادة استخدام المياه في المدن الجافة'],
    desc:['Three days on treating and reusing wastewater for farming and green spaces in southern cities.',
      'Trois jours sur le traitement et la réutilisation des eaux usées pour l’agriculture et les espaces verts dans les villes du Sud.',
      'ثلاثة أيام حول معالجة المياه المستعملة وإعادة استخدامها في الفلاحة والمساحات الخضراء بمدن الجنوب.']},
  {id:'s4',d:46,len:1,type:'sem',dom:'ai',aud:'res',org:'University of Biskra',ini:'UB',city:'',online:true,link:'https://www.univ-biskra.dz',
    t:['AI for date-palm disease detection','L’IA pour détecter les maladies du palmier dattier','الذكاء الاصطناعي لكشف أمراض النخيل'],
    desc:['An online seminar on image datasets and models that spot bayoud and other date-palm diseases early.',
      'Un séminaire en ligne sur les jeux d’images et les modèles qui détectent tôt le bayoud et d’autres maladies du palmier.',
      'ندوة عن بُعد حول قواعد الصور والنماذج التي تكشف مبكرًا مرض البيوض وأمراض النخيل الأخرى.'],
    needs:{roles:['speaker'],until:30,skills:[['Computer vision','Vision par ordinateur','الرؤية الحاسوبية'],['Plant pathology','Phytopathologie','أمراض النبات']]}},
  {id:'s5',d:71,len:2,type:'forum',dom:'water',aud:'ind',org:'ENP Oran',ini:'EO',city:'Oran',link:'https://www.enp-oran.dz',
    t:['Desalination & water forum','Forum dessalement et eau','منتدى تحلية المياه'],
    desc:['Two days bringing desalination plant operators, researchers and start-ups together on membranes, energy and brine.',
      'Deux jours réunissant exploitants de stations de dessalement, chercheurs et start-up autour des membranes, de l’énergie et de la saumure.',
      'يومان يجمعان مشغّلي محطات التحلية والباحثين والمؤسسات الناشئة حول الأغشية والطاقة والمحلول الملحي.'],
    needs:{roles:['speaker','collab'],until:50,skills:[['Reverse osmosis','Osmose inverse','التناضح العكسي'],['Brine management','Gestion de la saumure','تسيير المحلول الملحي']]}},
  {id:'s6',d:80,len:3,type:'work',dom:'energy',aud:'ind',org:'CDER',ini:'CD',city:'Algiers',x:'Pr. Belgacem Haba',link:'https://www.cder.dz',
    t:['Microgrids for remote villages','Micro-réseaux pour villages isolés','الشبكات الكهربائية الصغيرة للقرى النائية'],
    desc:['A three-day workshop on designing and running solar microgrids for villages far from the national grid.',
      'Un atelier de trois jours sur la conception et l’exploitation de micro-réseaux solaires pour les villages loin du réseau national.',
      'ورشة من ثلاثة أيام حول تصميم وتشغيل الشبكات الشمسية الصغيرة للقرى البعيدة عن الشبكة الوطنية.']},
  {id:'s7',d:101,len:2,type:'conf',dom:'agri',aud:'res',org:'Ferhat Abbas University Sétif 1',ini:'S1',city:'Sétif',link:'https://www.univ-setif.dz',
    t:['Agrivoltaics conference','Conférence sur l’agrivoltaïsme','مؤتمر الزراعة الكهروضوئية'],
    desc:['Growing crops under solar panels: field trials, yields and economics in the high plateaus.',
      'Cultiver sous les panneaux solaires : essais au champ, rendements et économie dans les hauts plateaux.',
      'الزراعة تحت الألواح الشمسية: تجارب ميدانية ومردودية واقتصاد في الهضاب العليا.'],
    needs:{roles:['speaker'],until:80,skills:[['Agrivoltaics','Agrivoltaïsme','الزراعة الكهروضوئية'],['Agronomy','Agronomie','علم الزراعة']]}},
  {id:'s8',d:118,len:1,type:'work',dom:'ai',aud:'stu',org:'ESI Algiers',ini:'ES',city:'',online:true,link:'https://www.esi.dz',
    t:['Smart farming sensors bootcamp','Bootcamp capteurs pour l’agriculture intelligente','معسكر حساسات الزراعة الذكية'],
    desc:['Students build a soil-moisture sensor network and a small dashboard in one intensive day.',
      'Les étudiants construisent un réseau de capteurs d’humidité du sol et un petit tableau de bord en une journée intensive.',
      'يبني الطلبة شبكة حساسات لرطوبة التربة ولوحة متابعة صغيرة في يوم مكثّف.']},
  {id:'s9',d:141,len:3,type:'forum',dom:'diaspora',aud:'pub',org:'Université Constantine 1',ini:'C1',city:'Constantine',x:'Dr. Houssem Eddine Degha',link:'https://www.umc.edu.dz',
    t:['Diaspora researchers forum','Forum des chercheurs de la diaspora','منتدى باحثي الجالية'],
    desc:['Algerian researchers abroad meet local universities to start joint supervision, visits and projects.',
      'Des chercheurs algériens de l’étranger rencontrent les universités locales pour lancer co-encadrements, visites et projets.',
      'يلتقي باحثون جزائريون من الخارج بالجامعات المحلية لإطلاق إشراف مشترك وزيارات ومشاريع.'],
    needs:{roles:['speaker','collab'],until:110}},
  {id:'s10',d:40,len:180,type:'collab',dom:'agri',aud:'res',org:'CRSTRA',ini:'CR',city:'Biskra',link:'https://www.crstra.dz',
    t:['Date-palm genomics research partnership','Partenariat de recherche en génomique du palmier dattier','شراكة بحثية في جينوميات النخيل'],
    desc:['CRSTRA is looking for experts to co-supervise a six-month study on drought-tolerant date-palm varieties, with remote and on-site work.',
      'Le CRSTRA cherche des experts pour co-encadrer une étude de six mois sur les variétés de palmier dattier tolérantes à la sécheresse, à distance et sur place.',
      'يبحث CRSTRA عن خبراء للإشراف المشترك على دراسة مدتها ستة أشهر حول أصناف النخيل المقاومة للجفاف، عن بُعد وحضوريًا.'],
    needs:{roles:['collab'],until:35,skills:[['Plant genomics','Génomique végétale','جينوميات النبات'],['Bioinformatics','Bio-informatique','المعلوماتية الحيوية']]}}
];

function iso(d){return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);}
function plus(n){var d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+n);return d;}
function today(){return iso(plus(0));}
function initials(s){return (s||'').split(/\s+/).filter(function(w){return /^[A-ZÀ-Ý]/.test(w);}).map(function(w){return w[0];}).join('').slice(0,2);}

function published(){
  var l=[];try{l=JSON.parse(localStorage.getItem('dzb-public-events')||'[]');}catch(e){}
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
  var s=null,a=null;try{s=JSON.parse(sessionStorage.getItem('dzb-session')||'null');a=JSON.parse(localStorage.getItem('dzb-account')||'null');}catch(e){}
  if(!s||!s.email)return null;
  var mine=a&&a.email&&a.email.toLowerCase()===s.email.toLowerCase();
  // demo@dz-bridge.dz and institution@dz-bridge.dz are the institution demo accounts (login.html)
  return {email:s.email,role:['demo@dz-bridge.dz','institution@dz-bridge.dz'].indexOf(s.email.toLowerCase())>-1?'org':mine?a.role:'expert'};
}
function contribs(){try{var l=JSON.parse(localStorage.getItem('dzb-contrib')||'[]');return Array.isArray(l)?l:[];}catch(e){return [];}}
function contribsFor(id){return contribs().filter(function(c){return c.ev===id;});}
function myContrib(id,email){return contribs().filter(function(c){return c.ev===id&&c.email&&email&&c.email.toLowerCase()===email.toLowerCase();})[0]||null;}
function addContrib(c){var l=contribs();l.push(c);try{localStorage.setItem('dzb-contrib',JSON.stringify(l));}catch(e){}}

window.DZEV={TYPES:TYPES,DOM:DOM,AUDS:AUDS,CITY:CITY,ROLES:ROLES,all:all,get:get,needsOpen:needsOpen,today:today,
  viewer:viewer,contribsFor:contribsFor,myContrib:myContrib,addContrib:addContrib};
})();
