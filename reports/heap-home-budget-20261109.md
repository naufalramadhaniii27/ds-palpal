# Heap home budget 27 -> 28 MB (2026-11-09)

CI Job A, test perf_budget: `390x844 cpu1x.heap_home_mb 27.05 > 27`. The 1250x850 run gave 27.12.

Cause: the data of the PDFX work (item riders in fx-Z1.js, creature and PDF model code) is loaded at Home and added a little under 3 MB since the 24.8 MB of the 9.8 plan. The species and background long texts are not part of it: they sit in the builder files, which load lazily.

Change: `heap_home_mb` ceiling raised from 27 to 28 in tests/perf-budget.json. heap_home_raw_mb (35) and heap_tools_mb (62) are unchanged (61.4 and 61.5 measured).

Open point for UI/UX and Data: if the ceiling should go back to 27, move fx-Z1.js to the lazy part.
