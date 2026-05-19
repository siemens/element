/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { TranslatableString } from '@siemens/element-translate-ng/translate';

/**
 * Visual layout of the {@link SiWeatherWidgetComponent}.
 *
 * - `vertical`: full vertical card layout with header, today block, optional
 *   additional data and an optional vertical forecast table.
 * - `horizontal`: wider card with the today block laid out side by side and a
 *   horizontal forecast strip below.
 * - `compact`: condensed card without a card header. Location and min/max
 *   temperature are rendered next to the illustration. Does not show a forecast.
 */
export type SiWeatherWidgetLayout = 'vertical' | 'horizontal' | 'compact';

/**
 * Minimal condition vocabulary. Best for compact UIs or coarse weather data
 * sources. Always a strict subset of {@link SiWeatherConditionCompact}.
 */
export type SiWeatherConditionMinimal =
  | 'clear'
  | 'clouds'
  | 'rain'
  | 'snow'
  | 'storm'
  | 'fog'
  | 'unknown';

/**
 * Recommended default condition vocabulary. Always a strict subset of
 * {@link SiWeatherConditionFull}.
 */
export type SiWeatherConditionCompact =
  | SiWeatherConditionMinimal
  | 'sunny'
  | 'fair'
  | 'partly-cloudy'
  | 'mostly-cloudy'
  | 'cloudy'
  | 'drizzle'
  | 'heavy-rain'
  | 'thunderstorm'
  | 'sleet'
  | 'blizzard'
  | 'hail'
  | 'windy'
  | 'hot'
  | 'cold';

/**
 * Full condition vocabulary that mirrors the granular naming used by typical
 * weather data providers (e.g. Xweather, OpenWeather).
 */
export type SiWeatherConditionFull =
  | SiWeatherConditionCompact
  | 'mostly-clear'
  | 'light-rain'
  | 'showers'
  | 'rain-showers'
  | 'freezing-rain'
  | 'freezing-drizzle'
  | 'light-snow'
  | 'snow-showers'
  | 'heavy-snow'
  | 'blowing-snow'
  | 'flurries'
  | 'rain-and-snow'
  | 'snow-to-rain'
  | 'rain-to-snow'
  | 'wintry-mix'
  | 'mist'
  | 'haze'
  | 'smoke'
  | 'dust';

/**
 * Tokenized weather condition. Accepts any of the three vocabulary tiers
 * ({@link SiWeatherConditionMinimal}, {@link SiWeatherConditionCompact},
 * {@link SiWeatherConditionFull}). The widget itself only forwards this value
 * to the injected {@link SiWeatherIconResolver}; the resolver decides which
 * tokens it can render.
 */
export type SiWeatherCondition =
  | SiWeatherConditionMinimal
  | SiWeatherConditionCompact
  | SiWeatherConditionFull;

/**
 * Optional hints a resolver MAY use to pick a more specific icon variant.
 * Implementations are free to ignore unsupported modifiers.
 */
export type SiWeatherIconModifier = 'windy' | 'freezing' | 'rain' | 'snow' | 'thunder';

/**
 * Describes how a weather illustration should be resolved. Callers can either
 * provide a direct {@link SiWeatherIcon.src} or a semantic
 * {@link SiWeatherIcon.condition} together with optional
 * {@link SiWeatherIcon.daytime} and {@link SiWeatherIcon.modifiers} hints.
 */
export interface SiWeatherIcon {
  /** Semantic condition token, used by the resolver. */
  condition?: SiWeatherCondition;
  /** Day or night variant hint. */
  daytime?: 'day' | 'night';
  /** Optional resolver hints, may be ignored. */
  modifiers?: readonly SiWeatherIconModifier[];
  /** Direct URL/path. Wins over {@link condition}. */
  src?: string;
  /** Translatable alt text for accessibility. */
  alt?: TranslatableString;
}

/**
 * Today block of the weather widget.
 */
export interface SiWeatherWidgetCurrent {
  /** Current temperature, pre-formatted by the caller (e.g. `"26°"` or `26`). */
  temperature: string | number;
  /** Translatable condition label, e.g. `"Sunny"`. */
  condition?: TranslatableString;
  /** Weather illustration. A string is shorthand for `{ src }`. */
  illustration?: SiWeatherIcon | string;
  /** Optional alt text used when {@link illustration} is given as a string. */
  illustrationAlt?: TranslatableString;
  /** Today's minimum temperature, pre-formatted by the caller. */
  minTemperature?: string | number;
  /** Today's maximum temperature, pre-formatted by the caller. */
  maxTemperature?: string | number;
}

/**
 * A single metric row in the additional-data block (e.g. wind, precipitation).
 */
export interface SiWeatherWidgetMetric {
  /** Translatable label, e.g. `"Wind"`. */
  label: TranslatableString;
  /** Pre-formatted value, e.g. `"7km/h"`. */
  value: string | number;
}

/**
 * An optional forecast column shown left of the temperature column in vertical
 * layouts. The widget supports up to two of these columns; additional columns
 * are ignored. The temperature column is mandatory and always rendered on the
 * right; it does not need to be modelled as a column here.
 */
export interface SiWeatherWidgetForecastColumn {
  /** Translatable column label, used as `aria-label` for the column. */
  label?: TranslatableString;
  /** element-icons icon name shown next to each row value. */
  icon?: string;
  /**
   * Per-day values, aligned by index with {@link SiWeatherWidgetForecast.days}.
   * Missing entries are rendered as empty cells.
   */
  values: readonly (string | number | undefined)[];
}

/**
 * A single day in the forecast block.
 */
export interface SiWeatherWidgetForecastDay {
  /** Translatable day label, e.g. `"Mon"`. */
  label: TranslatableString;
  /** Weather illustration for the day. A string is shorthand for `{ src }`. */
  illustration?: SiWeatherIcon | string;
  /** Minimum temperature, pre-formatted by the caller. */
  minTemperature: string | number;
  /** Maximum temperature, pre-formatted by the caller. */
  maxTemperature: string | number;
}

/**
 * Forecast block of the weather widget.
 *
 * The vertical layout supports up to two optional {@link columns} in addition
 * to the mandatory rightmost min/max temperature column. The horizontal layout
 * ignores {@link columns} and renders only day label, illustration and min/max
 * temperature per column. A horizontal forecast should provide at least three
 * days for a visually balanced layout.
 */
export interface SiWeatherWidgetForecast {
  /** The forecast days in display order. */
  days: readonly SiWeatherWidgetForecastDay[];

  /** Optional extra columns (vertical layout only). At most five are rendered. */
  columns?: readonly SiWeatherWidgetForecastColumn[];
}

/**
 * Composite payload accepted by the body component. Granular widget/body inputs
 * (`current`, `metrics`, `forecast`) take precedence when set.
 */
export interface SiWeatherWidgetData {
  current: SiWeatherWidgetCurrent;
  metrics?: readonly SiWeatherWidgetMetric[];
  forecast?: SiWeatherWidgetForecast;
}
