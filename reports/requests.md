# Requests to other parts

## Logic: Builder Apply drops Library additions (from UI/UX, T4)
- Library "Add" and "Buy" write entries to the sheet with `lib:1` (items in `C.inv`, spells in the spell list).
- Builder Apply replaces `C`. `manualLost` lists only attacks and resources, so `lib:1` entries vanish without a warning.
- Ask: carry `lib:1` entries over in Apply, or list them in `manualLost` so the user sees what is lost.
- Not changed here because Apply belongs to Logic.

## Art: latar Home versi lanskap (dari T10)
Latar Home di PC memakai `home-inn-phone` (potret, 1088 x 1920) dengan cover. Di layar 2x ia diperbesar sekitar 2,3x. Perlu `home-inn-pc` lanskap 2400 x 1344, gaya sama. Setelah ada, tambah ke `tools/art_pipeline.py` (blok g0) dan pakai di CSS Home untuk lebar di atas 760 px.
