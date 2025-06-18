/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { CdkMenuTrigger } from '@angular/cdk/menu';
import { Component, OnInit, TemplateRef, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiCircleStatusComponent } from '@siemens/element-ng/circle-status';
import { StatusType } from '@siemens/element-ng/common';
import { SiDatatableInteractionDirective } from '@siemens/element-ng/datatable';
import { SiFormItemComponent, SiFormValidationTooltipDirective } from '@siemens/element-ng/form';
import { SiIconComponent } from '@siemens/element-ng/icon';
import { SiMenuFactoryComponent } from '@siemens/element-ng/menu';
import { SiPaginationComponent } from '@siemens/element-ng/pagination';
import { NgxDatatableModule, SelectionType, TableColumn } from '@siemens/ngx-datatable';

@Component({
  selector: 'app-sample',
  templateUrl: './datatable.html',
  styleUrl: './datatable.scss',
  imports: [
    FormsModule,
    NgxDatatableModule,
    SiDatatableInteractionDirective,
    SiPaginationComponent,
    SiCircleStatusComponent,
    SiFormItemComponent,
    SiIconComponent,
    SiMenuFactoryComponent,
    CdkMenuTrigger,
    SiFormValidationTooltipDirective
  ]
})
export class SampleComponent implements OnInit {
  readonly statusCellTempl = viewChild.required('statusCellTempl', {
    read: TemplateRef<any>
  });
  readonly otherStatusCellTempl = viewChild.required('otherStatusCellTempl', {
    read: TemplateRef<any>
  });
  readonly ageCellTempl = viewChild.required('ageCellTempl', {
    read: TemplateRef<any>
  });
  readonly contextCellTempl = viewChild.required('contextCellTempl', {
    read: TemplateRef<any>
  });
  readonly statusHeaderCellTemplate = viewChild.required('statusHeaderCellTemplate', {
    read: TemplateRef<any>
  });
  readonly contextHeaderCellTemplate = viewChild.required('contextHeaderCellTemplate', {
    read: TemplateRef<any>
  });
  readonly contextItems = [
    { title: 'Items 1', action: () => alert('Item 1') },
    { title: 'Items 2', action: () => alert('Item 2') }
  ];
  readonly statusTypes: StatusType[] = ['success', 'info', 'warning', 'danger'];
  rows: any[] = [];
  columns!: TableColumn[];
  pageNumber = 0;
  noSelection = false;
  selectionType = SelectionType.multiClick;
  selectionTypes = Object.keys(SelectionType);
  nextStatusType = 0;
  enforceCheckboxes = false;

  constructor() {
    for (let i = 1; i <= 250; i++) {
      this.rows.push({
        id: i,
        firstname: 'First ' + i,
        lastname: 'Last ' + i,
        age: 10 + (i % 9),
        status: this.getStatusType(i)
      });
    }
  }

  ngOnInit(): void {
    this.initTableColumns();
  }

  selectionTypeChanged(enforceCheckboxes: boolean): void {
    this.enforceCheckboxes = enforceCheckboxes;
    this.initTableColumns();
  }

  private get showCheckboxes(): boolean {
    return this.selectionType === SelectionType.checkbox || this.enforceCheckboxes;
  }

  private initTableColumns(): void {
    this.columns = [
      {
        prop: 'user',
        name: '',
        headerTemplate: this.statusHeaderCellTemplate(),
        width: this.showCheckboxes ? 112 : 80,
        resizeable: false,
        canAutoResize: false,
        cellClass: 'overflow-visible',
        cellTemplate: this.statusCellTempl(),
        checkboxable: this.showCheckboxes,
        headerCheckboxable: this.showCheckboxes
      },
      {
        prop: 'id',
        name: 'ID',
        width: 50,
        headerClass: 'justify-content-end',
        cellClass: 'text-align-right-cell',
        resizeable: false,
        canAutoResize: false
      },
      {
        prop: 'firstname',
        name: 'First Name',
        minWidth: 100,
        resizeable: true,
        canAutoResize: true
      },
      {
        prop: 'lastname',
        name: 'Last Name',
        minWidth: 100,
        resizeable: true,
        canAutoResize: true
      },
      {
        prop: 'status',
        name: 'Status',
        minWidth: 100,
        resizeable: true,
        canAutoResize: false,
        cellTemplate: this.otherStatusCellTempl()
      },
      {
        prop: 'age',
        name: 'Age',
        width: 200,
        resizeable: false,
        canAutoResize: false,
        cellTemplate: this.ageCellTempl()
      },
      {
        prop: 'context',
        name: '',
        headerTemplate: this.contextHeaderCellTemplate(),
        width: 40,
        resizeable: false,
        canAutoResize: false,
        cellTemplate: this.contextCellTempl()
      }
    ];
  }

  private getStatusType(row: number): StatusType | null {
    if (row % 4 !== 0) {
      return null;
    }
    this.nextStatusType = ++this.nextStatusType % this.statusTypes.length;
    return this.statusTypes[this.nextStatusType];
  }
}
