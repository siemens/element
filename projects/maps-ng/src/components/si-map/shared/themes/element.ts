/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ColorPalettes } from '../../models/color-palette.type';
import { MarkerStatusType } from '../../models/map-point.interface';

const getProp = (style: CSSStyleDeclaration, prop: string, defaultValue: string): string => {
  const val = style.getPropertyValue(prop).replace(/\s/g, ''); // trim all whitespaces
  return val ? val : defaultValue;
};

export const themeElement = {
  style: () => {
    const style = window.getComputedStyle(document.documentElement);
    const status: Record<MarkerStatusType, string> = {
      info: getProp(style, '--element-status-information', '#206ED9'), // $element-status-information / $siemens-blue-500
      success: getProp(style, '--element-status-success', '#1C703F'), // $element-status-success / $siemens-green-700
      warning: getProp(style, '--element-status-warning', '#C75300'), // $element-status-warning / $siemens-orange-700
      danger: getProp(style, '--element-status-danger', '#D72339'), // $element-status-danger / $siemens-red-500
      caution: getProp(style, '--element-status-caution', '#EDBF00'), // $element-status-caution / $siemens-yellow-500
      critical: getProp(style, '--element-status-critical', '#650011'), // $element-status-critical / $siemens-red-900
      default: getProp(style, '--element-ui-0', '#006b80'), // $element-ui-0 / $siemens-interactive-blue-500
      unknown: getProp(style, '--element-ui-3', '#9999a9') // $element-ui-3 / $siemens-deep-blue-400
    };

    return {
      fillColor: getProp(style, '--element-base-1', '#FFFFFF'), // $element-base-1 / $siemens-white
      strokeColor: getProp(style, '--element-base-1', '#FFFFFF'), // $element-base-1 / $siemens-white
      textColor: getProp(style, '--element-text-primary', '#000028'), // $element-text-primary / $siemens-deep-blue-900
      defaultMarkerColor: getProp(style, '--element-text-primary', '#000028'), // $element-text-primary / $siemens-deep-blue-900
      status,
      colorPalette: {
        status: [status.info, status.success, status.warning, status.danger],
        element: [
          getProp(style, '--siemens-red-500', '#D72339'), // $siemens-red-500
          getProp(style, '--siemens-orange-700', '#C75300'), // $siemens-orange-700
          getProp(style, '--siemens-yellow-300', '#FFD732'), // $siemens-yellow-300
          getProp(style, '--siemens-green-500', '#28BF66'), // $siemens-green-500
          getProp(style, '--siemens-blue-500', '#206ED9'), // $siemens-blue-500
          getProp(style, '--element-petrol', '#009999'), // $element-petrol
          getProp(style, '--siemens-deep-blue-500', '#7D8099') // $siemens-deep-blue-500
        ]
      } as ColorPalettes
    };
  }
};

export type ThemeType = ReturnType<typeof themeElement.style>;
