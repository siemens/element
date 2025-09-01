/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Column,
  ColumnSelectionDialogResult,
  SiColumnSelectionDialogService
} from '@siemens/element-ng/column-selection-dialog';
import { SI_DATATABLE_CONFIG, SiDatatableModule } from '@siemens/element-ng/datatable';
import { SiResizeObserverModule } from '@siemens/element-ng/resize-observer';
import { LOG_EVENT } from '@siemens/live-preview';
import { NgxDatatableModule, TableColumn } from '@siemens/ngx-datatable';

@Component({
  selector: 'app-sample',
  imports: [NgxDatatableModule, SiDatatableModule, SiResizeObserverModule],
  templateUrl: './datatable-column-reorder.html',
  styleUrl: './datatable.scss'
})
export class SampleComponent {
  tableConfig = SI_DATATABLE_CONFIG;
  rows: any[] = [];
  private siColumnModal = inject(SiColumnSelectionDialogService);
  private logEvent = inject(LOG_EVENT);
  columns: TableColumn[] = [
    { name: 'First name', prop: 'firstname', width: 100 },
    { name: 'Last name', prop: 'lastname', width: 100 },
    {
      name: 'Age',
      prop: 'age',
      headerClass: 'justify-content-end',
      cellClass: 'text-align-right-cell',
      maxWidth: 100
    },
    { name: 'Address', prop: 'address', width: 500 }
  ];

  modalColumns: Column[] = [
    {
      id: 'firstname',
      title: 'First Name',
      visible: true,
      draggable: true,
      disabled: false
    },
    {
      id: 'lastname',
      title: 'Last Name',
      visible: true,
      draggable: true,
      disabled: false
    },
    {
      id: 'age',
      title: 'Age',
      visible: true,
      draggable: true,
      disabled: false
    },
    {
      id: 'address',
      title: 'Address',
      visible: true,
      draggable: true,
      disabled: false
    }
  ];

  private originalModalColumns = this.modalColumns.map(col => ({ ...col }));
  private originalColumns = this.columns.map(col => ({ ...col }));
  private destroyer = inject(DestroyRef);

  constructor() {
    for (let i = 1; i <= 250; i++) {
      this.rows.push({
        id: i,
        firstname: 'First ' + i,
        lastname: 'Last ' + i,
        age: 10 + (i % 9),
        address:
          'The quick brown fox jumps over the lazy dog repeatedly throughout the misty morning hours. Meanwhile, distant mountains cast long shadows across the peaceful valley below. Ancient trees whisper secrets to the gentle breeze that carries the scent of wildflowers from meadows far away. ' +
          i
      });
    }
  }

  private updateColumns(updatedColumns: Column[]): void {
    // Create a map of the original columns for easy lookup
    const columnMap = new Map(this.originalColumns.map(col => [col.prop, col]));

    // Reorder the columns array based on the order from updatedColumns
    // Only include visible columns in the final array
    this.columns = updatedColumns
      .filter(col => col.visible)
      .map(col => columnMap.get(col.id))
      .filter(col => col !== undefined);

    // Update the modalColumns to reflect the new state
    this.modalColumns = updatedColumns;
  }

  protected showColumnSelectionDialog(): void {
    this.siColumnModal
      .showColumnSelectionDialog({
        heading: 'Customize columns',
        bodyTitle: 'Customize view by selecting or ordering',
        columns: this.modalColumns,
        restoreEnabled: true,
        columnVisibilityConfigurable: true
      })
      .pipe(takeUntilDestroyed(this.destroyer))
      .subscribe((result: ColumnSelectionDialogResult) => {
        switch (result.type) {
          case 'ok':
            {
              this.logEvent('Column selection submitted');
              const updatedColumns = result.columns;
              this.updateColumns(updatedColumns);
            }
            break;
          case 'restoreDefault':
            this.modalColumns = this.originalModalColumns.map(col => ({ ...col }));
            result.updateColumns?.(this.modalColumns);
            break;
        }
      });
  }
}
