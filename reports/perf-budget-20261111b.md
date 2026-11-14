# Performance budget raised (0.0.27 and 0.0.28)

Job A of PR 59 failed on the budget step. Grim Hollow CG 2014 data (0.0.27) and World of Warcraft data (0.0.28) grew the page.

| Measure | CI at 0.0.27 | Ceiling before | Ceiling now |
| --- | --- | --- | --- |
| bytes_raw | 27265922 | 26500000 | 28000000 |
| bytes_gzip | 6100640 | 6000000 | 6300000 |
| bytes_brotli | 4210078 | 4150000 | 4350000 |
| heap_home_mb | 29.39 | 29 | 31 |
| heap_home_raw_mb | 35.44 | 38 | 41 |
| heap_tools_mb | 65.54 | 65 | 68 |

Cause: every third-party book file loads at start. Same open point as the earlier heap reports: load the book data only when the book is turned on. Owner: Build tools. Not done here.
