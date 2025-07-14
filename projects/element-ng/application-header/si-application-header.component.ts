/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { A11yModule, CdkTrapFocus } from '@angular/cdk/a11y';
import { BreakpointObserver } from '@angular/cdk/layout';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  Injector,
  input,
  OnDestroy,
  signal,
  TemplateRef,
  viewChild
} from '@angular/core';
import {
  HeaderWithDropdowns,
  SI_HEADER_WITH_DROPDOWNS,
  SiHeaderDropdownTriggerDirective
} from '@siemens/element-ng/header-dropdown';
import {
  addIcons,
  elementMenu,
  elementThumbnails,
  SiIconNextComponent
} from '@siemens/element-ng/icon';
import { BOOTSTRAP_BREAKPOINTS, Breakpoints } from '@siemens/element-ng/resize-observer';
import { SiTranslateModule } from '@siemens/element-translate-ng/translate';
import { defer, of, Subject } from 'rxjs';
import { map, skip, takeUntil } from 'rxjs/operators';

/** Root component for the application header. */
@Component({
  selector: 'si-application-header',
  imports: [SiTranslateModule, NgClass, A11yModule, NgTemplateOutlet, SiIconNextComponent],
  templateUrl: './si-application-header.component.html',
  styleUrl: './si-application-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: SI_HEADER_WITH_DROPDOWNS, useExisting: SiApplicationHeaderComponent }]
})
export class SiApplicationHeaderComponent implements HeaderWithDropdowns, OnDestroy {
  private static idCounter = 0;

  /**
   * Defines the minimum breakpoint which must be matched to expand the header / switch to desktop mode.
   *
   * @defaultValue 'sm'
   */
  readonly expandBreakpoint = input<'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'never'>('sm');
  readonly launchpad = input<TemplateRef<void>>();
  /**
   * @defaultValue
   * ```
   * $localize`:@@SI_APPLICATION_HEADER.LAUNCHPAD:Launchpad`
   * ```
   */
  readonly launchpadLabel = input($localize`:@@SI_APPLICATION_HEADER.LAUNCHPAD:Launchpad`);

  /** @internal */
  readonly closeMobileMenus = new Subject<void>();

  /** @internal */
  readonly mobileNavigationExpanded = signal(false);
  /** @internal */
  readonly hasNavigation = signal(false);

  protected readonly openDropdownCount = signal(0);
  protected readonly launchpadOpen = signal(false);
  protected readonly id = `__si-application-header-${SiApplicationHeaderComponent.idCounter++}`;
  protected toggleNavigation = $localize`:@@SI_APPLICATION_HEADER.TOGGLE_NAVIGATION:Toggle navigation`;
  protected injector = inject(Injector);
  protected readonly icons = addIcons({ elementThumbnails, elementMenu });

  private readonly navigationToggle = viewChild<ElementRef<HTMLDivElement>>('navigationToggle');
  private readonly focusTrap = viewChild.required(CdkTrapFocus);
  private breakpointObserver = inject(BreakpointObserver);
  private openDropdown?: SiHeaderDropdownTriggerDirective;
  private closeMobileSub = this.closeMobileMenus.subscribe(() => {
    this.closeMobileNavigation();
    this.closeLaunchpad();
  });

  /** @internal */
  // defer is required to re-check the current breakpoint as it may change.
  readonly inlineDropdown = defer(() => {
    const expandBreakpoint = this.expandBreakpoint();
    if (expandBreakpoint === 'never') {
      return of(true);
    }
    return this.breakpointObserver
      .observe(
        `(min-width: ${
          BOOTSTRAP_BREAKPOINTS[(expandBreakpoint + 'Minimum') as keyof Breakpoints]
        }px)`
      )
      .pipe(map(({ matches }) => !matches));
  });

  ngOnDestroy(): void {
    this.closeMobileSub.unsubscribe();
    this.closeMobileMenus.next();
    this.closeMobileMenus.complete();
  }

  /** @internal */
  onDropdownItemTriggered(): void {
    this.closeMobileMenus.next();
  }

  /** @internal */
  dropdownClosed(trigger?: SiHeaderDropdownTriggerDirective): void {
    this.openDropdownCount.update(v => v - 1);
    if (trigger === this.openDropdown) {
      this.openDropdown = undefined;
    }
  }

  /** @internal */
  dropdownOpened(trigger?: SiHeaderDropdownTriggerDirective): void {
    this.openDropdown ??= trigger;
    this.openDropdownCount.update(v => v + 1);
    this.closeLaunchpad();
  }

  /** @internal */
  closeLaunchpad(): void {
    if (this.launchpadOpen()) {
      this.launchpadOpen.set(false);
      this.dropdownClosed();

      if (this.hasNavigation()) {
        // This is also fine in expanded view when the mobile toggle is not visible.
        // Then the focus call will be ignored.
        this.navigationToggle()?.nativeElement.focus();
      }
    }
  }

  /** @internal */
  openLaunchpad(): void {
    if (!this.launchpadOpen()) {
      this.dropdownOpened();
      this.closeMobileMenus.next();
      this.launchpadOpen.set(true);
      this.inlineDropdown
        .pipe(skip(1), takeUntil(this.closeMobileMenus))
        .subscribe(() => this.closeMobileMenus.next());
    }
  }

  protected toggleMobileNavigationExpanded(): void {
    if (this.mobileNavigationExpanded()) {
      this.closeMobileNavigation();
    } else {
      this.openMobileNavigation();
    }
  }

  protected toggleLaunchpad(): void {
    if (this.launchpadOpen()) {
      this.closeLaunchpad();
    } else {
      this.openLaunchpad();
    }
  }

  protected navigationEscapePressed(): void {
    this.closeMobileNavigation();
    this.navigationToggle()?.nativeElement.focus();
  }

  protected backdropClicked(): void {
    this.closeMobileMenus.next();
  }

  private openMobileNavigation(): void {
    if (!this.mobileNavigationExpanded()) {
      this.closeMobileMenus.next();
      this.mobileNavigationExpanded.set(true);
      this.dropdownOpened();
      this.inlineDropdown
        .pipe(skip(1), takeUntil(this.closeMobileMenus))
        .subscribe(() => this.closeMobileMenus.next());
      this.focusTrap().focusTrap.focusFirstTabbableElementWhenReady();
    }
  }

  private closeMobileNavigation(): void {
    if (this.mobileNavigationExpanded()) {
      this.mobileNavigationExpanded.set(false);
      this.openDropdown?.close();
      this.dropdownClosed();
    }
  }
}
