/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
/* eslint-disable no-console */
import * as path from 'path';

import { main } from './index_npm_packages';

const packages = [
  'charts-ng',
  'element-ng',
  'element-translate-ng',
  'live-preview',
  'native-charts-ng',
  'dashboards-ng'
];

(async () => {
  const approveGolden = process.argv[2] === 'accept';
  const argvPackages = process.argv[3] ? process.argv[3].split(':') : undefined;

  const actualPackages = argvPackages ?? packages;

  const outdatedGoldens: string[] = [];
  for (const packageName of actualPackages) {
    console.log('Extracting API for package:', packageName);
    const outdated = await main(
      path.resolve(`api-goldens/${packageName}`),
      path.resolve(`dist/@siemens/${packageName}`),
      approveGolden,
      /ɵ/,
      []
    );
    outdatedGoldens.push(...outdated);
  }

  if (outdatedGoldens.length) {
    console.error(`The following goldens are outdated:`);
    outdatedGoldens.forEach(name => console.info(`-  ${name}`));
    console.info();
    console.info(
      `The goldens can be updated by running: "npm run api-goldens:build-accept"`
    );
    process.exitCode = 1;
  }
})();
