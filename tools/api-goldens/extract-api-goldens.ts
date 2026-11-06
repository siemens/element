/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
/* eslint-disable no-console */
import { parseArgs } from 'node:util';
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
  const { values } = parseArgs({
    options: {
      test: { type: 'boolean', default: false },
      accept: { type: 'boolean', default: false },
      'doc-model': { type: 'boolean', default: false },
      packages: { type: 'string' }
    }
  });
  if (values.test && values.accept) {
    throw new Error('Use either --test or --accept, not both.');
  }
  if (!values.test && !values.accept && !values['doc-model']) {
    throw new Error('Specify at least one operation: --test, --accept, or --doc-model.');
  }
  const actualPackages = values.packages?.split(':') ?? packages;

  const outdatedGoldens: string[] = [];
  for (const packageName of actualPackages) {
    console.log('Extracting API for package:', packageName);
    const outdated = await main(
      values.test || values.accept ? path.resolve(`api-goldens/${packageName}`) : undefined,
      path.resolve(`dist/@siemens/${packageName}`),
      values.accept,
      /^ɵ|^SiTranslatableKeys$/,
      [],
      values['doc-model'] ? path.resolve(`dist/api-docs/${packageName}`) : undefined
    );
    outdatedGoldens.push(...outdated.map(file => `${packageName}/${file}`));
  }

  if (outdatedGoldens.length) {
    console.error(`The following goldens are outdated:`);
    outdatedGoldens.forEach(name => console.info(`-  ${name}`));
    console.info();
    console.info(
      `The goldens can be updated by running: "pnpm api-goldens:build-accept"`
    );
    process.exitCode = 1;
  }
})();
