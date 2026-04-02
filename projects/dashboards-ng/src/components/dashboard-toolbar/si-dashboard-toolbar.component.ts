/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CdkMenuTrigger } from '@angular/cdk/menu';
import { Component, computed, inject, input, model, output, viewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  SiAutoCollapsableListDirective,
  SiAutoCollapsableListItemDirective,
  SiAutoCollapsableListOverflowItemDirective
} from '@siemens/element-ng/auto-collapsable-list';
import { MenuItem } from '@siemens/element-ng/common';
import { SiContentActionBarComponent } from '@siemens/element-ng/content-action-bar';
import { SiLinkDirective } from '@siemens/element-ng/link';
import { SiLoadingButtonComponent } from '@siemens/element-ng/loading-spinner';
import { SiMenuFactoryComponent, MenuItem as MenuMenuItem } from '@siemens/element-ng/menu';
import { SiResponsiveContainerDirective } from '@siemens/element-ng/resize-observer';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';

import { DashboardToolbarItem } from '../../model/si-dashboard-toolbar.model';
import { SiGridComponent } from '../grid/si-grid.component';

/**
 * The toolbar of the flexible dashboard is either `editable` or not. When not
 * `editable`, it supports content projection for applications to inject toolbar
 * controls for e.g. filtering. Use the attribute `filters-slot` to inject the filters.
 * In addition it shows the button to switch to the `editable`. When `editable`, it support
 * the cancel and save buttons, as well as displaying primary and secondary actions.
 */
@Component({
  selector: 'si-dashboard-toolbar',
  imports: [
    CdkMenuTrigger,
    SiAutoCollapsableListDirective,
    SiAutoCollapsableListItemDirective,
    SiAutoCollapsableListOverflowItemDirective,
    SiContentActionBarComponent,
    SiLinkDirective,
    SiLoadingButtonComponent,
    SiMenuFactoryComponent,
    RouterLink,
    SiResponsiveContainerDirective,
    SiTranslatePipe
  ],
  templateUrl: './si-dashboard-toolbar.component.html',
  host: {
    class: 'd-flex flex-column flex-grow-1'
  }
})
export class SiDashboardToolbarComponent {
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
   * Input to disable the save button. Note, the input `disabled` disables all
   * actions and the save button of the toolbar.
   *
   * @defaultValue true
   */
  readonly disableSaveButton = model(true);

  /**
   * Input to disable all actions and buttons of the toolbar.
   *
   * @defaultValue false */
  readonly disabled = input(false);

  /**
   * Input option to set the `editable` mode. When editable
   * the toolbar shows a cancel and save button. Otherwise,
   * it displays an edit button.
   *
   * @defaultValue false */
  readonly editable = model(false);

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

  readonly grid = input.required<SiGridComponent>();

  /**
   * Emits on save button click.
   */
  readonly save = output<void>();

  /**
   * Emits on cancel button click.
   */
  // eslint-disable-next-line @angular-eslint/no-output-native
  readonly cancel = output<void>();

  protected labelEdit = t(() => $localize`:@@DASHBOARD.EDIT:Edit`);
  protected labelCancel = t(() => $localize`:@@DASHBOARD.CANCEL:Cancel`);
  protected labelSave = t(() => $localize`:@@DASHBOARD.SAVE:Save`);
  protected labelMoreActions = t(() => $localize`:@@DASHBOARD.MORE_ACTIONS:More actions`);

  protected readonly activatedRoute = inject(ActivatedRoute, { optional: true });

  private readonly dashboardToolbarContainer = viewChild.required(SiResponsiveContainerDirective);

  private readonly autoCollapsableList = viewChild(SiAutoCollapsableListDirective);

  protected readonly showContentActionBar = computed(
    () => this.primaryEditActions()?.length + this.secondaryEditActions()?.length > 3
  );

  protected readonly editActions = computed(() => [
    ...this.primaryEditActions(),
    ...this.secondaryEditActions()
  ]);

  protected readonly primaryEditActionsComputed = computed(() => {
    return this.primaryEditActions().map(item => this.proxyMenuItemAction(item));
  });

  protected readonly secondaryEditActionsComputed = computed(() => {
    return this.secondaryEditActions().map(item => this.proxyMenuItemAction(item));
  });

  protected onEdit(): void {
    this.editable.set(true);
  }

  protected onSave(): void {
    if (this.editable()) {
      this.save.emit();
    }
  }

  protected onCancel(): void {
    if (this.editable()) {
      this.cancel.emit();
    }
  }

  protected isToolbarItem(item: MenuItem | DashboardToolbarItem): item is DashboardToolbarItem {
    return 'label' in item;
  }

  protected readonly overflowMenuItems = computed<MenuMenuItem[]>(() => {
    const listItems = this.autoCollapsableList()?.items() ?? [];
    return this.editActions()
      .filter((_, index) => !listItems[index]?.isVisible())
      .map(item => {
        if (this.isToolbarItem(item)) {
          switch (item.type) {
            case 'action':
              return {
                type: 'action' as const,
                label: item.label,
                action: () => item.action(this.grid())
              };
            case 'router-link':
              return {
                type: 'router-link' as const,
                label: item.label,
                routerLink: item.routerLink,
                extras: item.extras
              };
            case 'link':
              return {
                type: 'link' as const,
                label: item.label,
                href: item.href,
                target: item.target
              };
          }
        }
        return this.proxyMenuItemAction(item) as MenuMenuItem;
      });
  });

  protected readonly showEditButtonLabelDesktop = computed(() => {
    return this.showEditButtonLabel() && !this.dashboardToolbarContainer()?.xs();
  });

  private proxyMenuItemAction(
    item: MenuItem | DashboardToolbarItem
  ): MenuItem | DashboardToolbarItem {
    if (item.type === 'action' && typeof item.action === 'function') {
      item.action = item.action.bind(this, this.grid());
    }
    return item;
  }
}
