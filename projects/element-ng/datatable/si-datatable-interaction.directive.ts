/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  booleanAttribute,
  Directive,
  ElementRef,
  inject,
  input,
  isSignal,
  OnDestroy,
  OnInit,
  Signal
} from '@angular/core';
import { DatatableComponent } from '@siemens/ngx-datatable';

const unwrapSignalOrValue = <T>(valueOrSignal: T | Signal<T>): T => {
  if (isSignal(valueOrSignal)) {
    return valueOrSignal();
  }
  return valueOrSignal;
};

@Directive({
  selector: 'ngx-datatable[siDatatableInteraction]',
  host: {
    tabindex: '0',
    '(keydown)': 'onKeydown($event)',
    '(mousedown)': 'onMousedown($event)',
    '(mouseup)': 'onMouseup($event)',
    '(focusin)': 'onFocusin($event)'
  },
  exportAs: 'si-datatable-interaction'
})
export class SiDatatableInteractionDirective implements OnDestroy, OnInit {
  private table = inject(DatatableComponent, { self: true });
  /**
   * Automatically select every row or cell that is navigated trough.
   * Is ignored unless `selectionType` is `single` or `cell`.
   *
   * @defaultValue false
   */
  readonly datatableInteractionAutoSelect = input(false, { transform: booleanAttribute });

  private element: HTMLElement = inject(ElementRef).nativeElement;
  private scrollContainer: HTMLElement | null = null;

  private autoSelectTimeout: any;

  private isMousedown = false;

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown') {
      const first =
        unwrapSignalOrValue(this.table.selectionType) === 'cell'
          ? this.element.querySelector(
              '.datatable-row-wrapper > .datatable-body-row .datatable-body-cell'
            )
          : this.element.querySelector('.datatable-row-wrapper > .datatable-body-row');
      if (first) {
        (first as HTMLElement).focus();
        event.preventDefault();
      }
    } else if (event.key === 'ArrowUp') {
      const last =
        unwrapSignalOrValue(this.table.selectionType) === 'cell'
          ? this.element.querySelector(
              '.datatable-row-wrapper:last-child > .datatable-body-row .datatable-body-cell'
            )
          : this.element.querySelector('.datatable-row-wrapper:last-child > .datatable-body-row');
      if (last) {
        (last as HTMLElement).focus();
        event.preventDefault();
      }
    }
  }

  protected onMousedown(event: MouseEvent): void {
    this.isMousedown = true;
  }

  protected onMouseup(event: MouseEvent): void {
    this.isMousedown = false;
  }

  protected onFocusin(event: FocusEvent): void {
    const target = event.target as HTMLElement;
    if (!target) {
      return;
    }

    clearTimeout(this.autoSelectTimeout);
    // Re-select on every element

    const selectionType = unwrapSignalOrValue(this.table.selectionType);
    if (
      !this.isMousedown &&
      this.datatableInteractionAutoSelect() &&
      (selectionType === 'single' || selectionType === 'cell')
    ) {
      const rowOrCell = target.closest(
        selectionType === 'cell' ? 'datatable-body-cell' : 'datatable-body-row'
      );
      if (!rowOrCell) {
        return;
      }
      this.autoSelectTimeout = setTimeout(() => {
        rowOrCell.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13 }));
      }, 100);
    }
    if (unwrapSignalOrValue(this.table.virtualization)) {
      if (this.scrollContainer) {
        const lastList =
          selectionType === 'cell'
            ? this.scrollContainer.querySelectorAll(
                '.datatable-row-wrapper:last-child > .datatable-body-row .datatable-body-cell'
              )
            : this.scrollContainer.querySelectorAll(
                '.datatable-row-wrapper:last-child > .datatable-body-row'
              );
        if (Array.from(lastList).includes(target)) {
          this.scrollContainer.scrollTop =
            this.scrollContainer.scrollTop + lastList[0].clientHeight;
        } else {
          const firstList =
            selectionType === 'cell'
              ? this.scrollContainer.querySelectorAll(
                  '.datatable-row-wrapper:first-child > .datatable-body-row .datatable-body-cell'
                )
              : this.scrollContainer.querySelectorAll(
                  '.datatable-row-wrapper:first-child > .datatable-body-row'
                );
          if (Array.from(firstList).includes(target)) {
            this.scrollContainer.scrollTop =
              this.scrollContainer.scrollTop - firstList[0].clientHeight;
          }
        }
      }
    }
  }

  ngOnInit(): void {
    // Since ngx-datatable v27, the grid wrapping header and body is the vertical scroll container.
    this.scrollContainer = this.element.querySelector<HTMLElement>('[datatableScrollContainer]');
    // Keep the host as the single tab stop, the body is focusable by default.
    const tableBody = this.element.querySelector<HTMLElement>('datatable-body');
    if (tableBody) {
      tableBody.tabIndex = -1;
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.autoSelectTimeout);
  }
}
