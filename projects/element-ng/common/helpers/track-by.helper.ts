/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { TrackByFunction } from '@angular/core';

const trackByIdentity = <T>(index: number, item: T): any => item;

/**
 * Creates a trackByFunction for ngFor, that tracks an Item by its identity.
 * It should be used with a generic parameter, to generate a proper type:
 *
 * @example
 * ```ts
 * @Input() trackByFunction = buildTrackByIdentity<ItemType>()
 * ```
 * @deprecated use the new control-flow syntax
 */
export const buildTrackByIdentity = <T>(): TrackByFunction<T> => trackByIdentity;

const trackByIndex = (index: number): number => index;

/**
 * Creates a trackByFunction for ngFor, that tracks an Item by its index.
 * It should be used with a generic parameter, to generate a proper type:
 *
 * @example
 * ```
 * @Input() trackByFunction = buildTrackByIdentity<ItemType>()
 * ```
 * @deprecated use the new control-flow syntax
 */
export const buildTrackByIndex = <T>(): TrackByFunction<T> => trackByIndex;
