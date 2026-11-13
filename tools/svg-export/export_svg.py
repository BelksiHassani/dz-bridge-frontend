"""Export every DZ-Bridge interface as a vector SVG (EN / FR / AR x light / dark).

Usage:  python tools/svg-export/export_svg.py [filter]
        filter (optional) only exports files whose name contains it, e.g. "login" or "ar-dark".
        Several filters can be given comma-separated ("org-,expert-setup"): a file matching any of them is exported.

Renders the real pages in headless Microsoft Edge (or Chrome), drives each screen into its
state through the UI, and converts the result with dom2svg.js. Output goes to ./svg/<lang>-<theme>/.
"""
import html
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]                      # frontend/
OUT = ROOT / 'svg'
WIDTH, HEIGHT = 1440, 1000

# Optional 4th item: JS run before the page's own scripts (after localStorage is reset), to seed saved data.
EXPERT_ORGS = ("localStorage.setItem('dzb-expert-orgs',JSON.stringify([{id:'o1',short:'Halimi Solar Lab',ini:'HS',"
               "profile:{at:1,org:{name:'Halimi Solar Lab',short:'Halimi Solar Lab',type:'res',w:'16',city:'Algiers'},"
               "me:{name:'Bachir Halimi',email:'b.halimi@dz-bridge.dz'},invites:[]}}]));")


def expert_draft(step, published=False):
    d = ("{fn:'Bachir',ln:'Halimi',headline:'Professor of renewable energy systems',city:'Lyon',"
         "bio:'Solar irrigation and microgrids for arid regions, with 15 years of field projects in North Africa.'}")
    return ("localStorage.setItem('dzb-expert-draft',JSON.stringify({step:%d,maxStep:%d,published:%s,d:%s}));window.__QUIET=1;"
            % (step, step, 'true' if published else 'false', d))


def org_draft(step, published=False):
    d = ("{name:'Université Mohamed Khider de Biskra',short:'Univ. Biskra',type:'uni',w:'07',city:'Biskra',"
         "about:'Public university with strong agronomy and renewable energy departments.',needs:['lecture','visit'],domains:['agri','water']}")
    return ("localStorage.setItem('dzb-org-draft',JSON.stringify({step:%d,maxStep:%d,published:%s,d:%s}));window.__QUIET=1;"
            % (step, step, 'true' if published else 'false', d))


PUBLIC_EVENT = ("var d=new Date();d.setDate(d.getDate()+30);var f=d.toISOString().slice(0,10);d.setDate(d.getDate()+4);"
                "localStorage.setItem('dzb-public-events',JSON.stringify([{id:'e1',code:'PRJ-0654',title:'Solar dryer for Deglet Nour dates',"
                "type:'work',from:f,to:d.toISOString().slice(0,10),w:'07',place:{en:'Biskra',fr:'Biskra',ar:'بسكرة'},"
                "org:'Université Mohamed Khider de Biskra',aud:'stu',link:'',x:'N222',xName:'Pr. Belgacem Haba',named:true,consent:'yes',status:'live',at:0}]));")

SCREENS = [  # (file name, page, state[, setup js])
    ('01-landing-page', 'landing_page.html', ''),
    ('02-login', 'login.html', 'login'),
    ('03-login-wrong-password', 'login.html', 'wrong'),
    ('04-login-locked', 'login.html', 'locked'),
    ('05-reset-request', 'login.html', 'reset'),
    ('06-check-inbox', 'login.html', 'sent'),
    ('07-new-password', 'login.html', 'newpw'),
    ('08-password-updated', 'login.html', 'done'),
    ('09-signup', 'signup.html', 'su'),
    ('10-signup-organization', 'signup.html', 'su-org'),
    ('11-signup-errors', 'signup.html', 'su-errors'),
    ('12-signup-email-taken', 'signup.html', 'su-taken'),
    ('13-verify-email', 'signup.html', 'su-verify'),
    ('14-email-verified', 'signup.html', 'su-verified'),
    ('15-expert-dashboard', 'expert-dashboard.html', '#dashboard'),
    ('16-expert-opportunities', 'expert-dashboard.html', '#opportunities'),
    ('17-expert-opportunity-detail', 'expert-dashboard.html', '#opportunity/PRJ-0731'),
    ('18-expert-availability', 'expert-dashboard.html', '#availability'),
    ('19-expert-messages', 'expert-dashboard.html', '#messages'),
    ('20-expert-message-thread', 'expert-dashboard.html', '#messages/t1'),
    ('21-expert-feedback', 'expert-dashboard.html', '#feedback'),
    ('22-expert-profile-menu', 'expert-dashboard.html', '#dashboard|#ubtn', EXPERT_ORGS),
    ('23-expert-add-availability', 'expert-dashboard.html', '#availability|[data-addav]'),
    ('24-expert-setup-import', 'expert-profile.html', ''),
    ('25-expert-setup-personal', 'expert-profile.html', '', expert_draft(2)),
    ('26-expert-setup-expertise', 'expert-profile.html', '', expert_draft(3)),
    ('27-expert-setup-review', 'expert-profile.html', '', expert_draft(4)),
    ('28-expert-setup-done', 'expert-profile.html', '', expert_draft(4, True)),
    ('29-org-setup-identity', 'org-profile.html', ''),
    ('30-org-setup-needs', 'org-profile.html', '', org_draft(2)),
    ('31-org-setup-team', 'org-profile.html', '', org_draft(3)),
    ('32-org-setup-review', 'org-profile.html', '', org_draft(4)),
    ('33-org-setup-done', 'org-profile.html', '', org_draft(4, True)),
    ('34-org-dashboard', 'org-dashboard.html', '#dashboard'),
    ('35-org-projects', 'org-dashboard.html', '#projects'),
    ('36-org-project-detail', 'org-dashboard.html', '#project/PRJ-0731'),
    ('37-org-new-project', 'org-dashboard.html', '#new'),
    ('38-org-matches', 'org-dashboard.html', '#matches'),
    ('39-org-messages', 'org-dashboard.html', '#messages'),
    ('40-org-message-thread', 'org-dashboard.html', '#messages/m1'),
    ('41-org-events', 'org-dashboard.html', '#events'),
    ('42-org-publish-event', 'org-dashboard.html', '#project/PRJ-0654|[data-act="pubev"]'),
    ('43-org-feedback', 'org-dashboard.html', '#feedback'),
    ('44-org-rate-expert', 'org-dashboard.html', '#feedback|[data-act="rate"]'),
    ('45-org-profile', 'org-dashboard.html', '#profile'),
    ('46-org-of-expert-menu', 'org-dashboard.html', '#dashboard|#ubtn', EXPERT_ORGS + "history.replaceState(null,'',location.pathname+'?org=o1');"),
    ('47-landing-published-event', 'landing_page.html', '', PUBLIC_EVENT),
    ('48-events', 'events.html', '', PUBLIC_EVENT),
    ('49-events-filter', 'events.html', '#all|#fbtn|[data-ft="work"]', PUBLIC_EVENT),
]
LANGS = ['en', 'fr', 'ar']
THEMES = ['light', 'dark']


def find_browser():
    for p in [
        os.environ.get('BROWSER_PATH', ''),
        r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
        r'C:\Program Files\Microsoft\Edge\Application\msedge.exe',
        r'C:\Program Files\Google\Chrome\Application\chrome.exe',
        shutil.which('msedge') or '', shutil.which('chrome') or '', shutil.which('google-chrome') or '',
    ]:
        if p and Path(p).exists():
            return p
    sys.exit('Edge or Chrome not found. Set BROWSER_PATH to the browser executable.')


def build_page(page, lang, theme, state, scripts, setup=''):
    src = (ROOT / page).read_text(encoding='utf-8')
    head = ("<script>try{localStorage.clear();localStorage.setItem('dzb-lang','%s');"
            "localStorage.setItem('dzb-theme','%s');%s}catch(e){}</script>" % (lang, theme, setup))
    src = re.sub(r'(<head[^>]*>)', lambda m: m.group(1) + head, src, count=1)
    tail = ('<textarea id="__svgout" hidden></textarea><script>window.__STATE=%r;</script><script>%s</script><script>%s</script>'
            % (state, scripts[0], scripts[1]))
    i = src.rfind('</body>')
    return src[:i] + tail + src[i:]


def render(browser, profile, scripts, page, lang, theme, state, window, setup=''):
    """Returns (svg, stderr). A temp copy sits next to the real page so relative links keep working."""
    slug = (re.sub(r'\W', '_', state) or 'page')[:40]
    tmp = ROOT / f'.__svgexport_{slug}_{lang}_{theme}.html'
    tmp.write_text(build_page(page, lang, theme, state, scripts, setup), encoding='utf-8')
    try:
        res = subprocess.run(
            [browser, '--headless=new', '--disable-gpu', '--no-first-run', '--hide-scrollbars',
             '--disable-extensions', f'--user-data-dir={profile}', f'--window-size={window[0]},{window[1]}',
             '--virtual-time-budget=45000', '--dump-dom', tmp.as_uri()],
            capture_output=True, text=True, encoding='utf-8', timeout=180)
    finally:
        tmp.unlink(missing_ok=True)
    m = re.search(r'<textarea id="__svgout"[^>]*>(.*?)</textarea>', res.stdout, re.S)
    return (html.unescape(m.group(1)) if m else ''), res.stderr


def main():
    flts = [f for f in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if f]   # comma-separated, any match
    browser = find_browser()
    scripts = ((HERE / 'dom2svg.js').read_text(encoding='utf-8'), (HERE / 'drive.js').read_text(encoding='utf-8'))
    profile = tempfile.mkdtemp(prefix='dzb-svg-')
    failed = 0
    try:
        # headless windows lose some space to the frame: measure once so the viewport is exactly WIDTH x HEIGHT
        svg, err = render(browser, profile, scripts, 'login.html', 'en', 'light', 'login', (WIDTH, HEIGHT))
        dims = re.search(r'width="(\d+)" height="(\d+)"', svg)
        if not dims:
            sys.exit('Calibration failed: ' + (svg[:300] or err[-300:]))
        window = (2 * WIDTH - int(dims.group(1)), 2 * HEIGHT - int(dims.group(2)))
        for lang in LANGS:
            for theme in THEMES:
                for name, page, state, *setup in SCREENS:
                    target = OUT / f'{lang}-{theme}' / f'{name}.svg'
                    rel = str(target.relative_to(OUT)).replace('\\', '/')
                    if flts and not any(f in rel for f in flts):
                        continue
                    svg, err = render(browser, profile, scripts, page, lang, theme, state, window, setup[0] if setup else '')
                    if not svg.startswith('<svg'):
                        failed += 1
                        print(f'FAIL {target.relative_to(ROOT)}: {svg[:300] or err[-300:]}')
                        continue
                    target.parent.mkdir(parents=True, exist_ok=True)
                    target.write_text('<?xml version="1.0" encoding="UTF-8"?>\n' + svg, encoding='utf-8')
                    print(f'ok   {target.relative_to(ROOT)}  ({len(svg) // 1024} KB)')
    finally:
        shutil.rmtree(profile, ignore_errors=True)
    sys.exit(1 if failed else 0)


if __name__ == '__main__':
    main()
