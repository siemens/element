/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ColorPalettes } from '../../models/color-palette.type';
import { MarkerStatusType } from '../../models/map-point.interface';

const getProp = (style: CSSStyleDeclaration, prop: string): string => {
  const val = style.getPropertyValue(prop).replace(/\s/g, ''); // trim all whitespaces
  return val ? val : '';
};

export const themeElement = {
  style: () => {
    const style = window.getComputedStyle(document.documentElement);
    const status: Record<MarkerStatusType, string> = {
      info: getProp(style, '--element-status-information'), // $element-status-information / $siemens-blue-500
      success: getProp(style, '--element-status-success'), // $element-status-success / $siemens-green-700
      warning: getProp(style, '--element-status-warning'), // $element-status-warning / $siemens-orange-700
      danger: getProp(style, '--element-status-danger'), // $element-status-danger / $siemens-red-500
      caution: getProp(style, '--element-status-caution'), // $element-status-caution / $siemens-yellow-500
      critical: getProp(style, '--element-status-critical'), // $element-status-critical / $siemens-red-900
      default: getProp(style, '--element-ui-0'), // $element-ui-0 / $siemens-interactive-blue-500
      unknown: getProp(style, '--element-ui-3') // $element-ui-3 / $siemens-deep-blue-400
    };

    return {
      fillColor: getProp(style, '--element-base-1'), // $element-base-1 / $siemens-white
      strokeColor: getProp(style, '--element-base-1'), // $element-base-1 / $siemens-white
      textColor: getProp(style, '--element-text-primary'), // $element-text-primary / $siemens-deep-blue-900
      defaultMarkerColor: getProp(style, '--element-text-primary'), // $element-text-primary / $siemens-deep-blue-900
      status,
      colorPalette: {
        status: [status.info, status.success, status.warning, status.danger],
        element: [
          getProp(style, '--element-data-red-2'), // $siemens-red-500
          getProp(style, '--element-data-orange-4'), // $siemens-orange-700
          getProp(style, '--element-status-caution'), // $siemens-yellow-300
          getProp(style, '--element-data-green-2'), // $siemens-green-500
          getProp(style, '--element-status-information'), // $siemens-blue-500
          getProp(style, '--element-petrol'), // $element-petrol
          getProp(style, '--element-data-17') // $siemens-deep-blue-500
        ]
      } as ColorPalettes
    };
  }
};

export type ThemeType = ReturnType<typeof themeElement.style>;
