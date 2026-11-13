/* Puts the page into window.__STATE through the real UI, then writes the SVG into #__svgout. */
(async function () {
  'use strict';
  var S = window.__STATE, EMAIL = 'name@example.com';
  function $(s) { return document.querySelector(s); }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function type(sel, v) { var e = $(sel); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }
  async function fail(times) {
    type('#liEmail', EMAIL);
    for (var i = 0; i < times; i++) { type('#liPw', 'wrong-password'); $('#liForm').requestSubmit(); await wait(1000); }
  }
  async function toInbox() {
    type('#liEmail', EMAIL);
    $('a[data-go="reset"]').click(); await wait(100);
    $('#rsForm').requestSubmit(); await wait(1000);
  }
  async function fillSignup(email) {
    type('#suFn', 'Bachir'); type('#suLn', 'Helimi'); type('#suEmail', email); type('#suPw', 'Helimi-2026');
    $('#suTerms').checked = true; $('#suTerms').dispatchEvent(new Event('change', { bubbles: true }));
  }
  async function toVerify() { await fillSignup(EMAIL); $('#suForm').requestSubmit(); await wait(1600); }
  // headless virtual time doesn't run CSS transitions, so states would be captured mid-fade
  var still = document.createElement('style');
  still.textContent = '*,*::before,*::after{transition:none!important;animation:none!important}';
  document.head.appendChild(still);
  try { await document.fonts.ready; } catch (e) {}
  await wait(300);
  // seeded drafts greet with a "welcome back" toast that isn't part of the screen
  if (window.__QUIET) still.textContent += '.toast{visibility:hidden!important}';
  if (S && S.charAt(0) === '#') {                                              // dashboard hash routes, then "|selector" clicks (menus, dialogs)
    still.textContent += '.side{position:relative!important;top:0!important;height:auto!important}';  // sticky 100vh sidebar would stop short on tall pages
    var parts = S.split('|');
    location.hash = parts[0]; await wait(1500);
    for (var c = 1; c < parts.length; c++) { var el = $(parts[c]); if (el) el.click(); await wait(700); }
  }
  else if (S === 'wrong') await fail(3);
  else if (S === 'locked') await fail(5);
  else if (S === 'reset') { type('#liEmail', EMAIL); $('a[data-go="reset"]').click(); }
  else if (S === 'sent') { await toInbox(); await wait(18000); }               // resend timer shows 0:42
  else if (S === 'newpw') { await toInbox(); $('#demoLink a').click(); await wait(100); type('#npPw', 'abc123'); }
  else if (S === 'done') { await toInbox(); $('#demoLink a').click(); await wait(100); type('#npPw', 'Bridge-2026!'); $('#npForm').requestSubmit(); await wait(1200); }
  else if (S === 'su-org') $('input[name="role"][value="org"]').click();
  else if (S === 'su-errors') { $('#suForm').requestSubmit(); }
  else if (S === 'su-taken') { await fillSignup('b.helimi@example.com'); $('#suForm').requestSubmit(); await wait(1000); }
  else if (S === 'su-verify') { await toVerify(); await wait(18000); }        // resend timer shows 0:42
  else if (S === 'su-verified') { await toVerify(); $('#demoVerify').click(); await wait(100); }
  var demo = $('#demoLink') || ($('#demoVerify') && $('#demoVerify').parentNode);   // dev-only shortcut, not part of the real screen
  if (demo) demo.hidden = true;
  if (document.activeElement) document.activeElement.blur();
  await wait(500);
  window.scrollTo(0, 0);
  try { await document.fonts.ready; } catch (e) {}
  var out;
  try { out = window.__dom2svg(); } catch (e) { out = 'ERROR: ' + (e && e.stack || e); }
  $('#__svgout').textContent = out;
})();
