#!/usr/bin/env bash

VERSIONED_BUCKET_NAME="$1"
DEPLOY_RELEASE="$2"
VERSION="${DEPLOY_RELEASE#v}"
MAJOR_VERSION="v${VERSION%%.*}"

echo "major_version=$MAJOR_VERSION" >> "$GITHUB_OUTPUT"

aws s3 cp "s3://${VERSIONED_BUCKET_NAME}/latest-version.txt" latest-version.txt || true

LATEST_VERSION=""
if [[ -f latest-version.txt ]]; then
  LATEST_VERSION=$(tr -d '\r\n' < latest-version.txt)
fi

DEPLOY_LATEST="false"

if [[ "${{ github.ref_name }}" == "${{ github.event.repository.default_branch }}" ]]; then
  DEPLOY_LATEST="true"
  if [[ -n "$LATEST_VERSION" && "$LATEST_VERSION" != "$MAJOR_VERSION" ]]; then
    aws s3 sync --quiet --no-progress --delete \
      "s3://${VERSIONED_BUCKET_NAME}/latest/" \
      "s3://${VERSIONED_BUCKET_NAME}/$LATEST_VERSION/"
  fi
elif [[ "$LATEST_VERSION" == "$MAJOR_VERSION" ]]; then
  DEPLOY_LATEST="true"
fi

echo "deploy_latest=$DEPLOY_LATEST" >> "$GITHUB_OUTPUT"
echo "latest=$LATEST_VERSION" >> "$GITHUB_OUTPUT"

aws s3 ls s3://${VERSIONED_BUCKET_NAME}/ | grep "PRE v" | awk '{print $2}' | sed 's/\/$//' | sed 's/^v//' > s3-versions.txt || true
