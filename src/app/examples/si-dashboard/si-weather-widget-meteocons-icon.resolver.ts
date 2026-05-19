/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Injectable } from '@angular/core';
import {
  SiWeatherIcon,
  SiWeatherIconResolution,
  SiWeatherIconResolver
} from '@siemens/element-ng/dashboard';

/**
 * Maps the built-in {@link SiWeatherCondition} tokens to static SVG
 * illustrations served from the `@meteocons/svg-static` package (MIT). The
 * package is wired up via `angular.json` so that its `fill/*.svg` files are
 * exposed under `/assets/meteocons/` at runtime.
 */
const METEOCONS_BY_CONDITION: Record<string, string> = {
  clear: 'clear-day',
  clouds: 'cloudy',
  rain: 'rain',
  storm: 'thunderstorms',
  wind: 'wind',
  unknown: 'not-available'
};

@Injectable()
export class SiWeatherWidgetMeteoconsIconResolver extends SiWeatherIconResolver {
  override resolve(icon: SiWeatherIcon): SiWeatherIconResolution | null {
    const file = icon.condition ? METEOCONS_BY_CONDITION[icon.condition] : undefined;
    if (!file) {
      return null;
    }
    return { src: `assets/meteocons/${file}.svg`, alt: icon.condition };
  }
}
