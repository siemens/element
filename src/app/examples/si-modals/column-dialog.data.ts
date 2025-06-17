/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Column } from '@siemens/element-ng/column-selection-dialog';

export const headerData: Column[] = [
  {
    id: 'No1',
    title: 'Row 1 - not draggable',
    visible: true,
    draggable: false,
    disabled: false,
    editable: true
  },
  {
    id: 'No2',
    title: 'Row 2 - not draggable',
    visible: false,
    draggable: false,
    disabled: false
  },
  {
    id: 'No3',
    title: 'Row 3 - not draggable',
    visible: true,
    draggable: false,
    disabled: true
  },
  {
    id: 'No4',
    title: 'Row 4 - not draggable',
    visible: false,
    draggable: false,
    disabled: true
  },
  {
    id: 'No5',
    title: 'Row 5',
    visible: true,
    draggable: true,
    disabled: false,
    editable: true
  },
  {
    id: 'No6',
    title: 'Row 6',
    visible: true,
    draggable: true,
    disabled: true
  },
  {
    id: 'No7',
    title: 'Row 7',
    visible: true,
    draggable: true,
    disabled: false
  },
  {
    id: 'No8',
    title: 'Row 8',
    visible: true,
    draggable: true,
    disabled: false,
    editable: true
  },
  {
    id: 'No9',
    title: 'Row 9',
    visible: true,
    draggable: true,
    disabled: false
  },
  {
    id: 'No10',
    title: 'Row 10',
    visible: true,
    draggable: true,
    disabled: false
  },
  {
    id: 'No11',
    title: 'Row 11',
    visible: true,
    draggable: true,
    disabled: false
  },
  {
    id: 'No12',
    title: 'Row 12',
    visible: true,
    draggable: true,
    disabled: false
  },
  {
    id: 'No13',
    title: 'Row 13',
    visible: false,
    draggable: true,
    disabled: false
  },
  {
    id: 'No14',
    title: 'Row 14 - not draggable',
    visible: false,
    draggable: false,
    disabled: false
  },
  {
    id: 'No15',
    title: 'Row 15 - not draggable',
    visible: false,
    draggable: false,
    disabled: false
  }
];

export const cloneColumnData = (columns: Column[]): Column[] =>
  columns.map(x => Object.assign({}, x));
