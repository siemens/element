/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CdkDragDrop, CdkDropList, DragDropModule } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, DebugElement, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { removeItemFromTree, reorderTreeItem, transferTreeItem } from '../drag-drop.util';
import { SiCopyDragDirective } from '../si-copy-drag.directive';
import { SiTreeViewComponent } from '../si-tree-view.component';
import { TreeItem } from '../si-tree-view.model';
import { SiTreeViewItemComponent } from './si-tree-view-item.component';
import { SiTreeViewItemDirective } from './si-tree-view-item.directive';

@Component({
  imports: [SiTreeViewComponent, SiTreeViewItemComponent, SiTreeViewItemDirective, DragDropModule],
  template: `<div class="d-flex" style="height: 300px">
    <si-tree-view
      #treeOne
      class="tree-one h-100"
      cdkDropList
      [items]="items()"
      [cdkDropListData]="treeOneComponent().dropListItems"
      (cdkDropListDropped)="itemDropped($event)"
    >
      <ng-template siTreeViewItem>
        <si-tree-view-item cdkDrag />
      </ng-template>
    </si-tree-view>
    <si-tree-view
      #treeTwo
      class="h-100"
      cdkDropList
      [items]="treeTwoItems()"
      [cdkDropListData]="treeTwoComponent().dropListItems"
      (cdkDropListDropped)="itemDropped($event)"
    >
      <ng-template siTreeViewItem>
        <si-tree-view-item cdkDrag />
      </ng-template>
    </si-tree-view>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class WrapperComponent {
  readonly treeOneList = viewChild.required('treeOne', { read: CdkDropList });
  readonly treeTwoList = viewChild.required('treeTwo', { read: CdkDropList });

  readonly treeOneComponent = viewChild.required('treeOne', { read: SiTreeViewComponent });
  readonly treeTwoComponent = viewChild.required('treeTwo', { read: SiTreeViewComponent });

  readonly items = signal<TreeItem[]>([
    {
      label: 'Company1',
      dataField1: 'Root1DataField1',
      dataField2: 'Root1DataField2',
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
        }
      ]
    },
    {
      label: 'Company2',
      dataField1: 'Root1DataField1',
      dataField2: 'Root1DataField2',
      stateIndicatorColor: 'red',
      icon: 'element-project'
    },
    {
      label: 'Company3',
      dataField1: 'Root1DataField1',
      dataField2: 'Root1DataField2',
      stateIndicatorColor: 'red',
      icon: 'element-project'
    }
  ]);

  readonly treeTwoItems = signal<TreeItem[]>([
    {
      label: 'Tree Two Item 1'
    },
    {
      label: 'Tree Two Item 2',
      state: 'expanded',
      children: [
        {
          label: 'Tree Two Child Item 1'
        }
      ]
    }
  ]);

  itemDropped(event: CdkDragDrop<any>): void {
    if (event.container === event.previousContainer) {
      const updatedTree = [...reorderTreeItem(this.items(), event)];
      this.items.set(updatedTree);
    } else {
      const updatedTrees = transferTreeItem(this.items(), this.treeTwoItems(), event, true);
      this.items.set([...updatedTrees.sourceTree]);
      this.treeTwoItems.set([...updatedTrees.targetTree]);
    }
  }
}

describe('SiTreeViewComponentWithDragDrop', () => {
  let fixture: ComponentFixture<WrapperComponent>;
  let debugElement: DebugElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(WrapperComponent);
    debugElement = fixture.debugElement;
  });

  it('renders the updated tree when item label is modified', async () => {
    await fixture.whenStable();
    expect(
      debugElement.query(By.css('si-tree-view-item .si-tree-view-item-object-data div'))
        .nativeElement.textContent
    ).toBe('Company1');

    fixture.componentInstance.items.update(items => {
      items[0].label = 'Company4';
      return [...items];
    });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(
      debugElement.query(By.css('si-tree-view-item .si-tree-view-item-object-data div'))
        .nativeElement.textContent
    ).toBe('Company4');
  });
  it('moves tree items within tree', async () => {
    await fixture.whenStable();
    expect(fixture.componentInstance.items()[0].label).toBe('Company1');
    debugElement.query(By.css('si-tree-view')).triggerEventHandler('cdkDropListDropped', {
      currentIndex: 1,
      previousIndex: 0,
      previousContainer: fixture.componentInstance.treeOneList(),
      container: fixture.componentInstance.treeOneList()
    });
    await fixture.whenStable();
    expect(fixture.componentInstance.items()[0].label).toBe('Company2');
  });

  it('does not move tree item if current and previous index are same', async () => {
    await fixture.whenStable();
    expect(fixture.componentInstance.items()[0].label).toBe('Company1');
    debugElement.query(By.css('si-tree-view')).triggerEventHandler('cdkDropListDropped', {
      currentIndex: 0,
      previousIndex: 0,
      previousContainer: fixture.componentInstance.treeOneList(),
      container: fixture.componentInstance.treeOneList()
    });
    await fixture.whenStable();
    expect(fixture.componentInstance.items()[0].label).toBe('Company1');
  });

  it('moves tree item from one tree to another and removes from source tree', async () => {
    await fixture.whenStable();
    expect(fixture.componentInstance.items()[0].label).toBe('Company1');
    debugElement.query(By.css('si-tree-view')).triggerEventHandler('cdkDropListDropped', {
      currentIndex: 2,
      previousIndex: 0,
      previousContainer: fixture.componentInstance.treeOneList(),
      container: fixture.componentInstance.treeTwoList()
    });
    await fixture.whenStable();
    expect(fixture.componentInstance.items()[0].label).toBe('Company2');
  });

  it('renders the updated tree when item is modified', async () => {
    await fixture.whenStable();
    expect(
      debugElement.query(By.css('si-tree-view-item .si-tree-view-item-object-data div'))
        .nativeElement.textContent
    ).toBe('Company1');

    fixture.componentInstance.items.update(items => {
      items[0].label = 'Company4';
      return [...items];
    });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(
      debugElement.query(By.css('si-tree-view-item .si-tree-view-item-object-data div'))
        .nativeElement.textContent
    ).toBe('Company4');
  });

  it('shall not move item into its own child', async () => {
    vi.spyOn(console, 'error');
    fixture.componentInstance.items.update(items => {
      items[0].state = 'expanded';
      return [...items];
    });
    fixture.detectChanges();
    await fixture.whenStable();
    debugElement.query(By.css('si-tree-view')).triggerEventHandler('cdkDropListDropped', {
      currentIndex: 1,
      previousIndex: 0,
      previousContainer: fixture.componentInstance.treeOneList(),
      container: fixture.componentInstance.treeOneList()
    });
    expect(console.error).toHaveBeenCalledWith('Cannot move parent into its own child');
  });

  it('removes item from tree if node is found', async () => {
    await fixture.whenStable();
    expect(debugElement.queryAll(By.css('.tree-one si-tree-view-item')).length).toBe(3);

    const treeNode = fixture.componentInstance.items()[1];
    const treeItems = removeItemFromTree(fixture.componentInstance.items(), treeNode);
    fixture.componentInstance.items.set(structuredClone(treeItems));
    await fixture.whenStable();

    expect(debugElement.queryAll(By.css('.tree-one si-tree-view-item')).length).toBe(2);
  });

  it('returns same tree if node to be removed not found', async () => {
    await fixture.whenStable();
    const treeItems = removeItemFromTree(fixture.componentInstance.items(), {
      label: 'Different node'
    });
    expect(fixture.componentInstance.items()).toEqual(treeItems);
  });

  it('should update index of tree items when item is moved', async () => {
    await fixture.whenStable();
    expect(
      debugElement.query(By.css('si-tree-view-item .si-tree-view-item-object-data div'))
        .nativeElement.textContent
    ).toBe('Company1');

    expect(debugElement.query(By.css('si-tree-view-item')).nativeElement.tabIndex).toBe(0);
    debugElement.query(By.css('si-tree-view')).triggerEventHandler('cdkDropListDropped', {
      currentIndex: 1,
      previousIndex: 0,
      previousContainer: fixture.componentInstance.treeOneList(),
      container: fixture.componentInstance.treeOneList()
    });
    await fixture.whenStable();
    expect(
      debugElement.query(By.css('si-tree-view-item .si-tree-view-item-object-data div'))
        .nativeElement.textContent
    ).toBe('Company2');
    expect(debugElement.query(By.css('si-tree-view-item')).nativeElement.tabIndex).toBe(0);
  });
});

describe('SiCopyDragDirective', () => {
  @Component({
    imports: [
      SiTreeViewComponent,
      SiTreeViewItemComponent,
      SiTreeViewItemDirective,
      DragDropModule,
      SiCopyDragDirective
    ],
    template: `<div style="height: 300px">
      <si-tree-view
        #tree
        cdkDropList
        [items]="items()"
        [cdkDropListData]="treeComponent().dropListItems"
      >
        <ng-template siTreeViewItem>
          <si-tree-view-item cdkDrag siCopyDrag />
        </ng-template>
      </si-tree-view>
    </div>`,
    changeDetection: ChangeDetectionStrategy.OnPush
  })
  class CopyDragWrapperComponent {
    readonly treeComponent = viewChild.required('tree', { read: SiTreeViewComponent });
    readonly items = signal<TreeItem[]>([
      { label: 'Item 1', state: 'leaf' },
      { label: 'Item 2', state: 'leaf' }
    ]);
  }

  it('renders items with siCopyDrag directive', async () => {
    const fixture = TestBed.createComponent(CopyDragWrapperComponent);
    await fixture.whenStable();

    const items = fixture.debugElement.queryAll(By.css('si-tree-view-item'));
    expect(items).toHaveLength(2);
    expect(items[0].nativeElement.classList).toContain('si-copy-drag');
  });
});

describe('transferTreeItem copy semantics', () => {
  const initTree = (items: TreeItem[], parent?: TreeItem, level = 0): void => {
    for (const item of items) {
      item.parent = parent;
      item.level = level;
      if (item.children) {
        initTree(item.children, item, level + 1);
      }
    }
  };

  const flatten = (items: TreeItem[]): TreeItem[] => {
    const result: TreeItem[] = [];
    for (const item of items) {
      result.push(item);
      if (item.children && item.state === 'expanded') {
        result.push(...flatten(item.children));
      }
    }
    return result;
  };

  const makeDrop = (
    sourceData: TreeItem[],
    targetData: TreeItem[],
    previousIndex: number,
    currentIndex: number
  ): CdkDragDrop<TreeItem[]> =>
    ({
      container: { data: targetData } as CdkDropList<TreeItem[]>,
      previousContainer: { data: sourceData } as CdkDropList<TreeItem[]>,
      previousIndex,
      currentIndex
    }) as CdkDragDrop<TreeItem[]>;

  it('does not remove source item when removeFromSource is false', () => {
    const sensor: TreeItem = { label: 'Sensor A', state: 'leaf' };
    const sourceItems = [sensor];
    initTree(sourceItems);

    const target: TreeItem = {
      label: 'Floor 1',
      state: 'expanded',
      children: [{ label: 'Room 101', state: 'leaf' }]
    };
    const targetItems = [target];
    initTree(targetItems);

    const targetFlat = flatten(targetItems);
    const event = makeDrop(sourceItems, targetFlat, 0, 1);

    const result = transferTreeItem(sourceItems, targetItems, event, false);

    expect(result.sourceTree).toHaveLength(1);
    expect(result.sourceTree[0].label).toBe('Sensor A');
  });

  it('creates an independent deep clone of the copied item', () => {
    const sensor: TreeItem = { label: 'Sensor A', state: 'leaf', customData: { id: 42 } };
    const sourceItems = [sensor];
    initTree(sourceItems);

    const target: TreeItem = {
      label: 'Floor 1',
      state: 'expanded',
      children: [{ label: 'Room 101', state: 'leaf' }]
    };
    const targetItems = [target];
    initTree(targetItems);

    const targetFlat = flatten(targetItems);
    const event = makeDrop(sourceItems, targetFlat, 0, 1);

    transferTreeItem(sourceItems, targetItems, event, false);

    const copiedItem = target.children![0];
    copiedItem.label = 'Modified';
    copiedItem.customData.id = 99;

    expect(sensor).toMatchObject({ label: 'Sensor A', customData: { id: 42 } });
  });

  it('copies the same item multiple times as separate clones', () => {
    const sensor: TreeItem = { label: 'Sensor A', state: 'leaf' };
    const sourceItems = [sensor];
    initTree(sourceItems);

    const target: TreeItem = {
      label: 'Floor 1',
      state: 'expanded',
      children: [{ label: 'Room 101', state: 'leaf' }]
    };
    const targetItems = [target];
    initTree(targetItems);

    const targetFlat1 = flatten(targetItems);
    const event1 = makeDrop(sourceItems, targetFlat1, 0, 1);
    transferTreeItem(sourceItems, targetItems, event1, false);

    const targetFlat2 = flatten(targetItems);
    const event2 = makeDrop(sourceItems, targetFlat2, 0, 1);
    transferTreeItem(sourceItems, targetItems, event2, false);

    expect(target.children).toHaveLength(3);
    expect(target.children![0]).not.toBe(target.children![1]);
    expect(target.children![0]).toMatchObject({ label: 'Sensor A' });
    expect(target.children![1]).toMatchObject({ label: 'Sensor A' });
  });

  it('inserts copy as child when target is expanded', () => {
    const sensor: TreeItem = { label: 'Sensor A', state: 'leaf' };
    const sourceItems = [sensor];
    initTree(sourceItems);

    const existing: TreeItem = { label: 'Existing', state: 'leaf' };
    const target: TreeItem = { label: 'Floor 1', state: 'expanded', children: [existing] };
    const targetItems = [target];
    initTree(targetItems);

    const targetFlat = flatten(targetItems);
    const event = makeDrop(sourceItems, targetFlat, 0, 1);

    transferTreeItem(sourceItems, targetItems, event, false);

    expect(target.children).toHaveLength(2);
    expect(target.children![0]).toMatchObject({ label: 'Sensor A', parent: target });
  });

  it('inserts copy as sibling when target is a leaf', () => {
    const sensor: TreeItem = { label: 'Sensor A', state: 'leaf' };
    const sourceItems = [sensor];
    initTree(sourceItems);

    const leaf: TreeItem = { label: 'Room 101', state: 'leaf' };
    const parent: TreeItem = { label: 'Floor 1', state: 'expanded', children: [leaf] };
    const targetItems = [parent];
    initTree(targetItems);

    const targetFlat = flatten(targetItems);
    const event = makeDrop(sourceItems, targetFlat, 0, 2);

    transferTreeItem(sourceItems, targetItems, event, false);

    expect(parent.children).toHaveLength(2);
    expect(parent.children![0]).toMatchObject({ label: 'Room 101' });
    expect(parent.children![1]).toMatchObject({ label: 'Sensor A', parent });
  });

  it('does not modify trees when source item is not found', () => {
    vi.spyOn(console, 'error');

    const orphan: TreeItem = { label: 'Orphan', state: 'leaf' };
    const sourceItems: TreeItem[] = [{ label: 'Other', state: 'leaf' }];
    initTree(sourceItems);

    const target: TreeItem = { label: 'Floor 1', state: 'expanded', children: [] };
    const targetItems = [target];
    initTree(targetItems);

    const targetFlat = flatten(targetItems);
    const event = makeDrop([orphan], targetFlat, 0, 1);

    transferTreeItem(sourceItems, targetItems, event, false);

    expect(target.children).toHaveLength(0);
    expect(console.error).toHaveBeenCalledWith('Source tree item not found');
  });
});
