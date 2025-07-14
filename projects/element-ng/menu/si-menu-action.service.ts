/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { MenuItemAction, MenuItemCheckbox, MenuItemRadio } from './si-menu-model';

/**
 * Implement and provide this to an {@link SiMenuFactoryComponent}
 * to receive trigger events.
 */
export abstract class SiMenuActionService {
  /** Will be called by {@link SiMenuFactoryComponent} if an action is defined with a string instead of a function. */
  abstract actionTriggered(
    item: MenuItemAction | MenuItemRadio | MenuItemCheckbox,
    actionParam?: any
  ): void;
}
