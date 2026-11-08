/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, computed, effect, inject, input, output, viewChild } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { elementEdit } from '@siemens/element-icons';
import { MenuItem } from '@siemens/element-ng/common';
import { SiContentActionBarComponent } from '@siemens/element-ng/content-action-bar';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiLinkDirective } from '@siemens/element-ng/link';
import { SiLoadingButtonComponent } from '@siemens/element-ng/loading-spinner';
import { SiResponsiveContainerDirective } from '@siemens/element-ng/resize-observer';
import { SiTooltipDirective } from '@siemens/element-ng/tooltip';
import { SiTranslatePipe, t, TranslatableString } from '@siemens/element-translate-ng/translate';
import { combineLatest, of, startWith, switchMap } from 'rxjs';

import { SI_DASHBOARD_TOOLBAR_ITEMS } from '../../model/configuration';
import { DashboardToolbarItem } from '../../model/si-dashboard-toolbar.model';
import { SI_WIDGET_STORE } from '../../model/si-widget-storage';
import { SI_DASHBOARD_TOOLBAR_CONTEXT } from './si-dashboard-toolbar-context';

/**
 * Project into {@link SiFlexibleDashboardComponent} to configure its toolbar.
 * The dashboard manages editing, loading, saving and toolbar visibility automatically.
 * Project controls using `filters-slot` to display them outside edit mode.
 */
@Component({
  selector: 'si-dashboard-toolbar',
  imports: [
    SiContentActionBarComponent,
    SiLinkDirective,
    SiLoadingButtonComponent,
    SiIconComponent,
    RouterLink,
    SiResponsiveContainerDirective,
    SiTranslatePipe,
    SiTooltipDirective
  ],
  templateUrl: './si-dashboard-toolbar.component.html',
  host: {
    class: 'd-flex flex-column flex-grow-1',
    '[class.d-none]': 'hidden()'
  }
})
export class SiDashboardToolbarComponent {
  protected readonly icons = addIcons({ elementEdit });

  /**
   * Set primary actions that are in `editable` mode first visible or in
   * the expanded content action bar of the toolbar.
   *
   * @defaultValue []
   */
  readonly primaryEditActions = input<(MenuItem | DashboardToolbarItem)[]>([]);

  /**
   * Set secondary actions that are in `editable` mode second visible or in
   * the dropdown part of the content action bar of the toolbar.
   *
   * @defaultValue [] */
  readonly secondaryEditActions = input<(MenuItem | DashboardToolbarItem)[]>([]);

  /**
   * Option to hide the dashboard edit button.
   *
   * @defaultValue false
   */
  readonly hideEditButton = input(false);

  /**
   *  Option to display the edit button as a text button instead, only if the window is larger than xs {@link SiResponsiveContainerDirective}.
   *
   * @defaultValue false
   */
  readonly showEditButtonLabel = input(false);

  /**
   * Hide the built-in Add widget action.
   *
   * @defaultValue false
   */
  readonly hideAddWidgetInstanceButton = input(false);

  /**
   * Text, tooltip and accessible name of the Edit button.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@DASHBOARD.EDIT:Edit`)
   * ```
   */
  readonly editButtonLabel = input<TranslatableString>(t(() => $localize`:@@DASHBOARD.EDIT:Edit`));

  /**
   * Text of the Cancel button.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@DASHBOARD.CANCEL:Cancel`)
   * ```
   */
  readonly cancelButtonLabel = input<TranslatableString>(
    t(() => $localize`:@@DASHBOARD.CANCEL:Cancel`)
  );

  /**
   * Text of the Save button.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@DASHBOARD.SAVE:Save`)
   * ```
   */
  readonly saveButtonLabel = input<TranslatableString>(t(() => $localize`:@@DASHBOARD.SAVE:Save`));

  /**
   * Text of the built-in Add widget action.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@DASHBOARD.ADD_WIDGET:Add widget`)
   * ```
   */
  readonly addWidgetButtonLabel = input<TranslatableString>(
    t(() => $localize`:@@DASHBOARD.ADD_WIDGET:Add widget`)
  );

  /**
   * Accessible name of the overflow menu toggle.
   *
   * @defaultValue 'toggle'
   */
  readonly toggleItemLabel = input<TranslatableString>('toggle');

  /**
   * Emits when saving is requested. The dashboard saves automatically;
   * this event does not indicate that persistence has succeeded.
   */
  readonly save = output<void>();

  protected readonly activatedRoute = inject(ActivatedRoute, { optional: true });

  private readonly dashboard = inject(SI_DASHBOARD_TOOLBAR_CONTEXT);
  private readonly widgetStorage = inject(SI_WIDGET_STORE);
  private readonly globalEditActions = inject(SI_DASHBOARD_TOOLBAR_ITEMS, { optional: true }) ?? {
    primary: [],
    secondary: []
  };
  private readonly dashboardToolbarContainer = viewChild.required(SiResponsiveContainerDirective);

  private readonly managed = computed(() => this.dashboard.toolbar() === this);
  private readonly loading = toSignal(
    toObservable(this.dashboard.grid).pipe(switchMap(grid => grid.isLoading)),
    { initialValue: false }
  );

  protected readonly grid = this.dashboard.grid;
  protected readonly editable = computed(() => this.managed() && this.dashboard.editable());
  protected readonly disabled = computed(() => !this.managed() || this.loading());
  protected readonly disableSaveButton = computed(
    () => !this.managed() || !this.dashboard.modified()
  );
  protected readonly hidden = computed(
    () => this.managed() && !this.dashboard.isDashboardVisible()
  );

  private readonly actionSources = computed(() => {
    if (!this.managed()) {
      return { primary: of([]), secondary: of([]) };
    }

    const primary = [...this.primaryEditActions(), ...this.globalEditActions.primary];
    const secondary = [...this.secondaryEditActions(), ...this.globalEditActions.secondary];
    const dashboardId = this.dashboard.dashboardId();
    const storageActions =
      primary.length && secondary.length
        ? undefined
        : this.widgetStorage.getToolbarMenuItems?.(dashboardId);

    return {
      primary: primary.length ? of(primary) : (storageActions?.primary ?? of([])),
      secondary: secondary.length ? of(secondary) : (storageActions?.secondary ?? of([]))
    };
  });

  private readonly resolvedActions = toSignal(
    toObservable(this.actionSources).pipe(
      switchMap(({ primary, secondary }) =>
        combineLatest({
          primary: primary.pipe(startWith([])),
          secondary: secondary.pipe(startWith([]))
        })
      )
    ),
    { initialValue: { primary: [], secondary: [] } }
  );

  private readonly addWidgetInstanceAction = computed<DashboardToolbarItem>(() => ({
    type: 'action',
    label: this.addWidgetButtonLabel(),
    action: () => this.dashboard.addWidget()
  }));

  protected readonly primaryMenuItems = computed(() => {
    if (!this.managed()) {
      return [];
    }
    const items = this.resolvedActions().primary;
    return this.hideAddWidgetInstanceButton() ? items : [this.addWidgetInstanceAction(), ...items];
  });

  protected readonly secondaryMenuItems = computed(() => this.resolvedActions().secondary);

  protected readonly showContentActionBar = computed(
    () => this.primaryMenuItems().length + this.secondaryMenuItems().length > 3
  );

  protected readonly editActions = computed(() => [
    ...this.primaryMenuItems(),
    ...this.secondaryMenuItems()
  ]);

  constructor() {
    effect(() => {
      if (this.managed()) {
        this.dashboard.primaryEditActions$.next(this.primaryMenuItems());
        this.dashboard.secondaryEditActions$.next(this.secondaryMenuItems());
      }
    });
  }

  protected onEdit(): void {
    if (!this.disabled()) {
      this.dashboard.edit();
    }
  }

  protected onSave(): void {
    if (this.editable() && !this.disabled() && !this.disableSaveButton()) {
      this.dashboard.save();
      this.save.emit();
    }
  }

  protected onCancel(): void {
    if (this.editable() && !this.disabled()) {
      this.dashboard.cancel();
    }
  }

  protected isToolbarItem(item: MenuItem | DashboardToolbarItem): item is DashboardToolbarItem {
    return 'label' in item;
  }

  protected readonly showEditButtonLabelDesktop = computed(() => {
    return this.showEditButtonLabel() && !this.dashboardToolbarContainer()?.xs();
  });
}
