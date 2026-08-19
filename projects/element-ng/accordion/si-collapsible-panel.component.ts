/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  AccordionContent,
  AccordionGroup,
  AccordionPanel,
  AccordionTrigger
} from '@angular/aria/accordion';
import { NgTemplateOutlet } from '@angular/common';
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
  viewChild,
  ViewContainerRef
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

@Component({
  selector: 'si-collapsible-panel',
  imports: [
    AccordionContent,
    AccordionGroup,
    AccordionPanel,
    AccordionTrigger,
    NgTemplateOutlet,
    SiIconComponent,
    SiTranslatePipe,
    SiTooltipDirective
  ],
  templateUrl: './si-collapsible-panel.component.html',
  styleUrl: './si-collapsible-panel.component.scss',
  host: {
    '[class]': 'colorVariant()',
    '[class.opened]': 'opened()',
    '[class.hcollapsed]': 'hcollapsed()',
    '[class.full-height]': 'fullHeight()',
    '[class.disable-animations]': 'disableAnimation()',
    'animate.enter': 'disable-animations'
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

  protected readonly hcollapsed = computed(
    () => this.accordionHCollapseService?.hcollapsed() ?? false
  );
  protected readonly fullHeight = computed(() => this.accordionService?.fullHeight() ?? false);
  private readonly standaloneAccordionGroupView = viewChild('standaloneAccordionGroup', {
    read: ViewContainerRef
  });
  protected readonly accordionGroupInjector = computed(
    () => this.standaloneAccordionGroupView()?.injector
  );
  protected isHCollapsible = false;
  protected readonly icons = addIcons({ elementDown2 });
  protected readonly disableAnimation = signal(false);

  protected readonly accordionService = inject(SiAccordionService, { optional: true });
  private readonly accordionHCollapseService = inject(SiAccordionHCollapseService, {
    optional: true
  });
  /** Restore the content scroll position between open/close of the panel. */
  private lastScrollPos = 0;
  private readonly contentRef = viewChild<ElementRef<HTMLElement>>('content');

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
        const content = this.contentRef();
        if (content) {
          content.nativeElement.scrollTop = this.lastScrollPos;
        }
      });
    } else {
      // Save scroll position before closing
      this.lastScrollPos = this.contentRef()?.nativeElement.scrollTop ?? 0;
    }
  }

  protected doToggle(open: boolean): void {
    this.panelToggle.emit(open);
    this.openClose(this.hcollapsed() || open);
    this.accordionService?.toggle$.next(this);
    if (this.hcollapsed()) {
      this.accordionHCollapseService?.open$.next(this);
    }
  }
}
