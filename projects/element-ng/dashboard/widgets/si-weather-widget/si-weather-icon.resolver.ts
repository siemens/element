/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Injectable } from '@angular/core';
import { TranslatableString } from '@siemens/element-translate-ng/translate';

import { SiWeatherIcon } from './si-weather-widget.types';

/**
 * Result returned by a {@link SiWeatherIconResolver}.
 */
export interface SiWeatherIconResolution {
  /** Resolved image URL. */
  src: string;
  /** Resolved alt text. The widget falls back to a sensible default. */
  alt?: TranslatableString;
}

/**
 * Maps a semantic {@link SiWeatherIcon} (condition, daytime, modifiers) to an
 * actual image URL.
 *
 * The library ships this resolver as an abstract token only and does not bundle
 * any weather image assets. Application developers MUST provide a concrete
 * implementation and register it as `providedIn: 'root'` (or via providers) so
 * that the weather widget can render illustrations.
 *
 * If no resolver is registered, the widget renders illustrations only when the
 * caller passes a direct {@link SiWeatherIcon.src}. Without either, no
 * illustration is shown.
 *
 * @example
 * ```ts
 * @Injectable({ providedIn: 'root' })
 * export class MyWeatherIconResolver extends SiWeatherIconResolver {
 *   override resolve(icon: SiWeatherIcon): SiWeatherIconResolution | null {
 *     // ...
 *   }
 * }
 * ```
 */
@Injectable()
export abstract class SiWeatherIconResolver {
  /**
   * Resolve a semantic icon descriptor to an actual image URL. Implementations
   * SHOULD return `null` for unknown or `'unknown'` conditions so the widget
   * can skip rendering the illustration.
   */
  abstract resolve(icon: SiWeatherIcon): SiWeatherIconResolution | null;
}
