/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { CdkMenuTrigger } from '@angular/cdk/menu';
import { booleanAttribute, Component, input, output } from '@angular/core';
import { MenuItem as MenuItemLegacy } from '@siemens/element-ng/common';
import {
  addIcons,
  elementLeft4,
  elementOptionsVertical,
  elementRight4,
  SiIconNextComponent
} from '@siemens/element-ng/icon';
import { MenuItem, SiMenuFactoryComponent } from '@siemens/element-ng/menu';
import { SiTranslateModule } from '@siemens/element-translate-ng/translate';

@Component({
  selector: 'si-electron-titlebar',
  templateUrl: './si-electron-titlebar.component.html',
  styleUrl: './si-electron-titlebar.component.scss',
  imports: [CdkMenuTrigger, SiMenuFactoryComponent, SiIconNextComponent, SiTranslateModule]
})
export class SiElectrontitlebarComponent {
  /**
   * Title of your application
   */
  readonly appTitle = input.required<string>();

  /**
   * Defines if the application can go back or not
   *
   * @defaultValue false
   */
  readonly canGoBack = input(false, { transform: booleanAttribute });

  /**
   * Defines if the application can go forward or not
   *
   * @defaultValue false
   */
  readonly canGoForward = input(false, { transform: booleanAttribute });

  /**
   * Defines if the application is focused or not
   *
   * @defaultValue true
   */
  readonly hasFocus = input(true, { transform: booleanAttribute });

  /**
   * List of menu items for the dropdown
   * In this dropdown should the zoom functionality as well as the refresh function be provided
   *
   * @defaultValue []
   */
  readonly menuItems = input<(MenuItemLegacy | MenuItem)[]>([]);

  /**
   * Browsing forward function
   */
  readonly forward = output<void>();

  /**
   * Browsing back function
   */
  readonly back = output<void>();

  /**
   * Aria Label for Forward Button
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_ELECTRON_TITLEBAR.FORWARD:Forward`
   * ```
   */
  readonly ariaLabelForward = input($localize`:@@SI_ELECTRON_TITLEBAR.FORWARD:Forward`);

  /**
   * Aria Label for Back Button
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_ELECTRON_TITLEBAR.BACK:Back`
   * ```
   */
  readonly ariaLabelBack = input($localize`:@@SI_ELECTRON_TITLEBAR.BACK:Back`);

  /**
   * Aria Label for Menu Button
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_ELECTRON_TITLEBAR.MENU:Menu`
   * ```
   */
  readonly ariaLabelMenu = input($localize`:@@SI_ELECTRON_TITLEBAR.MENU:Menu`);

  protected readonly icons = addIcons({ elementLeft4, elementRight4, elementOptionsVertical });
}
