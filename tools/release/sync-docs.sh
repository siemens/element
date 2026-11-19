#!/usr/bin/env bash

set -euo pipefail

SOURCE="$1"
DESTINATION="$2"

# Match the content-hash formats emitted by esbuild, MkDocs and webpack.
# Everything else, including main.js and styles.css, requires revalidation.
ESBUILD_HASH='[A-Z0-9][A-Z0-9][A-Z0-9][A-Z0-9][A-Z0-9][A-Z0-9][A-Z0-9][A-Z0-9]'
HEX_HASH_8='[0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f]'
HEX_HASH_10="${HEX_HASH_8}[0-9a-f][0-9a-f]"
HASHED_PATTERNS=(
  "*-${ESBUILD_HASH}.*"
  "*.${HEX_HASH_8}.*"
  "*.${HEX_HASH_10}.*"
  "*.${HEX_HASH_10}${HEX_HASH_10}.*"
)

HASHED_FILTERS=(--exclude "*")
MUTABLE_FILTERS=()
for pattern in "${HASHED_PATTERNS[@]}"; do
  HASHED_FILTERS+=(--include "$pattern")
  MUTABLE_FILTERS+=(--exclude "$pattern")
done

# Upload content-hashed assets first and cache them for a year as immutable.
# Retain older hashes so existing pages can still load their referenced assets.
# Sync leaves unchanged objects untouched in both passes.
aws s3 sync --quiet --no-progress \
  --cache-control "public, max-age=31536000, immutable" \
  "${HASHED_FILTERS[@]}" "$SOURCE" "$DESTINATION"

# Publish non-hashed files with mandatory revalidation and remove obsolete ones.
# Excluding hashed assets also protects them from deletion in this pass.
aws s3 sync --quiet --no-progress --delete \
  --cache-control "no-cache" \
  "${MUTABLE_FILTERS[@]}" "$SOURCE" "$DESTINATION"
