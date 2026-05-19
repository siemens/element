/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inject, Injectable } from '@angular/core';
import { TranslatableString } from '@siemens/element-translate-ng/translate';

import { SiWeatherCondition, SiWeatherIcon } from './si-weather-widget.types';

/**
 * Result returned by a {@link SiWeatherIconResolver}. Implementations should
 * return either {@link icon} (rendered via `<si-icon>`) or {@link src}
 * (rendered as a plain `<img>`). When both are present, {@link icon} wins.
 */
export interface SiWeatherIconResolution {
  /** Resolved Element icon name (e.g. `"element-sun"`). Rendered via `<si-icon>`. */
  icon?: string;
  /** Resolved image URL. Rendered as a plain `<img>`. */
  src?: string;
  /** Resolved alt text. The widget falls back to a sensible default. */
  alt?: TranslatableString;
}

/**
 * Maps a semantic {@link SiWeatherIcon} to a renderable illustration. The
 * library ships a {@link SiDefaultWeatherIconResolver} that maps the built-in
 * {@link SiWeatherCondition} vocabulary to Element icons, so the widget renders
 * a reasonable illustration out of the box. Applications can override the
 * mapping or add provider-specific vocabularies by registering their own
 * resolver:
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
 *
 * Resolvers SHOULD return `null` for unknown or `'unknown'` conditions so the
 * widget can skip the illustration.
 */
@Injectable({
  providedIn: 'root',
  useFactory: () => inject(SiDefaultWeatherIconResolver)
})
export abstract class SiWeatherIconResolver {
  abstract resolve(icon: SiWeatherIcon): SiWeatherIconResolution | null;
}

const DEFAULT_CONDITION_ICONS: Record<SiWeatherCondition, string | null> = {
  clear: 'element-sun',
  clouds: 'element-cloudy',
  rain: 'element-rain',
  storm: 'element-storm',
  wind: 'element-wind',
  unknown: null
};

/**
 * Built-in resolver that maps the library's minimal
 * {@link SiWeatherCondition} vocabulary to Element icons:
 *
 * - `clear` → `element-sun`
 * - `clouds` → `element-cloudy`
 * - `rain` → `element-rain`
 * - `storm` → `element-storm`
 * - `wind` → `element-wind`
 * - `unknown` → no illustration
 *
 * Unknown tokens fall through to `null` so callers can register a more
 * capable resolver without losing the built-in fallback.
 */
@Injectable({ providedIn: 'root' })
export class SiDefaultWeatherIconResolver extends SiWeatherIconResolver {
  override resolve(icon: SiWeatherIcon): SiWeatherIconResolution | null {
    if (!icon.condition) {
      return null;
    }
    const mapped = DEFAULT_CONDITION_ICONS[icon.condition as SiWeatherCondition];
    if (!mapped) {
      return null;
    }
    return { icon: mapped, alt: icon.alt };
  }
}
