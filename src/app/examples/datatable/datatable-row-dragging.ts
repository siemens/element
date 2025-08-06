/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DatatableRowDefDirective, NgxDatatableModule } from '@siemens/ngx-datatable';
import { addIcons, elementMenu, SiIconNextComponent } from '@spike-rabbit/element-ng/icon';

@Component({
  selector: 'app-sample',
  imports: [
    NgxDatatableModule,
    DatatableRowDefDirective,
    DragDropModule,
    DatePipe,
    SiIconNextComponent
  ],
  templateUrl: './datatable-row-dragging.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent {
  icons = addIcons({ elementMenu });
  taskData = [
    {
      id: 1,
      priority: 1,
      task: 'Complete project proposal',
      deadline: 'July 28, 2023',
      status: 'In Progress',
      assignee: 'John Smith',
      department: 'Marketing'
    },
    {
      id: 2,
      priority: 2,
      task: 'Review client feedback',
      deadline: 'July 30, 2023',
      status: 'Not Started',
      assignee: 'Sarah Johnson',
      department: 'Customer Relations'
    },
    {
      id: 3,
      priority: 3,
      task: 'Update documentation',
      deadline: 'August 2, 2023',
      status: 'Not Started',
      assignee: 'Michael Chen',
      department: 'Development'
    },
    {
      id: 4,
      priority: 4,
      task: 'Prepare presentation slides',
      deadline: 'August 5, 2023',
      status: 'Not Started',
      assignee: 'Emily Rodriguez',
      department: 'Marketing'
    },
    {
      id: 5,
      priority: 5,
      task: 'Schedule team meeting',
      deadline: 'July 27, 2023',
      status: 'Completed',
      assignee: 'David Wilson',
      department: 'Operations'
    }
  ];

  protected drop(event: CdkDragDrop<any>): void {
    moveItemInArray(this.taskData, event.previousIndex, event.currentIndex);
    this.taskData = [...this.taskData.map((item, index) => ({ ...item, priority: index + 1 }))];
  }
}
