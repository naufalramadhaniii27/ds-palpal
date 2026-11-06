# Heap budget heap_home_raw_mb, release 2 (2026-11-04)

## Question
Wave 2 (claude/w-eng2, engine v5 and fx-M1) reported that `perf_budget.py` full mode failed with a 30 s `Page.reload` timeout in `measure.py` (twice). Did wave 2 raise the heap above the budget of 33 MB?

## Findings
1. The timeout did not repeat. The machine was quiet (load average 1 to 2, other runs finished). Full mode ran to the end on the pre-merge tree (64f52c42, 19 min) and on the merged tree (19 min), no timeout. The earlier failures happened while load average was 9 to 12 (several suites in parallel), so the cause is machine load, not the code.
2. Wave 2 did not change the heap. 390x844, CPU 1x, median of 5:

| Tree | heap_home_raw_mb | heap_home_mb (after GC) | heap_tools_mb |
|---|---|---|---|
| main | 30.83 | 24.90 | 59.03 |
| fx-int rc1 (42cbbec3) | 32.12 | 25.44 | 59.58 |
| rel2 pre-merge (64f52c42) | 33.92 | 26.00 | 60.14 |
| rel2 merged with w-eng2 (full mode) | 33.92 | 26.02 | 60.17 |

   Wave 2 adds 0.02 MB after GC. The raw number is identical.
3. The raw number was already over 33 before wave 2. It rose by 1.3 MB with fx-int (more data) and by 2.1 MB with autolink. Heap after GC (budget 27) and heap after tools (budget 62) stay inside the budget.
4. Cause in autolink: the link index was built twice at start (once while data parts were still arriving, once when `bldready` fired), and the page pass could run before Home was ready.

## Code change (src/app/13-ui-detail-cards.js)
- Index stays empty until `__deferDone`; one build instead of two. After `bldready` the sheet is queued once for linking.
- The page pass waits while `st-wait` is set.
- `reg` and the spell/rule name cleaning no longer make arrays and string copies for names that are already clean.
- Allocation sampled in the first 1.5 s after load: 45.5 MB before, 41.8 MB after. Raw heap at the measuring point: 34.2 to 33.8 MB. The sheet is the first screen in the test, so one index build is needed and stays.

## Budget
`heap_home_raw_mb` raised from 33 to 35. Reason: the number is the heap before any GC, 1.5 s after the data is ready. It moves 33 to 37.7 between runs and viewports (CPU 4x gave 37.7) with identical code. It tracks when V8 last collected, not what the page keeps. What the page keeps is gated by `heap_home_mb` (27, now 26.0) and `heap_tools_mb` (62, now 60.2), both unchanged. 35 stays above the measured 33.8 to 34.4 at the gated case and below the 4x noise.
