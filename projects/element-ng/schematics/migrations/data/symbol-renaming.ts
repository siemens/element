/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
export interface SymbolRenamingInstruction {
  module: RegExp;
  toModule?: string;
  symbolRenamings: { replace: string; replaceWith: string }[];
}

export const SYMBOL_RENAMING_MIGRATION: SymbolRenamingInstruction[] = [
  // v48 to v49
  {
    module: /@(siemens|simpl)\/dashboards-ng/,
    symbolRenamings: [{ replace: 'CONFIG_TOKEN', replaceWith: 'SI_DASHBOARD_CONFIGURATION' }]
  },
  {
    module: /@(siemens|simpl)\/element-ng(\/toast-notification)?/,
    symbolRenamings: [{ replace: 'ToastStateName', replaceWith: 'StatusType' }],
    toModule: '@siemens/element-ng/common'
  },
  {
    module: /@(siemens|simpl)\/element-ng(\/(info-page|unauthorized-page))?/,
    symbolRenamings: [
      { replace: 'SiUnauthorizedPageComponent', replaceWith: 'SiInfoPageComponent' }
    ],
    toModule: '@siemens/element-ng/info-page'
  },
  {
    module: /@siemens\/charts-ng/,
    symbolRenamings: [
      { replace: 'SimplChartsNgModule', replaceWith: 'SiChartsNgModule' },
      { replace: 'SimplSeriesOption', replaceWith: 'SiSeriesOption' },
      { replace: 'SimplLineSeriesOption', replaceWith: 'SiLineSeriesOption' },
      { replace: 'SimplBarSeriesOption', replaceWith: 'SiBarSeriesOption' },
      { replace: 'SimplHeatmapSeriesOption', replaceWith: 'SiHeatmapSeriesOption' },
      { replace: 'SimplScatterSeriesOption', replaceWith: 'SiScatterSeriesOption' },
      { replace: 'SimplCandlestickSeriesOption', replaceWith: 'SiCandlestickSeriesOption' }
    ]
  },
  {
    module: /@siemens\/live-preview/,
    symbolRenamings: [
      { replace: 'SimplLivePreviewRoutingModule', replaceWith: 'SiLivePreviewRoutingModule' },
      { replace: 'SimplLivePreviewModule', replaceWith: 'SiLivePreviewModule' }
    ]
  },
  {
    module: /@siemens\/maps-ng/,
    symbolRenamings: [{ replace: 'SimplMapsNgModule', replaceWith: 'SiMapsNgModule' }]
  },
  {
    module: /@siemens\/native-charts-ng/,
    symbolRenamings: [
      { replace: 'SimplNativeChartsNgModule', replaceWith: 'SiNativeChartsNgModule' }
    ]
  }
];
