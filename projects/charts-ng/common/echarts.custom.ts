/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import * as echarts from 'echarts/core';
import { LegacyGridContainLabel } from 'echarts/features';
import { CanvasRenderer, SVGRenderer } from 'echarts/renderers';

// Global ECharts registration - MINIMAL setup
// All chart types and their required components are now registered in their specific component files
// This allows for optimal tree-shaking - only the chart types and features you actually use will be included in the bundle
echarts.use([
  // Renderers (required for ECharts to work)
  CanvasRenderer,
  SVGRenderer,

  // Features (required for legacy support)
  LegacyGridContainLabel
]);

export { echarts };
