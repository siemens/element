/**
 * Copyright (c) Siemens 2016 - 2026
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
      info: getProp(style, '--si-sys-color-background-information'),
      success: getProp(style, '--si-sys-color-background-success'),
      warning: getProp(style, '--si-sys-color-background-warning'),
      danger: getProp(style, '--si-sys-color-background-danger'),
      caution: getProp(style, '--si-sys-color-background-caution'),
      critical: getProp(style, '--si-sys-color-background-critical'),
      default: getProp(style, '--si-sys-color-background-accent'),
      unknown: getProp(style, '--si-sys-color-background-neutral')
    };

    return {
      fillColor: getProp(style, '--si-sys-color-background-1'),
      strokeColor: getProp(style, '--si-sys-color-background-1'),
      textColor: getProp(style, '--si-sys-color-text-primary'),
      defaultMarkerColor: getProp(style, '--si-sys-color-text-primary'),
      status,
      colorPalette: {
        status: [status.info, status.success, status.warning, status.danger],
        element: [
          getProp(style, '--si-sys-color-data-sequential-red-2'),
          getProp(style, '--si-sys-color-data-sequential-orange-4'),
          getProp(style, '--si-sys-color-background-caution'),
          getProp(style, '--si-sys-color-data-sequential-green-2'),
          getProp(style, '--si-sys-color-background-information'),
          getProp(style, '--si-sys-color-data-categorical-1'),
          getProp(style, '--si-sys-color-data-categorical-17')
        ]
      } as ColorPalettes
    };
  }
};

export type ThemeType = ReturnType<typeof themeElement.style>;
