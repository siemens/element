#!/usr/bin/env bash

VERSIONED_BUCKET_NAME="$1"
DEPLOY_LATEST="$2"
MAJOR_VERSION="$3"

SITE_URL="https://element.siemens.io/"

if [[ "$DEPLOY_LATEST" == "true" ]]; then
  aws s3 sync --quiet --no-progress --delete "pages/" "s3://${VERSIONED_BUCKET_NAME}/latest/"
  echo "$MAJOR_VERSION" > latest-version.txt
  aws s3 cp latest-version.txt "s3://${VERSIONED_BUCKET_NAME}/latest-version.txt"
else
  aws s3 sync --quiet --no-progress --delete "pages/" "s3://${VERSIONED_BUCKET_NAME}/$MAJOR_VERSION/"
fi

aws s3 cp versions.json s3://${VERSIONED_BUCKET_NAME}/versions.json
