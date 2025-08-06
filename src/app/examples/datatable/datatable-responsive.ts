/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CdkMenuTrigger } from '@angular/cdk/menu';
import { Component, OnDestroy, OnInit, TemplateRef, viewChild } from '@angular/core';
import { NgxDatatableModule, TableColumn } from '@siemens/ngx-datatable';
import { SiCircleStatusModule } from '@spike-rabbit/element-ng/circle-status';
import { StatusType } from '@spike-rabbit/element-ng/common';
import { SiDatatableModule } from '@spike-rabbit/element-ng/datatable';
import { SiIconNextComponent } from '@spike-rabbit/element-ng/icon';
import { SiMenuFactoryComponent } from '@spike-rabbit/element-ng/menu';
import { SiPaginationComponent } from '@spike-rabbit/element-ng/pagination';
import {
  BOOTSTRAP_BREAKPOINTS,
  ElementDimensions,
  SiResizeObserverModule
} from '@spike-rabbit/element-ng/resize-observer';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-sample',
  imports: [
    NgxDatatableModule,
    SiDatatableModule,
    SiPaginationComponent,
    SiResizeObserverModule,
    SiCircleStatusModule,
    SiIconNextComponent,
    SiMenuFactoryComponent,
    CdkMenuTrigger
  ],
  templateUrl: './datatable-responsive.html',
  styleUrl: './datatable.scss'
})
export class SampleComponent implements OnInit, OnDestroy {
  readonly statusCellTempl = viewChild.required<TemplateRef<any>>('statusCellTempl');
  readonly otherStatusCellTempl = viewChild.required<TemplateRef<any>>('otherStatusCellTempl');
  readonly contextCellTempl = viewChild.required<TemplateRef<any>>('contextCellTempl');

  rows: any[] = [];
  columns!: TableColumn[];
  allColumns!: TableColumn[];
  pageNumber = 0;

  noSelection = false;
  statusTypes: StatusType[] = ['success', 'info', 'warning', 'danger'];
  nextStatusType = 0;
  enforceCheckboxes = false;
  contextItems = [
    { title: 'Items 1', action: () => alert('Item 1') },
    { title: 'Items 2', action: () => alert('Item 2') }
  ];

  private destroy = new Subject<boolean>();

  constructor() {
    for (let i = 1; i <= 250; i++) {
      this.rows.push({
        id: i,
        firstname: 'First ' + i,
        lastname: 'Last ' + i,
        address: 'Siemens',
        age: 10 + (i % 9),
        status: this.getStatusType(i)
      });
    }
  }

  ngOnInit(): void {
    this.initTableColumns();
  }

  ngOnDestroy(): void {
    this.destroy.next(true);
    this.destroy.complete();
  }

  private initTableColumns(): void {
    this.columns = [
      {
        prop: 'user',
        name: '',
        width: 80,
        resizeable: false,
        canAutoResize: false,
        cellTemplate: this.statusCellTempl()
      },
      {
        prop: 'id',
        name: 'ID',
        width: 50,
        resizeable: false,
        headerClass: 'justify-content-end',
        cellClass: 'text-align-right-cell',
        canAutoResize: false
      },
      {
        prop: 'firstname',
        name: 'First Name',
        minWidth: 100,
        width: 200,
        resizeable: true,
        canAutoResize: true
      },
      {
        prop: 'lastname',
        name: 'Last Name',
        minWidth: 100,
        width: 200,
        resizeable: true,
        canAutoResize: true
      },
      {
        prop: 'status',
        name: 'Status',
        minWidth: 100,
        resizeable: true,
        canAutoResize: true,
        cellTemplate: this.otherStatusCellTempl()
      },
      {
        prop: 'age',
        name: 'Age',
        minWidth: 100,
        headerClass: 'justify-content-end',
        cellClass: 'text-align-right-cell',
        resizeable: true,
        canAutoResize: true
      },
      {
        prop: 'context',
        name: '',
        width: 40,
        minWidth: 40,
        resizeable: false,
        canAutoResize: false,
        cellTemplate: this.contextCellTempl(),
        cellClass: 'text-align-center-cell'
      }
    ];

    this.allColumns = [...this.columns];
  }

  private getStatusType(row: number): StatusType | null {
    if (row % 4 !== 0) {
      return null;
    }
    this.nextStatusType = ++this.nextStatusType % this.statusTypes.length;
    return this.statusTypes[this.nextStatusType];
  }

  protected tableResize(event: ElementDimensions): void {
    switch (true) {
      case event.width <= BOOTSTRAP_BREAKPOINTS.smMinimum:
        this.columns = [this.allColumns[2], this.allColumns[3]];
        break;
      case event.width > BOOTSTRAP_BREAKPOINTS.smMinimum &&
        event.width <= BOOTSTRAP_BREAKPOINTS.mdMinimum:
        this.columns = [
          this.allColumns[1],
          this.allColumns[2],
          this.allColumns[3],
          this.allColumns[4]
        ];
        break;
      case event.width > BOOTSTRAP_BREAKPOINTS.mdMinimum &&
        event.width <= BOOTSTRAP_BREAKPOINTS.lgMinimum:
        this.columns = [
          this.allColumns[1],
          this.allColumns[2],
          this.allColumns[3],
          this.allColumns[4],
          this.allColumns[5]
        ];
        break;
      case event.width > BOOTSTRAP_BREAKPOINTS.lgMinimum &&
        event.width <= BOOTSTRAP_BREAKPOINTS.xlMinimum:
        this.columns = [
          this.allColumns[0],
          this.allColumns[1],
          this.allColumns[2],
          this.allColumns[3],
          this.allColumns[4],
          this.allColumns[5]
        ];
        break;
      case event.width > BOOTSTRAP_BREAKPOINTS.xlMinimum &&
        event.width <= BOOTSTRAP_BREAKPOINTS.xxlMinimum:
        this.columns = this.allColumns;
        break;
      default:
        this.columns = this.allColumns;
    }
  }
}
