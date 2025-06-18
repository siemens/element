/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { TreeItem } from './si-tree-view.model';
import * as utils from './si-tree-view.utils';

describe('SiTreeViewUtils', () => {
  let parent: TreeItem;

  const checkDefaults = (item: TreeItem): void => {
    expect(item.children).toEqual([]);
    expect(item.state).toBe('collapsed');
    expect(item.active).toBe(false);
    expect(item.checked).toBe('unchecked');
    expect(item.selected).toBe(false);
    expect(item.selectable).toBe(true);
    expect(item.showCheckbox).toBeUndefined();
    expect(item.showOptionbox).toBeUndefined();
  };

  beforeEach(() => {
    parent = { label: 'parent', level: 2 };
    utils.setTreeItemDefaults(parent);
  });

  describe('with addChildItem', () => {
    it('should call setTreeItemDefaults', () => {
      utils.addChildItem(parent, { label: 'child' });

      expect(parent.children).toHaveSize(1);
      checkDefaults(parent.children![0]);
    });
  });

  describe('with addChildItems', () => {
    let children: TreeItem[];
    let initialChildSize: number;

    beforeEach(() => {
      parent = { label: 'parent', level: 2 };
      utils.setTreeItemDefaults(parent);
      const selectable = true;
      parent.children!.push({ label: 'First Child', level: parent.level! + 1, parent, selectable });
      parent.children!.push({
        label: 'Second Child',
        level: parent.level! + 1,
        parent,
        selectable
      });
      initialChildSize = parent.children!.length;
      children = [{ label: 'Child 1' }, { label: 'Child 2' }];
    });

    it('should call setTreeItemDefaults', () => {
      utils.addChildItems(parent, children);

      children.forEach(item => {
        expect(item.children).toEqual([]);
        expect(item.state).toBe('collapsed');
        expect(item.active).toBe(false);
        expect(item.checked).toBe('unchecked');
        expect(item.selected).toBe(false);
        expect(item.selectable).toBe(true);
        expect(item.showCheckbox).toBeUndefined();
        expect(item.showOptionbox).toBeUndefined();
      });
    });

    it('should initialize and copy children', () => {
      const parentWithoutChild: TreeItem = { label: 'parentWithoutChild', level: 2 };
      utils.addChildItems(parentWithoutChild, children);

      expect(parentWithoutChild.children).toHaveSize(children.length);
      expect(parentWithoutChild.children![0].label).toBe('Child 1');
      expect(parentWithoutChild.children![1].label).toBe('Child 2');
    });

    it('should append child at the end', () => {
      utils.addChildItems(parent, children);

      expect(parent.children).toHaveSize(initialChildSize + children.length);
      expect(parent.children!.at(-2)!.label).toBe('Child 1');
      expect(parent.children!.at(-1)!.label).toBe('Child 2');
    });

    it('should append child at the beginning', () => {
      utils.addChildItems(parent, children, 0);

      expect(parent.children).toHaveSize(initialChildSize + children.length);
      expect(parent.children![0].label).toBe('Child 1');
      expect(parent.children![1].label).toBe('Child 2');
    });

    it('should append child at the backwards', () => {
      utils.addChildItems(parent, children, -1);

      expect(parent.children).toHaveSize(initialChildSize + children.length);
      expect(parent.children![1].label).toBe('Child 1');
      expect(parent.children![2].label).toBe('Child 2');
    });

    it('should append child in between', () => {
      utils.addChildItems(parent, children, 1);

      expect(parent.children).toHaveSize(initialChildSize + children.length);
      expect(parent.children![1].label).toBe('Child 1');
      expect(parent.children![2].label).toBe('Child 2');
    });

    it('should update tree level and parent', () => {
      children = [
        {
          label: '1',
          children: [{ label: '1.1', children: [{ label: '1.1.1' }] }, { label: '1.2' }]
        }
      ];
      utils.addChildItems(parent, children);

      children.forEach(item => {
        expect(item.level).toBe(parent.level! + 1);
        expect(item.parent).toEqual(parent);
      });

      children[0].children!.forEach(item => {
        expect(item.level).toBe(children[0].level! + 1);
        expect(item.parent).toEqual(children[0]);
      });
    });
  });
});
