#!/bin/sh
# Cloudflare Pages build: copy only the built site into dist/. Source, tests (with the sample character), reports and notes stay out.
# Pages settings: build command "sh tools/pages_dist.sh", output directory "dist".
set -e
cd "$(dirname "$0")/.."
rm -rf dist
mkdir dist
cp index.html sw.js manifest.webmanifest _headers dist/
cp -R img icons dist/
echo "dist ready: $(find dist -type f | wc -l) files"
