/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { SiIconComponent } from '@siemens/element-ng/icon';
import { SiTranslatePipe, t, TranslatableString } from '@siemens/element-translate-ng/translate';

import { SiWidgetBaseDirective } from '../si-widget-base.directive';
import { SiWeatherIconResolution, SiWeatherIconResolver } from './si-weather-icon.resolver';
import {
  SiWeatherIcon,
  SiWeatherWidgetCurrent,
  SiWeatherWidgetData,
  SiWeatherWidgetForecast,
  SiWeatherWidgetForecastColumn,
  SiWeatherWidgetForecastDay,
  SiWeatherWidgetLayout,
  SiWeatherWidgetMetric
} from './si-weather-widget.types';

const LAYOUT_CLASS: Record<SiWeatherWidgetLayout, string> = {
  vertical: 'si-weather-widget-vertical',
  horizontal: 'si-weather-widget-horizontal',
  compact: 'si-weather-widget-compact'
};

interface ResolvedIllustration {
  src: string;
  alt: TranslatableString;
}

/**
 * Body of the `<si-weather-widget>`. Useful for compositions that do not need
 * the surrounding `<si-card>` chrome (e.g. embedding the weather inside a
 * custom container).
 *
 * Data can be supplied either as the composite {@link value} payload or as the
 * granular {@link current}, {@link metrics} and {@link forecast} inputs. When
 * both are provided, the granular inputs take precedence.
 *
 * The body delegates illustration resolution to an optional
 * {@link SiWeatherIconResolver}. Without a registered resolver, illustrations
 * are only rendered when callers pass a direct {@link SiWeatherIcon.src}.
 *
 * In the `vertical` layout the forecast list responsively hides additional
 * data columns (wind, humidity, …) via pure CSS container queries when the
 * widget becomes too narrow. See `si-weather-widget-body.component.scss` for
 * the thresholds.
 */
@Component({
  selector: 'si-weather-widget-body',
  imports: [NgTemplateOutlet, SiIconComponent, SiTranslatePipe],
  templateUrl: './si-weather-widget-body.component.html',
  styleUrl: './si-weather-widget-body.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'layoutClass()' }
})
export class SiWeatherWidgetBodyComponent extends SiWidgetBaseDirective<SiWeatherWidgetData> {
  /**
   * Visual layout. {@link SiWeatherWidgetLayout}.
   *
   * @defaultValue 'vertical'
   */
  readonly layout = input<SiWeatherWidgetLayout>('vertical');
  /**
   * Optional location label, shown inside the body in the compact layout only.
   * The non-compact layouts render the location via the `<si-card>` heading
   * managed by `SiWeatherWidgetComponent`.
   */
  readonly location = input<TranslatableString>();
  /**
   * Today block. Takes precedence over `value().current`.
   */
  readonly current = input<SiWeatherWidgetCurrent>();
  /**
   * Additional data rows. Takes precedence over `value().metrics`.
   */
  readonly metrics = input<readonly SiWeatherWidgetMetric[]>();
  /**
   * Forecast. Takes precedence over `value().forecast`. Not rendered in the
   * `compact` layout.
   */
  readonly forecast = input<SiWeatherWidgetForecast>();
  /**
   * Accessible label for the additional data list.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_WEATHER_WIDGET.METRICS_LABEL:Additional weather data`)
   * ```
   */
  readonly metricsLabel = input<TranslatableString>(
    t(() => $localize`:@@SI_WEATHER_WIDGET.METRICS_LABEL:Additional weather data`)
  );
  /**
   * Accessible label for the forecast section.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_WEATHER_WIDGET.FORECAST_LABEL:Weather forecast`)
   * ```
   */
  readonly forecastLabel = input<TranslatableString>(
    t(() => $localize`:@@SI_WEATHER_WIDGET.FORECAST_LABEL:Weather forecast`)
  );

  private readonly resolver = inject(SiWeatherIconResolver, { optional: true });

  private readonly defaultIllustrationAlt = t(
    () => $localize`:@@SI_WEATHER_WIDGET.ILLUSTRATION_ALT:Weather illustration`
  );

  /** @internal */
  protected readonly layoutClass = computed(() => LAYOUT_CLASS[this.layout()]);

  /** @internal */
  protected readonly resolvedCurrent = computed(() => this.current() ?? this.value()?.current);

  /** @internal */
  protected readonly resolvedMetrics = computed(() => this.metrics() ?? this.value()?.metrics);

  /** @internal */
  protected readonly resolvedForecast = computed(() => this.forecast() ?? this.value()?.forecast);

  /** @internal */
  protected readonly forecastColumns = computed(() => {
    const forecast = this.resolvedForecast();
    if (!forecast?.columns) {
      return [] as readonly SiWeatherWidgetForecastColumn[];
    }
    // Hard cap at 5 extra columns; matches the breakpoint set declared in
    // `_widgets.scss`. Authors should pass at most 5 columns and pick the most
    // important ones — the row will become unreadable beyond that.
    return forecast.columns.slice(0, 5);
  });

  /** @internal */
  protected readonly isCompact = computed(() => this.layout() === 'compact');

  /** @internal */
  protected readonly hasContent = computed(
    () => !!this.resolvedCurrent() || !!this.resolvedMetrics()?.length
  );

  /** @internal */
  protected currentIllustration(): ResolvedIllustration | null {
    return this.resolveIllustration(this.resolvedCurrent()?.illustration, {
      condition: this.resolvedCurrent()?.condition,
      altFallback: this.resolvedCurrent()?.illustrationAlt
    });
  }

  /** @internal */
  protected dayIllustration(day: SiWeatherWidgetForecastDay): ResolvedIllustration | null {
    return this.resolveIllustration(day.illustration, { altFallback: day.label });
  }

  /**
   * Whether the resolved illustration URL points at an SVG. SVG illustrations
   * are rendered via CSS `mask` so they pick up the current text/primary color
   * instead of their authored fill, which lets the icon set follow the active
   * Element theme. Raster sources (PNG, JPG, …) are rendered as plain `<img>`.
   * @internal
   */
  protected isMaskable(src: string): boolean {
    // Strip query / fragment before checking the extension.
    const path = src.split(/[?#]/, 1)[0];
    return path.toLowerCase().endsWith('.svg');
  }

  /**
   * Returns the CSS `url(...)` expression for the given illustration source so
   * the template can drop it directly into a `style` binding. Single-quotes
   * the URL to keep it safe from spaces / parentheses while staying valid CSS.
   * @internal
   */
  protected maskUrl(src: string): string {
    return `url('${src.replace(/'/g, "\\'")}')`;
  }

  /** @internal */
  protected forecastColumnValue(
    column: SiWeatherWidgetForecastColumn,
    index: number
  ): string | number | undefined {
    return column.values?.[index];
  }

  private resolveIllustration(
    illustration: SiWeatherIcon | string | undefined,
    options: { condition?: TranslatableString; altFallback?: TranslatableString }
  ): ResolvedIllustration | null {
    if (!illustration) {
      return null;
    }
    const icon: SiWeatherIcon =
      typeof illustration === 'string' ? { src: illustration } : illustration;
    let resolution: SiWeatherIconResolution | null = null;
    if (icon.src) {
      resolution = { src: icon.src, alt: icon.alt };
    } else if (this.resolver) {
      resolution = this.resolver.resolve(icon);
    }
    if (!resolution) {
      return null;
    }
    return {
      src: resolution.src,
      alt:
        resolution.alt ??
        icon.alt ??
        options.condition ??
        options.altFallback ??
        this.defaultIllustrationAlt
    };
  }

  protected override hasWidgetData(): boolean {
    return !!this.value() || !!this.current() || !!this.metrics() || !!this.forecast();
  }
}
