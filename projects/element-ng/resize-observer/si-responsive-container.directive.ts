/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Directive, ElementRef, inject, input, OnDestroy, OnInit, signal } from '@angular/core';
import { Subscription } from 'rxjs';

import { ResizeObserverService } from './resize-observer.service';

export interface Breakpoints {
  smMinimum: number;
  mdMinimum: number;
  lgMinimum: number;
  xlMinimum: number;
  xxlMinimum: number;
}

// keep in sync with the Bootstrap variables
export const BOOTSTRAP_BREAKPOINTS: Breakpoints = {
  smMinimum: 576,
  mdMinimum: 768,
  lgMinimum: 992,
  xlMinimum: 1200,
  xxlMinimum: 1400
};

/**
 * Directive to automatically set `si-container-*` classes so Bootstrap column classes work
 * in the context of the container instead of viewport size.
 */
@Directive({
  selector: '[siResponsiveContainer]',
  host: {
    '[class.si-container-xs]': 'xs()',
    '[class.si-container-sm]': 'sm()',
    '[class.si-container-md]': 'md()',
    '[class.si-container-lg]': 'lg()',
    '[class.si-container-xl]': 'xl()',
    '[class.si-container-xxl]': 'xxl()'
  },
  exportAs: 'siResponsiveContainer'
})
export class SiResponsiveContainerDirective implements OnInit, OnDestroy {
  /** @defaultValue false */
  readonly xs = signal(false);
  /** @defaultValue false */
  readonly sm = signal(false);
  /** @defaultValue false */
  readonly md = signal(false);
  /** @defaultValue false */
  readonly lg = signal(false);
  /** @defaultValue false */
  readonly xl = signal(false);
  /** @defaultValue false */
  readonly xxl = signal(false);

  /** @defaultValue 100 */
  readonly resizeThrottle = input(100);
  readonly breakpoints = input<Breakpoints>();

  private subs?: Subscription;

  private element = inject(ElementRef);
  private service = inject(ResizeObserverService);

  ngOnInit(): void {
    this.subs = this.service
      .observe(this.element.nativeElement, this.resizeThrottle(), true)
      .subscribe(event => this.setResponsiveSize(event.width, event.height));
  }

  ngOnDestroy(): void {
    this.subs?.unsubscribe();
  }

  private setResponsiveSize(width: number, height: number): void {
    if (!width && !height) {
      // element is not visible, no point in changing anything
      return;
    }
    const breakpoints = this.breakpoints() ?? BOOTSTRAP_BREAKPOINTS;

    this.xs.set(width < breakpoints.smMinimum);
    this.sm.set(width >= breakpoints.smMinimum && width < breakpoints.mdMinimum);
    this.md.set(width >= breakpoints.mdMinimum && width < breakpoints.lgMinimum);
    this.lg.set(width >= breakpoints.lgMinimum && width < breakpoints.xlMinimum);
    this.xl.set(width >= breakpoints.xlMinimum && width < breakpoints.xxlMinimum);
    this.xxl.set(width >= breakpoints.xxlMinimum);
  }
}
