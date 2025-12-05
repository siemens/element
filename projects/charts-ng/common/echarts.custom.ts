/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import * as echarts from 'echarts/core';
import { LegacyGridContainLabel } from 'echarts/features';
import { CanvasRenderer, SVGRenderer } from 'echarts/renderers';

echarts.use([
  // renderers
  CanvasRenderer,
  SVGRenderer,

  // features
  LegacyGridContainLabel
]);

export { echarts };
