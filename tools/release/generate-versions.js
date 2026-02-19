import { readFileSync, writeFileSync } from 'node:fs';

const [, , deployLatestArg, majorVersionArg, latestFallbackArg] = process.argv;
const deployLatest = deployLatestArg === 'true';

const rawVersions = readFileSync('s3-versions.txt', 'utf8')
  .split(/\r?\n/)
  .map(line => line.trim())
  .filter(Boolean);

const payload = rawVersions
  .sort((a, b) => Number(b) - Number(a))
  .map(versionName => ({
    version: `v${versionName}`,
    title: `${versionName}.x`
  }));

if (deployLatest) {
  const numericTitle = majorVersionArg.replace(/^v/i, '');
  payload.unshift({ version: '', title: `${numericTitle}.x` });
} else {
  const numericTitle = latestFallbackArg.replace(/^v/i, '');
  payload.unshift({ version: '', title: `${numericTitle}.x` });
}

writeFileSync('versions.json', JSON.stringify(payload, null, 2));
