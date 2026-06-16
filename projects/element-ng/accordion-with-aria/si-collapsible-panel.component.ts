/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { AccordionContent, AccordionPanel, AccordionTrigger } from '@angular/aria/accordion';
import {
  booleanAttribute,
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
import { SiAccordionService, SiAccordionHCollapseService } from '@siemens/element-ng/accordion';
import { BackgroundColorVariant } from '@siemens/element-ng/common';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiTooltipDirective } from '@siemens/element-ng/tooltip';
import { SiTranslatePipe, TranslatableString } from '@siemens/element-translate-ng/translate';
import { filter } from 'rxjs';


@Component({
  selector: 'si-collapsible-panel-aria',
  imports: [SiIconComponent, SiTranslatePipe, SiTooltipDirective, AccordionTrigger, AccordionPanel, AccordionContent],
  templateUrl: './si-collapsible-panel.component.html',
  styleUrl: './si-collapsible-panel.component.scss',
  host: {
    '[class]': 'colorVariant()',
    '[class.opened]': 'opened()',
    '[class.hcollapsed]': 'hcollapsed()',
    '[class.full-height]': 'fullHeight()',
    '[style.--element-animations-enabled]': 'disableAnimation() ? "0" : undefined'
  }
})
export class SiCollapsiblePanelAriaComponent {
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

  protected readonly hcollapsed = computed(
    () => this.accordionHCollapseService?.hcollapsed() ?? false
  );
  protected readonly fullHeight = computed(() => this.accordionService?.fullHeight() ?? false);
  protected isHCollapsible = false;
  protected readonly icons = addIcons({ elementDown2 });
  protected readonly disableAnimation = signal(false);

  private readonly accordionService = inject(SiAccordionService, { optional: true });
  readonly accordionHCollapseService = inject(SiAccordionHCollapseService, {
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

  protected doToggle(toggle: boolean): void {
    this.panelToggle.emit(toggle);
    this.openClose(this.hcollapsed() || toggle);
    this.accordionService?.toggle$.next(this);
    if (this.hcollapsed()) {
      this.accordionHCollapseService?.open$.next(this);
    }
  }
}
