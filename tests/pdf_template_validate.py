"""Validate saved form values against widgets and render every page for visual QA.

python tests/pdf_template_validate.py tests/out/pdf-template/1250-app.pdf
Requires pypdf, pypdfium2 and Pillow. Does not modify the PDF.
"""
import pathlib
import sys
from pypdf import PdfReader
import pypdfium2 as pdfium
from PIL import Image, ImageOps, ImageDraw

source = pathlib.Path(sys.argv[1])
reader = PdfReader(source)
fields = reader.get_fields()
widgets = 0
for page in reader.pages:
    for ref in page.get('/Annots', []).get_object():
        widget = ref.get_object()
        if widget.get('/Subtype') != '/Widget':
            continue
        widgets += 1
        field = widget
        while not field.get('/T') and field.get('/Parent'):
            field = field['/Parent']
        name = field['/T']
        assert name in fields, ('Widget absent from canonical tree', name)
        value = widget.get('/V', field.get('/V'))
        assert value == fields[name].get('/V'), ('Canonical/widget values disagree', name)
        if field.get('/FT') == '/Tx':
            assert widget.get('/AP') and widget['/AP'].get('/N'), ('Missing appearance', name)
        elif field.get('/FT') == '/Btn' and not (int(field.get('/Ff', 0)) & (1 << 16)):
            assert widget.get('/AS') == value, ('Checkbox state mismatch', name)
        assert '/A' not in widget and '/AA' not in widget

out = source.parent / (source.stem + '-render')
out.mkdir(exist_ok=True)
document = pdfium.PdfDocument(source)
document.init_forms()
thumbnails = []
for i in range(len(document)):
    image = document[i].render(scale=1.5, draw_annots=True).to_pil()
    image.save(out / ('page-%02d.png' % (i + 1)))
    thumb = ImageOps.contain(image, (306, 396))
    tile = Image.new('RGB', (326, 425), '#e6e6e6')
    tile.paste(thumb, (10, 10))
    ImageDraw.Draw(tile).text((10, 409), 'Page %d' % (i + 1), fill='black')
    thumbnails.append(tile)
cols = min(3, len(thumbnails))
contact = Image.new('RGB', (cols * 326, ((len(thumbnails) + cols - 1) // cols) * 425), 'white')
for i, tile in enumerate(thumbnails):
    contact.paste(tile, ((i % cols) * 326, (i // cols) * 425))
contact.save(out / 'overview.png')
print('%d pages, %d canonical fields, %d widgets: values and appearances verified' % (len(document), len(fields), widgets))
