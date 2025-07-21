/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Config } from '@simpl/docs-composer';

export const config: Config = {
  include: [
    'projects/element-ng',
    'projects/charts-ng',
    'projects/dashboards-ng',
    'projects/native-charts-ng',
    'projects/element-translate-ng'
  ],
  typedocJson: 'src/assets/typedoc/**/docs.json',
  generate: {
    includeTypes: true,
    navPath: 'Components/API',
    deboostSearch: 0.25
  },
  build: {
    typedocExternalWarningsExceptions: ['@siemens/ngx-datatable'],
    typedocWarningsIgnoreFilter: ['echarts.', 'will not be copied to the output directory']
  },
  angular: true
};
