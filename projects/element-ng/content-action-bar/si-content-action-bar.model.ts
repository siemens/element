/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  MenuItemAction,
  MenuItemCheckbox,
  MenuItemGroup,
  MenuItemLink,
  MenuItemRouterLink
} from '@siemens/element-ng/menu';

export type ViewType = 'collapsible' | 'expanded' | 'mobile';

export type ContentActionBarMainItem = (
  | MenuItemAction
  | MenuItemCheckbox
  | MenuItemLink
  | MenuItemRouterLink
  | MenuItemGroup
) & { iconOnly?: boolean };
