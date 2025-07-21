/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CdkDragDrop, CdkDropList, DragDropModule } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, DebugElement, viewChild } from '@angular/core';
import {
  ComponentFixture,
  discardPeriodicTasks,
  fakeAsync,
  flush,
  TestBed,
  tick
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { runOnPushChangeDetection } from '@siemens/element-ng/test-helpers';
import {
  removeItemFromTree,
  reorderTreeItem,
  SiTreeViewComponent,
  SiTreeViewModule,
  transferTreeItem,
  TreeItem
} from '@siemens/element-ng/tree-view';

@Component({
  imports: [SiTreeViewModule, DragDropModule],
  template: `<div class="d-flex" style="height: 300px">
    <si-tree-view
      #treeOne
      class="tree-one h-100"
      cdkDropList
      [items]="items"
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
      [items]="treeTwoItems"
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

  items: TreeItem[] = [
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
  ];

  treeTwoItems: TreeItem[] = [
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
  ];

  itemDropped(event: CdkDragDrop<any>): void {
    if (event.container === event.previousContainer) {
      const updatedTree = [...reorderTreeItem(this.items, event)];
      this.items = updatedTree;
    } else {
      const updatedTrees = transferTreeItem(this.items, this.treeTwoItems, event, true);
      this.items = [...updatedTrees.sourceTree];
      this.treeTwoItems = [...updatedTrees.targetTree];
    }
  }
}

describe('SiTreeViewComponentWithDragDrop', () => {
  let fixture: ComponentFixture<WrapperComponent>;
  let debugElement: DebugElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [SiTreeViewModule, DragDropModule, WrapperComponent]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WrapperComponent);
    debugElement = fixture.debugElement;
  });

  it('renders the updated tree when item label is modified', () => {
    fixture.detectChanges();
    runOnPushChangeDetection(fixture);
    expect(
      debugElement.query(By.css('si-tree-view-item .si-tree-view-item-main h5')).nativeElement
        .textContent
    ).toBe('Company1');

    fixture.componentInstance.items[0].label = 'Company4';
    fixture.detectChanges();
    runOnPushChangeDetection(fixture);
    expect(
      debugElement.query(By.css('si-tree-view-item .si-tree-view-item-main h5')).nativeElement
        .textContent
    ).toBe('Company4');
  });
  it('moves tree items within tree', fakeAsync(() => {
    fixture.detectChanges();
    runOnPushChangeDetection(fixture);
    expect(fixture.componentInstance.items[0].label).toBe('Company1');
    debugElement.query(By.css('si-tree-view')).triggerEventHandler('cdkDropListDropped', {
      currentIndex: 1,
      previousIndex: 0,
      previousContainer: fixture.componentInstance.treeOneList(),
      container: fixture.componentInstance.treeOneList()
    });
    fixture.detectChanges();
    expect(fixture.componentInstance.items[0].label).toBe('Company2');
    flush();
    discardPeriodicTasks();
  }));

  it('does not move tree item if current and previous index are same', fakeAsync(() => {
    fixture.detectChanges();
    runOnPushChangeDetection(fixture);
    expect(fixture.componentInstance.items[0].label).toBe('Company1');
    debugElement.query(By.css('si-tree-view')).triggerEventHandler('cdkDropListDropped', {
      currentIndex: 0,
      previousIndex: 0,
      previousContainer: fixture.componentInstance.treeOneList(),
      container: fixture.componentInstance.treeOneList()
    });
    fixture.detectChanges();
    expect(fixture.componentInstance.items[0].label).toBe('Company1');
    flush();
    discardPeriodicTasks();
  }));

  it('moves tree item from one tree to another and removes from source tree', fakeAsync(() => {
    fixture.detectChanges();
    runOnPushChangeDetection(fixture);
    expect(fixture.componentInstance.items[0].label).toBe('Company1');
    debugElement.query(By.css('si-tree-view')).triggerEventHandler('cdkDropListDropped', {
      currentIndex: 2,
      previousIndex: 0,
      previousContainer: fixture.componentInstance.treeOneList(),
      container: fixture.componentInstance.treeTwoList()
    });
    fixture.detectChanges();
    expect(fixture.componentInstance.items[0].label).toBe('Company2');
    flush();
    discardPeriodicTasks();
  }));

  it('renders the updated tree when item is modified', () => {
    fixture.detectChanges();
    runOnPushChangeDetection(fixture);
    expect(
      debugElement.query(By.css('si-tree-view-item .si-tree-view-item-main h5')).nativeElement
        .textContent
    ).toBe('Company1');

    fixture.componentInstance.items[0].label = 'Company4';
    fixture.detectChanges();
    runOnPushChangeDetection(fixture);
    expect(
      debugElement.query(By.css('si-tree-view-item .si-tree-view-item-main h5')).nativeElement
        .textContent
    ).toBe('Company4');
  });

  it('shall not move item into its own child', () => {
    spyOn(console, 'error');
    fixture.componentInstance.items[0].state = 'expanded';
    fixture.detectChanges();
    runOnPushChangeDetection(fixture);
    debugElement.query(By.css('si-tree-view')).triggerEventHandler('cdkDropListDropped', {
      currentIndex: 1,
      previousIndex: 0,
      previousContainer: fixture.componentInstance.treeOneList(),
      container: fixture.componentInstance.treeOneList()
    });
    expect(console.error).toHaveBeenCalledWith('Cannot move parent into its own child');
  });

  it('removes item from tree if node is found', () => {
    fixture.detectChanges();
    runOnPushChangeDetection(fixture);
    expect(debugElement.queryAll(By.css('.tree-one si-tree-view-item')).length).toBe(3);

    const treeNode = fixture.componentInstance.items[1];
    const treeItems = removeItemFromTree(fixture.componentInstance.items, treeNode);
    fixture.componentInstance.items = structuredClone(treeItems);
    fixture.detectChanges();
    runOnPushChangeDetection(fixture);

    expect(debugElement.queryAll(By.css('.tree-one si-tree-view-item')).length).toBe(2);
  });

  it('returns same tree if node to be removed not found', () => {
    fixture.detectChanges();
    runOnPushChangeDetection(fixture);
    const treeItems = removeItemFromTree(fixture.componentInstance.items, {
      label: 'Different node'
    });
    expect(fixture.componentInstance.items).toEqual(treeItems);
  });

  it('should update index of tree items when item is moved', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    runOnPushChangeDetection(fixture);
    expect(
      debugElement.query(By.css('si-tree-view-item .si-tree-view-item-main h5')).nativeElement
        .textContent
    ).toBe('Company1');

    expect(debugElement.query(By.css('si-tree-view-item')).nativeElement.tabIndex).toBe(0);
    debugElement.query(By.css('si-tree-view')).triggerEventHandler('cdkDropListDropped', {
      currentIndex: 1,
      previousIndex: 0,
      previousContainer: fixture.componentInstance.treeOneList(),
      container: fixture.componentInstance.treeOneList()
    });
    fixture.detectChanges();
    expect(
      debugElement.query(By.css('si-tree-view-item .si-tree-view-item-main h5')).nativeElement
        .textContent
    ).toBe('Company2');
    expect(debugElement.query(By.css('si-tree-view-item')).nativeElement.tabIndex).toBe(0);
    flush();
    discardPeriodicTasks();
  }));
});
