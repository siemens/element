/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
export interface CustomLegend {
  customLegends: [
    {
      list: CustomLegendItem[];
      unit?: string;
    },
    {
      list: CustomLegendItem[];
      unit?: string;
    }
  ];
  legendAxis: string;
  top?: number | string;
  gridIndex?: number;
}

export interface CustomLegendItem {
  name: string;
  alternativeNaming?: boolean; // is used to handle custom legend hovering properly
  displayName?: string;
  color?: string;
  selected: boolean;
  tooltip?: string;
  symbol?: string;
}

export interface CustomLegendProps {
  displayName?: string;
  unit?: string;
  tooltip?: string;
}
