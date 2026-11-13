"""Bundle each ./svg/<lang>-<theme>/ folder into one PDF: ./pdf/<lang>-<theme>.pdf (one page per screen).

Usage:  python tools/svg-export/export_pdf.py [filter]      e.g. "ar-dark"
Run export_svg.py first. Pages keep each SVG's own size and stay vector (selectable text).
"""
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from export_svg import ROOT, find_browser

SVG_DIR = ROOT / 'svg'
PDF_DIR = ROOT / 'pdf'


def page_html(svgs):
    css, body, fonts = [], [], set()
    for i, path in enumerate(svgs):
        svg = path.read_text(encoding='utf-8')
        svg = re.sub(r'^<\?xml[^>]*>\s*', '', svg)
        fonts.update(re.findall(r'@import url\("([^"]+)"\);', svg))
        svg = re.sub(r'<style>@import url\("[^"]+"\);</style>', '', svg)
        p = f'p{i}-'                                        # keep ids unique across pages
        svg = re.sub(r'\bid="([^"]+)"', lambda m: f'id="{p}{m.group(1)}"', svg)
        svg = re.sub(r'url\(#([^)]+)\)', lambda m: f'url(#{p}{m.group(1)})', svg)
        svg = re.sub(r'href="#([^"]+)"', lambda m: f'href="#{p}{m.group(1)}"', svg)
        w, h = re.search(r'width="(\d+)" height="(\d+)"', svg).groups()
        css.append(f'@page s{i}{{size:{w}px {h}px;margin:0}} .s{i}{{page:s{i};width:{w}px;height:{h}px}}')
        body.append(f'<section class="s{i}">{svg}</section>')
    links = ''.join(f'<link rel="stylesheet" href="{f}">' for f in sorted(fonts))
    return ('<!doctype html><html><head><meta charset="utf-8">' + links +
            '<style>html,body{margin:0;padding:0}section{display:block;overflow:hidden;break-after:page}'
            'section:last-child{break-after:auto}section>svg{display:block}' + ''.join(css) + '</style></head><body>' +
            ''.join(body) + '</body></html>')


def main():
    flt = sys.argv[1] if len(sys.argv) > 1 else ''
    browser = find_browser()
    folders = sorted(d for d in SVG_DIR.iterdir() if d.is_dir() and flt in d.name)
    if not folders:
        sys.exit(f'No SVG folders in {SVG_DIR} — run export_svg.py first.')
    PDF_DIR.mkdir(exist_ok=True)
    profile = tempfile.mkdtemp(prefix='dzb-pdf-')
    work = Path(tempfile.mkdtemp(prefix='dzb-pdf-html-'))
    failed = 0
    try:
        for d in folders:
            svgs = sorted(d.glob('*.svg'))
            src = work / f'{d.name}.html'
            src.write_text(page_html(svgs), encoding='utf-8')
            out = PDF_DIR / f'{d.name}.pdf'
            out.unlink(missing_ok=True)
            subprocess.run([browser, '--headless=new', '--disable-gpu', '--no-first-run', f'--user-data-dir={profile}',
                            '--no-pdf-header-footer', '--virtual-time-budget=15000', f'--print-to-pdf={out}', src.as_uri()],
                           capture_output=True, timeout=300)
            if out.exists() and out.stat().st_size > 0:
                print(f'ok   {out.relative_to(ROOT)}  ({len(svgs)} pages, {out.stat().st_size // 1024} KB)')
            else:
                failed += 1
                print(f'FAIL {out.relative_to(ROOT)}')
    finally:
        shutil.rmtree(profile, ignore_errors=True)
        shutil.rmtree(work, ignore_errors=True)
    sys.exit(1 if failed else 0)


if __name__ == '__main__':
    main()
