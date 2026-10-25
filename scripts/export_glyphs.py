"""Rebuild the OFL Arimo glyph solids with OpenSCAD and trimesh.
Usage: python scripts/export_glyphs.py --openscad /path/to/openscad
All output and font caches stay inside this project.
"""
from pathlib import Path
import argparse
import concurrent.futures
import hashlib
import json
import os
import shutil
import subprocess
from xml.sax.saxutils import escape
import trimesh

ROOT = Path(__file__).resolve().parents[1]
CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789&/'

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--openscad', default=os.environ.get('ZIBIAN_OPENSCAD') or shutil.which('openscad'))
    args = parser.parse_args()
    if not args.openscad:
        parser.error('Install OpenSCAD and provide --openscad')
    work = ROOT / 'build/glyphs'
    work.mkdir(parents=True, exist_ok=True)
    font = ROOT / 'assets/fonts/Arimo.ttf'
    config = work / 'fonts.conf'
    config.write_text('<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd"><fontconfig><dir>' + escape(font.parent.as_posix()) + '</dir><cachedir>' + escape((work / 'font-cache').as_posix()) + '</cachedir></fontconfig>', encoding='utf-8')
    env = dict(os.environ, FONTCONFIG_FILE=str(config), TEMP=str(work), TMP=str(work))
    def export(char):
        scad, stl = work / f'{ord(char)}.scad', work / f'{ord(char)}.stl'
        scad.write_text('$fn=64; linear_extrude(height=1) text(' + json.dumps(char) + ', size=100, font="Arimo:style=Regular", halign="left", valign="baseline");', encoding='utf-8')
        proc = subprocess.run([args.openscad, '--export-format', 'binstl', '-o', str(stl), str(scad)], capture_output=True, env=env, timeout=90, creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0))
        if proc.returncode:
            raise RuntimeError(proc.stderr.decode('utf-8', errors='replace'))
        mesh = trimesh.load_mesh(stl, process=True)
        if not mesh.is_watertight or mesh.volume <= 0:
            raise RuntimeError('Invalid glyph: ' + char)
        lo, hi = mesh.bounds
        # Keep each complete glyph in its pair's rectangular volume, including Q's tail.
        scale = 100 / float(hi[1] - lo[1])
        return char, dict(vertices=mesh.vertices.reshape(-1).tolist(), triangles=mesh.faces.reshape(-1).tolist(),
                          width=float(hi[0]-lo[0])*scale, bearing=-float(lo[0])*scale, scale=scale, lift=-float(lo[1])*scale)
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        glyphs = dict(pool.map(export, CHARS))
    result = dict(version=1, source='Arimo Regular / Google Fonts, OpenSCAD size=100, $fn=64; complete glyph height normalized to 100',
                  license='OFL-1.1', copyright='Copyright 2026 The Arimo Project Authors (https://github.com/googlefonts/arimo)',
                  fontSha256=hashlib.sha256(font.read_bytes()).hexdigest(),
                  doNotSplit='&/2345679CDEFGKPSQ', glyphs=glyphs)
    target = ROOT / 'frontend/prototype-v2/model-engine/glyphs.json'
    target.write_text(json.dumps(result, separators=(',', ':')), encoding='utf-8')
    print(json.dumps(dict(glyphs=len(glyphs), bytes=target.stat().st_size, font='Arimo', license='OFL-1.1')))

if __name__ == '__main__':
    main()
