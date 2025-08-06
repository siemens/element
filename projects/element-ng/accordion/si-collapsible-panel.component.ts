/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { animate, query, style, transition, trigger } from '@angular/animations';
import { NgClass } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  model,
  output,
  viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { areAnimationsDisabled, BackgroundColorVariant } from '@spike-rabbit/element-ng/common';
import { addIcons, elementDown2, SiIconNextComponent } from '@spike-rabbit/element-ng/icon';
import { SiTranslatePipe } from '@spike-rabbit/element-translate-ng/translate';
import { filter } from 'rxjs';

import { SiAccordionHCollapseService } from './si-accordion-hcollapse.service';
import { SiAccordionService } from './si-accordion.service';

let controlIdCounter = 1;

@Component({
  selector: 'si-collapsible-panel',
  imports: [NgClass, SiIconNextComponent, SiTranslatePipe],
  templateUrl: './si-collapsible-panel.component.html',
  styleUrl: './si-collapsible-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'colorVariant()',
    '[class.opened]': 'opened()',
    '[class.hcollapsed]': 'hcollapsed()',
    '[class.full-height]': 'fullHeight()'
  },
  animations: [
    trigger('showHide', [
      transition('*=>hide', [
        style({ overflow: 'hidden' }),
        query(
          ':leave',
          [style({ blockSize: '*' }), animate('0.5s ease', style({ blockSize: '0' }))],
          { optional: true }
        )
      ]),
      transition('*=>show', [
        style({ overflow: 'hidden' }),
        query(
          ':enter',
          [style({ blockSize: '0' }), animate('0.5s ease', style({ blockSize: '*' }))],
          { optional: true }
        )
      ])
    ])
  ]
})
export class SiCollapsiblePanelComponent {
  /**
   * Heading for the collapsible panel.
   */
  readonly heading = input<string>();
  /**
   * Additional CSS classes for the top element.
   *
   * @defaultValue ''
   */
  readonly headerCssClasses = input('');
  /**
   * Additional CSS classes for the collapsible content region.
   *
   * @defaultValue ''
   */
  readonly contentBgClasses = input('');
  /**
   * Additional CSS classes for the wrapping content element.
   *
   * @defaultValue ''
   */
  readonly contentCssClasses = input('');
  /**
   * Expand/collapse the panel.
   *
   * @defaultValue false
   */
  readonly opened = model(false);
  /**
   * The icon to be displayed besides the heading.
   */
  readonly icon = input<string>();
  /**
   * Whether the si-collapsible-panel is disabled.
   *
   * @defaultValue false
   */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Color to use for component background */
  readonly colorVariant = input<BackgroundColorVariant>();
  /**
   * Defines the content of the optional badge. Should be a number or something like "100+".
   * if undefined or empty string, no badge is displayed
   */
  readonly badge = input<string | number>();
  /**
   * Defines the background color of the badge. Default is specific to Element flavour.
   */
  readonly badgeColor = input<string>();

  /**
   * An event emitted when the user triggered expand/collapse and emit with the new open state.
   * The event is emitted before the animation happens.
   */
  readonly panelToggle = output<boolean>();

  protected readonly hcollapsed = computed(
    () => this.accordionHCollapseService?.hcollapsed() ?? false
  );
  protected readonly fullHeight = computed(() => this.accordionService?.fullHeight() ?? false);
  protected controlId = '__si-collapsible-' + controlIdCounter++;
  protected headerId = this.controlId + '-header';
  protected isHCollapsible = false;
  protected readonly icons = addIcons({ elementDown2 });

  private readonly destroyRef = inject(DestroyRef);
  private readonly accordionService = inject(SiAccordionService, { optional: true });
  private readonly accordionHCollapseService = inject(SiAccordionHCollapseService, {
    optional: true
  });
  private enableAnimation = true;
  private readonly animationsGloballyDisabled = areAnimationsDisabled();
  private lastScrollPos = 0;
  private readonly contentRef = viewChild.required<ElementRef<HTMLElement>>('content');

  constructor() {
    this.isHCollapsible = !!this.accordionHCollapseService;
    this.accordionService?.toggle$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter(item => item !== this)
      )
      .subscribe(() => this.openClose(false));
  }

  protected get showHide(): string {
    if (this.enableAnimation && !this.animationsGloballyDisabled) {
      return this.opened() ? 'show' : 'hide';
    }
    return 'disabled';
  }

  /**
   * Expand/collapse panel.
   * @param open - indicate the panel shall open or close
   * @param enableAnimation - with animation
   */
  openClose(open: boolean, enableAnimation = true): void {
    this.opened.set(open);
    this.enableAnimation = enableAnimation;

    if (open) {
      setTimeout(() => {
        this.contentRef().nativeElement.scrollTop = this.lastScrollPos;
      });
    } else {
      this.lastScrollPos = this.contentRef().nativeElement.scrollTop;
    }
  }

  protected doToggle(event?: Event): void {
    if (this.disabled()) {
      return;
    }

    event?.preventDefault();
    const opened = this.opened();
    this.panelToggle.emit(!opened);
    this.openClose(this.hcollapsed() || !opened);
    this.accordionService?.toggle$.next(this);
    if (this.hcollapsed()) {
      this.accordionHCollapseService?.open$.next(this);
    }
  }

  protected keydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === 'Space' || event.key === ' ') {
      this.doToggle(undefined);
    }
  }
}
