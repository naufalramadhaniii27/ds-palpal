# Fillable 5E PDF export

The existing PDF button now fills `vendor/pdf/5e-character-sheet-fillable.pdf`,
the user's supplied three-page 5E AcroForm. Its original artwork and US Letter
page size are preserved. Values are real text and fields remain editable.

`src/app/37-ui-pdf-export-hold-slide-confirm.js` captures the open character,
derived statistics, live HP/resources, customized attacks, inventory, notes,
spellcasting and portrait. `src/app/lib/pdf-template.js` maps that snapshot to
the original field names. The generated layout JSON records canonical fields
and their page rectangles; spell rows are grouped by position, not their
misleading numerical names. The field named `SlotsRemaining` is filled with
spent slots because the artwork labels it **SLOTS EXPENDED**. Pact slots remain
separate in the resources continuation rather than being merged into ordinary
spell slots. Multiclass/per-spell casting numbers are retained in spell details.

Text fits at readable sizes; overflow continues on additional editable pages.
All notes and features are retained rather than clipped in scrollable fields.
The original three-page layout is always present, including an empty spell
page for non-casters. Standard ability score and modifier positions follow the
supplied template. Checkbox appearances use dots over its printed circles.

pdf-lib 1.17.1 and @pdf-lib/fontkit 1.1.1 are vendored alongside the template,
field map, and a TTF converted from the app's existing Archivo Narrow font.
No runtime dependency install, CDN, or server-side export is required. Existing
deployment packaging already copies `vendor/`. The service worker caches assets
after their first successful use, enabling subsequent exports after an offline
reload. A first-ever export needs access to those assets. Template Acrobat image
import actions are removed; portrait images are embedded directly when loadable.
If export/save fails, the existing print-dialog recovery path remains.

Preparation (only when deliberately replacing the template):

```
python -m pip install pypdf fonttools brotli
python tools/prepare_pdf_template.py /path/to/5E_CharacterSheet_Fillable.pdf
python build.py --vendor-update
python build.py
python build.py --check
```

On Windows `ESBUILD_BINARY_PATH` can point to the native `esbuild.exe`.
The template's original personal-use notice is retained in the PDF.

Validation:

* `node tests/pdf_template.mjs`: canonical values, proficiency/death-save checks,
  spell-level mapping, spell overflow, long features/notes, and appearance streams.
* `node tests/pdf_template_browser.cjs` (requires Playwright): actual PDF button,
  values compared with live derived data, phone/desktop viewports, no external
  requests, and repeat export following an offline reload. `PDF_TEST_BROWSER`
  optionally selects an installed Chromium executable.
* Render with forms initialized to review the editable widgets (for example,
  `pypdfium2.PdfDocument(...).init_forms()` before page rendering).

Verified on this branch: build/check (260 source pieces and 44 script blocks),
vendor integrity, field/overflow tests, and phone/desktop online plus offline
reload exports. The sample character exports to six pages, including its
continuations. Reopened output has 342 canonical fields and 344 widgets with
matching values and appearance streams. All six pages were rendered and reviewed.

The build checker now checks bundled module blocks rather than concatenating
raw module scopes, which previously produced four false duplicate-binding
errors. Dependency guards report no new violations. The size guard still reports
an existing one-branch baseline mismatch in `src/fx/27-blend-sheet.js`; that file
is byte-for-byte identical to the starting commit and its baseline is unchanged.
