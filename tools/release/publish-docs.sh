#!/usr/bin/env bash

set -euo pipefail

VERSIONED_BUCKET_NAME="$1"
DEPLOY_LATEST="$2"
MAJOR_VERSION="$3"

SITE_URL="https://element.siemens.io/"

if [[ "$DEPLOY_LATEST" == "true" ]]; then
  bash "$(dirname "$0")/sync-docs.sh" "pages/" "s3://${VERSIONED_BUCKET_NAME}/latest/"
  echo "$MAJOR_VERSION" > latest-version.txt
  aws s3 cp --cache-control "no-cache" latest-version.txt "s3://${VERSIONED_BUCKET_NAME}/latest-version.txt"
else
  bash "$(dirname "$0")/sync-docs.sh" "pages/" "s3://${VERSIONED_BUCKET_NAME}/$MAJOR_VERSION/"
fi

aws s3 cp --cache-control "no-cache" versions.json "s3://${VERSIONED_BUCKET_NAME}/versions.json"
