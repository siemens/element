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
import { Component } from '@angular/core';
import { SiCardComponent } from '@siemens/element-ng/card';
import { SiIconModule } from '@siemens/element-ng/icon';
import { SiMenuModule } from '@siemens/element-ng/menu';

@Component({
  selector: 'app-sample',
  imports: [DragDropModule, CdkListbox, CdkOption, SiCardComponent, SiIconModule, SiMenuModule],
  standalone: true,
  templateUrl: './drag-drop-cards.html',
  styles: `
    .card-size {
      block-size: 150px;
      inline-size: 250px;
    }
    .card-body:hover {
      cursor: auto;
    }
  `
})
export class SampleComponent {
  protected cards = [
    {
      heading: `Natural Gas Usage`,
      text: `Some quick example text to build on the card title and make up the bulk of the card's
  content.`
    },
    {
      heading: `FS20`,
      text: `Some quick example text to build on the card title and make up the bulk of the card's
  content.`,
      dragDisabled: true
    },
    {
      heading: `Overflows`,
      text: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum nec ornare nunc,
  quis feugiat ex. Vivamus mollis nisi at dapibus vehicula. Curabitur dui ante, interdum
  pharetra hendrerit vel, efficitur in erat. Phasellus porttitor molestie orci, vel
  consectetur ipsum commodo eget. Pellentesque ac gravida mi, id vehicula purus. Sed
  egestas nisl est, eget faucibus velit hendrerit vulputate. Aenean et pretium enim, in
  facilisis est. Nam luctus felis ut auctor sollicitudin. Donec elementum nec lorem vitae
  scelerisque. Mauris elementum metus diam, sit amet ornare mi rhoncus sit amet. Nulla
  semper scelerisque molestie. Cras et purus et nisi interdum maximus sed et leo. Mauris
  bibendum hendrerit nunc, sed malesuada augue.`
    },
    {
      heading: `Oil Usage`,
      text: `Some quick example text to build on the card title and make up the bulk of the card's
  content.`
    },
    {
      heading: `Water Usage`,
      text: `Some quick example text to build on the card title and make up the bulk of the card's
  content.`
    }
  ];

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
}
