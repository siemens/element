/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 *
 * Minimal client for the OpenWeather public API. Used by the configurable
 * weather widget demo to drive the widget with real-world data.
 *
 * Docs: https://openweathermap.org/current and https://openweathermap.org/forecast5
 */
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { SiWeatherCondition } from '@siemens/element-ng/dashboard';
import { firstValueFrom } from 'rxjs';

const BASE = 'https://api.openweathermap.org';

/* eslint-disable @typescript-eslint/naming-convention -- shape mirrors OpenWeather JSON API */
interface OpenWeatherGeoEntry {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

interface OpenWeatherWeather {
  id: number;
  main: string;
  description: string;
  icon: string; // e.g. "01d", "10n"
}

interface OpenWeatherCurrent {
  dt: number;
  weather: OpenWeatherWeather[];
  main: { temp: number; temp_min: number; temp_max: number; humidity: number };
  wind: { speed: number };
  clouds: { all: number };
  rain?: { '1h'?: number; '3h'?: number };
  sys: { sunrise: number; sunset: number };
  name: string;
}

interface OpenWeatherForecastEntry {
  dt: number;
  dt_txt: string;
  weather: OpenWeatherWeather[];
  main: { temp: number; temp_min: number; temp_max: number };
}

interface OpenWeatherForecastResponse {
  list: OpenWeatherForecastEntry[];
  city: { sunrise: number; sunset: number };
}
/* eslint-enable @typescript-eslint/naming-convention */

export interface OpenWeatherCitySuggestion {
  label: string;
  lat: number;
  lon: number;
}

export interface OpenWeatherSnapshot {
  current: OpenWeatherCurrent;
  forecast: OpenWeatherForecastResponse;
}

@Injectable({ providedIn: 'root' })
export class OpenWeatherService {
  private readonly http = inject(HttpClient);

  async searchCities(query: string, apiKey: string): Promise<OpenWeatherCitySuggestion[]> {
    if (!query.trim() || !apiKey) {
      return [];
    }
    const url = `${BASE}/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${apiKey}`;
    const results = await firstValueFrom(this.http.get<OpenWeatherGeoEntry[]>(url));
    return results.map(r => ({
      label: [r.name, r.state, r.country].filter(Boolean).join(', '),
      lat: r.lat,
      lon: r.lon
    }));
  }

  async load(
    lat: number,
    lon: number,
    apiKey: string,
    units: 'metric' | 'imperial' = 'metric'
  ): Promise<OpenWeatherSnapshot> {
    const common = `lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey}`;
    const [current, forecast] = await Promise.all([
      firstValueFrom(this.http.get<OpenWeatherCurrent>(`${BASE}/data/2.5/weather?${common}`)),
      firstValueFrom(
        this.http.get<OpenWeatherForecastResponse>(`${BASE}/data/2.5/forecast?${common}`)
      )
    ]);
    return { current, forecast };
  }
}

/**
 * Map an OpenWeather condition id (https://openweathermap.org/weather-conditions)
 * to one of our {@link SiWeatherCondition} tokens.
 */
export const mapOpenWeatherCondition = (id: number): SiWeatherCondition => {
  if (id >= 200 && id < 300) return 'thunderstorm';
  if (id >= 300 && id < 400) return 'drizzle';
  if (id >= 500 && id < 510) return 'rain';
  if (id === 511) return 'freezing-rain';
  if (id >= 520 && id < 600) return 'showers';
  if (id >= 600 && id < 700) {
    if (id === 600 || id === 620) return 'light-snow';
    if (id === 602 || id === 622) return 'heavy-snow';
    if (id === 611 || id === 612 || id === 613) return 'sleet';
    if (id === 615 || id === 616) return 'rain-and-snow';
    return 'snow';
  }
  if (id === 701 || id === 741) return 'fog';
  if (id === 711) return 'smoke';
  if (id === 721) return 'haze';
  if (id === 731 || id === 751 || id === 761) return 'dust';
  if (id === 762) return 'unknown';
  if (id === 771 || id === 781) return 'windy';
  if (id === 800) return 'clear';
  if (id === 801) return 'fair';
  if (id === 802) return 'partly-cloudy';
  if (id === 803) return 'mostly-cloudy';
  if (id === 804) return 'cloudy';
  return 'unknown';
};

/**
 * OpenWeather icon codes end with `d` (day) or `n` (night).
 */
export const mapOpenWeatherDaytime = (icon: string): 'day' | 'night' =>
  icon.endsWith('n') ? 'night' : 'day';

/**
 * Aggregate the hourly 5-day forecast into per-day min/max + a representative condition.
 */
export const aggregateForecast = (
  forecast: OpenWeatherForecastResponse,
  days = 5
): { date: Date; min: number; max: number; weather: OpenWeatherWeather }[] => {
  const buckets = new Map<string, OpenWeatherForecastEntry[]>();
  for (const entry of forecast.list) {
    const date = entry.dt_txt.slice(0, 10);
    let bucket = buckets.get(date);
    if (!bucket) {
      bucket = [];
      buckets.set(date, bucket);
    }
    bucket.push(entry);
  }
  return Array.from(buckets.entries())
    .slice(0, days)
    .map(([date, entries]) => {
      let min = Infinity;
      let max = -Infinity;
      for (const e of entries) {
        if (e.main.temp_min < min) min = e.main.temp_min;
        if (e.main.temp_max > max) max = e.main.temp_max;
      }
      // pick the entry closest to local noon for the representative icon
      const noon = entries.reduce((acc, e) => {
        const hourDiff = Math.abs(new Date(e.dt * 1000).getHours() - 12);
        const accDiff = Math.abs(new Date(acc.dt * 1000).getHours() - 12);
        return hourDiff < accDiff ? e : acc;
      }, entries[0]);
      return { date: new Date(date), min, max, weather: noon.weather[0] };
    });
};
