/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Link } from '@siemens/element-ng/link';

/**
 * The MenuItem is used to configure clickable items in menus.
 * They support a name, link, icons and sub-menu items.
 *
 * @deprecated This interface should no longer be used.
 * Use a corresponding alternative based on your use case:
 * - for {@link SiMenuFactoryComponent} use {@link @siemens/element-ng/menu#MenuItem}
 * - for {@link SiContentActionBarComponent} use {@link @siemens/element-ng/menu#MenuItem} and {@link ContentActionBarMainItem}
 * - for {@link SiNavbarVerticalComponent} use {@link NavbarVerticalItem}
 * - for {@link @siemens/dashboards-ng#SiFlexibleDashboardComponent}
 *   use {@link @siemens/dashboards-ng#DashboardToolbarItem}
 */
export interface MenuItem extends Link {
  /**
   * An optional id to uniquely identify the menu item.
   */
  id?: string;
  /**
   * The web font icon class name (e.g. element-settings-outline).
   */
  icon?: string;
  /**
   * The value for an image src tag. Maybe a relative or absolute link to an
   * jpg or gif image.
   */
  image?: string;
  /**
   * A navigation bar item can have a sub-menu, if these items are set. They
   * define the sub-menu content.
   */
  items?: MenuItem[];
  /**
   * If the menu item has children you can specify
   * if they are visible or not.
   */
  expanded?: boolean;
  /**
   * Defines if only the icon is shown in the default navigation bar.
   */
  iconOnly?: boolean;
  /**
   * Defines if custom content is chosen in account dropdown
   * (otherwise accountItems are used)
   */
  customContent?: boolean;
  /**
   * Defines the content of the optional badge. Should be a number or something like "100+".
   * if undefined or empty string, no badge is displayed
   */
  badge?: string | number;
  /**
   * Defines the background color of the badge. Default is specific to Element flavour.
   */
  badgeColor?: string;
  /**
   * Defines the badge style
   */
  badgeStyle?: 'inline' | 'dot' | '';
  /**
   * Show a dot badge without content?
   */
  badgeDot?: boolean;
  /**
   * For single/multi choice items: the kind of icon to show.
   */
  selectionState?: 'check' | 'radio' | '';
  /**
   * Type to distinguish between check and radio menu items. Needs to be set for correct interaction and used for a11y.
   */
  type?: 'check' | 'radio';
  /**
   * Whether the menu item should be displayed as a heading/title, will also disable links and actions.
   */
  isHeading?: boolean;
  /**
   * Whether the menu items sub-menu should open upwards instead of downwards.
   */
  dropUpwards?: boolean;
}

// alias for compat
export type NavbarItem = MenuItem;
