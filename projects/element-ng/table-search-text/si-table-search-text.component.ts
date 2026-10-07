/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CdkTrapFocus } from '@angular/cdk/a11y';
import {
  CdkConnectedOverlay,
  CdkOverlayOrigin,
  ConnectedPosition,
  Overlay
} from '@angular/cdk/overlay';
import {
  booleanAttribute,
  Component,
  ElementRef,
  inject,
  input,
  linkedSignal,
  model,
  numberAttribute,
  output,
  viewChild
} from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { elementFilter } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiSearchBarComponent } from '@siemens/element-ng/search-bar';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';
import { DataTableColumnDirective } from '@siemens/ngx-datatable';

/** A table column text filter with a search dialog, supporting Angular Signal Forms. */
@Component({
  selector: 'si-table-search-text',
  imports: [
    CdkConnectedOverlay,
    CdkOverlayOrigin,
    CdkTrapFocus,
    SiIconComponent,
    SiSearchBarComponent,
    SiTranslatePipe
  ],
  templateUrl: './si-table-search-text.component.html',
  styleUrl: './si-table-search-text.component.scss'
})
export class SiTableSearchTextComponent implements FormValueControl<string> {
  private static idCounter = 0;

  /**
   * Accessible description when a filter is active. Supports translation keys and the `{{value}}` placeholder.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_TABLE_SEARCH_TEXT.ACTIVE_FILTER:Active filter: {{value}}`)
   * ```
   */
  readonly activeFilterDescription = input(
    t(() => $localize`:@@SI_TABLE_SEARCH_TEXT.ACTIVE_FILTER:Active filter: {{value}}`)
  );

  /** The text used to filter the column.
   * @defaultValue ''
   */
  readonly value = model('');

  /** Delay in milliseconds before updating the filter.
   * @defaultValue 400
   */
  readonly debounceTime = input(400, { transform: numberAttribute });

  /** Whether the filter is disabled.
   * @defaultValue false
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Whether the filter can be viewed but not edited.
   * @defaultValue false
   */
  readonly readonly = input(false, { transform: booleanAttribute });

  /** Emitted when the user finishes interacting with the filter. */
  readonly touch = output<void>();

  /** Accessible name for the filter button and dialog. Supports translation keys and the `{{columnName}}` placeholder.
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_TABLE_SEARCH_TEXT.LABEL:Filter {{columnName}}`)
   * ```
   */
  readonly label = input(t(() => $localize`:@@SI_TABLE_SEARCH_TEXT.LABEL:Filter {{columnName}}`));

  /** Search input placeholder. Supports translation keys and the `{{columnName}}` placeholder.
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_TABLE_SEARCH_TEXT.PLACEHOLDER:Filter {{columnName}}...`)
   * ```
   */
  readonly placeholder = input(
    t(() => $localize`:@@SI_TABLE_SEARCH_TEXT.PLACEHOLDER:Filter {{columnName}}...`)
  );

  protected readonly column = inject(DataTableColumnDirective);
  protected readonly dialogId = `si-table-search-text-${SiTableSearchTextComponent.idCounter++}`;
  protected readonly descriptionId = `${this.dialogId}-description`;
  protected readonly icons = addIcons({ elementFilter });
  protected readonly open = linkedSignal({ source: this.disabled, computation: () => false });
  protected readonly scrollStrategy = inject(Overlay).scrollStrategies.reposition();
  protected readonly positions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 4 }
  ];

  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');

  /** Focuses the filter button. */
  focus(options?: FocusOptions): void {
    this.trigger().nativeElement.focus(options);
  }

  protected close(): void {
    if (this.open()) {
      this.open.set(false);
      this.touch.emit();
    }
  }

  protected onTriggerBlur(): void {
    if (!this.open()) {
      this.touch.emit();
    }
  }

  protected onOverlayKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.close();
    }
  }
}
