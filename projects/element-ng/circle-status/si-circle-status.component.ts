/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { NgClass } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  OnChanges,
  OnDestroy,
  signal,
  SimpleChanges,
  viewChild
} from '@angular/core';
import { BlinkService, EntityStatusType, StatusIcon } from '@siemens/element-ng/common';
import {
  addIcons,
  elementRight4,
  SiIconNextComponent,
  STATUS_ICON_CONFIG
} from '@siemens/element-ng/icon';
import { SiTranslateModule } from '@siemens/element-translate-ng/translate';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'si-circle-status',
  templateUrl: './si-circle-status.component.html',
  styleUrl: './si-circle-status.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, SiIconNextComponent, SiTranslateModule]
})
export class SiCircleStatusComponent implements OnChanges, OnDestroy {
  private readonly statusIcons = inject(STATUS_ICON_CONFIG);
  /**
   * The status (success, info, warning, danger) to be visualized.
   */
  readonly status = input<EntityStatusType>();

  /* DO NOT REMOVE: Even though the input is marked as deprecated, the core-team decided not to remove the
   input. The possibility to have custom color is often requested by projects, so we keep it.
   however in order to discourage it's use, we keep it marked deprecated.
   */
  /**
   * A custom color (e.g. `#fefefe`) for exceptional cases.
   * @deprecated use the semantic `status` input instead.
   */
  readonly color = input<string>();

  /**
   * Set a domain type icon (e.g. `element-door`) for which the status shall be shown.
   * Leave undefined for visualizing the status without an icon.
   */
  readonly icon = input<string>();

  /**
   * Set the size using either regular or small only works when used together with `icon`
   *
   * @defaultValue 'regular'
   */
  readonly size = input<'regular' | 'small'>('regular');

  /**
   * event direction is out
   *
   * @defaultValue false
   */
  readonly eventOut = input(false, { transform: booleanAttribute });

  /**
   * Custom icon class for event out
   */
  readonly eventIcon = input<string>();

  /**
   * Whether the status should appear with a pulsing circle around the badge.
   *
   * @defaultValue false
   */
  readonly blink = input(false, { transform: booleanAttribute });

  /**
   * Blink pulse generator for synchronized blinking with other components
   */
  readonly blinkPulse = input<Observable<boolean>>();

  /**
   * Aria label for icon and status combo. Needed for a11y
   */
  readonly ariaLabel = input<string>();

  protected readonly backgroundClass = computed(() => this.statusIcon()?.background ?? '');
  protected readonly theAriaLabel = computed(() => this.ariaLabel() ?? this.autoLabel());
  protected readonly autoLabel = computed(() => {
    const status = this.status();
    const statusName = status && this.statusIcons[status] ? status : 'none';
    const direction = this.eventOut() ? ' out' : '';
    const iconName = this.icon()?.replace(/^element-{0,1}/, '') ?? '';
    return `${iconName.toLocaleLowerCase()}${
      this.status() && this.icon() ? ' in ' : ''
    }status ${statusName}${direction}`;
  });
  protected readonly statusIcon = computed<StatusIcon | undefined>(() => {
    const status = this.status();
    return status ? this.statusIcons[status] : undefined;
  });
  protected readonly blinkOn = signal(false);
  protected readonly contrastFix = signal(false);
  protected readonly icons = addIcons({ elementRight4 });
  private blinkSubs?: Subscription;

  private readonly bg = viewChild.required<ElementRef>('bg');

  private blinkService = inject(BlinkService);

  ngOnChanges(changes: SimpleChanges): void {
    if (this.blinkService && changes.blink) {
      this.blinkSubs?.unsubscribe();

      if (this.blink()) {
        const pulse = this.blinkPulse() ?? this.blinkService.pulse$;
        this.blinkSubs = pulse.subscribe(onOff => {
          this.blinkOn.set(onOff);
        });
      } else {
        this.blinkOn.set(false);
      }
    }
    if (changes.color || changes.blink) {
      queueMicrotask(() => {
        this.contrastFix.set(!!this.color() && this.blink() && this.calculateContrastFix());
      });
    }
  }

  ngOnDestroy(): void {
    this.blinkSubs?.unsubscribe();
  }

  private calculateContrastFix(): boolean {
    // see https://www.w3.org/TR/AERT/#color-contrast
    const rgb = getComputedStyle(this.bg().nativeElement)
      .backgroundColor?.match(/\d+/g)
      ?.map(v => +v);
    return !!rgb && Math.round((rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000) <= 128;
  }
}
