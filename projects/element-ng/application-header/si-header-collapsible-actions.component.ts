/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { A11yModule, CdkTrapFocus } from '@angular/cdk/a11y';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  OnDestroy,
  signal,
  viewChild
} from '@angular/core';
import { SI_HEADER_DROPDOWN_OPTIONS } from '@siemens/element-ng/header-dropdown';
import { addIcons, elementOptionsVertical, SiIconNextComponent } from '@siemens/element-ng/icon';
import { SiTranslatePipe } from '@siemens/element-translate-ng/translate';
import { Subscription } from 'rxjs';
import { skip, takeUntil } from 'rxjs/operators';

import { SiApplicationHeaderComponent } from './si-application-header.component';

/** Container for actions that should be collapsed in mobile mode. */
@Component({
  selector: 'si-header-collapsible-actions',
  imports: [SiTranslatePipe, A11yModule, SiIconNextComponent],
  templateUrl: './si-header-collapsible-actions.component.html',
  styles: '.badge-dot::after { inset-inline-end: 4px; }',
  providers: [
    { provide: SI_HEADER_DROPDOWN_OPTIONS, useValue: { disableRootFocusTrapForInlineMode: true } }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'd-contents' }
})
export class SiHeaderCollapsibleActionsComponent implements OnDestroy {
  private static idCounter = 0;

  /**
   * Accessible label of the toggle button if actions are collapsed.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_APPLICATION_HEADER.TOGGLE_ACTIONS:Toggle actions`
   * ```
   */
  readonly mobileToggleLabel = input(
    $localize`:@@SI_APPLICATION_HEADER.TOGGLE_ACTIONS:Toggle actions`
  );

  /** @internal **/
  readonly mobileExpanded = signal(false);
  /** @internal **/
  readonly badgeCount = signal(0);

  protected readonly id = `__si-header-collapsible-actions-${SiHeaderCollapsibleActionsComponent.idCounter++}`;
  protected readonly icons = addIcons({ elementOptionsVertical });

  private readonly toggle = viewChild.required<ElementRef<HTMLDivElement>>('toggle');
  private readonly focusTrap = viewChild.required(CdkTrapFocus);
  private header = inject(SiApplicationHeaderComponent);
  private closeMobileSub = this.header.closeMobileMenus.subscribe(() => this.closeMobile());
  private inlineChangeSubscription?: Subscription;

  ngOnDestroy(): void {
    this.closeMobileSub.unsubscribe();
    this.inlineChangeSubscription?.unsubscribe();
  }

  protected toggleMobileExpanded(): void {
    if (this.mobileExpanded()) {
      this.closeMobile();
    } else {
      this.openMobile();
    }
  }

  protected escapePressed(): void {
    this.closeMobile();
    this.toggle().nativeElement.focus();
  }

  private openMobile(): void {
    if (!this.mobileExpanded()) {
      this.header.closeMobileMenus.next();
      this.header.dropdownOpened();
      this.mobileExpanded.set(true);
      this.inlineChangeSubscription = this.header.inlineDropdown
        .pipe(skip(1), takeUntil(this.header.closeMobileMenus))
        .subscribe(() => this.header.closeMobileMenus.next());
      this.focusTrap().focusTrap.focusFirstTabbableElementWhenReady();
    }
  }

  private closeMobile(): void {
    if (this.mobileExpanded()) {
      this.header.dropdownClosed();
      this.mobileExpanded.set(false);
      this.toggle().nativeElement.focus();
    }
  }
}
