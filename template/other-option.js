/* "Other…" for dropdown lists.
   Every <select> gets an "Other…" option at the end (except filters, sorts and record pickers,
   which carry data-no-other). Choosing it opens a text field under the list; the typed text is
   added to the list as a new option, selected, and a normal change event is sent, so the page
   stores the text as the value. Pages call DZOther.opt(current, keys) when they render a list,
   so a value typed earlier still shows after a re-render. */
(function(){
'use strict';
var OTHER='__other';
var TX={
  en:{other:'Other…',ph:'Type your answer',ok:'Add',cancel:'Cancel'},
  fr:{other:'Autre…',ph:'Saisissez votre réponse',ok:'Ajouter',cancel:'Annuler'},
  ar:{other:'أخرى…',ph:'اكتب إجابتك',ok:'إضافة',cancel:'إلغاء'}
};
function lang(){var l=(document.documentElement.lang||'en').slice(0,2);return TX[l]?l:'en';}
function t(k){return TX[lang()][k];}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}

/* the custom option to add when a stored value is not one of the list keys */
function opt(cur,keys){
  if(cur==null||cur===''||cur===OTHER)return '';
  cur=String(cur);
  for(var i=0;i<(keys||[]).length;i++)if(String(keys[i])===cur)return '';
  return '<option value="'+esc(cur)+'" data-custom selected>'+esc(cur)+'</option>';
}

var css='.oth-box{display:flex;gap:6px;margin-top:6px;align-items:center}'+
  '.oth-box input{flex:1;min-width:0}'+
  '.oth-box button{flex:none;white-space:nowrap}';
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

function skip(sel){return sel.hasAttribute('data-no-other')||sel.multiple||sel.closest('[data-no-other]');}
function enhance(sel){
  if(skip(sel))return;
  var o=sel.querySelector('option[value="'+OTHER+'"]');
  if(!o){
    o=document.createElement('option');o.value=OTHER;
    // keep the custom choice selected if the page marked one
    var keep=sel.value;
    sel.appendChild(o);
    if(sel.value!==keep)sel.value=keep;
  }
  o.textContent=t('other');
  if(sel.value!==OTHER)sel.setAttribute('data-oth-prev',sel.value);
}
function scan(root){
  if(!root||!root.querySelectorAll)return;
  if(root.tagName==='SELECT')enhance(root);
  Array.prototype.forEach.call(root.querySelectorAll('select'),enhance);
}

function closeBox(sel,restore){
  var b=sel.nextElementSibling;
  if(b&&b.classList.contains('oth-box'))b.remove();
  if(restore){sel.value=sel.getAttribute('data-oth-prev')||'';if(sel.value===OTHER)sel.selectedIndex=0;}
}
function commit(sel,txt){
  txt=txt.trim();
  if(!txt){closeBox(sel,true);sel.focus();return;}
  var ex=null;
  Array.prototype.forEach.call(sel.options,function(o){if(o.value!==OTHER&&(o.value===txt||o.textContent.trim().toLowerCase()===txt.toLowerCase()))ex=o;});
  if(!ex){
    ex=document.createElement('option');ex.value=txt;ex.textContent=txt;ex.setAttribute('data-custom','');
    sel.insertBefore(ex,sel.querySelector('option[value="'+OTHER+'"]'));
  }
  closeBox(sel,false);
  sel.value=ex.value;sel.setAttribute('data-oth-prev',ex.value);
  var id=sel.id;
  sel.dispatchEvent(new Event('input',{bubbles:true}));
  sel.dispatchEvent(new Event('change',{bubbles:true}));
  // the page may have re-rendered the list: put the focus back on the new one
  var again=id&&document.getElementById(id);(again||sel).focus();
}
function openBox(sel){
  closeBox(sel,false);
  var b=document.createElement('div');b.className='oth-box';
  b.innerHTML='<input class="ctl" type="text" maxlength="120" placeholder="'+esc(t('ph'))+'" aria-label="'+esc(t('ph'))+'">'+
    '<button type="button" class="btn btn-primary btn-sm" data-oth="ok">'+esc(t('ok'))+'</button>'+
    '<button type="button" class="btn btn-ghost btn-sm" data-oth="x">'+esc(t('cancel'))+'</button>';
  sel.insertAdjacentElement('afterend',b);
  var inp=b.querySelector('input');
  inp.addEventListener('keydown',function(e){
    if(e.key==='Enter'){e.preventDefault();e.stopPropagation();commit(sel,inp.value);}
    else if(e.key==='Escape'){e.preventDefault();e.stopPropagation();closeBox(sel,true);sel.focus();}
  });
  b.addEventListener('click',function(e){
    var a=e.target.closest('[data-oth]');if(!a)return;
    if(a.getAttribute('data-oth')==='ok')commit(sel,inp.value);else{closeBox(sel,true);sel.focus();}
  });
  inp.focus();
}

/* capture phase on window: the page never sees the "Other…" value itself */
function guard(e){
  var s=e.target;
  if(!s||s.tagName!=='SELECT')return;
  if(s.value===OTHER){
    e.stopImmediatePropagation();
    if(e.type==='change')openBox(s);
  }else{
    s.setAttribute('data-oth-prev',s.value);
    var b=s.nextElementSibling;if(b&&b.classList.contains('oth-box'))b.remove();
  }
}
window.addEventListener('change',guard,true);
window.addEventListener('input',guard,true);

function start(){
  scan(document.body);
  new MutationObserver(function(ms){
    ms.forEach(function(m){Array.prototype.forEach.call(m.addedNodes,function(n){if(n.nodeType===1)scan(n);});
      if(m.target&&m.target.tagName==='SELECT')enhance(m.target);});
  }).observe(document.body,{childList:true,subtree:true});
  // relabel when the page language changes
  new MutationObserver(function(){Array.prototype.forEach.call(document.querySelectorAll('option[value="'+OTHER+'"]'),function(o){o.textContent=t('other');});})
    .observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
}
if(document.body)start();else document.addEventListener('DOMContentLoaded',start);

window.DZOther={opt:opt,scan:scan};
})();
