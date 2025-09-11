/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CHARTS_NG_MAPPINGS } from './charts-ng-mappings';
import { DASHBOARDS_NG_MAPPINGS } from './dashboards-ng-mappings';
import { ELEMENT_NG_MAPPINGS } from './element-ng-mappings';
import { ELEMENT_TRANSLATE_NG_MAPPINGS } from './element-translate-ng-mappings';
import { MAPS_NG_MAPPINGS } from './maps-ng-mappings';

/**
 * Helper function to find new import path specifically for component names
 */
export const findComponentImportPath = (
  symbolName: string,
  moduleSpecifier: string
): string | undefined => {
  const [, project, subPath] = moduleSpecifier.split('/');

  switch (project) {
    case 'element-ng': {
      // Special case for MenuItem from menu package as it has conflicting name with MenuItem from common package
      if (symbolName === 'MenuItem' && subPath === 'menu') {
        return '@siemens/element-ng/menu';
      }
      return ELEMENT_NG_MAPPINGS[symbolName];
    }
    case 'maps-ng':
      return MAPS_NG_MAPPINGS[symbolName];
    case 'dashboards-ng':
      return DASHBOARDS_NG_MAPPINGS[symbolName];
    case 'charts-ng':
      return CHARTS_NG_MAPPINGS[symbolName];
    case 'element-translate-ng':
      return ELEMENT_TRANSLATE_NG_MAPPINGS[symbolName];
    default:
      return undefined;
  }
};
