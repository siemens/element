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
  // v49 to v51
  {
    module: /^@(siemens|simpl)\/element-ng\/application-header$/,
    symbolRenamings: [
      {
        replace: 'SiHeaderSiemensLogoComponent',
        replaceWith: 'SiHeaderLogoDirective'
      }
    ]
  },
  {
    module: /@siemens\/element-ng\/icon-status$/,
    toModule: '@siemens/element-ng/status-counter',
    symbolRenamings: [{ replace: 'SiIconStatusComponent', replaceWith: 'SiStatusCounterComponent' }]
  }
];
