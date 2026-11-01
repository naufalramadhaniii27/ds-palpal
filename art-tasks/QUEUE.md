# QUEUE: every image still to make (v4, 2026-11-01)

One prompt runs this whole list. The same prompt may run in several Codex sessions at the same time: each session claims one batch, finishes it, then claims the next. MASTER.md stays the rule book for every batch.

## How a session works
1. Run MASTER.md steps 0 to 2 (identity, read tasks, sync art-batch and merge rescue branches).
2. Pick a batch: go down the ORDER list below and take the first batch that is not finished and not claimed.
   - Finished: art/PROGRESS.md has a "## <batch> v3" heading and every path of that batch file is listed under it (as a path line or a "NEEDS REVIEW: <path>" line).
   - Claimed: that heading exists, some paths are missing, and the line "CLAIM: <batch> <session> <UTC time>" directly above the heading is less than 3 hours old. A claim older than 3 hours, or a NEXT line, means the batch is free to resume.
3. Claim it: add (or refresh) the heading as in MASTER step 5 and put "CLAIM: <batch> <your session id> <UTC time like 20261101T0600>" directly above it (one CLAIM line per batch, replace an old one). Commit "<batch>: claim" and run the PUSH PROCEDURE at once, before the first image. If the rebase shows another session claimed the same batch less than 3 hours ago, drop your claim and pick again.
4. Make the batch exactly as MASTER steps 3 to 7 say (resume rules of step 8 apply to a batch that already has images). When it is done, delete its CLAIM and NEXT lines in the same "<batch>: done" commit.
5. Do not wait for the user between batches: go back to step 1 and claim the next one. Stop only when every batch in ORDER is finished, or on a usage or time limit (MASTER step 8, keep the CLAIM line so it expires on its own).
6. At the very end, report: batches finished by this session, images made, every NEEDS REVIEW path, the image model used.

## What the new batches (237 to 267) are for
The app still shows many small line icons drawn by code next to the painted icons, and some lists have entries with no picture. These batches replace them so every icon in the app is painted in one style:
- art/batch/icons/ui/: painted versions of the app's line icons (action types, spell areas and casting times, senses, speeds, item kinds, class resources, sheet tabs, builder steps and the like). They sit at 24 to 32 pixels, so one bold readable object each, no letters or numbers.
- art/batch/icons/library/: one icon per Library category.
- art/batch/icons/species/: one icon per species (an object from the culture, not a portrait).
- art/batch/icons/items/extra/: equipment and magic items that have no icon yet.
- art/batch/icons/features/extra/, bastion/, vehicles/, objects/: features, Bastion facilities, vehicles and siege objects without a picture.
- art/batch/creatures/extra/: creatures that have no picture at all.
These replace the old art-t4 plan (codex-t4-wave-1 to 9): do not make anything under art/t4/.

## ORDER
Unfinished older batches first (one image left in 057, 181, 213: check them first), then the new ones.
batch-162 batch-142 batch-186 batch-057 batch-181 batch-213 batch-128 batch-129 batch-131 batch-143 batch-158 batch-159 batch-161 batch-163 batch-164 batch-166 batch-167 batch-180 batch-182 batch-183 batch-184 batch-187 batch-188 batch-190 batch-191 batch-192 batch-193 batch-195 batch-196 batch-197
batch-237 batch-238 batch-239 batch-240 batch-241 batch-242 batch-243 batch-244 batch-245 batch-246 batch-247 batch-248 batch-249 batch-250 batch-251 batch-252 batch-253 batch-254 batch-255 batch-256 batch-257 batch-258 batch-259 batch-260 batch-261 batch-262 batch-263 batch-264 batch-265 batch-266 batch-267
