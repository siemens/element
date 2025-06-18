/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { CheckboxState, TreeItem } from './si-tree-view.model';
import { boxClicked, selectItemsBetween } from './si-tree-view.utils';

const treeRoot: TreeItem[] = [
  {
    label: 'Company1',
    dataField1: 'SI',
    dataField2: 'SI2',
    stateIndicatorColor: 'red',
    icon: 'element-project',
    children: [
      {
        label: 'Milano',
        dataField1: 'MIL'
      },
      {
        label: 'Buffalo Grove',
        dataField1: 'BG',
        stateIndicatorColor: 'red'
      },
      {
        label: 'Pune',
        dataField1: 'PUN'
      },
      {
        label: 'Zug',
        dataField1: 'ZUG'
      }
    ]
  },
  {
    label: 'Company2',
    dataField1: 'Gg',
    icon: 'element-project',
    children: [
      {
        label: 'G-Milano',
        dataField1: 'G-MIL'
      },
      {
        label: 'G-Buffalo Grove',
        dataField1: 'G-BG',
        stateIndicatorColor: 'red'
      },
      {
        label: 'G-Pune',
        dataField1: 'G-PUN'
      },
      {
        label: 'G-Zug',
        dataField1: 'G-ZUG'
      }
    ]
  },
  {
    label: 'Company3',
    dataField1: 'MS',
    icon: 'element-project',
    children: [
      {
        label: 'M-Milano',
        dataField1: 'M-MIL',
        state: 'leaf'
      },
      {
        label: 'M-Buffalo Grove',
        dataField1: 'M-BG',
        stateIndicatorColor: 'red',
        state: 'leaf'
      },
      {
        label: 'M-Pune',
        dataField1: 'M-PUN',
        state: 'leaf'
      },
      {
        label: 'M-Zug',
        dataField1: 'M-ZUG',
        state: 'leaf'
      }
    ]
  }
];

describe('TreeItem and tree-helpers', () => {
  it('should correctly interact with checkbox', () => {
    treeRoot[0].showCheckbox = true;
    treeRoot[0].showOptionbox = false;
    treeRoot[0].checked = undefined as CheckboxState | undefined;
    treeRoot[1].checked = undefined as CheckboxState | undefined;

    boxClicked(treeRoot[0], true);

    expect(treeRoot[0].checked).toBe('checked');

    treeRoot[0].checked = 'checked';
    boxClicked(treeRoot[0], true);

    expect(treeRoot[0].checked).not.toBe('checked');

    treeRoot[0].checked = 'indeterminate';
    boxClicked(treeRoot[0], true);

    expect(treeRoot[0].checked).toBe('checked');

    treeRoot[0].checked = 'unchecked';
    treeRoot[1].checked = 'checked';
    boxClicked(treeRoot[0], true);

    expect(treeRoot[0].checked).toBe('checked');
    expect(treeRoot[1].checked).toBe('checked');

    treeRoot[0].checked = 'checked';
    treeRoot[1].checked = 'unchecked';
    boxClicked(treeRoot[0], true);

    expect(treeRoot[0].checked).not.toBe('checked');
    expect(treeRoot[1].checked).not.toBe('checked');
  });

  it('should correctly interact with optionbox', () => {
    treeRoot[0].showOptionbox = true;
    treeRoot[0].showCheckbox = false;
    treeRoot[0].checked = 'unchecked';
    treeRoot[1].checked = 'unchecked';

    boxClicked(treeRoot[0], true);

    expect(treeRoot[0].checked).toBe('checked');

    treeRoot[0].checked = 'indeterminate';
    boxClicked(treeRoot[0], false);

    expect(treeRoot[0].checked).not.toBe('checked');

    treeRoot[0].showOptionbox = true;
    treeRoot[0].checked = 'checked';
    treeRoot[1].checked = 'unchecked';
    boxClicked(treeRoot[0], true);

    expect(treeRoot[0].checked).toBe('checked');
    expect(treeRoot[1].checked).not.toBe('checked');
  });

  it('should correctly select between two items', () => {
    expect(treeRoot[0].selected).toBeFalsy();
    expect(treeRoot[1].selected).toBeFalsy();

    treeRoot[0].selectable = true;
    treeRoot[1].selectable = true;
    selectItemsBetween(treeRoot, treeRoot[0], treeRoot[1]);

    expect(treeRoot[0].selected).toBeFalsy();
    expect(treeRoot[1].selected).toBeTrue();
  });
});
