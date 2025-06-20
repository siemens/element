/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  OnChanges,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EntityStatusType } from '@siemens/element-ng/common';
import { SiTranslateService } from '@siemens/element-translate-ng/translate';

import { STATUS_ICON_CONFIG } from './icon-status';
import { SiIconNextComponent } from './si-icon-next.component';

@Component({
  selector: 'si-status-icon',
  template: `
    @let iconValue = statusIcon();
    @if (iconValue) {
      <si-icon-next [ngClass]="iconValue.color" [icon]="iconValue.icon" />
      <si-icon-next [ngClass]="iconValue.stackedColor" [icon]="iconValue.stacked" />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, SiIconNextComponent],
  host: {
    class: 'icon-stack',
    '[attr.aria-label]': 'ariaLabel()'
  }
})
export class SiStatusIconComponent implements OnChanges {
  private readonly statusIcons = inject(STATUS_ICON_CONFIG);
  private readonly translate = inject(SiTranslateService);
  private readonly destroyRef = inject(DestroyRef);

  readonly status = input.required<EntityStatusType>();

  protected readonly statusIcon = computed(() => this.statusIcons[this.status()]);

  protected readonly ariaLabel = signal<string | null>(null);

  ngOnChanges(): void {
    const ariaLabel = this.statusIcon()?.ariaLabel;
    if (ariaLabel) {
      this.translate
        .translateAsync(ariaLabel)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(label => this.ariaLabel.set(label));
    }
  }
}
