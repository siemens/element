/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 *
 * Demo implementation of `SiWeatherIconResolver` that maps semantic weather
 * condition tokens to the Element-style monochrome SVG icon set bundled in
 * this demo app under `assets/weather-icons/`.
 *
 * This resolver lives in the dashboards-demo on purpose: the Element library
 * itself does not ship any weather icon assets. Application developers should
 * provide their own implementation.
 */
import { Injectable } from '@angular/core';
import {
  SiWeatherCondition,
  SiWeatherIcon,
  SiWeatherIconResolution,
  SiWeatherIconResolver
} from '@siemens/element-ng/dashboard';

const CONDITION_TO_BASE: Partial<Record<SiWeatherCondition, string>> = {
  // Minimal
  clear: 'clear',
  clouds: 'cloudy',
  rain: 'rain',
  snow: 'snow',
  storm: 'tstorm',
  fog: 'fog',
  // Compact
  sunny: 'sunny',
  fair: 'fair',
  'partly-cloudy': 'pcloudy',
  'mostly-cloudy': 'mcloudy',
  cloudy: 'cloudy',
  drizzle: 'drizzle',
  'heavy-rain': 'rain',
  thunderstorm: 'tstorms',
  sleet: 'sleet',
  blizzard: 'blizzard',
  hail: 'sleet',
  windy: 'wind',
  hot: 'hot',
  cold: 'cold',
  // Full
  'mostly-clear': 'fair',
  'light-rain': 'drizzle',
  showers: 'showers',
  'rain-showers': 'showers',
  'freezing-rain': 'freezingrain',
  'freezing-drizzle': 'fdrizzle',
  'light-snow': 'flurries',
  'snow-showers': 'snowshowers',
  'heavy-snow': 'snow',
  'blowing-snow': 'blowingsnow',
  flurries: 'flurries',
  'rain-and-snow': 'rainandsnow',
  'snow-to-rain': 'snowtorain',
  'rain-to-snow': 'raintosnow',
  'wintry-mix': 'wintrymix',
  mist: 'fog',
  haze: 'hazy',
  smoke: 'smoke',
  dust: 'dust',
  unknown: 'na'
};

const KNOWN_ASSETS = new Set<string>([
  'blizzard', 'blizzardn',
  'blowingsnow', 'blowingsnown',
  'clear', 'clearn', 'clearw', 'clearwn',
  'cloudy', 'cloudyn', 'cloudyw', 'cloudywn',
  'cold', 'coldn',
  'drizzle', 'drizzlef', 'drizzlen',
  'dust', 'dustn',
  'fair', 'fairn',
  'fdrizzle', 'fdrizzlen',
  'flurries', 'flurriesn', 'flurriesw', 'flurrieswn',
  'fog', 'fogn',
  'freezingrain', 'freezingrainn',
  'hazy', 'hazyn',
  'hot',
  'mcloudy', 'mcloudyn', 'mcloudyr', 'mcloudyrn', 'mcloudyrw', 'mcloudyrwn',
  'mcloudys', 'mcloudysf', 'mcloudysfn', 'mcloudysfw', 'mcloudysfwn',
  'mcloudysn', 'mcloudysw', 'mcloudyswn',
  'mcloudyt', 'mcloudytn', 'mcloudytw', 'mcloudytwn',
  'mcloudyw', 'mcloudywn',
  'na',
  'pcloudy', 'pcloudyn', 'pcloudyr', 'pcloudyrn', 'pcloudyrw', 'pcloudyrwn',
  'pcloudys', 'pcloudysf', 'pcloudysfn', 'pcloudysfw', 'pcloudysfwn',
  'pcloudysn', 'pcloudysw', 'pcloudyswn',
  'pcloudyt', 'pcloudytn', 'pcloudytw', 'pcloudytwn',
  'pcloudyw', 'pcloudywn',
  'rain', 'rainandsnow', 'rainandsnown', 'rainn', 'raintosnow', 'raintosnown', 'rainw',
  'showers', 'showersn', 'showersw', 'showerswn',
  'sleet', 'sleetn', 'sleetsnow', 'sleetsnown',
  'smoke', 'smoken',
  'snow', 'snown', 'snowshowers', 'snowshowersn', 'snowshowersw', 'snowshowerswn',
  'snowtorain', 'snowtorainn', 'snoww', 'snowwn',
  'sunny', 'sunnyn', 'sunnyw', 'sunnywn',
  'tstorm', 'tstormn', 'tstorms', 'tstormsn', 'tstormsw', 'tstormswn',
  'wind',
  'wintrymix', 'wintrymixn'
]);

@Injectable()
export class AppXweatherIconResolver extends SiWeatherIconResolver {
  override resolve(icon: SiWeatherIcon): SiWeatherIconResolution | null {
    if (!icon.condition) {
      return null;
    }
    const base = CONDITION_TO_BASE[icon.condition];
    if (!base) {
      return null;
    }
    const modifiers = new Set(icon.modifiers ?? []);
    const night = icon.daytime === 'night';

    let effectiveBase = base;
    if (modifiers.has('freezing')) {
      if (base === 'drizzle') {
        effectiveBase = 'fdrizzle';
      } else if (base === 'rain') {
        effectiveBase = 'freezingrain';
      }
    }

    let suffix = '';
    if (modifiers.has('thunder')) {
      suffix = 't';
    } else if (modifiers.has('snow')) {
      suffix = modifiers.has('freezing') ? 'sf' : 's';
    } else if (modifiers.has('rain')) {
      suffix = 'r';
    }

    const candidates = this.buildCandidates(effectiveBase, suffix, modifiers.has('windy'), night);
    const name = candidates.find(c => KNOWN_ASSETS.has(c));
    if (!name) {
      return null;
    }
    return { src: `assets/weather-icons/${name}.svg`, alt: icon.alt };
  }

  private buildCandidates(
    base: string,
    weatherSuffix: string,
    windy: boolean,
    night: boolean
  ): string[] {
    const w = windy ? 'w' : '';
    const n = night ? 'n' : '';
    return [
      `${base}${weatherSuffix}${w}${n}`,
      `${base}${weatherSuffix}${n}`,
      `${base}${w}${n}`,
      `${base}${n}`,
      base
    ];
  }
}
