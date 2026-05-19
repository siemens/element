# Weather condition tokens

!!! warning "Beta"
    The weather condition tokens are currently in **beta**. The vocabulary,
    tier composition, and modifier names may change based on feedback before
    they are considered stable.

The [Weather widget](weather-widget.md) exposes its own condition vocabulary,
`SiWeatherCondition`, that an injected `SiWeatherIconResolver` maps to
illustration assets. There is no industry-wide standard for weather-icon
naming, so applications are expected to translate their provider's data into
these tokens.

## Tiers

`SiWeatherCondition` is exported in three subset tiers. Pick the smallest one
that covers the data you receive. Each tier is a strict subset of the next.

- **`SiWeatherConditionMinimal`** — coarse-grained, suitable for compact UIs
  or low-fidelity providers.
- **`SiWeatherConditionCompact`** — recommended default. Adds the common
  intermediate states such as `partly-cloudy` or `thunderstorm`.
- **`SiWeatherConditionFull`** — granular naming that mirrors typical
  high-fidelity providers (e.g. Xweather, OpenWeather).

## Token reference

### Minimal

| Token | Description |
|---|---|
| `clear` | Clear sky. |
| `clouds` | Overcast or mostly cloudy. |
| `rain` | Generic rain. |
| `snow` | Generic snow. |
| `storm` | Thunderstorm or severe weather. |
| `fog` | Fog. |
| `unknown` | Data missing or unrecognized. Resolvers should return `null`. |

### Compact (additions)

| Token | Description |
|---|---|
| `sunny` | Bright clear sky. |
| `fair` | Mostly clear with light cloud cover. |
| `partly-cloudy` | Mixed sun and cloud. |
| `mostly-cloudy` | Predominantly cloudy with breaks. |
| `cloudy` | Fully overcast. |
| `drizzle` | Light, fine rain. |
| `heavy-rain` | Heavy rain. |
| `thunderstorm` | Thunder with rain. |
| `sleet` | Mixed rain and snow / ice pellets. |
| `blizzard` | Heavy snow with strong wind. |
| `hail` | Hail. |
| `windy` | Wind-dominant condition. |
| `hot` | Hot weather advisory. |
| `cold` | Cold weather advisory. |

### Full (additions)

| Token | Description |
|---|---|
| `mostly-clear` | Mostly clear sky. |
| `light-rain` | Light, steady rain. |
| `showers` | Showers. |
| `rain-showers` | Rain showers. |
| `freezing-rain` | Rain that freezes on contact. |
| `freezing-drizzle` | Freezing drizzle. |
| `light-snow` | Light snow. |
| `snow-showers` | Snow showers. |
| `heavy-snow` | Heavy snow. |
| `blowing-snow` | Wind-driven snow. |
| `flurries` | Brief, light snow. |
| `rain-and-snow` | Simultaneous rain and snow. |
| `snow-to-rain` | Snow transitioning to rain. |
| `rain-to-snow` | Rain transitioning to snow. |
| `wintry-mix` | Mixed wintry precipitation. |
| `mist` | Mist. |
| `haze` | Haze. |
| `smoke` | Smoke. |
| `dust` | Dust. |

## Modifiers

`SiWeatherIcon.modifiers` is an optional list of hints that resolvers MAY use
to pick a more specific asset variant on top of the chosen condition. The
following modifiers are defined:

| Modifier | Hint |
|---|---|
| `windy` | Significant wind. |
| `freezing` | Sub-zero conditions or freezing precipitation. |
| `rain` | Combined rain on top of the base condition. |
| `snow` | Combined snow on top of the base condition. |
| `thunder` | Combined thunder on top of the base condition. |

Modifiers never replace the condition. Implementations are free to ignore
unsupported combinations.

## Daytime

`SiWeatherIcon.daytime` is `'day' | 'night'`. Resolvers typically pick a
different illustration variant for night (e.g. a moon instead of a sun).

## Mapping from external providers

Mapping a provider's response onto `SiWeatherCondition` is the application's
responsibility — the library deliberately does not embed any provider-specific
logic. The Element repository ships two reference mappers used by the
documentation examples:

- [`open-weather.service.ts`](https://github.com/siemens/element/tree/main/src/app/examples/si-dashboard/open-weather.service.ts)
  — maps OpenWeather's condition codes to `SiWeatherCondition`, plus daytime
  and modifiers.
- [`si-xweather-icon.resolver.ts`](https://github.com/siemens/element/tree/main/src/app/examples/si-dashboard/si-xweather-icon.resolver.ts)
  — maps a `SiWeatherIcon` (condition + daytime + modifiers) to an
  Xweather-style PNG filename.

Use them as a starting point when integrating a different provider.

## Implementing a custom resolver

A resolver extends the abstract `SiWeatherIconResolver` and returns either a
`SiWeatherIconResolution` (`src` + optional `alt`) or `null` to skip the
illustration.

```ts
import { Injectable } from '@angular/core';
import {
  SiWeatherIcon,
  SiWeatherIconResolution,
  SiWeatherIconResolver
} from '@siemens/element-ng/dashboard';

@Injectable({ providedIn: 'root' })
export class MyWeatherIconResolver extends SiWeatherIconResolver {
  override resolve(icon: SiWeatherIcon): SiWeatherIconResolution | null {
    if (!icon.condition || icon.condition === 'unknown') {
      return null;
    }
    const daytime = icon.daytime ?? 'day';
    return {
      src: `/assets/weather/${icon.condition}-${daytime}.svg`,
      alt: icon.alt ?? icon.condition
    };
  }
}
```

The resolver only needs to be provided once at application root. The widget
picks it up through dependency injection:

```ts
import { ApplicationConfig } from '@angular/core';
import { SiWeatherIconResolver } from '@siemens/element-ng/dashboard';

import { MyWeatherIconResolver } from './my-weather-icon.resolver';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: SiWeatherIconResolver, useClass: MyWeatherIconResolver }
  ]
};
```

## References

The following resources describe provider-specific weather code systems that
applications may want to map onto `SiWeatherCondition`. The library itself
does not depend on any of them.

- [OpenWeather weather conditions](https://openweathermap.org/weather-conditions)
- [Xweather weather codes](https://docs.xweather.com/reference/weather-codes)
- [WMO World Weather Information Service](https://worldweather.wmo.int/)
