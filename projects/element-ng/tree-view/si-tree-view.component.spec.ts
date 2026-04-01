/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MenuItem } from '@siemens/element-ng/menu';
import { BehaviorSubject } from 'rxjs';

import { SiTreeViewItemHeightService } from './si-tree-view-item-height.service';
import { SiTreeViewComponent } from './si-tree-view.component';
import { LoadChildrenEventArgs, MenuItemsProvider, TreeItem } from './si-tree-view.model';

@Component({
  imports: [SiTreeViewComponent],
  template: `<si-tree-view
    class="vh-100"
    [style]="style()"
    [class.tree-xs]="smallSize()"
    [items]="items()"
    [enableSelection]="enableSelection()"
    [enableIcon]="enableIcon()"
    [singleSelectMode]="singleSelectMode()"
    [folderStateStart]="folderStateStart()"
    [selectedItem]="selectedItem()"
    [groupedList]="groupedList()"
    [flatTree]="flatTree()"
    [enableDataField1]="enableDataField1()"
    [enableDataField2]="enableDataField2()"
    [enableContextMenuButton]="enableContextMenuButton()"
    [expandOnClick]="expandOnClick()"
    [compactMode]="compactMode()"
    [contextMenuItems]="contextMenuItems()"
    [enableStateIndicator]="enableStateIndicator()"
    [isVirtualized]="isVirtualized()"
    [enableCheckbox]="enableCheckbox()"
    [inheritChecked]="inheritChecked()"
    [enableOptionbox]="enableOptionbox()"
    [pageSize]="pageSize()"
    [pagesVirtualized]="pagesVirtualized()"
    [horizontalScrolling]="horizontalScrolling()"
    [deleteChildrenOnCollapse]="deleteChildrenOnCollapse()"
    [expandCollapseAll]="expandCollapseAll()"
    (loadChildren)="loadChildren($event)"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class WrapperComponent {
  readonly treeViewComponent = viewChild.required(SiTreeViewComponent);
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
    }
  ]);
  loadChildren = (e: LoadChildrenEventArgs): void => {};
  readonly style = signal('');
  readonly smallSize = signal(false);
  readonly selectedItem = signal<TreeItem | TreeItem[] | undefined>(this.items()[0]);
  readonly enableSelection = signal(true);
  readonly enableIcon = signal(true);
  readonly singleSelectMode = signal(true);
  readonly folderStateStart = signal(true);
  readonly groupedList = signal(false);
  readonly flatTree = signal(false);
  readonly enableDataField1 = signal(true);
  readonly enableDataField2 = signal(false);
  readonly enableContextMenuButton = signal(true);
  readonly compactMode = signal(false);
  readonly contextMenuItems = signal<MenuItem[] | MenuItemsProvider>([
    { label: 'Item One', type: 'action', action: () => alert('action one') }
  ]);
  readonly enableStateIndicator = signal(true);
  readonly isVirtualized = signal(true);
  readonly enableCheckbox = signal(false);
  readonly inheritChecked = signal(true);
  readonly enableOptionbox = signal(false);
  readonly expandOnClick = signal(false);
  readonly pageSize = signal(10);
  readonly pagesVirtualized = signal(6);
  readonly horizontalScrolling = signal(false);
  readonly deleteChildrenOnCollapse = signal(false);
  readonly expandCollapseAll = signal(false);
  readonly cdRef = inject(ChangeDetectorRef);
  readonly updateItems = (items: TreeItem[]): void => {
    this.items.set(items);
    this.cdRef.markForCheck();
  };
}
describe('SiTreeViewComponent', () => {
  let fixture: ComponentFixture<WrapperComponent>;
  let component: WrapperComponent;
  let debugElement: ComponentFixture<WrapperComponent>['debugElement'];
  let element: HTMLElement;
  let originalRequestAnimationFrame: any;

  /** Get SiTreeViewItemHeightService for tree instance */
  const getHeightService = (): SiTreeViewItemHeightService =>
    fixture.debugElement.children[0].injector.get(SiTreeViewItemHeightService);

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [WrapperComponent]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WrapperComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    element = fixture.nativeElement;
  });

  beforeEach(() => {
    originalRequestAnimationFrame = window.requestAnimationFrame;
    vi.useFakeTimers().setTimerTickMode('nextTimerAsync');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
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
    const icon = element.querySelector('.si-tree-view-item-icon');
    expect(icon?.getAttribute('data-icon')).toBe('element-project');
  });

  it('should contain folder state start', () => {
    component.folderStateStart.set(true);
    fixture.detectChanges();
    expect(component.treeViewComponent().folderStateStart()).toBe(true);
    expect(
      element.querySelector('.si-tree-view-root-ul .si-tree-view-li-item a .element-down-2')
    ).toBeFalsy();
    expect(
      element.querySelector('.si-tree-view-root-ul .si-tree-view-li-item a .element-right-2')
    ).toBeTruthy();
  });

  it('should contain folder state right', () => {
    component.folderStateStart.set(false);
    fixture.detectChanges();
    expect(
      element.querySelector('.si-tree-view-root-ul .si-tree-view-li-item a .element-down-2')
    ).toBeTruthy();
    expect(
      element.querySelector('.si-tree-view-root-ul .si-tree-view-li-item a .element-right-2')
    ).toBeFalsy();
  });

  it('should enable groupedList and folder state right', () => {
    component.folderStateStart.set(false);
    component.groupedList.set(true);
    fixture.detectChanges();
    expect(
      element.querySelector('.si-tree-view-root-ul .si-tree-view-item-group a .element-down-2')
    ).toBeTruthy();
    expect(
      element.querySelector('.si-tree-view-root-ul .si-tree-view-item-group a .element-right-2')
    ).toBeFalsy();
  });

  it('should enable groupedList and folder state start', () => {
    component.folderStateStart.set(true);
    component.groupedList.set(true);
    fixture.detectChanges();
    expect(
      element.querySelector('.si-tree-view-root-ul .si-tree-view-item-group a .element-down-2')
    ).toBeFalsy();
    expect(
      element.querySelector('.si-tree-view-root-ul .si-tree-view-item-group a .element-right-2')
    ).toBeTruthy();
  });

  it('should be a flat tree', async () => {
    component.flatTree.set(true);
    await fixture.whenStable();
    expect(element.querySelector('.si-tree-view-header')).toBeTruthy();
  });

  describe('when switching to a flat tree', () => {
    beforeEach(() => {
      component.selectedItem.set(undefined);
      fixture.detectChanges();
    });

    const clickItem = (index: number, multiple = false): void => {
      element
        .querySelector<HTMLElement>(
          'si-tree-view-item:nth-child(' + index + ') .si-tree-view-item-main'
        )!
        .dispatchEvent(
          new MouseEvent('click', { bubbles: true, metaKey: multiple, ctrlKey: multiple })
        );
    };

    const openFirstItem = (): void => {
      element.querySelector<HTMLElement>('a.si-tree-view-item-toggle')!.click();
    };

    const getHeaderContent = (): string => {
      return element.querySelector('.si-tree-view-header')!.textContent!;
    };

    const getItemsContent = (): string => {
      return element.querySelector('.si-tree-view')!.textContent!;
    };

    it('should display top level', async () => {
      component.flatTree.set(true);
      fixture.detectChanges();
      const rootItem = component.items()[0];
      expect(getHeaderContent()).not.toContain(rootItem.label);
      expect(getItemsContent()).toContain(rootItem?.label);
    });

    it('should display children of last opened item', () => {
      openFirstItem();
      const rootItem = component.items()[0];
      const item = rootItem.children![1];
      fixture.detectChanges();
      component.flatTree.set(true);
      fixture.detectChanges();
      expect(getHeaderContent()).toContain(rootItem.label);
      expect(getItemsContent()).toContain(item?.label);
    });

    it('should keep single selected item visible', () => {
      openFirstItem();
      fixture.detectChanges();
      const rootItem = component.items()[0];
      const item = rootItem.children![1];
      clickItem(3);
      fixture.detectChanges();
      component.flatTree.set(true);
      fixture.detectChanges();
      expect(getHeaderContent()).toContain(rootItem.label);
      expect(getItemsContent()).toContain(item?.label);
    });

    it('should keep multiple selected items visible', () => {
      component.singleSelectMode.set(false);
      openFirstItem();
      fixture.detectChanges();
      const rootItem = component.items()[0];
      const item1 = rootItem.children![0];
      const item2 = rootItem.children![1];
      clickItem(2, true);
      clickItem(3, true);
      fixture.detectChanges();
      component.flatTree.set(true);
      fixture.detectChanges();
      expect(getHeaderContent()).toContain(rootItem.label);
      expect(getItemsContent()).toContain(item1?.label);
      expect(getItemsContent()).toContain(item2?.label);
    });

    it('should keep multiple selected items visible, even if at different levels', () => {
      component.singleSelectMode.set(false);
      openFirstItem();
      fixture.detectChanges();
      const rootItem = component.items()[0];
      clickItem(1, true);
      clickItem(3, true);
      fixture.detectChanges();
      component.flatTree.set(true);
      fixture.detectChanges();
      expect(getHeaderContent()).not.toContain(rootItem.label);
      expect(getItemsContent()).toContain(rootItem?.label);
    });

    it('should start at root level if selection is at root', () => {
      const rootItem = component.items()[0];
      clickItem(1);
      fixture.detectChanges();
      component.flatTree.set(true);
      fixture.detectChanges();
      expect(getHeaderContent()).not.toContain(rootItem.label);
      expect(getItemsContent()).toContain(rootItem?.label);
    });
  });

  it('should be no flat tree (default)', () => {
    expect(element.querySelector('.si-tree-view-header')).toBeFalsy();
  });

  it('should be a grouped List', () => {
    component.groupedList.set(true);
    fixture.detectChanges();
    expect(element.querySelector('.si-tree-view .si-tree-view-item-group')).toBeTruthy();
    expect(element.querySelector('.si-tree-view-li-item')).toBeFalsy();
  });

  it('should be no grouped List (default)', () => {
    fixture.detectChanges();
    expect(element.querySelector('.si-tree-view .si-tree-view-item-group')).toBeFalsy();
    expect(element.querySelector('.si-tree-view-li-item')).toBeTruthy();
  });

  it('should show no dataFields (default)', () => {
    expect(element.querySelector('.si-tree-view-item-object-data #data-field-1')).toBeFalsy();
    expect(element.querySelector('.si-tree-view-item-object-data #data-field-2')).toBeFalsy();
  });

  it('should show dataField1', () => {
    component.enableDataField1.set(true);
    fixture.detectChanges();
    expect(component.treeViewComponent().enableDataField1()).toBe(true);
    expect(element.querySelector('.si-tree-view-item-object-data-field-1')).toBeTruthy();
    expect(element.querySelector('.si-tree-view-item-object-data-field-1')).toHaveTextContent(
      'Root1DataField1'
    );
  });

  it('should show dataField2', () => {
    component.enableDataField2.set(true);
    fixture.detectChanges();
    expect(component.treeViewComponent().enableDataField2()).toBe(true);
    expect(element.querySelector('.si-tree-view-item-object-data-field-2')).toBeTruthy();
    expect(element.querySelector('.si-tree-view-item-object-data-field-2')).toHaveTextContent(
      'Root1DataField2'
    );
  });

  it('should hide menu button', () => {
    component.enableContextMenuButton.set(false);
    fixture.detectChanges();
    expect(component.treeViewComponent().enableContextMenuButton()).toBe(false);
    expect(element.querySelector('.si-tree-view-menu-btn.element-options-vertical')).toBeFalsy();
  });

  it('should show menu button', () => {
    component.contextMenuItems.set([{ label: 'Title', type: 'action', action: () => {} }]);
    component.enableContextMenuButton.set(true);
    fixture.detectChanges();
    expect(component.treeViewComponent().enableContextMenuButton()).toBe(true);
    expect(element.querySelector('.si-tree-view-menu-btn.element-options-vertical')).toBeTruthy();
  });

  it('should hide state pipe', () => {
    component.enableStateIndicator.set(false);
    fixture.detectChanges();
    expect(component.treeViewComponent().enableStateIndicator()).toBe(false);
    expect(element.querySelector('.si-tree-view-state-indicator')).toBeFalsy();
  });

  it('should show state pipe', () => {
    component.enableStateIndicator.set(true);
    fixture.detectChanges();
    expect(component.treeViewComponent().enableStateIndicator()).toBe(true);
    expect(element.querySelector('.si-tree-view-state-indicator')).toBeTruthy();
    expect(
      debugElement.query(By.css('.si-tree-view-state-indicator')).styles['background-color']
    ).toBe('red');
  });

  it('should be not virtualized', () => {
    component.isVirtualized.set(false);
    fixture.detectChanges();
    expect(element.querySelector('.si-tree-view > div + div + div')).toBeFalsy();
  });

  it('should render all items in DOM on expand with virtualization off', () => {
    component.isVirtualized.set(false);
    component.expandCollapseAll.set(true);
    const root = createTreeItems(1);
    root[0].children = createTreeItems(99);
    component.items.set(root);
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
    component.isVirtualized.set(true);
    fixture.detectChanges();
    expect(element.querySelector('.si-tree-view > div + div + div')).toBeTruthy();
  });

  it('should not show checkbox or option box', () => {
    expect(element.querySelector('.form-check-input')).toBeFalsy();
  });

  it('should show checkbox and check click', async () => {
    component.enableCheckbox.set(true);
    fixture.detectChanges();
    const input = element.querySelector<HTMLInputElement>('.form-check-input')!;
    expect(component.treeViewComponent().enableCheckbox()).toBe(true);
    expect(input.checked).toBeFalsy();

    input.click();
    vi.advanceTimersByTime(0);
    await fixture.whenStable();

    expect(input.checked).toBeTruthy(); // state after click
  });

  it('should show checkbox and check click', async () => {
    component.enableCheckbox.set(true);
    component.inheritChecked.set(true);
    component.folderStateStart.set(false);
    fixture.detectChanges();
    const input = element.querySelector<HTMLInputElement>('.form-check-input')!;
    expect(input.checked).toBeFalsy();
    expect(component.treeViewComponent().inheritChecked()).toBe(true);
    input.click();
    vi.advanceTimersByTime(0);
    await fixture.whenStable();
    expect(input.checked).toBeTruthy();

    debugElement
      .query(By.css('.si-tree-view-root-ul .si-tree-view-li-item a .element-down-2'))
      .triggerEventHandler('click', null);
    vi.advanceTimersByTime(0);
    await fixture.whenStable();
    expect(input.checked).toBeTruthy();
  });

  it('should show option box', () => {
    component.enableOptionbox.set(true);
    fixture.detectChanges();
    const input = element.querySelector<HTMLInputElement>('.form-check-input')!;
    expect(component.treeViewComponent().enableOptionbox()).toBe(true);
    expect(input.checked).toBeFalsy();
    expect(input.type).toBe('radio');
  });

  it('should show option box and check click', async () => {
    component.enableOptionbox.set(true);
    component.folderStateStart.set(false);
    fixture.detectChanges();

    // Option boxes don't work on the first level. So expand the tree first
    debugElement
      .query(By.css('.si-tree-view-root-ul .si-tree-view-li-item .si-tree-view-item-toggle'))
      .triggerEventHandler('click', null);
    vi.advanceTimersByTime(0);
    await fixture.whenStable();
    const input = element.querySelector<HTMLInputElement>('.form-check-input')!;
    // Click on the now expanded optionbox. (Second item in the list)
    input.click();
    vi.advanceTimersByTime(0);
    await fixture.whenStable();

    expect(input.checked).toBeTruthy();
  });

  it('item should toggle by click on collapse button', async () => {
    component.folderStateStart.set(false);
    fixture.detectChanges();
    debugElement
      .query(By.css('.si-tree-view-root-ul .si-tree-view-li-item .si-tree-view-item-toggle'))
      .triggerEventHandler('click', null);
    fixture.detectChanges();
    const item = element.querySelectorAll('.si-tree-view-item')[1];
    expect(item.querySelector('.si-tree-view-item-object-data div')).toHaveTextContent('Milano');
  });

  it('item should be selected', () => {
    component.enableSelection.set(true);
    fixture.detectChanges();

    expect(element.querySelector('.si-tree-view-li-item.si-tree-view-item-selected')).toBeTruthy();
  });

  it('should return folderStateStart true as default', () => {
    expect(component.folderStateStart()).toBe(true);
  });

  it('should call onFlatTreeNavigateUp', () => {
    component.flatTree.set(true);
    // Use of <any> due to accessing protected member
    const spy = vi.spyOn(component.treeViewComponent() as any, 'onFlatTreeNavigateUp');
    fixture.detectChanges();
    expect(element.querySelectorAll('.si-tree-view-item-toggle').length).toBeGreaterThan(0);
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

  it('should call onFlatTreeNavigateHome', async () => {
    component.flatTree.set(true);
    // Use of <any> due to accessing protected member
    const spy = vi.spyOn(component.treeViewComponent() as any, 'onFlatTreeNavigateHome');
    fixture.detectChanges();
    debugElement.queryAll(By.css('.si-tree-view-header-btn'))[0].triggerEventHandler('click', null);
    vi.advanceTimersByTime(0);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(spy).toHaveBeenCalled();
  });

  it('should expand and collapse all items', async () => {
    component.expandCollapseAll.set(true);
    vi.spyOn(component.treeViewComponent(), 'expandAll');
    vi.spyOn(component.treeViewComponent(), 'collapseAll');

    fixture.detectChanges();
    element
      .querySelectorAll('.si-tree-view-expand-collapse-container button')[0]
      .dispatchEvent(new Event('click'));
    vi.advanceTimersByTime(0);
    await fixture.whenStable();
    expect(component.treeViewComponent().expandAll).toHaveBeenCalled();

    element
      .querySelectorAll('.si-tree-view-expand-collapse-container button')[1]
      .dispatchEvent(new Event('click'));
    vi.advanceTimersByTime(0);
    await fixture.whenStable();
    expect(component.treeViewComponent().collapseAll).toHaveBeenCalled();
  });

  it('should call item click', () => {
    const treeViewComponent = component.treeViewComponent();
    vi.spyOn(treeViewComponent.treeItemClicked, 'emit');
    fixture.detectChanges();
    element.querySelectorAll('.si-tree-view-item-main')[0].dispatchEvent(new Event('click'));
    fixture.detectChanges();
    expect(treeViewComponent.treeItemClicked.emit).toHaveBeenCalled();
  });

  it('should contain custom menu items', async () => {
    vi.spyOn(component.treeViewComponent().treeItemClicked, 'emit');
    const menuItems: MenuItem[] = [];
    menuItems.push(
      { label: 'Item One', type: 'action', action: () => alert('action one') },
      { label: 'Item Two', type: 'action', action: () => alert('action two') }
    );
    component.contextMenuItems.set(menuItems);
    vi.advanceTimersByTime(0);
    await fixture.whenStable();
    element.querySelectorAll('.si-tree-context-menu-btn div')[0].dispatchEvent(new Event('click'));
    vi.advanceTimersByTime(0);
    await fixture.whenStable();
    expect(document.querySelector<HTMLElement>('si-menu si-menu-item')).toHaveTextContent(
      'Item One'
    );
  });

  it('should allow returning menu items as observable with menu provider', async () => {
    component.enableContextMenuButton.set(true);
    const menuItems = new BehaviorSubject<MenuItem[]>([
      { label: 'Item One', type: 'action', action: () => alert('action one') }
    ]);

    component.contextMenuItems.set(() => {
      return menuItems;
    });
    await fixture.whenStable();
    element.querySelectorAll('.si-tree-context-menu-btn div')[0].dispatchEvent(new Event('click'));
    fixture.detectChanges();
    expect(document.querySelector<HTMLElement>('si-menu si-menu-item')).toHaveTextContent(
      'Item One'
    );
    menuItems.next([{ label: 'Item Updated', type: 'action', action: () => alert('action one') }]);
    await fixture.whenStable();
    expect(document.querySelector<HTMLElement>('si-menu si-menu-item')).toHaveTextContent(
      'Item Updated'
    );
  });

  describe('with context menu items', () => {
    beforeEach(() => {
      const menuItems: MenuItem[] = [];
      menuItems.push(
        { label: 'Item One', type: 'action', action: () => alert('action one') },
        {
          label: 'Item Two',
          type: 'action',
          action: () => alert('action two')
        }
      );
      component.contextMenuItems.set(menuItems);
      fixture.detectChanges();
    });

    it('should open on Shift + F10', async () => {
      fixture.detectChanges();
      element.querySelectorAll('si-tree-view-item')[0].dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'F10',
          shiftKey: true
        })
      );
      vi.advanceTimersByTime(0);
      await fixture.whenStable();
      fixture.detectChanges();
      await fixture.whenStable();
      expect(document.querySelector<HTMLElement>('si-menu si-menu-item')).toHaveTextContent(
        'Item One'
      );
    });

    it('should open on context-menu button', async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      element.querySelectorAll('si-tree-view-item')[0].dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ContextMenu'
        })
      );
      vi.advanceTimersByTime(0);
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(document.querySelector<HTMLElement>('si-menu si-menu-item')).toHaveTextContent(
        'Item One'
      );
    });

    it('should open on context-menu event', async () => {
      fixture.detectChanges();
      element.querySelectorAll('si-tree-view-item')[0].dispatchEvent(new Event('contextmenu'));
      vi.advanceTimersByTime(0);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(document.querySelector<HTMLElement>('si-menu si-menu-item')).toHaveTextContent(
        'Item One'
      );
    });

    it('should have only one context menu open at a time', async () => {
      // Open context menu of tree different items left one menu open
      component.items.set(createTreeItems(3));
      fixture.detectChanges();
      const items = element.querySelectorAll('si-tree-view-item');

      for (const i of Array.from(items)) {
        i.dispatchEvent(new Event('contextmenu'));
        vi.advanceTimersByTime(0);
        fixture.detectChanges();
        await fixture.whenStable();
      }
    });
  });

  it('should handle page size and pages virtualized', () => {
    component.pageSize.set(5);
    component.pagesVirtualized.set(10);
    component.isVirtualized.set(true);
    component.items.set(createTreeItems(100));
    fixture.detectChanges();
    expect(element.querySelectorAll('si-tree-view-item').length).toBe(50);
  });

  it('should delete children on collapse', () => {
    fixture.detectChanges();
    component.deleteChildrenOnCollapse.set(true);
    component.expandCollapseAll.set(true);
    fixture.detectChanges();
    expect(component.treeViewComponent().deleteChildrenOnCollapse()).toBe(true);
    element.querySelectorAll('.si-tree-view-item-toggle')[0].dispatchEvent(new Event('click'));

    fixture.detectChanges();
    element.querySelectorAll('.si-tree-view-item-toggle')[0].dispatchEvent(new Event('click'));

    fixture.detectChanges();
    expect(component.items()[0].children?.length).toBe(0);
  });

  it('should handle method treeItemsSelected', () => {
    const treeViewComponent = component.treeViewComponent();
    vi.spyOn(treeViewComponent.treeItemsSelected, 'emit');
    component.enableSelection.set(true);
    fixture.detectChanges();
    element.querySelectorAll('.si-tree-view-item-main')[0].dispatchEvent(new Event('click'));
    fixture.detectChanges();
    expect(treeViewComponent.treeItemsSelected.emit).toHaveBeenCalledWith([component.items()[0]]);
  });

  it('should handle refresh API', () => {
    fixture.detectChanges();
    component.flatTree.set(true);
    expect(element.querySelectorAll('si-tree-view-item').length).toBe(1);

    component.items.set(createTreeItems(2));
    component.treeViewComponent().refresh();
    fixture.detectChanges();
    expect(element.querySelectorAll('si-tree-view-item').length).toBe(2);

    component.flatTree.set(false);
    component.items.set(createTreeItems(3));
    component.treeViewComponent().refresh();
    fixture.detectChanges();
    expect(element.querySelectorAll('si-tree-view-item').length).toBe(3);
  });

  it('should handle method scrollIntoView', () => {
    component.items.set(createTreeItems(100));
    component.pageSize.set(10);
    component.pagesVirtualized.set(6);
    component.isVirtualized.set(true);
    fixture.detectChanges();
    expect(element.querySelector('.si-tree-view-root-ul')?.childElementCount).toBe(60);
    component.treeViewComponent().scrollItemIntoView(component.items()[99]);
    fixture.detectChanges();
    expect(
      element.querySelector(`.si-tree-view-root-ul
    si-tree-view-item:last-child .si-tree-view-item-object-data`)?.textContent
    ).toBe('Test100');
  });

  it('should handle loadChildren', () => {
    component.items.set([
      {
        label: 'Company1',
        children: []
      }
    ]);
    vi.spyOn(component, 'loadChildren');
    fixture.detectChanges();
    element.querySelector('.si-tree-view-item-toggle')?.dispatchEvent(new Event('click'));
    fixture.detectChanges();
    expect(component.loadChildren).toHaveBeenCalledTimes(1);
  });

  it('should append nodes from dynamic loadChildren', () => {
    component.items.set([
      {
        label: 'Company1',
        children: []
      }
    ]);
    vi.spyOn(component, 'loadChildren').mockImplementation((e: LoadChildrenEventArgs) =>
      e.callback(e.treeItem, [{ label: 'loaded child' }])
    );
    fixture.detectChanges();
    element.querySelector('.si-tree-view-item-toggle')?.dispatchEvent(new Event('click'));
    fixture.detectChanges();

    const lastItem = Array.from(element.querySelectorAll<HTMLElement>('si-tree-view-item')).at(-1);
    expect(lastItem?.innerText.trim()).toBe('loaded child');
  });

  it('should handle showTreeItem', () => {
    component.items.set(createTreeItems(1));
    component.items.update(items => {
      items[0].children = createTreeItems(1);
      items[0].children[0].children = [{ parent: items[0].children[0] }];
      items[0].children[0].children[0].children = [{ parent: items[0].children[0].children[0] }];
      return [...items];
    });

    const treeViewComponent = component.treeViewComponent();
    vi.spyOn(treeViewComponent, 'expandTreeItem');
    fixture.detectChanges();

    treeViewComponent.showTreeItem(component.items()[0].children![0].children![0].children![0]);
    fixture.detectChanges();

    expect(treeViewComponent.expandTreeItem).toHaveBeenCalledWith(
      component.items()[0].children![0].children![0]
    );
  });

  it('should handle scroll', () => {
    component.items.set(createTreeItems(100));
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
    component.items.set(createTreeItems(1000));
    fixture.detectChanges();

    component.isVirtualized.set(true);
    component.groupedList.set(true);
    fixture.detectChanges();
    element.querySelector('.si-tree-view')?.scroll(0, 5000);
    element.querySelector('.si-tree-view')?.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    expect(component.treeViewComponent().groupedList()).toBe(true);
    expect(element.querySelectorAll('si-tree-view-item').length).toBe(60);

    element.querySelector('.si-tree-view')?.scroll(0, 0);
    element.querySelector('.si-tree-view')?.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    expect(element.querySelectorAll('si-tree-view-item').length).toBe(60);
  });

  it('should auto scroll if children not visible when node is expanded', async () => {
    component.items.set(createTreeItems(100));
    component.folderStateStart.set(false);
    element.style.height = '100%';
    await fixture.whenStable();
    const itemHeight =
      (element.querySelector('si-tree-view-item')?.getBoundingClientRect().height ?? 40) + 8;
    const lastVisibleNode =
      Math.floor(
        (element.getBoundingClientRect().height - element.getBoundingClientRect().top) / itemHeight
      ) - 1;
    component.items.update(items => {
      items[lastVisibleNode] = {
        ...items[lastVisibleNode],
        children: createTreeItems(10),
        state: 'collapsed'
      };
      items[lastVisibleNode + 1] = {
        ...items[lastVisibleNode + 1],
        children: createTreeItems(10),
        state: 'collapsed'
      };
      return [...items];
    });
    vi.advanceTimersByTime(0);
    await fixture.whenStable();
    Object.defineProperty(window, 'requestAnimationFrame', {
      writable: true,
      value: (cb: any) => {
        cb(0);
        return 0;
      }
    });
    const scrollObserver = vi.spyOn(window.IntersectionObserver.prototype, 'observe');
    const nextNode = debugElement.queryAll(By.css('.si-tree-view-item-toggle'))[
      lastVisibleNode + 1
    ];
    debugElement
      .queryAll(By.css('.si-tree-view-item-toggle'))
      [lastVisibleNode].triggerEventHandler('click', null);
    fixture.detectChanges();
    nextNode.triggerEventHandler('click', null);
    vi.advanceTimersByTime(0);
    await fixture.whenStable();
    expect(scrollObserver).toHaveBeenCalled();
  });

  it('should trigger item height calculation', () => {
    fixture.detectChanges();

    expect(component.treeViewComponent().compactMode()).toBeFalsy();
    component.compactMode.set(true);
    const spy = vi.spyOn(getHeightService(), 'updateItemHeight');
    fixture.detectChanges();
    expect(spy).toHaveBeenCalled();
  });

  it('should update tree height on class changes', async () => {
    component.enableDataField1.set(false);
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    // Ensure we are in the right state and the tree is already rendered
    expect(getHeightService().itemHeight).toBeGreaterThan(24);

    component.smallSize.set(true);
    fixture.detectChanges();
    vi.useRealTimers();
    // cannot use mock timer here
    await new Promise(r => setTimeout(r, 0));
    // Changing the class require a second cycle to call ngAfterViewChecked
    fixture.detectChanges();
    await fixture.whenStable();

    expect(getHeightService().itemHeight).toBeCloseTo(24, 0);
  });

  it('should not reduce pageSize when tree dimensions are reduced', () => {
    const previous = component.treeViewComponent().pageSize;
    // @ts-expect-error updatePageSize should not expose as a public method
    component.treeViewComponent().updatePageSize({ width: 100, height: 40 });
    expect(component.treeViewComponent().pageSize).toBe(previous);
  });

  describe('with multi selection enabled', () => {
    beforeEach(() => {
      component.singleSelectMode.set(false);
      component.enableSelection.set(true);
      component.items.set(createTreeItems(10));
      fixture.detectChanges();
    });

    it('should select multiple items', async () => {
      component.selectedItem.set([
        component.items()[0],
        component.items()[1],
        component.items()[2]
      ]);
      vi.advanceTimersByTime(100);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(
        element.querySelectorAll('.si-tree-view-li-item.si-tree-view-item-selected').length
      ).toBe(3);
    });

    it('should handle selectedItem changes', async () => {
      component.selectedItem.set([
        component.items()[0],
        component.items()[1],
        component.items()[2]
      ]);
      vi.advanceTimersByTime(100);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(
        element.querySelectorAll('.si-tree-view-li-item.si-tree-view-item-selected').length
      ).toBe(3);

      component.selectedItem.set(undefined);
      fixture.detectChanges();

      expect(
        element.querySelectorAll('.si-tree-view-li-item.si-tree-view-item-selected').length
      ).toBe(0);
    });

    it('should select all items on click', () => {
      component.selectedItem.set([component.items()[0]]);
      fixture.detectChanges();

      const lastItem = Array.from(
        element.querySelectorAll<HTMLElement>('.si-tree-view-item-main')
      ).at(-1)!;
      const eventData = { 'view': window, 'bubbles': true, 'shiftKey': true };
      lastItem.dispatchEvent(new MouseEvent('mousedown', eventData));
      lastItem.dispatchEvent(new MouseEvent('click', eventData));
      fixture.detectChanges();

      expect(
        element.querySelectorAll('.si-tree-view-li-item.si-tree-view-item-selected').length
      ).toBe(component.items().length);
    });

    it('should emit selection on keyup shift', () => {
      const treeViewComponent = component.treeViewComponent();
      vi.spyOn(treeViewComponent.treeItemsSelected, 'emit');
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

      expect(treeViewComponent.treeItemsSelected.emit).toHaveBeenCalledWith([component.items()[0]]);
    });

    it('should append to selected items on click', () => {
      component.selectedItem.set([component.items()[0]]);
      fixture.detectChanges();

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
        element.querySelectorAll('.si-tree-view-li-item.si-tree-view-item-selected').length
      ).toBe(2);
    });

    it('should deselect item on click', () => {
      component.selectedItem.set([component.items()[0], component.items()[1]]);
      fixture.detectChanges();

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
        element.querySelectorAll('.si-tree-view-li-item.si-tree-view-item-selected').length
      ).toBe(1);
    });

    it('should emit selection on keyup control', () => {
      const treeViewComponent = component.treeViewComponent();
      vi.spyOn(treeViewComponent.treeItemsSelected, 'emit');
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

      expect(treeViewComponent.treeItemsSelected.emit).toHaveBeenCalledWith([component.items()[0]]);
    });
  });

  it('default should be enableIcon', () => {
    expect(component.treeViewComponent().enableIcon()).toBe(true);
  });

  describe('with icons', () => {
    beforeEach(() => {
      component.items.set(createTreeItems(10, { icon: 'sample-icon', selected: true }));
      fixture.detectChanges();
    });

    it('should display icons', () => {
      expect(
        element.querySelectorAll('.si-tree-view-item-icon :not(.si-tree-view-menu-btn)').length
      ).toBe(10);
    });

    it('should hide icons', () => {
      component.enableIcon.set(false);
      fixture.detectChanges();
      expect(
        element.querySelectorAll('.si-tree-view-item-icon :not(.si-tree-view-menu-btn)').length
      ).toBe(0);
    });
  });

  describe('with keyboard', () => {
    beforeEach(() => {
      const tree = createTreeItems(5, { state: 'collapsed' });
      tree.forEach(i => (i.children = [{ label: `child ${i.label}`, parent: i }]));
      tree[2].state = 'expanded';
      component.items.set(tree);
      fixture.detectChanges();
    });

    it('should emit second item as clicked and selected on enter', () => {
      const treeViewComponent = component.treeViewComponent();
      vi.spyOn(treeViewComponent.treeItemClicked, 'emit');
      vi.spyOn(treeViewComponent.treeItemsSelected, 'emit');

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

      expect(treeViewComponent.treeItemClicked.emit).toHaveBeenCalled();
      expect(treeViewComponent.treeItemsSelected.emit).toHaveBeenCalledWith([component.items()[1]]);
    });

    it('should expand node on keydown ArrowRight', () => {
      const treeViewComponent = component.treeViewComponent();
      vi.spyOn(treeViewComponent.treeItemFolderClicked, 'emit');
      vi.spyOn(treeViewComponent.treeItemFolderStateChanged, 'emit');

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

      expect(treeViewComponent.treeItemFolderClicked.emit).toHaveBeenCalled();
      expect(treeViewComponent.treeItemFolderStateChanged.emit).toHaveBeenCalled();
      expect(component.items()[1].state).toBe('expanded');
    });

    it('should jump into expanded node on keydown ArrowRight', () => {
      const treeViewComponent = component.treeViewComponent();
      vi.spyOn(treeViewComponent.treeItemsSelected, 'emit');

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

      expect(treeViewComponent.treeItemsSelected.emit).toHaveBeenCalledWith([
        component.items()[0].children![0]
      ]);
    });

    it('should collapse node on keydown ArrowLeft', () => {
      const treeViewComponent = component.treeViewComponent();
      vi.spyOn(treeViewComponent.treeItemFolderClicked, 'emit');
      vi.spyOn(treeViewComponent.treeItemFolderStateChanged, 'emit');

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

      expect(treeViewComponent.treeItemFolderClicked.emit).toHaveBeenCalled();
      expect(treeViewComponent.treeItemFolderStateChanged.emit).toHaveBeenCalled();
      expect(component.items()[1].state).toBe('collapsed');
    });

    it('should jump out of node on keydown ArrowLeft', async () => {
      const treeViewComponent = component.treeViewComponent();
      vi.spyOn(treeViewComponent.treeItemsSelected, 'emit');

      const firstItem = element.querySelector<HTMLElement>('si-tree-view-item')!;
      firstItem.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowRight',
          bubbles: true
        })
      );
      vi.advanceTimersByTime(0);
      await fixture.whenStable();

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
      vi.advanceTimersByTime(0);
      fixture.detectChanges();

      document.activeElement?.closest('si-tree-view-item')?.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true
        })
      );
      fixture.detectChanges();
      vi.advanceTimersByTime(0);
      fixture.detectChanges();

      expect(treeViewComponent.treeItemsSelected.emit).toHaveBeenCalledWith([component.items()[0]]);
    });

    describe('with checkbox', () => {
      beforeEach(() => {
        component.enableCheckbox.set(true);
        fixture.detectChanges();
      });

      it('should emit checkbox clicked on keydown Space', () => {
        const treeViewComponent = component.treeViewComponent();
        vi.spyOn(treeViewComponent.treeItemCheckboxClicked, 'emit');

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

        expect(treeViewComponent.treeItemCheckboxClicked.emit).toHaveBeenCalled();
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
        component.enableOptionbox.set(true);
        fixture.detectChanges();
      });

      it('should emit checkbox clicked on keydown Space', () => {
        const treeViewComponent = component.treeViewComponent();
        vi.spyOn(treeViewComponent.treeItemCheckboxClicked, 'emit');

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

        expect(treeViewComponent.treeItemCheckboxClicked.emit).toHaveBeenCalled();
      });
    });

    describe('with flat tree', () => {
      beforeEach(() => {
        component.flatTree.set(true);
        fixture.detectChanges();
      });

      it('should jump into node on keydown ArrowRight', async () => {
        const treeViewComponent = component.treeViewComponent();
        vi.spyOn(treeViewComponent.treeItemsSelected, 'emit');

        const firstItem = element.querySelector<HTMLElement>('si-tree-view-item')!;

        firstItem.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'ArrowRight',
            bubbles: true
          })
        );
        vi.advanceTimersByTime(0);
        fixture.detectChanges();
        await fixture.whenStable();

        document.activeElement?.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'Enter',
            bubbles: true
          })
        );
        vi.advanceTimersByTime(0);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(treeViewComponent.treeItemsSelected.emit).toHaveBeenCalledWith([
          component.items()[0].children![0]
        ]);
      });

      it('should jump out of node on keydown ArrowLeft', async () => {
        const treeViewComponent = component.treeViewComponent();
        vi.spyOn(treeViewComponent.treeItemsSelected, 'emit');

        const firstItem = element.querySelector<HTMLElement>('si-tree-view-item')!;
        firstItem.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'ArrowRight',
            bubbles: true
          })
        );
        vi.advanceTimersByTime(0);
        fixture.detectChanges();
        await fixture.whenStable();

        document.activeElement?.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'ArrowLeft',
            bubbles: true
          })
        );
        vi.advanceTimersByTime(0);
        fixture.detectChanges();
        await fixture.whenStable();

        document.activeElement?.closest('si-tree-view-item')?.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'Enter',
            bubbles: true
          })
        );
        vi.advanceTimersByTime(0);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(treeViewComponent.treeItemsSelected.emit).toHaveBeenCalledWith([
          component.items()[0]
        ]);
      });
    });
  });

  describe('with addChildItems', () => {
    beforeEach(() => {
      component.items.update(items => {
        items[0].state = 'expanded';
        return [...items];
      });
      fixture.detectChanges();
    });

    it('should dynamically add items to root', () => {
      component
        .treeViewComponent()
        .addChildItems([{ label: 'new root', dataField1: 'data field', icon: 'element-project' }]);
      fixture.detectChanges();

      const items = Array.from(element.querySelectorAll<HTMLElement>('si-tree-view-item'));
      expect(items).toHaveLength(4);
      expect(items.at(-1)?.innerText.trim()).toContain('new root');
    });

    it('should dynamically add items with children to root', () => {
      const children = [{ label: 'dynamic child 1' }, { label: 'dynamic child 2' }];
      component.treeViewComponent().addChildItems([
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
      expect(items).toHaveLength(6);
      expect(items.at(-2)?.innerText.trim()).toContain('dynamic child 1');
      expect(items.at(-1)?.innerText.trim()).toContain('dynamic child 2');
    });

    it('should dynamically add child items to given node', () => {
      const children = [{ label: 'dynamic child 1' }, { label: 'dynamic child 2' }];
      component.treeViewComponent().addChildItems(
        [
          {
            label: 'extra node',
            dataField1: 'data field',
            state: 'expanded',
            children
          }
        ],
        component.items()[0]
      );
      fixture.detectChanges();

      const items = Array.from(element.querySelectorAll<HTMLElement>('si-tree-view-item'));
      expect(items).toHaveLength(6);
      expect(items.at(-3)?.innerText.trim()).toContain('extra node');
      expect(items.at(-2)?.innerText.trim()).toContain('dynamic child 1');
      expect(items.at(-1)?.innerText.trim()).toContain('dynamic child 2');
    });
  });

  describe('with expandOnClick', () => {
    beforeEach(() => {
      component.expandOnClick.set(true);
      const tree = createTreeItems(3, { state: 'collapsed' });
      tree.forEach(i => (i.children = [{ label: `child ${i.label}`, parent: i }]));
      tree[1].state = 'expanded';
      tree[2].selectable = false;
      component.items.set(tree);
      fixture.detectChanges();
    });

    it('should expand item', () => {
      const treeViewComponent = component.treeViewComponent();
      vi.spyOn(treeViewComponent.treeItemFolderStateChanged, 'emit');

      const collapsedItem = Array.from(
        element.querySelectorAll<HTMLElement>('si-tree-view-item .si-tree-view-item-main')
      ).at(0)!;
      collapsedItem.click();
      fixture.detectChanges();

      expect(component.items()[0].state).toBe('expanded');
      expect(treeViewComponent.treeItemFolderStateChanged.emit).toHaveBeenCalled();
    });

    it('should collapse node', () => {
      const treeViewComponent = component.treeViewComponent();
      vi.spyOn(treeViewComponent.treeItemFolderStateChanged, 'emit');

      const expandedItem = Array.from(
        element.querySelectorAll<HTMLElement>('si-tree-view-item .si-tree-view-item-main')
      ).at(1)!;
      // First click to activate the node
      expandedItem.click();
      fixture.detectChanges();
      // Second click to collapse the node
      expandedItem.click();
      fixture.detectChanges();

      expect(component.items()[0].state).toBe('collapsed');
      expect(treeViewComponent.treeItemFolderStateChanged.emit).toHaveBeenCalled();
    });

    it('should not toggle state when not selectable', () => {
      const treeViewComponent = component.treeViewComponent();
      vi.spyOn(treeViewComponent.treeItemFolderStateChanged, 'emit');

      const collapsedNotSelectableItem = Array.from(
        element.querySelectorAll<HTMLElement>(
          'si-tree-view-item .si-tree-view-item-not-selectable .si-tree-view-item-main'
        )
      ).at(0)!;
      collapsedNotSelectableItem.click();
      fixture.detectChanges();

      expect(component.items()[0].state).toBe('collapsed');
      expect(treeViewComponent.treeItemFolderStateChanged.emit).not.toHaveBeenCalled();
    });

    it('should not toggle state on flatTree', () => {
      component.flatTree.set(true);
      fixture.detectChanges();
      const treeViewComponent = component.treeViewComponent();
      vi.spyOn(treeViewComponent.treeItemFolderStateChanged, 'emit');

      const collapsedItem = Array.from(
        element.querySelectorAll<HTMLElement>('si-tree-view-item .si-tree-view-item-main')
      ).at(0)!;
      collapsedItem.click();
      fixture.detectChanges();

      expect(component.items()[0].state).toBe('collapsed');
      expect(treeViewComponent.treeItemFolderStateChanged.emit).not.toHaveBeenCalled();
    });
  });

  describe('with display none', () => {
    beforeEach(() => {
      component.style.set('display: none');
    });

    it('should not update pageSize when item height is 0', () => {
      const oldPageSize = component.treeViewComponent().pageSize();
      fixture.detectChanges();
      const tree = element.querySelector<HTMLElement>('si-tree-view')!;
      tree.style.height = '100px';
      expect(component.treeViewComponent().pageSize()).toBe(oldPageSize);
    });
  });
});
