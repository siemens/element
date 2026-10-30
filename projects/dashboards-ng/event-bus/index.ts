/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

// NOTE: Do not export the Angular `SiEventBus` service (src/services/si-event-bus.ts) from here.
// It must be exported from the main entry point.
// This entry point exists so that non-Angular widgets (plain JS/TS, React, Vue, etc.) can
// import `getEventBusInstance` without pulling in any Angular dependency.
// The implementation class is intentionally not exported, consumers depend on `SiEventBusApi`.
export type { SiEventBusApi, SiEventType } from './si-event-bus.model';
export * from './si-event-bus.util';
