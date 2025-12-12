/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { TitleComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { LegacyGridContainLabel } from 'echarts/features';
import { CanvasRenderer, SVGRenderer } from 'echarts/renderers';

echarts.use([
  // renderers
  CanvasRenderer,
  SVGRenderer,

  // core components used by all charts
  TitleComponent,
  TooltipComponent,

  // features
  LegacyGridContainLabel
]);

export { echarts };
