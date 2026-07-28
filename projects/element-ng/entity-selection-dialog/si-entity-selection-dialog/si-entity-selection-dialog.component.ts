/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import {
  DatatableComponent,
  SelectionType as DatatableSelectionType,
  TableColumn
} from '@siemens/ngx-datatable';
import { Observable, Subject } from 'rxjs';

import { SI_DATATABLE_CONFIG } from '../../si-datatable';
import { Page, PagedData, PageRequest } from '../pagination';

export interface Selectable {
  id: string;
  title: string;
  data?: any;
}

export enum SelectionType {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  single = 'single',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  multi = 'multi'
}

/**
 * Page information we get from ngx-datatable.
 */
interface PageInfo {
  offset: number; // pageNumber
  pageSize: number; // pageSize
  limit: number;
  count: number; // totalElements
}

@Component({
  selector: 'si-entity-selection-dialog',
  templateUrl: './si-entity-selection-dialog.component.html',
  styleUrl: './si-entity-selection-dialog.component.scss'
})
export class SiEntitySelectionDialogComponent implements OnInit {
  @ViewChild('table', { static: true }) table?: DatatableComponent;

  /** @defaultValue '' */
  @Input() modalTitle = '';
  /** @defaultValue '' */
  @Input() modalSave = '';
  /** @defaultValue '' */
  @Input() modalCancel = '';

  @Input() pagedData!: Observable<PagedData<Selectable>>;
  @Input() pageRequests?: Subject<PageRequest | undefined>;
  /** @defaultValue [] */
  @Input() selected?: Selectable[] = [];
  @Input() selectionType?: SelectionType;
  /** @defaultValue 1 */
  @Input() numberOfSelections = 1;
  @Output() readonly closeModal = new EventEmitter<Selectable[] | undefined>();

  datatableRows?: Selectable[];
  /** @defaultValue [] */
  loadedSelected: Selectable[] = [];
  private unloadedSelected: Map<string, Selectable> = new Map();

  datatableSelectionType: DatatableSelectionType = DatatableSelectionType.single;
  /**
   * @defaultValue
   * ```
   * { pageNumber: 0, totalElements: 0, size: 0, totalPages: 0 }
   * ```
   */
  page: Page = { pageNumber: 0, totalElements: 0, size: 0, totalPages: 0 };

  /** @defaultValue '' */
  searchString = '';

  tableColumns!: TableColumn[];
  tableConfig = SI_DATATABLE_CONFIG;

  ngOnInit(): void {
    this.initUnloadedSelected();

    this.tableColumns = [
      {
        prop: 'title',
        checkboxable: this.selectionType === SelectionType.multi
      }
    ];
    if (this.selectionType === SelectionType.single) {
      this.numberOfSelections = 1;
    }

    this.pagedData?.subscribe(pagedData => {
      this.datatableRows = pagedData.data;

      let nextDatatableSelected: Selectable[] = [];
      if (this.selected && this.selected.length > 0) {
        nextDatatableSelected = pagedData.data.filter(selectable => {
          if (!selectable) {
            return false;
          } else {
            const result = this.selected!.some(selected => selected.id === selectable.id);
            if (result) {
              this.unloadedSelected.delete(selectable.id);
            }
            return result;
          }
        });
      }

      this.loadedSelected = nextDatatableSelected;
      this.page = pagedData.page || { pageNumber: 0, totalElements: 0, size: 0, totalPages: 0 };
    });

    if (this.selectionType === SelectionType.multi) {
      this.datatableSelectionType = DatatableSelectionType.multiClick;
    }
  }

  onSelect(itemsSelectedInTheTable: Selectable[]): void {
    this.loadedSelected = [...itemsSelectedInTheTable];
    this.selected = [...this.loadedSelected, ...this.unloadedSelected.values()];
  }

  get saveDisabled() {
    if (this.numberOfSelections === undefined || this.numberOfSelections < 1) {
      return false;
    } else {
      return !this.selected || this.selected.length < this.numberOfSelections;
    }
  }
  saveModal(): void {
    if (this.selected) {
      this.closeModal.emit(this.selected);
    }
  }

  closeModalDialog(): void {
    this.closeModal.emit(undefined);
  }

  public resetTableScroll(): void {
    if (this.table) {
      this.table.bodyComponent.offsetY = 0;
      this.table.element.getElementsByTagName('datatable-body')[0].scrollTop = 0;
    }
  }

  searchText(search?: string): void {
    const tmpSearch = search?.trim() ?? '';
    if (this.searchString !== tmpSearch) {
      this.initUnloadedSelected();
      this.resetTableScroll();
      this.searchString = tmpSearch;
      this.table?.recalculate();
      const requestPageSize = this.table?.pageSize ?? 50;
      this.pageRequests?.next({
        pageNumber: 0,
        pageSize: requestPageSize,
        search: this.searchString
      });
    }
  }

  public setPage(page: PageInfo): void {
    if (!this.pageRequests) {
      return;
    }

    // We already have all data
    if (this.page && this.page.totalElements === this.page.size) {
      return;
    }

    if (this.page.pageNumber !== page.offset) {
      this.pageRequests?.next({
        pageNumber: page.offset,
        pageSize: page.pageSize,
        search: this.searchString
      });
    }
  }

  private initUnloadedSelected() {
    this.selected?.forEach(s => this.unloadedSelected.set(s.id, s));
  }
}
