/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  AfterContentInit,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  DestroyRef,
  ElementRef,
  inject,
  input,
  OnChanges
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BackgroundColorVariant } from '@siemens/element-ng/common';
import { ResizeObserverService } from '@siemens/element-ng/resize-observer';

import { SiAccordionHCollapseService } from './si-accordion-hcollapse.service';
import { SiAccordionService } from './si-accordion.service';
import { SiCollapsiblePanelComponent } from './si-collapsible-panel.component';

const PANEL_MIN_HEIGHT = 100;

@Component({
  selector: 'si-accordion',
  template: '<div><ng-content /></div>',
  providers: [SiAccordionService],
  styleUrl: './si-accordion.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.full-height]': 'fullHeight()',
    '[class.hcollapsed]': 'collapsed()'
  }
})
export class SiAccordionComponent implements AfterContentInit, OnChanges {
  /** @defaultValue true */
  readonly expandFirstPanel = input(true, { transform: booleanAttribute });
  /** @defaultValue false */
  readonly fullHeight = input(false, { transform: booleanAttribute });
  /** @defaultValue false */
  readonly hcollapsed = input(false);
  /**
   * Color to use for component background
   * @deprecated This has no effect anymore. Will be removed in v48
   **/
  readonly colorVariant = input<BackgroundColorVariant>();
  /**
   * Indicate whether the accordion is collapsed.
   * @internal
   */
  readonly collapsed = computed(
    () => this.accordionHCollapseService?.hcollapsed() ?? this.hcollapsed()
  );

  private readonly panels = contentChildren(SiCollapsiblePanelComponent);
  private responsive = false;
  private destroyer = inject(DestroyRef);
  private service = inject(SiAccordionService);
  private resizeObserver = inject(ResizeObserverService);
  private element = inject(ElementRef);
  private accordionHCollapseService = inject(SiAccordionHCollapseService, { optional: true });

  ngOnChanges(): void {
    this.service.fullHeight.set(this.fullHeight() && !this.responsive);
  }

  ngAfterContentInit(): void {
    this.resizeObserver
      .observe(this.element.nativeElement, 100, true, true)
      .pipe(takeUntilDestroyed(this.destroyer))
      .subscribe(() => this.calcFullHeight());

    this.panels().at(0)?.openClose(this.expandFirstPanel(), false);
  }

  private calcFullHeight(): void {
    if (this.panels?.length) {
      const height = (this.element.nativeElement as HTMLElement).offsetHeight;
      this.responsive = !this.hcollapsed() && height < this.panels.length * PANEL_MIN_HEIGHT;
      this.service.fullHeight.set(this.fullHeight() && !this.responsive);
    }
  }
}
