#!/bin/sh
# Cloudflare Pages build: copy only the built site into dist/. Source, tests (with the sample character), reports and notes stay out.
# Pages settings: build command "sh tools/pages_dist.sh", output directory "dist".
set -e
cd "$(dirname "$0")/.."
rm -rf dist
mkdir dist
cp index.html sw.js manifest.webmanifest _headers dist/
cp -R img icons vendor data dist/
# Split form for hosting: the deferred parts become p/NAME.HASH.js files (tools/split_dist.py, Python standard library only). The single-file
# index.html in the project root stays the result of the project. A failure here stops the build, so a broken split never goes live.
python3 tools/split_dist.py index.html sw.js dist
# Functions run only for /api/*. Every other path is a static file, so the app itself never costs a Worker request
printf '{"version":1,"include":["/api/*"],"exclude":[]}\n' > dist/_routes.json
echo "dist ready: $(find dist -type f | wc -l) files"
