/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

// NOTE: Do not export the Angular `SiEventBus` service (src/services/si-event-bus.ts) from here.
// It must be exported from the main entry point.
// This entry point exists so that non-Angular widgets (plain JS/TS, React, Vue, etc.) can
// use the event bus without pulling in any Angular dependency.
// The implementation class is intentionally not exported, consumers depend on `SiEventBusApi`.
export type {
  SiDefaultEventMap,
  SiEmitOptions,
  SiEvent,
  SiEventBusApi,
  SiEventBusOptions,
  SiEventMap,
  SiEventPattern,
  SiEventType,
  SiEventTypeOf,
  SiResolvedEventMap
} from './si-event-bus.model';
export * from './si-event-bus.util';
