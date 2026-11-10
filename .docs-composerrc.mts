/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
export const config = {
  include: [
    { packageDir: 'projects/element-ng' },
    { packageDir: 'projects/charts-ng' },
    { packageDir: 'projects/dashboards-ng' },
    {
      packageDir: 'projects/native-charts-ng',
      publicEntrypoint: 'docs.ts'
    },
    { packageDir: 'projects/element-translate-ng' },
    { packageDir: 'projects/maps-ng' }
  ],
  typedocJson: 'src/assets/typedoc/**/docs.json',
  generate: {
    includeTypes: true,
    navPath: 'Components/API',
    deboostSearch: 0.25
  },
  build: {
    typedocExternalWarningsExceptions: ['@siemens/ngx-datatable'],
    typedocWarningsIgnoreFilter: ['echarts.', 'will not be copied to the output directory'],
    demoPath: 'element-examples/index.html',
    stripWrapperFunctionDefaultValueTypes: ['TranslatableString']
  },
  angular: true
};
