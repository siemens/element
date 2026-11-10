export interface MenuItemBase {
  label?: string;
}

export interface MenuItemGroup extends MenuItemBase {
  children?: MenuItemBase[];
}

export interface MenuItemCollection<T> {
  items?: T[];
}

export interface ExtendedMenuItemGroup<T extends MenuItemBase = MenuItemBase>
  extends MenuItemGroup, MenuItemCollection<T> {}

export class MenuItemGroupImplementation<T extends MenuItemBase = MenuItemBase>
  implements MenuItemGroup, MenuItemCollection<T>
{
  label?: string;
  items?: T[];
}

export interface SelectionContract<T> {
  /** List of all options that are currently selected. */
  selectedRows: readonly T[];

  /** Updates the selection.
   * @param value - Currently selected values.
   * @param notify - Whether to notify listeners.
   */
  onValueChange(value: readonly T[], notify?: boolean): void;

  /** Formats a string selection.
   * @param value - String selection.
   */
  format(value: string): string;
  /** Formats a numeric selection.
   * @param value - Numeric selection.
   */
  format(value: number): string;
}

export interface ExtendedSelectionContract<T> extends SelectionContract<T> {}

export class SelectionImplementation<T> implements ExtendedSelectionContract<T> {
  selectedRows: readonly T[] = [];

  onValueChange(value: readonly T[], notify = true): void {
    this.selectedRows = value;
  }

  format(value: string): string;
  format(value: number): string;
  format(value: string | number): string {
    return String(value);
  }
}

export class SelectionOverride extends SelectionImplementation<string> {
  /** Implementation-specific selection. */
  override selectedRows: readonly string[] = [];

  /** @param value - Implementation-specific values. */
  override onValueChange(value: readonly string[], notify = false): void {
    this.selectedRows = value;
  }
}
