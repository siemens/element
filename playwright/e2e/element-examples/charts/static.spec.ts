/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { type StaticTestOptions, test } from '../../../support/test-helpers';

const options: StaticTestOptions = { delay: 1000, skipAriaSnapshot: true };

test('si-charts/cartesian/area-stacked', ({ si }) => si.static(options));
test('si-charts/cartesian/area', ({ si }) => si.static(options));
test('si-charts/cartesian/bar-basic', ({ si }) => si.static(options));
test('si-charts/cartesian/bar-line-combined', ({ si }) => si.static(options));
test('si-charts/cartesian/bar-stacked', ({ si }) => si.static(options));
test('si-charts/cartesian/candlestick', ({ si }) => si.static(options));
test('si-charts/cartesian/heatmap', ({ si }) => si.static(options));
test('si-charts/cartesian/line-axis-position', ({ si }) => si.static(options));
test('si-charts/cartesian/line-basic', ({ si }) => si.static(options));
test('si-charts/cartesian/line-live', ({ si }) => si.static(options));
test('si-charts/cartesian/scatter-basic', ({ si }) => si.static(options));
test('si-charts/cartesian/scatter-line-combined', ({ si }) => si.static(options));
test('si-charts/cartesian/scatter-live', ({ si }) => si.static(options));
test('si-charts/circle/donut', ({ si }) => si.static(options));
test('si-charts/circle/pie-basic', ({ si }) => si.static(options));
test('si-charts/circle/pie-custom', ({ si }) => si.static(options));
test('si-charts/circle/pie-label-formatter', ({ si }) => si.static(options));
test('si-charts/gauge/gauge-basic', ({ si }) => si.static(options));
test('si-charts/generic/generic-custom', ({ si }) => si.static(options));
test('si-charts/generic/generic', ({ si }) => si.static(options));
test('si-charts/interactive/interactive', ({ si }) => si.static(options));
test('si-charts/progress-bar/progress-bar', ({ si }) => si.static(options));
test('si-charts/progress/progress-220', ({ si }) => si.static(options));
test('si-charts/progress/progress-360', ({ si }) => si.static(options));
