/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { TemplateRef } from '@angular/core';
import {
  MenuItemAction,
  MenuItemCheckbox,
  MenuItemGroup,
  MenuItemLink,
  MenuItemRouterLink
} from '@siemens/element-ng/menu';
import { TranslatableString } from '@siemens/element-translate-ng/translate';

export type ViewType = 'collapsible' | 'expanded' | 'mobile';

export type ContentActionBarMainItem = (
  | MenuItemAction
  | MenuItemCheckbox
  | MenuItemLink
  | MenuItemRouterLink
  | MenuItemGroup
) & { iconOnly?: boolean; tooltip?: TranslatableString | TemplateRef<any> };
