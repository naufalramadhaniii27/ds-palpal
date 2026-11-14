# Heap home budget raised (0.0.23)

Valda 2014 subclasses (72 entries, about 260 KB of data) raised the home heap on 390x844 cpu1x.

| Measure | Before | After | Ceiling before | Ceiling now |
| --- | --- | --- | --- | --- |
| heap_home_mb | under 28 | 28.31 | 28 | 29 |
| heap_home_raw_mb | under 37 | 37.38 | 37 | 38 |

Cause: the tp16 data files load at start. Each new third-party book adds to home heap.
Open point (same as heap_tools): lazy-load third-party book data so it is read only when the book is turned on. Owner: Build tools. Not done here.
