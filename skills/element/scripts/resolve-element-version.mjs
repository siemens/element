#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const DOCUMENTATION_ORIGIN = 'https://element.siemens.io';
const VERSIONS_URL = `${DOCUMENTATION_ORIGIN}/versions.json`;
const ELEMENT_PACKAGES = [
  '@siemens/element-ng',
  '@siemens/dashboards-ng',
  '@siemens/charts-ng',
  '@siemens/maps-ng',
  '@siemens/element-translate-ng',
  '@siemens/element-theme',
  '@siemens/element-icons'
];
const DEPENDENCY_SECTIONS = ['dependencies', 'devDependencies', 'peerDependencies'];

async function readProjectVersion() {
  const packageJsonPath = resolve('package.json');
  let packageJson;

  try {
    packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return undefined;
    }
    throw new Error(`Unable to read ${packageJsonPath}: ${error.message}`);
  }

  for (const packageName of ELEMENT_PACKAGES) {
    for (const section of DEPENDENCY_SECTIONS) {
      const version = packageJson[section]?.[packageName];

      if (typeof version === 'string') {
        return version;
      }
    }
  }

  return undefined;
}

function extractMajor(version) {
  const match = version?.match(/(?:^|[~^<>=\s])v?(\d+)(?:\.|$)/);
  return match ? Number(match[1]) : undefined;
}

async function createDocumentationUrl(elementVersion) {
  const elementMajor = extractMajor(elementVersion);
  const response = await fetch(VERSIONS_URL);

  if (!response.ok) {
    throw new Error(`Unable to fetch ${VERSIONS_URL}: HTTP ${response.status}`);
  }

  const versions = await response.json();

  const developmentVersion = versions.find(v => v.title === 'Development');
  const latestVersion = versions.find(v => v.version === '');

  const matchedVersion =
    elementMajor === undefined
      ? latestVersion
      : versions.find(v => v.title === `${elementMajor}.x`);

  const selectedVersion = matchedVersion ?? latestVersion ?? developmentVersion;

  // TODO: Remove this fallback once the updated llms.txt is available in latest.
  const documentationVersion = selectedVersion?.version || developmentVersion?.version;

  if (documentationVersion === undefined) {
    throw new Error(`No Element documentation found in ${VERSIONS_URL}.`);
  }

  const versionPath = documentationVersion ? `${documentationVersion}/` : '';
  return `${DOCUMENTATION_ORIGIN}/${versionPath}llms.txt`;
}

async function main() {
  const elementVersion = process.argv[2] ?? (await readProjectVersion());
  process.stdout.write(`${await createDocumentationUrl(elementVersion)}\n`);
}

main().catch(error => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
