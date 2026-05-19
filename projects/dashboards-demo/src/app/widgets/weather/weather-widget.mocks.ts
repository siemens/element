/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  SiWeatherCondition,
  SiWeatherIconModifier,
  SiWeatherWidgetForecast,
  SiWeatherWidgetMetric
} from '@siemens/element-ng/dashboard';

export const ALL_CONDITIONS: SiWeatherCondition[] = [
  'clear',
  'sunny',
  'fair',
  'partly-cloudy',
  'mostly-cloudy',
  'cloudy',
  'rain',
  'drizzle',
  'heavy-rain',
  'showers',
  'thunderstorm',
  'snow',
  'flurries',
  'sleet',
  'blizzard',
  'fog',
  'haze',
  'windy',
  'hot',
  'cold',
  'unknown'
];

export const ALL_MODIFIERS: SiWeatherIconModifier[] = [
  'windy',
  'freezing',
  'rain',
  'snow',
  'thunder'
];

export const SAMPLE_FORECAST: SiWeatherWidgetForecast = {
  days: [
    {
      label: 'Mon',
      illustration: { condition: 'sunny' },
      minTemperature: '18°',
      maxTemperature: '26°'
    },
    {
      label: 'Tue',
      illustration: { condition: 'partly-cloudy' },
      minTemperature: '17°',
      maxTemperature: '24°'
    },
    {
      label: 'Wed',
      illustration: { condition: 'rain' },
      minTemperature: '15°',
      maxTemperature: '21°'
    },
    {
      label: 'Thu',
      illustration: { condition: 'thunderstorm' },
      minTemperature: '14°',
      maxTemperature: '20°'
    },
    {
      label: 'Fri',
      illustration: { condition: 'cloudy' },
      minTemperature: '16°',
      maxTemperature: '22°'
    }
  ],
  columns: [
    {
      label: 'Wind',
      icon: 'element-wind',
      values: ['7km/h', '6km/h', '12km/h', '14km/h', '9km/h']
    },
    {
      label: 'Precipitation',
      icon: 'element-water',
      values: ['0mm', '1mm', '8mm', '12mm', '2mm']
    },
    {
      label: 'Humidity',
      icon: 'element-humidity',
      values: ['60%', '65%', '85%', '90%', '70%']
    },
    {
      label: 'Cloud cover',
      icon: 'element-cloud',
      values: ['20%', '40%', '90%', '95%', '60%']
    },
    {
      label: 'UV',
      icon: 'element-sun',
      values: ['7', '5', '2', '1', '4']
    }
  ]
};

export const SAMPLE_METRICS: SiWeatherWidgetMetric[] = [
  { label: 'Wind', value: '7km/h' },
  { label: 'Cloud cover', value: '90%' },
  { label: 'Precipitation', value: '8mm' },
  { label: 'UVI', value: '1 low' }
];

export interface WeatherWidgetPayload {
  layout: 'vertical' | 'horizontal' | 'compact';
  location: string;
  temperature: string;
  minTemperature: string;
  maxTemperature: string;
  condition: SiWeatherCondition;
  conditionLabel: string;
  daytime: 'day' | 'night';
  modifiers: SiWeatherIconModifier[];
  showMetrics: boolean;
  showForecast: boolean;
  forecastColumnCount: number;
}

export const DEFAULT_WEATHER_PAYLOAD: WeatherWidgetPayload = {
  layout: 'vertical',
  location: 'Zug',
  temperature: '26°',
  minTemperature: '20°',
  maxTemperature: '28°',
  condition: 'sunny',
  conditionLabel: 'Sunny',
  daytime: 'day',
  modifiers: [],
  showMetrics: true,
  showForecast: true,
  forecastColumnCount: 2
};
