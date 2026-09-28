/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { testMap } from '../../../support/maptiler-mock';
import { type StaticTestOptions } from '../../../support/test-helpers';

// To iron out platform differences.
const options: StaticTestOptions = { maxDiffPixels: 10 };

testMap('si-map/si-map-custom-popover-onhover', ({ si }) => si.static(options));
testMap('si-map/si-map-custom-popover', ({ si }) => si.static(options));
testMap('si-map/si-map-custom-style', ({ si }) => si.static(options));
testMap('si-map/si-map-custom-zoom-levels', ({ si }) => si.static(options));
testMap('si-map/si-map-default-style', ({ si }) => si.static(options));
testMap('si-map/si-map-grouping', ({ si }) => si.static(options));
testMap.fixme('si-map/si-map-labels', ({ si }) => si.static(options));
