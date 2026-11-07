"""Install the user-supplied 5E form and extract a reviewed field layout.

Usage: python tools/prepare_pdf_template.py /path/to/5E_CharacterSheet_Fillable.pdf
Requires pypdf only for this one-time preparation; exports run entirely in-browser.
"""
import base64
import json
import pathlib
import re
import shutil
import sys
from pypdf import PdfReader
from fontTools.ttLib import TTFont
import io

ROOT = pathlib.Path(__file__).resolve().parents[1]
source = pathlib.Path(sys.argv[1])
reader = PdfReader(source)
fields = reader.get_fields()
layout = []
refs = {f.indirect_reference.idnum for f in fields.values() if getattr(f, 'indirect_reference', None)}
for i, page in enumerate(reader.pages):
    for ref in page.get('/Annots', []).get_object():
        widget = ref.get_object()
        if widget.get('/Subtype') != '/Widget':
            continue
        field = widget
        while not field.get('/T') and field.get('/Parent'):
            field = field['/Parent']
        name = field.get('/T')
        if not name or name not in fields:
            raise ValueError('Orphaned/unnamed widget: inspect template before integrating')
        if ref.idnum not in refs and not widget.get('/Parent'):
            raise ValueError('Ambiguous widget/field tree: ' + name)
        if not any(x['name'] == name for x in layout):
            layout.append({'name': name, 'page': i, 'rect': list(map(float, widget['/Rect'])), 'type': str(field.get('/FT'))})
assert len(layout) == len(fields), 'Template contains non-widget fields'
out = ROOT / 'vendor/pdf'
shutil.copyfile(source, out / '5e-character-sheet-fillable.pdf')
(out / '5e-character-sheet-fields.json').write_text(json.dumps(layout, indent=2) + '\n')
css = (ROOT / 'src/css/00-fonts.css').read_text(encoding='utf-8')
# Reuse the app's existing Archivo Narrow font, avoiding platform fonts or CDN requests.
font = re.search(r"font-family:'Archivo Narrow'.*?base64,([^)]*)", css, re.S).group(1).rstrip("'\"")
ttf = TTFont(io.BytesIO(base64.b64decode(font)))
ttf.flavor = None
ttf.save(out / 'archivo-narrow.ttf')
print('Installed template:', len(reader.pages), 'pages,', len(layout), 'canonical fields/widgets')
