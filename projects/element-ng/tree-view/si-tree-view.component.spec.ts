/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DebugElement,
  inject,
  ViewChild
} from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SiLoadingSpinnerModule } from '@siemens/element-ng/loading-spinner';
import { MenuItem } from '@siemens/element-ng/menu';
import { ResizeObserverService } from '@siemens/element-ng/resize-observer';
import { MenuItemsProvider, SiTreeViewModule } from '@siemens/element-ng/tree-view';
import { SiTranslateModule } from '@siemens/element-translate-ng/translate';
import { BehaviorSubject } from 'rxjs';

import { runOnPushChangeDetection } from '../test-helpers';
import { SiTreeViewItemHeightService } from './si-tree-view-item-height.service';
import { SiTreeViewComponent } from './si-tree-view.component';
import { LoadChildrenEventArgs, TreeItem } from './si-tree-view.model';

@Component({
  imports: [SiLoadingSpinnerModule, SiTranslateModule, SiTreeViewModule],
  template: `<si-tree-view
    class="vh-100"
    [style]="style"
    [class.tree-xs]="smallSize"
    [items]="items"
    [enableSelection]="enableSelection"
    [enableIcon]="enableIcon"
    [singleSelectMode]="singleSelectMode"
    [folderStateStart]="folderStateStart"
    [selectedItem]="selectedItem"
    [groupedList]="groupedList"
    [flatTree]="flatTree"
    [enableDataField1]="enableDataField1"
    [enableDataField2]="enableDataField2"
    [enableContextMenuButton]="enableContextMenuButton"
    [expandOnClick]="expandOnClick"
    [compactMode]="compactMode"
    [contextMenuItems]="contextMenuItems"
    [enableStateIndicator]="enableStateIndicator"
    [isVirtualized]="isVirtualized"
    [enableCheckbox]="enableCheckbox"
    [inheritChecked]="inheritChecked"
    [enableOptionbox]="enableOptionbox"
    [pageSize]="pageSize"
    [pagesVirtualized]="pagesVirtualized"
    [horizontalScrolling]="horizontalScrolling"
    [deleteChildrenOnCollapse]="deleteChildrenOnCollapse"
    [disableFilledIcons]="disableFilledIcons"
    [expandCollapseAll]="expandCollapseAll"
    (loadChildren)="loadChildren($event)"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class WrapperComponent {
  @ViewChild(SiTreeViewComponent, { static: true }) treeViewComponent!: SiTreeViewComponent;
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
    }
  ];
  loadChildren = (e: LoadChildrenEventArgs): void => {};
  style = '';
  smallSize = false;
  selectedItem?: TreeItem | TreeItem[] = this.items[0];
  enableSelection = true;
  enableIcon = true;
  singleSelectMode = true;
  folderStateStart = true;
  groupedList = false;
  flatTree = false;
  enableDataField1 = true;
  enableDataField2 = false;
  enableContextMenuButton = true;
  compactMode = false;
  contextMenuItems?: MenuItem[] | MenuItemsProvider = [
    { label: 'Item One', type: 'action', action: () => alert('action one') }
  ];
  enableStateIndicator = true;
  isVirtualized = true;
  enableCheckbox = false;
  inheritChecked = true;
  enableOptionbox = false;
  expandOnClick = false;
  pageSize?: number = 10;
  pagesVirtualized?: number = 6;
  horizontalScrolling = false;
  disableFilledIcons = false;
  deleteChildrenOnCollapse = false;
  expandCollapseAll = false;
  cdRef = inject(ChangeDetectorRef);
  updateItems = (items: TreeItem[]): void => {
    this.items = items;
    this.cdRef.markForCheck();
  };
}
describe('SiTreeViewComponent', () => {
  let fixture: ComponentFixture<WrapperComponent>;
  let component: WrapperComponent;
  let debugElement: DebugElement;
  let element: HTMLElement;
  let originalRequestAnimationFrame: any;

  /** Get SiTreeViewItemHeightService for tree instance */
  const getHeightService = (): SiTreeViewItemHeightService =>
    fixture.debugElement.children[0].injector.get(SiTreeViewItemHeightService);

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        SiLoadingSpinnerModule,
        NoopAnimationsModule,
        SiTranslateModule,
        SiTreeViewModule,
        WrapperComponent
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WrapperComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    element = fixture.nativeElement;
  });

  beforeAll(() => {
    originalRequestAnimationFrame = window.requestAnimationFrame;
  });

  afterAll(() => {
    window.requestAnimationFrame = originalRequestAnimationFrame;
  });

  const createTreeItems = (count: number, extraProperties?: Partial<TreeItem>): TreeItem[] => {
    const treeItems: TreeItem[] = [];
    for (let i = 1; i <= count; i++) {
      treeItems.push({
        ...extraProperties,
        label: `Test${i}`
      });
    }
    return treeItems;
  };

  it('should contain set items', () => {
    fixture.detectChanges();
    expect(debugElement.query(By.css('.si-tree-view-item-icon.element-project'))).toBeTruthy();
  });

  it('should contain folder state start', () => {
    component.folderStateStart = true;
    fixture.detectChanges();
    expect(component.treeViewComponent.folderStateStart()).toBeTrue();
    expect(
      debugElement.query(By.css('.si-tree-view-root-ul .si-tree-view-li-item a .element-down-2'))
    ).toBeFalsy();
    expect(
      debugElement.query(By.css('.si-tree-view-root-ul .si-tree-view-li-item a .element-right-2'))
    ).toBeTruthy();
  });

  it('should contain folder state right', () => {
    component.folderStateStart = false;
    fixture.detectChanges();
    expect(
      debugElement.query(By.css('.si-tree-view-root-ul .si-tree-view-li-item a .element-down-2'))
    ).toBeTruthy();
    expect(
      debugElement.query(By.css('.si-tree-view-root-ul .si-tree-view-li-item a .element-right-2'))
    ).toBeFalsy();
  });

  it('should enable groupedList and folder state right', () => {
    component.folderStateStart = false;
    component.groupedList = true;
    fixture.detectChanges();
    expect(
      debugElement.query(By.css('.si-tree-view-root-ul .si-tree-view-item-group a .element-down-2'))
    ).toBeTruthy();
    expect(
      debugElement.query(
        By.css('.si-tree-view-root-ul .si-tree-view-item-group a .element-right-2')
      )
    ).toBeFalsy();
  });

  it('should enable groupedList and folder state start', () => {
    component.folderStateStart = true;
    component.groupedList = true;
    fixture.detectChanges();
    expect(
      debugElement.query(By.css('.si-tree-view-root-ul .si-tree-view-item-group a .element-down-2'))
    ).toBeFalsy();
    expect(
      debugElement.query(
        By.css('.si-tree-view-root-ul .si-tree-view-item-group a .element-right-2')
      )
    ).toBeTruthy();
  });

  it('should be a flat tree', () => {
    component.flatTree = true;
    fixture.detectChanges();
    expect(debugElement.query(By.css('.si-tree-view-header'))).toBeTruthy();
  });

  describe('when switching to a flat tree', () => {
    beforeEach(() => {
      component.selectedItem = undefined;
      fixture.detectChanges();
    });

    const clickItem = (index: number, multiple = false): void => {
      return debugElement
        .query(By.css('si-tree-view-item:nth-child(' + index + ') .si-tree-view-item-main'))
        .nativeElement.dispatchEvent(
          new MouseEvent('click', { bubbles: true, metaKey: multiple, ctrlKey: multiple })
        );
    };

    const openFirstItem = (): void => {
      debugElement.query(By.css('a.si-tree-view-item-toggle')).nativeElement.click();
    };

    const getHeaderContent = (): void => {
      return debugElement.query(By.css('.si-tree-view-header')).nativeElement.textContent;
    };

    const getItemsContent = (): void => {
      return debugElement.query(By.css('.si-tree-view')).nativeElement.textContent;
    };

    it('should display top level', () => {
      component.flatTree = true;
      runOnPushChangeDetection(fixture);
      const rootItem = component.items[0];
      expect(getHeaderContent()).not.toContain(rootItem.label);
      expect(getItemsContent()).toContain(rootItem?.label);
    });

    it('should display children of last opened item', () => {
      openFirstItem();
      const rootItem = component.items[0];
      const item = rootItem.children![1];
      runOnPushChangeDetection(fixture);
      component.flatTree = true;
      runOnPushChangeDetection(fixture);
      expect(getHeaderContent()).toContain(rootItem.label);
      expect(getItemsContent()).toContain(item?.label);
    });

    it('should keep single selected item visible', () => {
      openFirstItem();
      runOnPushChangeDetection(fixture);
      const rootItem = component.items[0];
      const item = rootItem.children![1];
      clickItem(3);
      runOnPushChangeDetection(fixture);
      component.flatTree = true;
      runOnPushChangeDetection(fixture);
      expect(getHeaderContent()).toContain(rootItem.label);
      expect(getItemsContent()).toContain(item?.label);
    });

    it('should keep multiple selected items visible', () => {
      component.singleSelectMode = false;
      openFirstItem();
      runOnPushChangeDetection(fixture);
      const rootItem = component.items[0];
      const item1 = rootItem.children![0];
      const item2 = rootItem.children![1];
      clickItem(2, true);
      clickItem(3, true);
      runOnPushChangeDetection(fixture);
      component.flatTree = true;
      runOnPushChangeDetection(fixture);
      expect(getHeaderContent()).toContain(rootItem.label);
      expect(getItemsContent()).toContain(item1?.label);
      expect(getItemsContent()).toContain(item2?.label);
    });

    it('should keep multiple selected items visible, even if at different levels', () => {
      component.singleSelectMode = false;
      openFirstItem();
      runOnPushChangeDetection(fixture);
      const rootItem = component.items[0];
      clickItem(1, true);
      clickItem(3, true);
      runOnPushChangeDetection(fixture);
      component.flatTree = true;
      runOnPushChangeDetection(fixture);
      expect(getHeaderContent()).not.toContain(rootItem.label);
      expect(getItemsContent()).toContain(rootItem?.label);
    });

    it('should start at root level if selection is at root', () => {
      const rootItem = component.items[0];
      clickItem(1);
      runOnPushChangeDetection(fixture);
      component.flatTree = true;
      runOnPushChangeDetection(fixture);
      expect(getHeaderContent()).not.toContain(rootItem.label);
      expect(getItemsContent()).toContain(rootItem?.label);
    });
  });

  it('should be no flat tree (default)', () => {
    expect(debugElement.query(By.css('.si-tree-view-header'))).toBeFalsy();
  });

  it('should be a grouped List', () => {
    component.groupedList = true;
    fixture.detectChanges();
    expect(debugElement.query(By.css('.si-tree-view .si-tree-view-item-group'))).toBeTruthy();
    expect(debugElement.query(By.css('.si-tree-view-li-item'))).toBeFalsy();
  });

  it('should be no grouped List (default)', () => {
    fixture.detectChanges();
    expect(debugElement.query(By.css('.si-tree-view .si-tree-view-item-group'))).toBeFalsy();
    expect(debugElement.query(By.css('.si-tree-view-li-item'))).toBeTruthy();
  });

  it('should show no dataFields (default)', () => {
    expect(debugElement.query(By.css('.si-tree-view-item-object-data #data-field-1'))).toBeFalsy();
    expect(debugElement.query(By.css('.si-tree-view-item-object-data #data-field-2'))).toBeFalsy();
  });

  it('should show dataField1', () => {
    component.enableDataField1 = true;
    fixture.detectChanges();
    expect(component.treeViewComponent.enableDataField1()).toBeTrue();
    expect(debugElement.query(By.css('.si-tree-view-item-object-data-field-1'))).toBeTruthy();
    expect(element.querySelector('.si-tree-view-item-object-data-field-1')!.innerHTML).toContain(
      'Root1DataField1'
    );
  });

  it('should show dataField2', () => {
    component.enableDataField2 = true;
    fixture.detectChanges();
    expect(component.treeViewComponent.enableDataField2()).toBeTrue();
    expect(debugElement.query(By.css('.si-tree-view-item-object-data-field-2'))).toBeTruthy();
    expect(element.querySelector('.si-tree-view-item-object-data-field-2')!.innerHTML).toContain(
      'Root1DataField2'
    );
  });

  it('should hide menu button', () => {
    component.enableContextMenuButton = false;
    fixture.detectChanges();
    expect(component.treeViewComponent.enableContextMenuButton()).toBeFalse();
    expect(
      debugElement.query(By.css('.si-tree-view-menu-btn.element-options-vertical'))
    ).toBeFalsy();
  });

  it('should show menu button', () => {
    component.contextMenuItems = [{ label: 'Title', type: 'action', action: () => {} }];
    component.enableContextMenuButton = true;
    fixture.detectChanges();
    expect(component.treeViewComponent.enableContextMenuButton()).toBeTrue();
    expect(
      debugElement.query(By.css('.si-tree-view-menu-btn.element-options-vertical'))
    ).toBeTruthy();
  });

  it('should hide state pipe', () => {
    component.enableStateIndicator = false;
    fixture.detectChanges();
    expect(component.treeViewComponent.enableStateIndicator()).toBeFalse();
    expect(debugElement.query(By.css('.si-tree-view-state-indicator'))).toBeFalsy();
  });

  it('should show state pipe', () => {
    component.enableStateIndicator = true;
    fixture.detectChanges();
    expect(component.treeViewComponent.enableStateIndicator()).toBeTrue();
    expect(debugElement.query(By.css('.si-tree-view-state-indicator'))).toBeTruthy();
    expect(
      debugElement.query(By.css('.si-tree-view-state-indicator')).styles['background-color']
    ).toBe('red');
  });

  it('should be not virtualized', () => {
    component.isVirtualized = false;
    fixture.detectChanges();
    expect(debugElement.query(By.css('.si-tree-view > div + div + div'))).toBeFalsy();
  });

  it('should render all items in DOM on expand with virtualization off', () => {
    component.isVirtualized = false;
    component.expandCollapseAll = true;
    const root = createTreeItems(1);
    root[0].children = createTreeItems(99);
    component.items = root;
    fixture.detectChanges();
    expect(element.querySelectorAll('.si-tree-view-item').length).toBe(1);

    fixture.detectChanges();
    element
      .querySelectorAll('.si-tree-view-expand-collapse-container button')[0]
      .dispatchEvent(new Event('click'));

    fixture.detectChanges();
    expect(element.querySelectorAll('.si-tree-view-item').length).toBe(100);
  });

  it('should be virtualized', () => {
    component.isVirtualized = true;
    fixture.detectChanges();
    expect(debugElement.query(By.css('.si-tree-view > div + div + div'))).toBeTruthy();
  });

  it('should not show checkbox or option box', () => {
    expect(debugElement.query(By.css('.form-check-input'))).toBeFalsy();
  });

  it('should show checkbox and check click', fakeAsync(() => {
    component.enableCheckbox = true;
    fixture.detectChanges();
    const input = debugElement.query(By.css('.form-check-input')).nativeElement;
    expect(component.treeViewComponent.enableCheckbox()).toBeTrue();
    expect(input.checked).toBeFalsy();

    input.click();
    tick();
    fixture.detectChanges();

    expect(input.checked).toBeTruthy(); // state after click
  }));

  it('should show checkbox and check click', fakeAsync(() => {
    component.enableCheckbox = true;
    component.inheritChecked = true;
    component.folderStateStart = false;
    fixture.detectChanges();
    const input = debugElement.query(By.css('.form-check-input')).nativeElement;
    expect(input.checked).toBeFalsy();
    expect(component.treeViewComponent.inheritChecked()).toBeTrue();
    input.click();
    tick();
    fixture.detectChanges();
    expect(input.checked).toBeTruthy();

    debugElement
      .query(By.css('.si-tree-view-root-ul .si-tree-view-li-item a .element-down-2'))
      .triggerEventHandler('click', null);
    tick();
    fixture.detectChanges();
    expect(input.checked).toBeTruthy();
  }));

  it('should show option box', () => {
    component.enableOptionbox = true;
    fixture.detectChanges();
    const input = fixture.debugElement.query(By.css('.form-check-input')).nativeElement;
    expect(component.treeViewComponent.enableOptionbox()).toBeTrue();
    expect(input.checked).toBeFalsy();
    expect(input.type).toBe('radio');
  });

  it('should show option box and check click', fakeAsync(() => {
    component.enableOptionbox = true;
    component.folderStateStart = false;
    fixture.detectChanges();

    // Option boxes don't work on the first level. So expand the tree first
    debugElement
      .query(By.css('.si-tree-view-root-ul .si-tree-view-li-item .si-tree-view-item-toggle'))
      .triggerEventHandler('click', null);
    tick();
    fixture.detectChanges();
    const input = fixture.debugElement.query(By.css('.form-check-input')).nativeElement;
    // Click on the now expanded optionbox. (Second item in the list)
    input.click();
    tick();
    fixture.detectChanges();

    expect(input.checked).toBeTruthy();
  }));

  it('item should toggle by click on collapse button', async () => {
    component.folderStateStart = false;
    fixture.detectChanges();
    debugElement
      .query(By.css('.si-tree-view-root-ul .si-tree-view-li-item .si-tree-view-item-toggle'))
      .triggerEventHandler('click', null);
    fixture.detectChanges();
    const item = element.querySelectorAll('.si-tree-view-item')[1];
    expect(item.querySelector('.si-tree-view-item-object-data h5')?.innerHTML).toContain('Milano');
  });

  it('item should be selected', () => {
    component.enableSelection = true;
    fixture.detectChanges();

    expect(
      debugElement.query(By.css('.si-tree-view-li-item.si-tree-view-item-selected'))
    ).toBeTruthy();
  });

  it('should return folderStateStart true as default', () => {
    expect(component.folderStateStart).toBeTrue();
  });

  it('should call onFlatTreeNavigateUp', () => {
    component.flatTree = true;
    // Use of <any> due to accessing protected member
    const spy = spyOn<any>(component.treeViewComponent, 'onFlatTreeNavigateUp').and.callThrough();
    fixture.detectChanges();
    expect(debugElement.queryAll(By.css('.si-tree-view-item-toggle')).length).toBeGreaterThan(0);
    debugElement
      .queryAll(By.css('.si-tree-view-item-toggle'))[0]
      .triggerEventHandler('click', null);
    fixture.detectChanges();
    const item = element.querySelectorAll('.si-tree-view-item-toggle')[1];
    item.dispatchEvent(new Event('click'));
    fixture.detectChanges();

    expect(element.querySelectorAll('.si-tree-view-header-btn').length).toBe(2);
    element.querySelectorAll('.si-tree-view-header-btn')[1].dispatchEvent(new Event('click'));

    fixture.detectChanges();
    expect(spy).toHaveBeenCalled();
  });

  it('should call onFlatTreeNavigateHome', fakeAsync(() => {
    component.flatTree = true;
    // Use of <any> due to accessing protected member
    const spy = spyOn<any>(component.treeViewComponent, 'onFlatTreeNavigateHome').and.callThrough();
    fixture.detectChanges();
    debugElement.queryAll(By.css('.si-tree-view-header-btn'))[0].triggerEventHandler('click', null);
    tick();
    fixture.detectChanges();
    expect(spy).toHaveBeenCalled();
  }));

  it('should expand and collapse all items', fakeAsync(() => {
    component.expandCollapseAll = true;
    spyOn(component.treeViewComponent, 'expandAll').and.callThrough();
    spyOn(component.treeViewComponent, 'collapseAll').and.callThrough();

    fixture.detectChanges();
    element
      .querySelectorAll('.si-tree-view-expand-collapse-container button')[0]
      .dispatchEvent(new Event('click'));
    tick();
    fixture.detectChanges();
    expect(component.treeViewComponent.expandAll).toHaveBeenCalled();

    element
      .querySelectorAll('.si-tree-view-expand-collapse-container button')[1]
      .dispatchEvent(new Event('click'));
    tick();
    fixture.detectChanges();
    expect(component.treeViewComponent.collapseAll).toHaveBeenCalled();

    flush();
  }));

  it('should call item click', () => {
    spyOn(component.treeViewComponent.treeItemClicked, 'emit');
    fixture.detectChanges();
    element.querySelectorAll('.si-tree-view-item-main')[0].dispatchEvent(new Event('click'));
    fixture.detectChanges();
    expect(component.treeViewComponent.treeItemClicked.emit).toHaveBeenCalled();
  });

  it('should contain custom menu items', fakeAsync(() => {
    spyOn(component.treeViewComponent.treeItemClicked, 'emit');
    const menuItems: MenuItem[] = [];
    menuItems.push(
      { label: 'Item One', type: 'action', action: () => alert('action one') },
      { label: 'Item Two', type: 'action', action: () => alert('action two') }
    );
    component.contextMenuItems = menuItems;
    fixture.detectChanges();
    tick(1000);
    element.querySelectorAll('.si-tree-context-menu-btn div')[0].dispatchEvent(new Event('click'));
    fixture.detectChanges();
    flush();
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    expect(document.querySelector<HTMLElement>('si-menu si-menu-item')?.innerText).toBe('Item One');
  }));

  it('should allow returing menu items as observable with menu provider', fakeAsync(() => {
    component.enableContextMenuButton = true;

    const menuItems = new BehaviorSubject<MenuItem[]>([
      { label: 'Item One', type: 'action', action: () => alert('action one') }
    ]);

    component.contextMenuItems = () => {
      return menuItems;
    };
    fixture.detectChanges();
    runOnPushChangeDetection(fixture);
    element.querySelectorAll('.si-tree-context-menu-btn div')[0].dispatchEvent(new Event('click'));
    fixture.detectChanges();
    expect(document.querySelector<HTMLElement>('si-menu si-menu-item')?.innerText).toBe('Item One');
    menuItems.next([{ label: 'Item Updated', type: 'action', action: () => alert('action one') }]);
    fixture.detectChanges();
    runOnPushChangeDetection(fixture);
    expect(document.querySelector<HTMLElement>('si-menu si-menu-item')?.innerText).toBe(
      'Item Updated'
    );

    fixture.detectChanges();
    flush();
  }));

  describe('with context menu items', () => {
    beforeEach(fakeAsync(() => {
      const menuItems: MenuItem[] = [];
      menuItems.push(
        { label: 'Item One', type: 'action', action: () => alert('action one') },
        {
          label: 'Item Two',
          type: 'action',
          action: () => alert('action two')
        }
      );
      component.contextMenuItems = menuItems;
    }));

    it('should open on Shift + F10', fakeAsync(() => {
      fixture.detectChanges();
      element.querySelectorAll('si-tree-view-item')[0].dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'F10',
          shiftKey: true
        })
      );
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      expect(document.querySelector<HTMLElement>('si-menu si-menu-item')?.innerText).toBe(
        'Item One'
      );
    }));

    it('should open on context-menu button', fakeAsync(() => {
      fixture.detectChanges();
      element.querySelectorAll('si-tree-view-item')[0].dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ContextMenu'
        })
      );
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      expect(document.querySelector<HTMLElement>('si-menu si-menu-item')?.innerText).toBe(
        'Item One'
      );
    }));

    it('should open on context-menu event', fakeAsync(() => {
      fixture.detectChanges();
      element.querySelectorAll('si-tree-view-item')[0].dispatchEvent(new Event('contextmenu'));
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      expect(document.querySelector<HTMLElement>('si-menu si-menu-item')?.innerText).toBe(
        'Item One'
      );
    }));

    it('should have only one context menu open at a time', fakeAsync(() => {
      // Open context menu of tree different items left one menu open
      component.items = createTreeItems(3);
      fixture.detectChanges();
      const items = element.querySelectorAll('si-tree-view-item');
      items.forEach(i => {
        i.dispatchEvent(new Event('contextmenu'));
        tick();
        expect(document.querySelectorAll('si-menu')?.length).toBe(1);
      });
    }));
  });

  it('should handle page size and pages virtualized', () => {
    component.pageSize = 5;
    component.pagesVirtualized = 10;
    component.isVirtualized = true;
    component.items = createTreeItems(100);
    fixture.detectChanges();
    expect(element.querySelectorAll('si-tree-view-item').length).toBe(50);
  });

  it('should delete children on collapse', fakeAsync(() => {
    fixture.detectChanges();
    component.deleteChildrenOnCollapse = true;
    component.expandCollapseAll = true;
    component.cdRef.markForCheck();
    fixture.detectChanges();
    expect(component.treeViewComponent.deleteChildrenOnCollapse()).toBeTrue();
    element.querySelectorAll('.si-tree-view-item-toggle')[0].dispatchEvent(new Event('click'));
    tick();
    fixture.detectChanges();
    element.querySelectorAll('.si-tree-view-item-toggle')[0].dispatchEvent(new Event('click'));
    tick();
    fixture.detectChanges();
    expect(component.items[0].children?.length).toBe(0);
    flush();
  }));

  it('should handle method treeItemsSelected', () => {
    spyOn(component.treeViewComponent.treeItemsSelected, 'emit');
    component.enableSelection = true;
    fixture.detectChanges();
    element.querySelectorAll('.si-tree-view-item-main')[0].dispatchEvent(new Event('click'));
    fixture.detectChanges();
    expect(component.treeViewComponent.treeItemsSelected.emit).toHaveBeenCalledWith([
      component.items[0]
    ]);
  });

  it('should handle refresh API', () => {
    fixture.detectChanges();
    component.flatTree = true;
    expect(element.querySelectorAll('si-tree-view-item').length).toBe(1);

    component.items = createTreeItems(2);
    component.treeViewComponent.refresh();
    runOnPushChangeDetection(fixture);
    expect(element.querySelectorAll('si-tree-view-item').length).toBe(2);

    component.flatTree = false;
    component.items = createTreeItems(3);
    component.treeViewComponent.refresh();
    runOnPushChangeDetection(fixture);
    expect(element.querySelectorAll('si-tree-view-item').length).toBe(3);
  });

  it('should handle method scrollIntoView', () => {
    component.items = createTreeItems(100);
    component.pageSize = 10;
    component.pagesVirtualized = 6;
    component.isVirtualized = true;
    fixture.detectChanges();
    expect(element.querySelector('.si-tree-view-root-ul')?.childElementCount).toBe(60);
    component.treeViewComponent.scrollItemIntoView(component.items[99]);
    fixture.detectChanges();
    expect(
      element.querySelector(`.si-tree-view-root-ul
    si-tree-view-item:last-child .si-tree-view-item-object-data`)?.textContent
    ).toBe('Test100');
  });

  it('should handle loadChildren', () => {
    component.items = [
      {
        label: 'Company1',
        children: []
      }
    ];
    spyOn(component, 'loadChildren').and.callThrough();
    fixture.detectChanges();
    element.querySelector('.si-tree-view-item-toggle')?.dispatchEvent(new Event('click'));
    fixture.detectChanges();
    expect(component.loadChildren).toHaveBeenCalledTimes(1);
  });

  it('should append nodes from dynamic loadChildren', () => {
    component.items = [
      {
        label: 'Company1',
        children: []
      }
    ];
    spyOn(component, 'loadChildren').and.callFake((e: LoadChildrenEventArgs) =>
      e.callback(e.treeItem, [{ label: 'loaded child' }])
    );
    fixture.detectChanges();
    element.querySelector('.si-tree-view-item-toggle')?.dispatchEvent(new Event('click'));
    fixture.detectChanges();

    const lastItem = Array.from(element.querySelectorAll<HTMLElement>('si-tree-view-item')).at(-1);
    expect(lastItem?.innerText.trim()).toBe('loaded child');
  });

  it('should handle showTreeItem', () => {
    component.items = createTreeItems(1);
    component.items[0].children = createTreeItems(1);
    component.items[0].children[0].children = [{ parent: component.items[0].children[0] }];
    component.items[0].children[0].children[0].children = [
      { parent: component.items[0].children[0].children[0] }
    ];

    spyOn(component.treeViewComponent, 'expandTreeItem');
    fixture.detectChanges();

    component.treeViewComponent.showTreeItem(
      component.items[0].children[0].children[0].children[0]
    );
    fixture.detectChanges();

    expect(component.treeViewComponent.expandTreeItem).toHaveBeenCalledWith(
      component.items[0].children[0].children[0]
    );
  });

  it('should handle scroll', () => {
    component.items = createTreeItems(100);
    fixture.detectChanges();
    expect(element.querySelectorAll('si-tree-view-item').length).toBe(60);

    element.querySelector('.si-tree-view')?.scroll(0, 5000);
    fixture.detectChanges();

    element.querySelector('.si-tree-view')?.dispatchEvent(new Event('scroll'));
    element.querySelector('.si-tree-view')?.scroll(0, 0);
    element.querySelector('.si-tree-view')?.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    expect(element.querySelectorAll('si-tree-view-item').length).toBe(60);
  });

  it('should handle scroll with grouped list', () => {
    component.items = createTreeItems(1000);
    fixture.detectChanges();

    component.isVirtualized = true;
    component.groupedList = true;
    fixture.detectChanges();
    element.querySelector('.si-tree-view')?.scroll(0, 5000);
    element.querySelector('.si-tree-view')?.dispatchEvent(new Event('scroll'));
    runOnPushChangeDetection(fixture);
    expect(component.treeViewComponent.groupedList()).toBeTrue();
    expect(element.querySelectorAll('si-tree-view-item').length).toBe(60);

    element.querySelector('.si-tree-view')?.scroll(0, 0);
    element.querySelector('.si-tree-view')?.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    expect(element.querySelectorAll('si-tree-view-item').length).toBe(60);
  });

  it('should auto scroll if children not visible when node is expanded', fakeAsync(() => {
    component.items = createTreeItems(100);
    component.folderStateStart = false;
    element.style.height = '100%';
    component.cdRef.markForCheck();
    fixture.detectChanges();
    const itemHeight =
      (element.querySelector('si-tree-view-item')?.getBoundingClientRect().height ?? 40) + 8;
    const lastVisibleNode =
      Math.floor(
        (element.getBoundingClientRect().height - element.getBoundingClientRect().top) / itemHeight
      ) - 1;
    component.items[lastVisibleNode] = {
      ...component.items[lastVisibleNode],
      children: createTreeItems(10),
      state: 'collapsed'
    };
    component.items[lastVisibleNode + 1] = {
      ...component.items[lastVisibleNode + 1],
      children: createTreeItems(10),
      state: 'collapsed'
    };
    component.items = [...component.items];
    runOnPushChangeDetection(fixture);
    Object.defineProperty(window, 'requestAnimationFrame', {
      writable: true,
      value: (cb: any) => {
        cb(0);
        return 0;
      }
    });
    const scrollObserver = spyOn(window, 'IntersectionObserver').and.callThrough();
    const nextNode = debugElement.queryAll(By.css('.si-tree-view-item-toggle'))[
      lastVisibleNode + 1
    ];
    debugElement
      .queryAll(By.css('.si-tree-view-item-toggle'))
      [lastVisibleNode].triggerEventHandler('click', null);
    fixture.detectChanges();
    nextNode.triggerEventHandler('click', null);
    tick(100);
    expect(scrollObserver).toHaveBeenCalled();
  }));

  it('should trigger item height calculation', () => {
    fixture.detectChanges();

    expect(component.treeViewComponent.compactMode()).toBeFalsy();
    component.compactMode = true;
    const spy = spyOn(getHeightService(), 'updateItemHeight').and.callThrough();
    component.cdRef.markForCheck();
    fixture.detectChanges();
    expect(spy).toHaveBeenCalled();
  });

  it('should update tree height on class changes', async () => {
    component.enableDataField1 = false;
    fixture.detectChanges();
    // Ensure we are in the right state and the tree is already rendered
    expect(getHeightService().itemHeight).toBeGreaterThan(24);

    component.smallSize = true;
    component.cdRef.markForCheck();
    fixture.detectChanges();
    await fixture.whenStable();
    // Changing the class require a second cycle to call ngAfterViewChecked
    fixture.detectChanges();

    expect(getHeightService().itemHeight).toBe(24);
  });

  it('should not reduce pageSize when tree dimensions are reduced', () => {
    const previous = component.treeViewComponent.pageSize;
    // @ts-expect-error updatePageSize should not expose as a public method
    component.treeViewComponent.updatePageSize({ width: 100, height: 40 });
    expect(component.treeViewComponent.pageSize).toBe(previous);
  });

  describe('with multi selection enabled', () => {
    beforeEach(() => {
      component.singleSelectMode = false;
      component.enableSelection = true;
      component.items = createTreeItems(10);
      fixture.detectChanges();
    });

    it('should select multiple items', fakeAsync(() => {
      component.selectedItem = [component.items[0], component.items[1], component.items[2]];
      component.cdRef.markForCheck();
      fixture.detectChanges();
      tick();
      runOnPushChangeDetection(fixture);

      expect(
        debugElement.queryAll(By.css('.si-tree-view-li-item.si-tree-view-item-selected')).length
      ).toBe(3);
    }));

    it('should handle selectedItem changes', fakeAsync(() => {
      component.selectedItem = [component.items[0], component.items[1], component.items[2]];
      component.cdRef.markForCheck();
      fixture.detectChanges();
      tick();
      runOnPushChangeDetection(fixture);

      expect(
        debugElement.queryAll(By.css('.si-tree-view-li-item.si-tree-view-item-selected')).length
      ).toBe(3);

      component.selectedItem = undefined;
      component.cdRef.markForCheck();
      fixture.detectChanges();

      expect(
        debugElement.queryAll(By.css('.si-tree-view-li-item.si-tree-view-item-selected')).length
      ).toBe(0);
    }));

    it('should select all items on click', fakeAsync(() => {
      component.selectedItem = [component.items[0]];
      component.cdRef.markForCheck();
      fixture.detectChanges();
      tick();
      runOnPushChangeDetection(fixture);

      const lastItem = Array.from(
        element.querySelectorAll<HTMLElement>('.si-tree-view-item-main')
      ).at(-1)!;
      const eventData = { 'view': window, 'bubbles': true, 'shiftKey': true };
      lastItem.dispatchEvent(new MouseEvent('mousedown', eventData));
      lastItem.dispatchEvent(new MouseEvent('click', eventData));
      fixture.detectChanges();

      expect(
        debugElement.queryAll(By.css('.si-tree-view-li-item.si-tree-view-item-selected')).length
      ).toBe(component.items.length);
    }));

    it('should emit selection on keyup shift', () => {
      spyOn(component.treeViewComponent.treeItemsSelected, 'emit');
      const firstItem = Array.from(
        element.querySelectorAll<HTMLElement>('.si-tree-view-item-main')
      ).at(0)!;
      firstItem.dispatchEvent(
        new MouseEvent('click', {
          'view': window,
          'bubbles': true,
          'shiftKey': true
        })
      );

      document.dispatchEvent(
        new KeyboardEvent('keyup', {
          key: 'Shift'
        })
      );
      fixture.detectChanges();

      expect(component.treeViewComponent.treeItemsSelected.emit).toHaveBeenCalledWith([
        component.items[0]
      ]);
    });

    it('should append to selected items on click', fakeAsync(() => {
      component.selectedItem = [component.items[0]];
      component.cdRef.markForCheck();
      fixture.detectChanges();
      tick();
      runOnPushChangeDetection(fixture);

      const lastItem = Array.from(
        element.querySelectorAll<HTMLElement>('.si-tree-view-item-main')
      ).at(-1)!;
      lastItem.dispatchEvent(
        new MouseEvent('click', {
          'view': window,
          'bubbles': true,
          'ctrlKey': true
        })
      );
      fixture.detectChanges();

      expect(
        debugElement.queryAll(By.css('.si-tree-view-li-item.si-tree-view-item-selected')).length
      ).toBe(2);
    }));

    it('should deselect item on click', fakeAsync(() => {
      component.selectedItem = [component.items[0], component.items[1]];
      component.cdRef.markForCheck();
      fixture.detectChanges();
      tick();
      runOnPushChangeDetection(fixture);

      const firstItem = Array.from(
        element.querySelectorAll<HTMLElement>('.si-tree-view-item-main')
      ).at(0)!;
      firstItem.dispatchEvent(
        new MouseEvent('click', {
          'view': window,
          'bubbles': true,
          'ctrlKey': true
        })
      );
      fixture.detectChanges();

      expect(
        debugElement.queryAll(By.css('.si-tree-view-li-item.si-tree-view-item-selected')).length
      ).toBe(1);
    }));

    it('should emit selection on keyup control', () => {
      spyOn(component.treeViewComponent.treeItemsSelected, 'emit');
      const firstItem = Array.from(
        element.querySelectorAll<HTMLElement>('.si-tree-view-item-main')
      ).at(0)!;
      firstItem.dispatchEvent(
        new MouseEvent('click', {
          'view': window,
          'bubbles': true,
          'ctrlKey': true
        })
      );
      document.dispatchEvent(
        new KeyboardEvent('keyup', {
          key: 'Control'
        })
      );
      fixture.detectChanges();

      expect(component.treeViewComponent.treeItemsSelected.emit).toHaveBeenCalledWith([
        component.items[0]
      ]);
    });
  });

  it('default should be enableIcon', () => {
    expect(component.treeViewComponent.enableIcon()).toBeTrue();
  });

  describe('with icons', () => {
    beforeEach(() => {
      component.items = createTreeItems(10, { icon: 'sample-icon', selected: true });
      fixture.detectChanges();
    });

    it('should display icons', fakeAsync(() => {
      expect(debugElement.queryAll(By.css('span.si-tree-view-item-icon')).length).toBe(10);
    }));

    it('should hide icons', fakeAsync(() => {
      component.enableIcon = false;
      component.cdRef.markForCheck();
      fixture.detectChanges();
      expect(debugElement.queryAll(By.css('span.si-tree-view-item-icon')).length).toBe(0);
    }));

    it('should display filled icons', fakeAsync(() => {
      expect(element.querySelector('span.sample-icon-filled')).toBeTruthy();
    }));

    it('should not display filled icons if disabled', fakeAsync(() => {
      component.disableFilledIcons = true;
      component.cdRef.markForCheck();
      fixture.detectChanges();
      expect(element.querySelector('span.sample-icon-filled')).toBeNull();
    }));
  });

  describe('with keyboard', () => {
    beforeEach(() => {
      const tree = createTreeItems(5, { state: 'collapsed' });
      tree.forEach(i => (i.children = [{ label: `child ${i.label}`, parent: i }]));
      tree[2].state = 'expanded';
      component.items = tree;
      fixture.detectChanges();
    });

    it('should emit second item as clicked and selected on enter', () => {
      spyOn(component.treeViewComponent.treeItemClicked, 'emit');
      spyOn(component.treeViewComponent.treeItemsSelected, 'emit');

      const secondItem = Array.from(element.querySelectorAll<HTMLElement>('si-tree-view-item')).at(
        1
      )!;
      secondItem.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true
        })
      );
      fixture.detectChanges();

      expect(component.treeViewComponent.treeItemClicked.emit).toHaveBeenCalled();
      expect(component.treeViewComponent.treeItemsSelected.emit).toHaveBeenCalledWith([
        component.items[1]
      ]);
    });

    it('should expand node on keydown ArrowRight', () => {
      spyOn(component.treeViewComponent.treeItemFolderClicked, 'emit');
      spyOn(component.treeViewComponent.treeItemFolderStateChanged, 'emit');

      const secondItem = Array.from(element.querySelectorAll<HTMLElement>('si-tree-view-item')).at(
        1
      )!;
      secondItem.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowRight',
          bubbles: true
        })
      );
      fixture.detectChanges();

      expect(component.treeViewComponent.treeItemFolderClicked.emit).toHaveBeenCalled();
      expect(component.treeViewComponent.treeItemFolderStateChanged.emit).toHaveBeenCalled();
      expect(component.items[1].state).toBe('expanded');
    });

    it('should jump into expanded node on keydown ArrowRight', () => {
      spyOn(component.treeViewComponent.treeItemsSelected, 'emit');

      const firstItem = element.querySelector<HTMLElement>('si-tree-view-item')!;

      firstItem.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowRight',
          bubbles: true
        })
      );
      fixture.detectChanges();

      firstItem.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowRight',
          bubbles: true
        })
      );
      fixture.detectChanges();

      document.activeElement?.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true
        })
      );
      fixture.detectChanges();

      expect(component.treeViewComponent.treeItemsSelected.emit).toHaveBeenCalledWith([
        component.items[0].children![0]
      ]);
    });

    it('should collapse node on keydown ArrowLeft', () => {
      spyOn(component.treeViewComponent.treeItemFolderClicked, 'emit');
      spyOn(component.treeViewComponent.treeItemFolderStateChanged, 'emit');

      const secondItem = Array.from(element.querySelectorAll<HTMLElement>('si-tree-view-item')).at(
        2
      )!;
      secondItem.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowLeft',
          bubbles: true
        })
      );
      fixture.detectChanges();

      expect(component.treeViewComponent.treeItemFolderClicked.emit).toHaveBeenCalled();
      expect(component.treeViewComponent.treeItemFolderStateChanged.emit).toHaveBeenCalled();
      expect(component.items[1].state).toBe('collapsed');
    });

    it('should jump out of node on keydown ArrowLeft', () => {
      spyOn(component.treeViewComponent.treeItemsSelected, 'emit');

      const firstItem = element.querySelector<HTMLElement>('si-tree-view-item')!;
      firstItem.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowRight',
          bubbles: true
        })
      );
      fixture.detectChanges();

      const childItem = Array.from(element.querySelectorAll<HTMLElement>('si-tree-view-item')).at(
        1
      )!;
      childItem.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowLeft',
          bubbles: true
        })
      );
      fixture.detectChanges();

      document.activeElement?.closest('si-tree-view-item')?.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true
        })
      );
      fixture.detectChanges();

      expect(component.treeViewComponent.treeItemsSelected.emit).toHaveBeenCalledWith([
        component.items[0]
      ]);
    });

    describe('with checkbox', () => {
      beforeEach(() => {
        component.enableCheckbox = true;
        component.cdRef.markForCheck();
        fixture.detectChanges();
      });

      it('should emit checkbox clicked on keydown Space', () => {
        spyOn(component.treeViewComponent.treeItemCheckboxClicked, 'emit');

        const childItemTest3 = Array.from(
          element.querySelectorAll<HTMLElement>('si-tree-view-item')
        ).at(3)!;
        childItemTest3.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'Space',
            bubbles: true
          })
        );
        fixture.detectChanges();

        expect(component.treeViewComponent.treeItemCheckboxClicked.emit).toHaveBeenCalled();
      });

      it('should show checkbox for all items', () => {
        component.updateItems([
          {
            label: 'Root 1',
            state: 'expanded',
            children: [
              { label: 'R1-C1', state: 'expanded', children: [{ label: 'R1-C1-C1' }] },
              { label: 'R1-C2', state: 'expanded', children: [{ label: 'R1-C2-C1' }] },
              { label: 'R1-C3', state: 'expanded', children: [{ label: 'R1-C3-C1' }] }
            ]
          },
          {
            label: 'Root 2',
            state: 'expanded',
            children: [
              { label: 'R2-C1', state: 'expanded', children: [{ label: 'R2-C1-C1' }] },
              { label: 'R2-C2', state: 'expanded', children: [{ label: 'R2-C2-C1' }] },
              { label: 'R2-C3', state: 'expanded', children: [{ label: 'R2-C3-C1' }] }
            ]
          }
        ]);
        fixture.detectChanges();

        const actualItems = Array.from(
          element.querySelectorAll<HTMLElement>('si-tree-view-item input.form-check-input')
        );
        fixture.detectChanges();

        expect(actualItems.length).toBe(14);
      });
    });

    describe('with option box', () => {
      beforeEach(() => {
        component.enableOptionbox = true;
        component.cdRef.markForCheck();
        fixture.detectChanges();
      });

      it('should emit checkbox clicked on keydown Space', () => {
        spyOn(component.treeViewComponent.treeItemCheckboxClicked, 'emit');

        const childItemTest3 = Array.from(
          element.querySelectorAll<HTMLElement>('si-tree-view-item')
        ).at(3)!;
        childItemTest3.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'Space',
            bubbles: true
          })
        );
        fixture.detectChanges();

        expect(component.treeViewComponent.treeItemCheckboxClicked.emit).toHaveBeenCalled();
      });
    });

    describe('with flat tree', () => {
      beforeEach(() => {
        component.flatTree = true;
        component.cdRef.markForCheck();
        fixture.detectChanges();
      });

      it('should jump into node on keydown ArrowRight', fakeAsync(() => {
        spyOn(component.treeViewComponent.treeItemsSelected, 'emit');

        const firstItem = element.querySelector<HTMLElement>('si-tree-view-item')!;

        firstItem.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'ArrowRight',
            bubbles: true
          })
        );
        fixture.detectChanges();

        tick();

        document.activeElement?.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'Enter',
            bubbles: true
          })
        );
        fixture.detectChanges();

        expect(component.treeViewComponent.treeItemsSelected.emit).toHaveBeenCalledWith([
          component.items[0].children![0]
        ]);
      }));

      it('should jump out of node on keydown ArrowLeft', fakeAsync(() => {
        spyOn(component.treeViewComponent.treeItemsSelected, 'emit');

        const firstItem = element.querySelector<HTMLElement>('si-tree-view-item')!;
        firstItem.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'ArrowRight',
            bubbles: true
          })
        );
        fixture.detectChanges();

        tick();

        document.activeElement?.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'ArrowLeft',
            bubbles: true
          })
        );
        fixture.detectChanges();

        tick();

        document.activeElement?.closest('si-tree-view-item')?.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'Enter',
            bubbles: true
          })
        );
        fixture.detectChanges();

        expect(component.treeViewComponent.treeItemsSelected.emit).toHaveBeenCalledWith([
          component.items[0]
        ]);
      }));
    });
  });

  describe('with addChildItems', () => {
    beforeEach(() => {
      component.items[0].state = 'expanded';
      component.cdRef.markForCheck();
      fixture.detectChanges();
    });

    it('should dynamically add items to root', () => {
      component.treeViewComponent.addChildItems([
        { label: 'new root', dataField1: 'data field', icon: 'element-project' }
      ]);
      fixture.detectChanges();

      const items = Array.from(element.querySelectorAll<HTMLElement>('si-tree-view-item'));
      expect(items).toHaveSize(4);
      expect(items.at(-1)?.innerText.trim()).toContain('new root');
    });

    it('should dynamically add items with children to root', () => {
      const children = [{ label: 'dynamic child 1' }, { label: 'dynamic child 2' }];
      component.treeViewComponent.addChildItems([
        {
          label: 'new root',
          dataField1: 'data field',
          icon: 'element-project',
          state: 'expanded',
          children
        }
      ]);
      fixture.detectChanges();

      const items = Array.from(element.querySelectorAll<HTMLElement>('si-tree-view-item'));
      expect(items).toHaveSize(6);
      expect(items.at(-2)?.innerText.trim()).toContain('dynamic child 1');
      expect(items.at(-1)?.innerText.trim()).toContain('dynamic child 2');
    });

    it('should dynamically add child items to given node', () => {
      const children = [{ label: 'dynamic child 1' }, { label: 'dynamic child 2' }];
      component.treeViewComponent.addChildItems(
        [
          {
            label: 'extra node',
            dataField1: 'data field',
            state: 'expanded',
            children
          }
        ],
        component.items[0]
      );
      fixture.detectChanges();

      const items = Array.from(element.querySelectorAll<HTMLElement>('si-tree-view-item'));
      expect(items).toHaveSize(6);
      expect(items.at(-3)?.innerText.trim()).toContain('extra node');
      expect(items.at(-2)?.innerText.trim()).toContain('dynamic child 1');
      expect(items.at(-1)?.innerText.trim()).toContain('dynamic child 2');
    });
  });

  describe('with expandOnClick', () => {
    beforeEach(() => {
      component.expandOnClick = true;
      const tree = createTreeItems(3, { state: 'collapsed' });
      tree.forEach(i => (i.children = [{ label: `child ${i.label}`, parent: i }]));
      tree[1].state = 'expanded';
      tree[2].selectable = false;
      component.items = tree;
      component.cdRef.markForCheck();
      fixture.detectChanges();
    });

    it('should expand item', () => {
      spyOn(component.treeViewComponent.treeItemFolderStateChanged, 'emit');

      const collapsedItem = Array.from(
        element.querySelectorAll<HTMLElement>('si-tree-view-item .si-tree-view-item-main')
      ).at(0)!;
      collapsedItem.click();
      fixture.detectChanges();

      expect(component.items[0].state).toBe('expanded');
      expect(component.treeViewComponent.treeItemFolderStateChanged.emit).toHaveBeenCalled();
    });

    it('should collapse node', () => {
      spyOn(component.treeViewComponent.treeItemFolderStateChanged, 'emit');

      const expandedItem = Array.from(
        element.querySelectorAll<HTMLElement>('si-tree-view-item .si-tree-view-item-main')
      ).at(1)!;
      // First click to activate the node
      expandedItem.click();
      fixture.detectChanges();
      // Second click to collapse the node
      expandedItem.click();
      fixture.detectChanges();

      expect(component.items[0].state).toBe('collapsed');
      expect(component.treeViewComponent.treeItemFolderStateChanged.emit).toHaveBeenCalled();
    });

    it('should not toggle state when not selectable', () => {
      spyOn(component.treeViewComponent.treeItemFolderStateChanged, 'emit');

      const collapsedNotSelectableItem = Array.from(
        element.querySelectorAll<HTMLElement>(
          'si-tree-view-item .si-tree-view-item-not-selectable .si-tree-view-item-main'
        )
      ).at(0)!;
      collapsedNotSelectableItem.click();
      fixture.detectChanges();

      expect(component.items[0].state).toBe('collapsed');
      expect(component.treeViewComponent.treeItemFolderStateChanged.emit).not.toHaveBeenCalled();
    });

    it('should not toggle state on flatTree', () => {
      component.flatTree = true;
      component.cdRef.markForCheck();
      fixture.detectChanges();
      spyOn(component.treeViewComponent.treeItemFolderStateChanged, 'emit');

      const collapsedItem = Array.from(
        element.querySelectorAll<HTMLElement>('si-tree-view-item .si-tree-view-item-main')
      ).at(0)!;
      collapsedItem.click();
      fixture.detectChanges();

      expect(component.items[0].state).toBe('collapsed');
      expect(component.treeViewComponent.treeItemFolderStateChanged.emit).not.toHaveBeenCalled();
    });
  });

  describe('with display none', () => {
    beforeEach(() => {
      component.style = 'display: none';
    });

    it('should not update pageSize when item height is 0', fakeAsync(() => {
      const oldPageSize = component.treeViewComponent.pageSize();
      fixture.detectChanges();
      const tree = element.querySelector<HTMLElement>('si-tree-view')!;
      tree.style.height = '100px';
      TestBed.inject(ResizeObserverService)._checkAll();

      flush();
      expect(component.treeViewComponent.pageSize()).toBe(oldPageSize);
    }));
  });
});
