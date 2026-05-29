/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

// NOTE: Do not export si-event-bus.ts from here. It must be exported from the main entry point.
// This entry point exists so that non-Angular widgets (plain JS/TS, React, Vue, etc.) can
// import `getEventBusInstance` without pulling in any Angular dependency.
export * from './si-event-bus.base';
export * from './si-event-bus.util';
