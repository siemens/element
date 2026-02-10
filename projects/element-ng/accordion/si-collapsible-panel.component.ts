/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  model,
  output,
  signal,
  viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { elementDown2 } from '@siemens/element-icons';
import { BackgroundColorVariant } from '@siemens/element-ng/common';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiTooltipDirective } from '@siemens/element-ng/tooltip';
import { SiTranslatePipe, TranslatableString } from '@siemens/element-translate-ng/translate';
import { filter } from 'rxjs';

import { SiAccordionHCollapseService } from './si-accordion-hcollapse.service';
import { SiAccordionService } from './si-accordion.service';

let controlIdCounter = 1;

@Component({
  selector: 'si-collapsible-panel',
  imports: [SiIconComponent, SiTranslatePipe, SiTooltipDirective],
  templateUrl: './si-collapsible-panel.component.html',
  styleUrl: './si-collapsible-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'colorVariant()',
    '[class.opened]': 'opened()',
    '[class.hcollapsed]': 'hcollapsed()',
    '[class.full-height]': 'fullHeight()',
    '[style.--element-animations-enabled]': 'disableAnimation() ? "0" : undefined'
  }
})
export class SiCollapsiblePanelComponent {
  /**
   * Heading for the collapsible panel.
   */
  readonly heading = input<TranslatableString>();
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
  /**
   * Color variant for component background.
   *
   * @deprecated This input has no effect on the component styling.
   */
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

  /**
   * Formats badge value to limit display to "+99" for numbers greater than 99
   */
  protected readonly formattedBadge = computed(() => {
    const badge = this.badge();
    if (!badge && badge !== 0) {
      return '';
    }
    if (typeof badge === 'number') {
      return badge > 99 ? '+99' : badge.toString();
    }
    return badge.toString();
  });

  protected readonly hcollapsed = computed(
    () => this.accordionHCollapseService?.hcollapsed() ?? false
  );
  protected readonly fullHeight = computed(() => this.accordionService?.fullHeight() ?? false);
  protected controlId = '__si-collapsible-' + controlIdCounter++;
  protected headerId = this.controlId + '-header';
  protected isHCollapsible = false;
  protected readonly icons = addIcons({ elementDown2 });
  protected readonly disableAnimation = signal(false);

  private readonly accordionService = inject(SiAccordionService, { optional: true });
  private readonly accordionHCollapseService = inject(SiAccordionHCollapseService, {
    optional: true
  });
  /** Restore the content scroll position between open/close of the panel. */
  private lastScrollPos = 0;
  private readonly contentRef = viewChild.required<ElementRef<HTMLElement>>('content');

  constructor() {
    this.isHCollapsible = !!this.accordionHCollapseService;
    this.accordionService?.toggle$
      .pipe(
        takeUntilDestroyed(),
        filter(item => item !== this)
      )
      .subscribe(() => this.openClose(false));
  }

  /**
   * Expand/collapse panel.
   * @param open - indicate the panel shall open or close
   * @param enableAnimation - with animation
   */
  openClose(open: boolean, enableAnimation = true): void {
    this.opened.set(open);
    this.disableAnimation.set(!enableAnimation);

    if (open) {
      // Restore scroll position after opening
      setTimeout(() => {
        this.contentRef().nativeElement.scrollTop = this.lastScrollPos;
      });
    } else {
      // Save scroll position before closing
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
