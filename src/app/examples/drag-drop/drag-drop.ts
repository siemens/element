/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem
} from '@angular/cdk/drag-drop';
import { CdkListbox, CdkOption } from '@angular/cdk/listbox';
import { CdkContextMenuTrigger, CdkMenuModule } from '@angular/cdk/menu';
import { Component, signal, viewChildren } from '@angular/core';
import { SiMenuModule } from '@siemens/element-ng/menu';

@Component({
  selector: 'app-sample',
  imports: [
    DragDropModule,
    CdkListbox,
    CdkOption,
    SiMenuModule,
    CdkContextMenuTrigger,
    CdkMenuModule
  ],
  standalone: true,
  templateUrl: './drag-drop.html'
})
export class SampleComponent {
  protected listOne = [
    'Cras justo odio',
    'Dapibus ac facilisis in',
    'Morbi leo risus',
    'Porta ac consectetur ac',
    'Vestibulum at eros'
  ];

  protected listTwo = [
    'Buy groceries: milk, bread, eggs, and cheese.',
    'Weekend tasks: clean the house, do laundry, and mow the lawn.',
    'Packing list: passport, toothbrush, sunscreen, and camera.',
    'Project steps: research, planning, execution, and review.',
    'Shopping list: apples, oranges, bananas, and grapes.',
    'Daily routine: wake up, exercise, breakfast, and work.'
  ];

  protected readonly itemInClipboard = signal<
    { item: string; list: string[]; index: number } | undefined
  >(undefined);

  private readonly cdkOptionsListOne = viewChildren('listOneItem', { read: CdkOption });
  private readonly cdkOptionsListTwo = viewChildren('listTwoItem', { read: CdkOption });

  protected itemDropped(event: CdkDragDrop<any>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }
  /**
   * Moves an item within a list to a new index.
   * This is just for demo to show how to handle keyboard interactions.
   * You may need to consider appropriate screen reader announcement as well while moving items.
   */
  protected moveWithinList(items: string[], previousIndex: number, currentIndex: number): void {
    if (currentIndex >= 0 && currentIndex < items.length) {
      moveItemInArray(items, previousIndex, currentIndex);
      if (items === this.listOne) {
        this.cdkOptionsListOne()[currentIndex].focus();
      } else {
        this.cdkOptionsListTwo()[currentIndex].focus();
      }
    }
  }

  protected cutItem(data: { item: string; list: string[]; index: number }): void {
    this.itemInClipboard.set(data);
  }

  protected pasteItem(data: { item: string; list: string[]; index: number }): void {
    if (data.list === this.itemInClipboard()?.list) {
      moveItemInArray(data.list, this.itemInClipboard()!.index!, data.index + 1);
    } else {
      transferArrayItem(
        this.itemInClipboard()!.list,
        data.list,
        this.itemInClipboard()!.index,
        data.index + 1
      );
    }
    this.itemInClipboard.set(undefined);
  }

  protected keydown(
    event: KeyboardEvent,
    data: { item: string; list: string[]; index: number }
  ): void {
    if (event.metaKey && event.key === 'x' && data.item !== 'Morbi leo risus') {
      this.cutItem(data);
    } else if (event.metaKey && event.key === 'v') {
      this.pasteItem(data);
    }
  }
}
