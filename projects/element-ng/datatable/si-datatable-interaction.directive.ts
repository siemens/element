/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  booleanAttribute,
  Directive,
  ElementRef,
  HostBinding,
  HostListener,
  inject,
  input,
  OnDestroy,
  OnInit
} from '@angular/core';

@Directive({
  selector: '[siDatatableInteraction]',
  exportAs: 'si-datatable-interaction'
})
export class SiDatatableInteractionDirective implements OnDestroy, OnInit {
  /**
   * The selection type of the datatable, will automatically be set if set for datatable.
   *
   * @defaultValue ''
   */
  readonly selectionType = input('');

  /**
   * Automatically select every row or cell that is navigated trough.
   * Is ignored unless `selectionType` is `single` or `cell`.
   *
   * @defaultValue false
   */
  readonly datatableInteractionAutoSelect = input(false, { transform: booleanAttribute });

  @HostBinding('attr.tabindex') protected tabIndex = '0';

  private element: HTMLElement = inject(ElementRef).nativeElement;
  private tableBody?: HTMLElement;

  private autoSelectTimeout: any;

  private isMousedown = false;

  @HostListener('keydown', ['$event'])
  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown') {
      const first =
        this.selectionType() === 'cell'
          ? this.element.querySelector(
              '.datatable-row-wrapper > .datatable-body-row .datatable-body-cell'
            )
          : this.element.querySelector('.datatable-row-wrapper > .datatable-body-row');
      if (first) {
        (first as HTMLElement).focus();
      }
    } else if (event.key === 'ArrowUp') {
      const last =
        this.selectionType() === 'cell'
          ? this.element.querySelector(
              '.datatable-row-wrapper:last-child > .datatable-body-row .datatable-body-cell'
            )
          : this.element.querySelector('.datatable-row-wrapper:last-child > .datatable-body-row');
      if (last) {
        (last as HTMLElement).focus();
      }
    }
  }

  @HostListener('mousedown', ['$event'])
  protected onMousedown(event: MouseEvent): void {
    this.isMousedown = true;
  }

  @HostListener('mouseup', ['$event'])
  protected onMouseup(event: MouseEvent): void {
    this.isMousedown = false;
  }

  @HostListener('focusin', ['$event'])
  protected onFocusin(event: FocusEvent): void {
    const target = event.target as HTMLElement;
    if (!target) {
      return;
    }

    clearTimeout(this.autoSelectTimeout);
    // Re-select on every element

    const selectionType = this.selectionType();
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
    if (this.element.classList.contains('virtualized')) {
      if (this.tableBody) {
        const lastList =
          selectionType === 'cell'
            ? this.tableBody.querySelectorAll(
                '.datatable-row-wrapper:last-child > .datatable-body-row .datatable-body-cell'
              )
            : this.tableBody.querySelectorAll(
                '.datatable-row-wrapper:last-child > .datatable-body-row'
              );
        if (Array.from(lastList).includes(target)) {
          this.tableBody.scrollTop = this.tableBody.scrollTop + lastList[0].clientHeight;
        } else {
          const firstList =
            selectionType === 'cell'
              ? this.tableBody.querySelectorAll(
                  '.datatable-row-wrapper:first-child > .datatable-body-row .datatable-body-cell'
                )
              : this.tableBody.querySelectorAll(
                  '.datatable-row-wrapper:first-child > .datatable-body-row'
                );
          if (Array.from(firstList).includes(target)) {
            this.tableBody.scrollTop = this.tableBody.scrollTop - firstList[0].clientHeight;
          }
        }
      }
    }
  }

  ngOnInit(): void {
    this.tableBody = this.element.querySelector('datatable-body') as HTMLElement;
    if (this.tableBody) {
      this.tableBody.tabIndex = -1;
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.autoSelectTimeout);
  }
}
