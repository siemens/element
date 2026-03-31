/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CdkMenuTrigger } from '@angular/cdk/menu';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  OnInit,
  signal,
  TemplateRef,
  viewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { elementDown2, elementOptionsVertical } from '@siemens/element-icons';
import { SI_DATATABLE_CONFIG, SiDatatableModule } from '@siemens/element-ng/datatable';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { MenuItem, SiMenuFactoryComponent } from '@siemens/element-ng/menu';
import { ElementDimensions, SiResizeObserverDirective } from '@siemens/element-ng/resize-observer';
import { NgxDatatableModule, TableColumn } from '@siemens/ngx-datatable';

type Status = 'Active' | 'Inactive' | 'On Leave';

interface Employee {
  id: number;
  name: string;
  department: string;
  role: string;
  status: Status;
}

const COLLAPSED_BREAKPOINT = 400;

@Component({
  selector: 'app-sample',
  imports: [
    NgxDatatableModule,
    SiDatatableModule,
    SiIconComponent,
    SiMenuFactoryComponent,
    SiResizeObserverDirective,
    CdkMenuTrigger,
    FormsModule
  ],
  templateUrl: './datatable-bulk-actions.html',
  styleUrl: './datatable-bulk-actions.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent implements OnInit {
  protected readonly icons = addIcons({ elementDown2, elementOptionsVertical });
  protected readonly tableConfig = SI_DATATABLE_CONFIG;
  protected readonly collapsed = signal(false);
  protected readonly statusMenuOpen = signal(false);

  private readonly bulkActionsTemplate = viewChild.required('bulkActionsTemplate', {
    read: TemplateRef<unknown>
  });
  private readonly checkboxCellTemplate = viewChild.required('checkboxCellTmpl', {
    read: TemplateRef<unknown>
  });
  private readonly checkboxHeaderTemplate = viewChild.required('checkboxHeaderTmpl', {
    read: TemplateRef<unknown>
  });

  protected readonly checked = signal(new Set<number>());
  protected readonly rows = signal<Employee[]>([]);
  columns!: TableColumn[];

  private readonly departments = ['Engineering', 'Marketing', 'Sales', 'Support'];
  private readonly roles = ['Developer', 'Designer', 'Manager', 'Analyst'];
  private readonly statuses: Status[] = ['Active', 'Inactive', 'On Leave'];

  protected readonly allActions: MenuItem[] = [
    { type: 'action', label: 'Delete', action: () => this.delete() },
    { type: 'action', label: 'Export', action: () => this.export() },
    {
      type: 'group',
      label: 'Change status',
      children: this.statuses.map(status => ({
        type: 'action',
        label: status,
        action: () => this.changeStatus(status)
      }))
    }
  ];

  protected readonly statusMenuItems: MenuItem[] = this.statuses.map(status => ({
    type: 'action',
    label: status,
    action: () => this.changeStatus(status)
  }));

  protected readonly allChecked = computed(
    () => this.rows().length > 0 && this.checked().size === this.rows().length
  );
  protected readonly someChecked = computed(
    () => this.checked().size > 0 && this.checked().size < this.rows().length
  );

  constructor() {
    const initial: Employee[] = [];
    for (let i = 1; i <= 50; i++) {
      initial.push({
        id: i,
        name: 'Employee ' + i,
        department: this.departments[i % this.departments.length],
        role: this.roles[i % this.roles.length],
        status: this.statuses[i % this.statuses.length]
      });
    }
    this.rows.set(initial);
  }

  ngOnInit(): void {
    this.columns = [
      {
        name: '',
        width: 50,
        sortable: false,
        resizeable: false,
        canAutoResize: false,
        headerTemplate: this.checkboxHeaderTemplate(),
        cellTemplate: this.checkboxCellTemplate(),
        summaryTemplate: this.bulkActionsTemplate(),
        cellClass: 'bulk-actions'
      },
      { name: 'Name', prop: 'name', summaryFunc: null },
      { name: 'Department', prop: 'department', summaryFunc: null },
      { name: 'Role', prop: 'role', summaryFunc: null },
      { name: 'Status', prop: 'status', summaryFunc: null }
    ];
  }

  toggleAll(): void {
    if (this.allChecked()) {
      this.checked.set(new Set());
    } else {
      this.checked.set(new Set(this.rows().map(r => r.id)));
    }
  }

  toggleRow(row: Employee): void {
    const next = new Set(this.checked());
    if (next.has(row.id)) {
      next.delete(row.id);
    } else {
      next.add(row.id);
    }
    this.checked.set(next);
  }

  delete(): void {
    this.rows.set(this.rows().filter(row => !this.checked().has(row.id)));
    this.checked.set(new Set());
  }

  export(): void {
    alert(`Exporting ${this.checked().size} items`);
  }

  onResize(dimensions: ElementDimensions): void {
    this.collapsed.set(dimensions.width < COLLAPSED_BREAKPOINT);
  }

  private changeStatus(status: Status): void {
    this.rows.set(this.rows().map(row => (this.checked().has(row.id) ? { ...row, status } : row)));
  }
}
