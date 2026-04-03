/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  OnInit,
  signal,
  TemplateRef,
  viewChild
} from '@angular/core';
import {
  SiApplicationHeaderComponent,
  SiHeaderBrandDirective
} from '@siemens/element-ng/application-header';
import { SI_DATATABLE_CONFIG, SiDatatableModule } from '@siemens/element-ng/datatable';
import { SiEmptyStateComponent } from '@siemens/element-ng/empty-state';
import { SiResizeObserverDirective } from '@siemens/element-ng/resize-observer';
import { SiSidePanelComponent, SiSidePanelContentComponent } from '@siemens/element-ng/side-panel';
import { ActivateEvent, NgxDatatableModule, TableColumn } from '@siemens/ngx-datatable';

interface Employee {
  id: number;
  name: string;
  department: string;
  role: string;
  status: string;
}

@Component({
  selector: 'app-sample',
  imports: [
    NgxDatatableModule,
    SiApplicationHeaderComponent,
    SiDatatableModule,
    SiEmptyStateComponent,
    SiHeaderBrandDirective,
    SiResizeObserverDirective,
    SiSidePanelComponent,
    SiSidePanelContentComponent
  ],
  templateUrl: './datatable-bulk-actions-side-panel.html',
  styleUrl: './datatable-bulk-actions.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent implements OnInit {
  protected readonly tableConfig = SI_DATATABLE_CONFIG;
  protected readonly panelCollapsed = signal(true);
  protected readonly selectedRow = signal<Employee[]>([]);

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
  private readonly statuses = ['Active', 'Inactive', 'On Leave'];

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
    this.updatePanel();
  }

  toggleRow(row: Employee): void {
    const next = new Set(this.checked());
    if (next.has(row.id)) {
      next.delete(row.id);
    } else {
      next.add(row.id);
    }
    this.checked.set(next);
    this.updatePanel();
  }

  acknowledge(): void {
    if (this.checked().size > 0) {
      alert(`Acknowledged ${this.checked().size} items`);
    } else if (this.selectedRow()) {
      alert(`Acknowledged ${this.selectedRow()!.length} items`);
    }
  }

  closePanel(): void {
    this.panelCollapsed.set(true);
    this.selectedRow.set([]);
  }

  private updatePanel(): void {
    if (this.checked().size > 0) {
      this.selectedRow.set([]);
    }
  }
}
