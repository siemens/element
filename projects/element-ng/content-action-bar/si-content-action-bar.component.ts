/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CdkMenuBar, CdkMenuModule } from '@angular/cdk/menu';
import {
  AfterViewInit,
  booleanAttribute,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  OnChanges,
  SimpleChanges,
  viewChild
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiAutoCollapsableListModule } from '@siemens/element-ng/auto-collapsable-list';
import { MenuItem as MenuItemLegacy } from '@siemens/element-ng/common';
import { addIcons, elementCancel, elementOptionsVertical } from '@siemens/element-ng/icon';
import { SiLinkModule } from '@siemens/element-ng/link';
import {
  MenuItem,
  MenuItemAction,
  MenuItemCheckbox,
  MenuItemRadio,
  SiMenuActionService,
  SiMenuModule
} from '@siemens/element-ng/menu';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';

import { SiContentActionBarToggleComponent } from './si-content-action-bar-toggle.component';
import { ContentActionBarMainItem, ViewType } from './si-content-action-bar.model';

@Component({
  selector: 'si-content-action-bar',
  imports: [
    SiMenuModule,
    CdkMenuModule,
    SiAutoCollapsableListModule,
    SiTranslatePipe,
    SiLinkModule,
    SiContentActionBarToggleComponent,
    RouterLink
  ],
  templateUrl: './si-content-action-bar.component.html',
  styleUrl: './si-content-action-bar.component.scss',
  host: {
    '[class]': 'viewType()'
  }
})
export class SiContentActionBarComponent implements OnChanges, AfterViewInit {
  /**
   * List of primary actions. Supports up to **4** actions and omits additional ones.
   */
  readonly primaryActions = input<readonly (MenuItemLegacy | ContentActionBarMainItem)[]>();
  /**
   * List of secondary actions.
   */
  readonly secondaryActions = input<readonly (MenuItemLegacy | MenuItem)[]>();
  /**
   * A param that will be passed to the `action` in the primary/secondary actions.
   * This allows to re-use the same primary/secondary action arrays across rows
   * in a table.
   */
  readonly actionParam = input<any>();
  /**
   * Selection of view type as 'collapsible', 'expanded' or 'mobile'.
   *
   * @defaultValue 'expanded'
   */
  readonly viewType = input<ViewType>('expanded');
  /**
   * Toggle icon aria-label, required for a11y
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CONTENT_ACTION_BAR.TOGGLE:Toggle`)
   * ```
   */
  readonly toggleItemLabel = input(t(() => $localize`:@@SI_CONTENT_ACTION_BAR.TOGGLE:Toggle`));
  /**
   * Option to remove all icons from dropdown menus of the content action bar.
   *
   * Some apps provide only few actions with icons, located in the set of primary actions.
   * The icons are visible in the `collapsible` and `expanded` view type. On reduced space,
   * primary actions are relocated in the same dropdown menu as the secondary actions. The
   * dropdown menu can look unbalanced, if a large number of secondary actions without
   * icons are presented with few actions with icons. This option balances the look and feel
   * by removing all icons from actions in the dropdown menu.
   *
   * @defaultValue false
   */
  readonly preventIconsInDropdownMenus = input(false, { transform: booleanAttribute });
  /**
   * Disables the whole content-action-bar.
   *
   * @defaultValue false
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  private readonly expandElement = viewChild<
    SiContentActionBarToggleComponent,
    ElementRef<HTMLElement>
  >('expandElement', { read: ElementRef });
  private readonly menuBarElement = viewChild<CdkMenuBar, ElementRef<HTMLDivElement>>(CdkMenuBar, {
    read: ElementRef
  });

  protected readonly mobileActions = computed(() => {
    const primaryActions = this.primaryActions();
    const secondaryActions = this.secondaryActions();
    const preventIcons = this.preventIconsInDropdownMenus();
    let actions: readonly (MenuItemLegacy | MenuItem)[] = [];
    if (primaryActions?.length && secondaryActions?.length) {
      actions = [...primaryActions, { title: '-' }, ...secondaryActions];
    } else if (primaryActions?.length) {
      actions = primaryActions;
    } else if (secondaryActions?.length) {
      actions = secondaryActions;
    }
    if (preventIcons) {
      actions = actions.map(action => ({
        ...action,
        icon: undefined
      }));
    }
    return actions;
  });
  protected readonly secondaryActionsInternal = computed(() => {
    let secondaryActions = this.secondaryActions();
    if (this.preventIconsInDropdownMenus()) {
      secondaryActions = secondaryActions?.map(action => ({
        ...action,
        icon: undefined
      }));
    }
    return secondaryActions;
  });
  protected readonly icons = addIcons({ elementCancel, elementOptionsVertical });
  protected expanded = true;
  protected parentElement?: HTMLElement | null;

  private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private menuActionService = inject(SiMenuActionService, { optional: true });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.viewType) {
      this.expanded = this.viewType() === 'expanded';
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.parentElement !== this.elementRef.nativeElement.parentElement) {
        this.parentElement = this.elementRef.nativeElement.parentElement;
      }
    });
  }

  protected expand(): void {
    this.expanded = true;
    setTimeout(() => this.menuBarElement()?.nativeElement.focus());
  }

  protected collapse(): void {
    this.expanded = false;
    setTimeout(() => this.expandElement()?.nativeElement.focus());
  }

  protected isNewItemStyle(
    item: MenuItemLegacy | ContentActionBarMainItem
  ): item is ContentActionBarMainItem {
    return 'label' in item;
  }

  protected runAction(item: MenuItemAction | MenuItemRadio | MenuItemCheckbox): void {
    if (typeof item.action === 'function') {
      item.action(this.actionParam(), item as any); // typescript cannot level down the item type properly
    }

    if (typeof item.action === 'string') {
      this.menuActionService?.actionTriggered(item, this.actionParam());
    }
  }
}
