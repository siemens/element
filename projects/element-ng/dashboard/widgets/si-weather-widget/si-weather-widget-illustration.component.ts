/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { SiIconComponent } from '@siemens/element-ng/icon';
import { SiTranslatePipe, t, TranslatableString } from '@siemens/element-translate-ng/translate';

import { SiWeatherIconResolution, SiWeatherIconResolver } from './si-weather-icon.resolver';
import { SiWeatherIcon } from './si-weather-widget.types';

interface ResolvedIllustration {
  icon?: string;
  src?: string;
  alt: TranslatableString;
}

type IllustrationSize = 'sm' | 'md' | 'lg';

/**
 * Renders a weather illustration as either an `<si-icon>` (when the resolver
 * yields an icon name) or an `<img>` (when a raster `src` is provided).
 * Owns the icon resolution logic and the alt-text fallback chain. Not exported
 * from the public entry point.
 *
 * @internal
 */
@Component({
  selector: 'si-weather-widget-illustration',
  imports: [SiIconComponent, SiTranslatePipe],
  template: `
    @let res = resolved();
    @if (res) {
      @if (res.icon) {
        <si-icon
          role="img"
          class="si-weather-widget-illustration"
          [icon]="res.icon"
          [attr.aria-label]="res.alt | translate"
        />
      } @else if (res.src) {
        <img class="si-weather-widget-illustration" [src]="res.src" [alt]="res.alt | translate" />
      }
    }
  `,
  styleUrl: './si-weather-widget-illustration.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.si-weather-widget-illustration-sm]': "size() === 'sm'",
    '[class.si-weather-widget-illustration-md]': "size() === 'md'",
    '[class.si-weather-widget-illustration-lg]': "size() === 'lg'"
  }
})
export class SiWeatherWidgetIllustrationComponent {
  readonly illustration = input<SiWeatherIcon | string>();
  readonly condition = input<TranslatableString>();
  readonly altFallback = input<TranslatableString>();
  /** @defaultValue 'lg' */
  readonly size = input<IllustrationSize>('lg');

  private readonly resolver = inject(SiWeatherIconResolver);
  private readonly defaultAlt = t(
    () => $localize`:@@SI_WEATHER_WIDGET.ILLUSTRATION_ALT:Weather illustration`
  );

  protected readonly resolved = computed<ResolvedIllustration | null>(() => {
    const illustration = this.illustration();
    if (!illustration) {
      return null;
    }
    const icon: SiWeatherIcon =
      typeof illustration === 'string' ? { src: illustration } : illustration;
    let resolution: SiWeatherIconResolution | null;
    if (icon.src) {
      resolution = { src: icon.src, alt: icon.alt };
    } else {
      resolution = this.resolver.resolve(icon);
    }
    if (!resolution || (!resolution.icon && !resolution.src)) {
      return null;
    }
    return {
      icon: resolution.icon,
      src: resolution.icon ? undefined : resolution.src,
      alt: resolution.alt ?? icon.alt ?? this.condition() ?? this.altFallback() ?? this.defaultAlt
    };
  });
}
