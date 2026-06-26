#!/usr/bin/env bash

# Publishes the documentation built from the main branch to the "development"
# path of the versioned S3 bucket and refreshes versions.json so that the
# "Development" entry stays on top of the version selector.

set -euo pipefail

VERSIONED_BUCKET_NAME="$1"

# Determine the current "latest" major version so the regenerated versions.json
# keeps pointing the root entry at the correct release.
aws s3 cp "s3://${VERSIONED_BUCKET_NAME}/latest-version.txt" latest-version.txt || true

LATEST_VERSION=""
if [[ -f latest-version.txt ]]; then
  LATEST_VERSION=$(tr -d '\r\n' < latest-version.txt)
fi

# Collect the existing released major versions from the bucket.
aws s3 ls "s3://${VERSIONED_BUCKET_NAME}/" | grep "PRE v" | awk '{print $2}' | sed 's/\/$//' | sed 's/^v//' > s3-versions.txt || true

# Generate versions.json. We are not deploying a release, so deploy_latest is
# false and the root entry falls back to the current latest version. The
# "Development" entry is always prepended by the script itself.
node tools/release/generate-versions.js "false" "" "$LATEST_VERSION"

# Publish the development documentation and the updated versions.json.
aws s3 sync --quiet --no-progress --delete "pages/" "s3://${VERSIONED_BUCKET_NAME}/development/"
aws s3 cp versions.json "s3://${VERSIONED_BUCKET_NAME}/versions.json"
