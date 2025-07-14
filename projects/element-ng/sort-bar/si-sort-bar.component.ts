/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { HttpParams } from '@angular/common/http';
import { Component, input, OnInit, output } from '@angular/core';
import {
  addIcons,
  elementSortDown,
  elementSortUp,
  SiIconNextComponent
} from '@siemens/element-ng/icon';
import { SiTranslateModule } from '@siemens/element-translate-ng/translate';

export interface SortCriteria {
  name: string;
  key: number | string;
}

@Component({
  selector: 'si-sort-bar',
  imports: [SiIconNextComponent, SiTranslateModule],
  templateUrl: './si-sort-bar.component.html',
  styleUrl: './si-sort-bar.component.scss'
})
export class SiSortBarComponent implements OnInit {
  /**
   * Custom sort title.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_SORT_BAR.TITLE:Sort by`
   * ```
   */
  readonly sortTitle = input($localize`:@@SI_SORT_BAR.TITLE:Sort by`);
  /**
   * List of sort criteria.
   */
  readonly sortCriteria = input.required<SortCriteria[]>();
  /**
   * `key` which sortCriteria is active by default.
   */
  readonly defaultSortCriteria = input.required<SortCriteria['key']>();

  /**
   * Output callback event will provide you with a HttpParams object if active
   * sortCriteria change.
   */
  readonly sortChange = output<HttpParams>();

  protected readonly icons = addIcons({ elementSortDown, elementSortUp });
  protected activeSortCriteria: SortCriteria['key'] = '';
  protected sortIsDescending = false;

  ngOnInit(): void {
    const defaultSortCriteria = this.defaultSortCriteria();
    if (defaultSortCriteria) {
      this.setActive(defaultSortCriteria);
    }
  }

  protected setActive(key: SortCriteria['key']): void {
    if (this.activeSortCriteria === key) {
      this.sortIsDescending = !this.sortIsDescending;
    }

    this.activeSortCriteria = key;

    const searchParams = new HttpParams()
      .set('sort', this.activeSortCriteria)
      .set('order', this.sortIsDescending ? 'desc' : 'asc');

    this.sortChange.emit(searchParams);
  }
}
