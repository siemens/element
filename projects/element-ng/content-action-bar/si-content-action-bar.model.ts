/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import {
  MenuItemAction,
  MenuItemGroup,
  MenuItemLink,
  MenuItemRouterLink
} from '@siemens/element-ng/menu';

export type ViewType = 'collapsible' | 'expanded' | 'mobile';

export type ContentActionBarMainItem = (
  | MenuItemAction
  | MenuItemLink
  | MenuItemRouterLink
  | MenuItemGroup
) & { iconOnly?: boolean };
