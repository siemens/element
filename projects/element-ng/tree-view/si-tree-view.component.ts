/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
/*
 * WARNING: Parts of this component are made to be used in conjunction with Bootstrap.
 * Bootstrap is not included with this package and has to be installed separately.
 */
import { FocusKeyManager } from '@angular/cdk/a11y';
import { CdkScrollableModule } from '@angular/cdk/scrolling';
import { NgClass } from '@angular/common';
import {
  AfterViewChecked,
  AfterViewInit,
  booleanAttribute,
  ChangeDetectorRef,
  Component,
  computed,
  ContentChild,
  ContentChildren,
  ElementRef,
  HostListener,
  inject,
  input,
  OnChanges,
  OnDestroy,
  OnInit,
  output,
  QueryList,
  signal,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { buildTrackByIdentity, MenuItem as MenuItemLegacy } from '@siemens/element-ng/common';
import { MenuItem } from '@siemens/element-ng/menu';
import { ElementDimensions, ResizeObserverService } from '@siemens/element-ng/resize-observer';
import { SiTranslateModule, TranslatableString } from '@siemens/element-translate-ng/translate';
import { asyncScheduler, defer, fromEvent, merge, Observable, Subject, Subscription } from 'rxjs';
import { map, withLatestFrom } from 'rxjs/operators';

import { SiTreeViewConverterService } from './si-tree-view-converter.service';
import { SiTreeViewItemHeightService } from './si-tree-view-item-height.service';
import { SiTreeViewItemTemplateDirective } from './si-tree-view-item-template.directive';
import { SiTreeViewItemComponent } from './si-tree-view-item/si-tree-view-item.component';
import { SiTreeViewItemDirective } from './si-tree-view-item/si-tree-view-item.directive';
import { SiTreeViewVirtualizationService } from './si-tree-view-virtualization.service';
import {
  CheckboxClickEventArgs,
  ClickEventArgs,
  DEFAULT_CHILDREN_INDENTATION,
  DEFAULT_TREE_ICON_SET,
  FolderStateEventArgs,
  ItemsVirtualizedArgs,
  LoadChildrenEventArgs,
  MenuItemsProvider,
  TreeItem,
  TreeViewIconSet
} from './si-tree-view.model';
import { SiTreeViewService } from './si-tree-view.service';
import {
  addChildItems,
  childrenLoaded,
  collapse,
  enableCheckboxRecursive,
  enableOptionboxRecursive,
  expand,
  hasChildren,
  initializeTreeItemsRecursive,
  removeUndefinedState,
  resetActive,
  ROOT_LEVEL,
  selectItemsBetween,
  selectRecursive,
  setActive,
  setTreeItemDefaults
} from './si-tree-view.utils';

const rootDefaults: TreeItem = {
  label: 'root',
  level: ROOT_LEVEL,
  state: 'expanded',
  selectable: false
};

/**
 * Implements a tree view with the following main capabilities:
 * Showing multiple trees. The data of the trees is set via the input property 'items'.
 * Showing the trees in a flat mode with navigation/bread/crumb on top.
 * A tree/list item is composed of a 'folder' icon, any item icon, the label, two additional datafields and a context menu button.
 * Children of parent nodes are lazy loaded upon request (in case they are not yet available in model.)
 * Context menu support via context menu item: the context menu items can be set via input properties.
 * Multi selection and focus support.
 * Checkboxes and / or option boxes per tree node.
 * Virtualization support: Input properties allow to set the page size and the number of pages to be virtualized.
 * Current limitation is roughly half a million of nodes. This is due to some 'strange' behavior with flex containers.
 * Set the input properties 'pageSize' and 'pagesVirtualized' to a reasonable amount of virtualized items.
 * The number of virtualized items is the product of the pageSize and the pagesVirtualized (no of pages virtualized).
 * Choose a value in the area of 50 virtualized items, dependent on the screen size. Check at runtime if appropriate!
 * Grouped List support: The component does also support grouped lists.
 * See the test client implementation of this package for all functionality.
 */
@Component({
  selector: 'si-tree-view',
  providers: [
    SiTreeViewConverterService,
    SiTreeViewItemHeightService,
    SiTreeViewService,
    SiTreeViewVirtualizationService
  ],
  templateUrl: './si-tree-view.component.html',
  styleUrl: './si-tree-view.component.scss',
  imports: [
    NgClass,
    SiTranslateModule,
    SiTreeViewItemComponent,
    CdkScrollableModule,
    SiTreeViewItemDirective
  ]
})
export class SiTreeViewComponent
  implements OnInit, OnChanges, OnDestroy, AfterViewInit, AfterViewChecked
{
  /**
   * The context menu items which are bound to the context menu of all tree items,
   * or a menu item provider function that is invoked for each tree item once.
   *
   * @defaultValue []
   */
  readonly contextMenuItems = input<(MenuItemLegacy | MenuItem)[] | MenuItemsProvider>([]);
  /**
   * The indentation in pixel for the children in respect to its parent.
   *
   * @defaultValue DEFAULT_CHILDREN_INDENTATION
   */
  readonly childrenIndentation = input<number>(DEFAULT_CHILDREN_INDENTATION);
  /**
   * Enable horizontal scrolling. When disabled (the default), an ellipsis is used for overflowing text
   *
   * @defaultValue false
   */
  readonly horizontalScrolling = input(false, { transform: booleanAttribute });
  /**
   * Enable the compact mode, making it more vertically compact.
   *
   * @defaultValue false
   */
  readonly compactMode = input(false, { transform: booleanAttribute });
  /**
   * Enable buttons for collapse and expand all.
   * Does not work when `flatTree` is enabled.
   *
   * @defaultValue false
   */
  readonly expandCollapseAll = input(false, { transform: booleanAttribute });
  /**
   * Tooltip text shown for the expand all icon.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_TREE_VIEW.EXPAND_ALL:Expand all`
   * ```
   */
  readonly expandAllTooltip = input($localize`:@@SI_TREE_VIEW.EXPAND_ALL:Expand all`);
  /**
   * Tooltip text shown for the collapse all icon.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_TREE_VIEW.COLLAPSE_ALL:Collapse all`
   * ```
   */
  readonly collapseAllTooltip = input($localize`:@@SI_TREE_VIEW.COLLAPSE_ALL:Collapse all`);
  /**
   * Customize icons for treeview.
   */
  readonly icons = input<TreeViewIconSet>();

  /**
   * Track-by function for tree items. By default, items are tracked by their identity.
   *
   * @deprecated has no effect and will be removed
   *
   * @defaultValue
   * ```
   * buildTrackByIdentity<TreeItem>()
   * ```
   */
  readonly trackByFunction = input(buildTrackByIdentity<TreeItem>());

  /**
   * Number of rows per page. Used for the virtualization of rows (number of
   * rows per page).
   * @defaultValue 10
   * @defaultref {@link SiTreeViewVirtualizationService#pageSize}
   */
  readonly pageSize = input(10, {
    transform: (value: number) => (value < 5 ? 5 : value)
  });

  /**
   * Number of pages which are virtualized.
   * @defaultValue 6
   * @defaultref {@link SiTreeViewVirtualizationService#pagesVirtualized}
   */
  readonly pagesVirtualized = input(6, {
    transform: (value: number) => (value < 5 ? 5 : value)
  });

  /**
   * Whether "filled" icons should not be used when a tree item is selected.
   * Per default filled icons are used when available.
   * @defaultValue false
   */
  readonly disableFilledIcons = input(false, { transform: booleanAttribute });

  /**
   * Sets if the folder state icon shall be shown on the left (in LTR) or on the right (in LTR) side
   * of the tree item. Per default the icon will be shown on the left (in LTR). Has no
   * effect if flatTree is enabled.
   * @defaultValue true
   */
  readonly folderStateStart = input(true, { transform: booleanAttribute });

  /**
   * Sets if the tree list shall virtualize the tree items.
   * This input field must be set at startup and shall not be changed afterwards.
   * @defaultValue true
   */
  readonly isVirtualized = input(true, { transform: booleanAttribute });

  /**
   * Sets the root tree items of all the trees (Required).
   * @defaultValue []
   * @defaultref {@link _items}
   */
  readonly items = input<TreeItem[]>([]);

  /**
   * Sets the tree item to be selected.
   */
  readonly selectedItem = input<TreeItem | TreeItem[] | undefined>();

  /**
   * Sets if the tree shall force single tree item selection.
   * @defaultValue false
   */
  readonly singleSelectMode = input(false, { transform: booleanAttribute });

  /**
   * Shows or hides additional information below the label.
   * @defaultValue false
   */
  readonly enableDataField1 = input(false, { transform: booleanAttribute });

  /**
   * Shows or hides additional information below the label.
   * @defaultValue false
   * @defaultref {@link SiTreeViewService#enableDataField2}
   */
  readonly enableDataField2 = input(false, { transform: booleanAttribute });

  /**
   * Shows or hides state pipe.
   * @defaultValue true
   */
  readonly enableStateIndicator = input(true, { transform: booleanAttribute });

  /**
   * Shows or hides icon
   * @defaultValue true
   */
  readonly enableIcon = input(true, { transform: booleanAttribute });

  /**
   * Shows or hides context menu button and also controls context menu visibility on right click.
   * @defaultValue true
   * @defaultref {@link SiTreeViewService#enableContextMenuButton}
   */
  readonly enableContextMenuButton = input(true, { transform: booleanAttribute });

  /**
   * Allows / disabled selecting of tree items by clicking on them.
   * @defaultValue false
   */
  readonly enableSelection = input(false, { transform: booleanAttribute });

  /**
   * Sets if children are deleted upon collapsing tree items. This feature might
   * be used, if children shall be lazy loaded always upon expanding a tree
   * item.
   * @defaultValue false
   */
  readonly deleteChildrenOnCollapse = input(false, { transform: booleanAttribute });

  /**
   * Sets if the tree view shall be displayed as flat tree list with a
   * breadcrumb. A flat tree only shows the one level at the time and lists the
   * tree items of the current level as a list.
   * @defaultValue false
   * @defaultref {@link SiTreeViewService#flatTree}
   */
  readonly flatTree = input(false);

  /**
   * Sets if the tree view is displayed as a grouped list.
   * Important: In this mode, only the first two hierarchies of the tree model
   * are considered!
   * @defaultValue false
   * @defaultref {@link SiTreeViewService#groupedList}
   */
  readonly groupedList = input(false, { transform: booleanAttribute });

  /**
   * Sets if the tree items shall show a checkbox.
   * @defaultValue false
   * @defaultref {@link SiTreeViewService#enableCheckbox}
   */
  readonly enableCheckbox = input(false, { transform: booleanAttribute });

  /**
   * Sets if the tree items shall show an optionbox.
   * @defaultValue false
   */
  readonly enableOptionbox = input(false, { transform: booleanAttribute });

  /**
   * Sets if the tree items should expand/collapse when clicking on them.
   * Does not work when `flatTree` is enabled or the tree item is not selectable.
   * @defaultValue false
   */
  readonly expandOnClick = input(false, { transform: booleanAttribute });

  /**
   * Sets if the checkbox state of a tree item is inherited to its children/parent.
   * @defaultValue true
   */
  readonly inheritChecked = input(true, { transform: booleanAttribute });

  /**
   * String to be shown when there are no content actions.
   *
   * @defaultValue 'No actions available'
   */
  readonly noActionsString = input('No actions available');

  /** Aria label for the tree view. Needed for a11y, alternatively use {@link ariaLabelledBy}. */
  readonly ariaLabel = input<TranslatableString>();

  /** Aria labelled by for the tree view. Needed for a11y, alternatively use {@link ariaLabel}. */
  readonly ariaLabelledBy = input<string>();

  /**
   * Triggered upon virtualization (or unvirtualization) of a tree item.
   */
  readonly itemsVirtualizedChanged = output<ItemsVirtualizedArgs>();
  /**
   * Triggered upon clicking the folder of a tree item.
   */
  readonly treeItemFolderClicked = output<FolderStateEventArgs>();
  /**
   * Triggered upon a state change of the folder of a tree item.
   */
  readonly treeItemFolderStateChanged = output<FolderStateEventArgs>();
  /**
   * Triggered upon clicking the label of a tree item.
   */
  readonly treeItemClicked = output<TreeItem>();
  /**
   * Triggered upon clicking the checkbox of a tree item.
   */
  readonly treeItemCheckboxClicked = output<CheckboxClickEventArgs>();
  /**
   * Triggered upon the request of loading the children of a tree item.
   */
  readonly loadChildren = output<LoadChildrenEventArgs>();
  /**
   * Triggered upon the selection of a tree item (multi selection supported).
   */
  readonly treeItemsSelected = output<TreeItem[]>();

  /**
   * The injected content with included SiTreeViewItemTemplateDirective.
   */
  @ContentChildren(SiTreeViewItemTemplateDirective)
  templates!: QueryList<SiTreeViewItemTemplateDirective>;

  private initialized = false;
  private updateTreeItemHeightRequired = true; // must be set to true so the height is initially calculated once at least
  private updateGroupItemHeightRequired = true; // must be set to true so the height is initially calculated once at least
  private selectedTreeItems: TreeItem[] = [];
  private manuallySelectedTreeItems = false;
  private latestFolderChanged?: TreeItem;
  private breadCrumbTreeItems: TreeItem[] = [];
  private subscriptions: Subscription[] = [];
  private multiSelectionStart!: TreeItem;
  private _multiSelectionActive = false;
  private domChangeObserver?: MutationObserver;
  private scroll$!: Observable<Event>;

  private element = inject(ElementRef);
  private siTreeViewService = inject(SiTreeViewService);
  private siTreeViewConverterService = inject(SiTreeViewConverterService);
  private siTreeViewVirtualizationService = inject(SiTreeViewVirtualizationService);
  private siTreeViewItemHeightService = inject(SiTreeViewItemHeightService);
  private cdRef = inject(ChangeDetectorRef);
  private resizeObserver = inject(ResizeObserverService);
  /**
   * Create a virtual root node so there is just a single root node. This makes sure the tree
   * can be fully traversed starting from any node. This is needed e.g. for recursively
   * removing the "active" state from other nodes.
   */
  private virtualRoot: TreeItem = { ...rootDefaults };

  private readonly _items = signal(this.items());

  private updateTreeItemDefaults(item: TreeItem): void {
    item.showCheckbox ??= this.enableCheckbox();
    item.showOptionbox ??= this.enableOptionbox();
  }

  /**
   * @internal
   */
  readonly computedIcons = computed(() => {
    return {
      ...DEFAULT_TREE_ICON_SET,
      ...this.icons()
    };
  });

  /** @internal */
  scrollChildIntoView: Subject<TreeItem> = new Subject<TreeItem>();
  /** @internal */
  childrenLoaded: Subject<TreeItem> = new Subject<TreeItem>();
  /**
   * @internal
   * Used internally by `SiTreeViewItemDirective` to determine if the items have changed,
   * and render the new items.
   */
  evaluateForTreeItemsDiffer = new Subject<void>();
  /** @internal */
  hasAnyChildren = true;

  /**
   * Gets the height of the div above the virtualized rows.
   */
  protected get heightBefore(): string {
    return this.siTreeViewVirtualizationService.heightBefore + 'px';
  }

  /**
   * Gets the height of the div below the virtualized rows.
   */
  protected get heightAfter(): string {
    return this.siTreeViewVirtualizationService.heightAfter + 'px';
  }

  /**
   * @internal
   * This is meant to be used for internal purpose.
   * Returns the virtualized items in the tree list uses virtualization, otherwise all items are returned as a flat list.
   * Bind these to the HTML.
   */
  get itemsVirtualized(): TreeItem[] {
    return this.isVirtualized()
      ? this.siTreeViewVirtualizationService.itemsVirtualized
      : this.siTreeViewConverterService.flattenedTrees;
  }

  @ViewChildren(SiTreeViewItemComponent)
  protected children!: QueryList<SiTreeViewItemComponent>;

  @ContentChild(SiTreeViewItemDirective, { read: TemplateRef })
  protected treeItemContentTemplate!: TemplateRef<any>;

  @ContentChildren(SiTreeViewItemComponent, { descendants: true })
  private nextItmes!: QueryList<SiTreeViewItemComponent>;

  private keyManager!: FocusKeyManager<SiTreeViewItemComponent>;

  /**
   * @internal
   * Returns index of the currently active Tree Item element in DOM
   * or null if there is no active tree item element
   */
  get activeIndex(): number | null {
    // This method is called before afterViewInit. Everywhere else keymanager can be expected to exist.
    return this.keyManager?.activeItemIndex;
  }

  /** Can be used for [cdkDropListData] when using cdk drag and drop. */
  get dropListItems(): TreeItem[] {
    return this.itemsVirtualized;
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Compact mode change the CSS margins so it is necessary to
    // re-calc the tree item height
    if (changes.compactMode || changes.enableDataField1 || changes.enableDataField2) {
      this.updateTreeItemHeightRequired = true;
    }

    if (changes.flatTree) {
      this.handleTreeMode();
    }

    if (changes.pageSize) {
      this.siTreeViewVirtualizationService.pageSize = this.pageSize();
      this.resetVirtualizedItemList();
    }

    if (changes.pagesVirtualized) {
      this.siTreeViewVirtualizationService.pagesVirtualized = this.pagesVirtualized();
      this.resetVirtualizedItemList();
    }

    if (changes.enableCheckbox) {
      for (const element of this._items()) {
        enableCheckboxRecursive(element, this.enableCheckbox());
      }
    }

    if (changes.enableOptionbox) {
      for (const element of this._items()) {
        enableOptionboxRecursive(element, this.enableOptionbox());
      }
    }

    if (changes.groupedList) {
      this.siTreeViewService.groupedList = this.groupedList();
      if (this.groupedList()) {
        this.updateGroupItemHeightRequired = true;
      }
      this.fillFlattenedTree(this._items(), true);
    }

    if (changes.items) {
      this.treeItemsUpdated();
    }

    if (changes.selectedItem) {
      this.selectTreeItems(this.selectedItem());
    }
  }

  ngOnInit(): void {
    this.scroll$ = defer(() => fromEvent(this.treeViewInnerElement.nativeElement, 'scroll'));
    this.siTreeViewService.scroll$ = this.scroll$;
    if (this.isVirtualized()) {
      this.subscriptions.push(this.scroll$.subscribe(event => this.onScroll(event)));
    }

    this.subscriptions.push(
      this.siTreeViewService.clickEvent.subscribe(event => this.onItemClicked(event))
    );
    this.subscriptions.push(
      this.siTreeViewService.folderClickEvent.subscribe(event => this.onItemFolderClicked(event))
    );
    this.subscriptions.push(
      this.siTreeViewService.checkboxClickEvent.subscribe(event =>
        this.onItemCheckboxClicked(event)
      )
    );
    this.subscriptions.push(
      this.siTreeViewService.loadChildrenEvent.subscribe(event => this.onLoadChildren(event))
    );
    this.subscriptions.push(
      this.siTreeViewService.scrollIntoViewEvent.subscribe(event => this.onScrollIntoView(event))
    );
    this.subscriptions.push(
      this.siTreeViewService.focusParentEvent.subscribe(event => {
        if (!this.flatTree()) {
          this.focusParentItem(event);
          return;
        }
        this.onFlatTreeNavigateUp();
      })
    );
    this.subscriptions.push(
      this.siTreeViewService.focusFirstChildEvent.subscribe(event =>
        this.focusFirstChildItem(event)
      )
    );
    this.subscriptions.push(
      this.siTreeViewVirtualizationService.itemsVirtualizedChanged.subscribe(
        (event: ItemsVirtualizedArgs) => {
          this.itemsVirtualizedChanged.emit(event);
          this.evaluateForTreeItemsDiffer.next();
          this.cdRef.markForCheck();
        }
      )
    );
    this.initialized = true;
    this.handleTreeMode();
  }

  ngAfterViewInit(): void {
    this.addClassObserver();
    this.subscriptions.push(this.monitorTreeSizeChanges().subscribe(d => this.updatePageSize(d)));
    this.keyManager = new FocusKeyManager(this.getChildren())
      .withWrap()
      .withAllowedModifierKeys(['shiftKey'])
      .withHomeAndEnd()
      .withTypeAhead();

    queueMicrotask(() => this.keyManager.updateActiveItem(0));
  }

  ngAfterViewChecked(): void {
    if (
      this.updateTreeItemHeightRequired &&
      this.siTreeViewConverterService.flattenedTrees.length > 0
    ) {
      const oldHeight = this.siTreeViewItemHeightService.itemHeight;
      let newHeight: number | undefined;
      if (this.isVirtualized()) {
        newHeight = this.siTreeViewItemHeightService.updateItemHeight(
          this.treeViewInnerElement.nativeElement,
          this.siTreeViewConverterService.flattenedTrees,
          this.siTreeViewVirtualizationService.itemBaseIdx,
          this.siTreeViewVirtualizationService.itemsVirtualizedCount
        );
      } else {
        newHeight = this.siTreeViewItemHeightService.updateItemHeight(
          this.treeViewInnerElement.nativeElement,
          this.siTreeViewConverterService.flattenedTrees,
          0,
          this.siTreeViewConverterService.flattenedTrees.length
        );
      }

      if (newHeight !== undefined && newHeight > 0) {
        this.updateTreeItemHeightRequired = false;
        if (oldHeight !== newHeight) {
          const task: () => void = () => {
            this.updateVirtualizedItemList();
            this.cdRef.markForCheck();
          };
          asyncScheduler.schedule(task, 0);
        }
      }
    }

    if (
      this.updateGroupItemHeightRequired &&
      this.siTreeViewConverterService.flattenedTrees.length > 0
    ) {
      const oldHeight = this.siTreeViewItemHeightService.groupItemHeight;
      let newHeight: number | undefined;
      if (this.isVirtualized()) {
        newHeight = this.siTreeViewItemHeightService.updateGroupedItemHeight(
          this.treeViewInnerElement.nativeElement,
          this.siTreeViewConverterService.flattenedTrees,
          this.siTreeViewVirtualizationService.itemBaseIdx,
          this.siTreeViewVirtualizationService.itemsVirtualizedCount
        );
      } else {
        newHeight = this.siTreeViewItemHeightService.updateGroupedItemHeight(
          this.treeViewInnerElement.nativeElement,
          this.siTreeViewConverterService.flattenedTrees,
          0,
          this.siTreeViewConverterService.flattenedTrees.length
        );
      }

      if (newHeight !== undefined) {
        this.updateGroupItemHeightRequired = false;
        if (oldHeight !== newHeight) {
          const task: () => void = () => {
            this.updateVirtualizedItemList();
            this.cdRef.markForCheck();
          };
          asyncScheduler.schedule(task, 0);
        }
      }
    }
  }

  ngOnDestroy(): void {
    this.subscriptions
      .filter(subscription => !!subscription)
      .forEach(subscription => subscription.unsubscribe());
    this.domChangeObserver?.disconnect();
  }

  /**
   * Returns the last breadcrumb tree item. Can be null in case the flat tree
   * shows the root.
   */
  protected get lastBreadCrumbItem(): TreeItem | null {
    const item = this.breadCrumbTreeItems[this.breadCrumbTreeItems.length - 1];
    return item ? item : null;
  }

  /**
   * Returns true if the header shows the root/home of the tree.
   */
  protected get headerShowsRoot(): boolean {
    return this.lastBreadCrumbItem == null;
  }

  /**
   * Called by the owner of the tree upon returning the retrieved children of a
   * 'load children' request.
   */
  private childrenLoadingDone(item: TreeItem, children: TreeItem[]): void {
    const oldState = item.state ?? 'collapsed';
    if (item?.state === 'expanding') {
      initializeTreeItemsRecursive(children, item, itemToUpdate =>
        this.updateTreeItemDefaults(itemToUpdate)
      );
      item.children = children;
      item.state = 'expanded';
    }
    const newState = item.state ?? 'collapsed';
    this.updateBreadCrumb(this.evalLowestBreadCrumbNode());

    if (this.flatTree()) {
      this.fillFlattenedTree(children);
      this.focusFirstItemFlattened();
    } else {
      this.fillFlattenedTree(this._items());
    }
    if (oldState !== newState) {
      this.treeItemFolderStateChanged.emit(new FolderStateEventArgs(item, oldState, newState));
    }
    this.childrenLoaded.next(item);
    this.cdRef.markForCheck();
  }

  protected onFlatTreeNavigateUp(): void {
    if (this.lastBreadCrumbItem) {
      const last = this.lastBreadCrumbItem;
      this.onBreadCrumbItemClicked(last.parent);
      setTimeout(() => this.focusItem(last));
    }
  }

  protected onFlatTreeNavigateHome(): void {
    this.onBreadCrumbItemClicked();
    this.focusFirstItemFlattened();
  }

  private getChildren(): QueryList<SiTreeViewItemComponent> {
    return !this.treeItemContentTemplate ? this.children : this.nextItmes;
  }

  private focusItem(item: TreeItem): void {
    const children = this.getChildren();
    const component = children?.find(child => child.treeItem === item);
    if (component) {
      this.keyManager.setActiveItem(component);
    }
  }

  private focusParentItem(item: TreeItem): void {
    const parent = item.parent;
    if (parent && parent.level !== ROOT_LEVEL) {
      this.focusItem(parent);
    }
  }

  private focusFirstChildItem(item: TreeItem): void {
    const firstChild = item.children?.[0];
    if (firstChild) {
      const children = this.getChildren();
      const firstChildComponent = children?.find(child => child.treeItem === firstChild);
      if (firstChildComponent) {
        this.keyManager.setActiveItem(firstChildComponent);
      }
    }
  }

  /**
   * Updates the tree to visualize the provided tree item by expanding all its parent items, collapsing all
   * other first level tree items and scroll to the provided item.
   * @param item - The tree item that shall be visible.
   */
  showTreeItem(item: TreeItem): void {
    this.doShowTreeItem(item);
    const task: () => void = () => {
      this.scrollChildIntoView.next(item);
      this.cdRef.markForCheck();
    };
    asyncScheduler.schedule(task, 0);
  }

  private doShowTreeItem(item: TreeItem, collapseOtherNodes = true): void {
    if (item.parent && item.parent.level !== ROOT_LEVEL) {
      this.expandTreeItem(item.parent);
      if (item.parent.parent && item.parent.parent.level !== ROOT_LEVEL) {
        this.doShowTreeItem(item.parent, collapseOtherNodes);
      } else if (collapseOtherNodes) {
        const myRoot = item.parent;
        for (const root of this._items()) {
          if (myRoot !== root) {
            this.collapseTreeItem(root);
          }
        }
      }
    }
  }

  /**
   * Expands all tree items.
   * @param items - Optional param for recursion, will expand these items. If empty, all tree items will be expanded.
   */
  expandAll(items?: TreeItem[]): void {
    (items ?? this._items()).forEach(item => {
      if (hasChildren(item) && childrenLoaded(item)) {
        if (item.state === 'collapsed') {
          this.expandTreeItem(item);
        }
        this.expandAll(item.children);
      }
    });
  }

  /**
   * Expands the provided tree item.
   * @param item - The tree item to be expanded.
   */
  expandTreeItem(item: TreeItem): void {
    const oldState = removeUndefinedState(item.state);
    expand(item);
    this.latestFolderChanged = item;
    this.siTreeViewService.folderClickEvent.next(
      new FolderStateEventArgs(item, oldState, removeUndefinedState(item.state))
    );
  }

  /**
   * Collapses all tree items.
   * @param items - Optional param for recursion, will collapse these items. If empty, all tree items will be collapsed.
   */
  collapseAll(items?: TreeItem[]): void {
    (items ?? this._items()).forEach(item => {
      if (hasChildren(item)) {
        if (item.state === 'expanded' || item.state === 'expanding') {
          this.collapseTreeItem(item);
        }
        this.collapseAll(item.children);
      }
    });
    this.resetVirtualizedItemList();
  }

  /**
   * Collapses the provided tree item.
   * @param item - The tree item to be collapsed.
   */
  collapseTreeItem(item: TreeItem): void {
    const oldState = item.state ?? 'collapsed';
    collapse(item);
    this.latestFolderChanged = item;
    this.siTreeViewService.folderClickEvent.next(
      new FolderStateEventArgs(item, oldState, removeUndefinedState(item.state))
    );
  }

  /**
   * Add tree items as root elements or as children of an existing tree item.
   * @param children - Tree items to add.
   * @param parent - Optional parent tree item to which the items shall be added.
   * @param position - Optional position where to insert the tree items among their siblings.
   */
  addChildItems(children: TreeItem[], parent?: TreeItem, position?: number): void {
    addChildItems(parent ?? this.virtualRoot, children, position, item =>
      this.updateTreeItemDefaults(item)
    );
    this.refresh();
  }

  /**
   * Forces a refresh of the view considering the current tree item model. Needs
   * to be called when tree items have been added, removed, or updated via model
   * in ways that do not trigger an automatic update of the view.
   */
  refresh(): void {
    if (!this.flatTree()) {
      this.fillFlattenedTree(this._items());
    } else {
      this.fillFlattenedTree(this.evalListItemsForFlatTreeMode());
    }
    this.cdRef.markForCheck();
  }

  /**
   * Scrolls the specified tree item into view. Tree items will be expanded if
   * required.
   */
  scrollItemIntoView(treeItem: TreeItem): void {
    this.onScrollIntoViewByConsumer(treeItem);
  }

  private evalListItemsForFlatTreeMode(): TreeItem[] {
    return this.lastBreadCrumbItem ? (this.lastBreadCrumbItem.children ?? []) : this._items();
  }

  private collapseChildrenFlatTreeModeOnly(items: TreeItem[]): void {
    this.collapseChildren(items, true);
  }

  private collapseChildren(items: TreeItem[], flatModeOnly: boolean = false): void {
    if (flatModeOnly && !this.flatTree()) {
      return;
    }

    for (const item of items) {
      if (item.state === 'expanded' || item.state === 'expanding') {
        const oldState = item.state;
        collapse(item);
        this.latestFolderChanged = item;
        this.treeItemFolderStateChanged.emit(new FolderStateEventArgs(item, oldState, item.state));
      }
    }
  }

  @HostListener('document:keyup.shift')
  protected onKeyUpShift(): void {
    if (this._multiSelectionActive) {
      this._multiSelectionActive = false;
      this.emitSelectedItems();
    }
  }

  @HostListener('document:keyup.control')
  protected onKeyUpCtrl(): void {
    if (this._multiSelectionActive) {
      this._multiSelectionActive = false;
      this.emitSelectedItems();
    }
  }

  @HostListener('document:keyup.meta')
  protected onKeyUpMeta(): void {
    if (this._multiSelectionActive) {
      this._multiSelectionActive = false;
      this.emitSelectedItems();
    }
  }

  @HostListener('document:mouseleave')
  protected onMouseLeave(): void {
    if (this._multiSelectionActive) {
      this._multiSelectionActive = false;
      this.emitSelectedItems();
    }
  }

  @HostListener('keydown', ['$event'])
  protected handleKeydown(event: KeyboardEvent): void {
    this.keyManager.onKeydown(event);
  }

  private onItemClicked(event: ClickEventArgs): void {
    let skipFocus = false;

    if (!event.target.selectable) {
      return;
    }

    this.manuallySelectedTreeItems = true;

    if (
      (event.mouseEvent.ctrlKey ||
        (navigator.userAgent.includes('Mac') && event.mouseEvent.metaKey)) &&
      !this.singleSelectMode()
    ) {
      this._multiSelectionActive = true;
      this.multiSelectionStart = event.target;
      if (event.target.selected) {
        skipFocus = true;
      }
      event.target.selected = !event.target.selected;

      if (event.target.selected && !this.singleSelectMode()) {
        this.selectedTreeItems.push(event.target);
      } else {
        const idx: number = this.selectedTreeItems.indexOf(event.target);
        if (idx !== -1) {
          this.selectedTreeItems.splice(idx, 1);
        }
      }
    } else if (event.mouseEvent.shiftKey && !this.singleSelectMode()) {
      this._multiSelectionActive = true;

      // If the anchor has not been established, set it to the first item in the selected
      // items list if defined ELSE the first item in the tree
      if (!this.multiSelectionStart) {
        this.multiSelectionStart = this.selectedTreeItems?.[0] ?? this._items()?.[0];
      }

      // If the tree is in flat mode, ensure the anchor is inside the currently selected folder
      if (this.flatTree()) {
        const treeItems: TreeItem[] =
          (event.target.parent ? event.target.parent.children : this._items()) ?? [];
        if (treeItems.findIndex(ti => ti === this.multiSelectionStart) < 0) {
          // Move anchor to top-level item in current folder!
          this.multiSelectionStart = treeItems[0];
        }
      }

      for (const element of this._items()) {
        selectRecursive(element, false);
      }

      this.multiSelectionStart.selected = true;
      const selectedItems = selectItemsBetween(
        this._items(),
        this.multiSelectionStart,
        event.target
      );
      this.selectedTreeItems = [this.multiSelectionStart];

      if (selectedItems) {
        this.selectedTreeItems.push(...selectedItems);
      }
    } else {
      this.multiSelectionStart = event.target;
      for (const element of this._items()) {
        selectRecursive(element, false);
      }
      event.target.selected = true;
      this.selectedTreeItems = [event.target];
    }

    for (const element of this._items()) {
      resetActive(element);
    }

    if (!skipFocus) {
      setActive(event.target, true);
    }

    this.treeItemClicked.emit(event.target);
    if (!this._multiSelectionActive) {
      this.emitSelectedItems();
      // Note, if multi selection would be active, we would emit the selected items only upon 'keyup' event for Shift and Control
      // and upon document.mouseleave event
    }
    this.cdRef.markForCheck();
    this.siTreeViewService.triggerMarkForCheck.next();
  }

  private emitSelectedItems(): void {
    if (this.enableSelection()) {
      if (this.siTreeViewService.groupedList) {
        const filtered: TreeItem[] = this.selectedTreeItems.filter(
          item => !this.siTreeViewService.isGroupedItem(item)
        );
        this.treeItemsSelected.emit(filtered);
      } else {
        this.treeItemsSelected.emit(this.selectedTreeItems);
      }
    }
  }

  private handleTreeMode(): void {
    let ti: TreeItem | undefined;

    if (this.isVirtualized()) {
      ti = this.siTreeViewVirtualizationService.calculateFirstVisibleTreeItem();
    }

    if (this.flatTree()) {
      this.siTreeViewService.childrenIndentation = 0;

      if (this.selectedTreeItems.length && this.manuallySelectedTreeItems) {
        // manually selected items => display the (children of) parent of the (highest or first) selected item,
        // if there is no parent display the root node
        const sorted = this.selectedTreeItems.sort(
          (itemA, itemB) => (itemA.level ?? 0) - (itemB.level ?? 0)
        );
        this.fillFlattenedTree(sorted[0].parent?.children ?? this._items(), true);
      } else if (!this.latestFolderChanged) {
        // no folder state change of any tree item so far => display the root item in the list
        this.fillFlattenedTree(this._items(), true);
      } else if (this.latestFolderChanged.state === 'expanded') {
        this.fillFlattenedTree(this.latestFolderChanged.children ?? [], true);
      } else if (this.latestFolderChanged.parent) {
        this.fillFlattenedTree(this.latestFolderChanged.parent?.children ?? [], true);
      } else {
        this.fillFlattenedTree(this._items(), true);
      }

      this.updateBreadCrumb(this.evalLowestBreadCrumbNode());
      if (ti && !this.siTreeViewConverterService.flattenedTrees.includes(ti, 0)) {
        ti = this.siTreeViewConverterService.flattenedTrees[0];
      }
    } else {
      this.siTreeViewService.childrenIndentation = this.childrenIndentation();
      this.fillFlattenedTree(this._items(), true);
    }

    this.onScrollIntoViewByConsumer(ti);
  }

  private evalLowestBreadCrumbNode(): TreeItem | undefined {
    if (this.latestFolderChanged) {
      return this.latestFolderChanged.state === 'expanded'
        ? this.latestFolderChanged
        : this.latestFolderChanged.parent;
    }
    return undefined;
  }

  @ViewChild('treeViewInner', { read: ElementRef, static: true })
  protected treeViewInnerElement!: ElementRef<HTMLDivElement>;

  private onItemFolderClicked(eventArgs: FolderStateEventArgs): void {
    this.treeItemFolderClicked.emit(eventArgs);
    this.treeItemFolderStateChanged.emit(eventArgs);
    this.latestFolderChanged = eventArgs.treeItem;
    this.updateBreadCrumb(this.evalLowestBreadCrumbNode());

    if (!this.flatTree()) {
      this.fillFlattenedTree(this._items());
    } else if (this.latestFolderChanged.state === 'expanded') {
      this.fillFlattenedTree(this.latestFolderChanged.children ?? []);
      this.focusFirstItemFlattened();
    }
  }

  private updateBreadCrumb(treeItem?: TreeItem): void {
    if (!treeItem || treeItem.level === ROOT_LEVEL) {
      this.breadCrumbTreeItems = [];
    } else {
      this.breadCrumbTreeItems = [treeItem];
      this.pushParentItemsIntoBreadCrumbRecursive(treeItem);
      this.breadCrumbTreeItems = this.breadCrumbTreeItems.reverse();
    }
  }

  private pushParentItemsIntoBreadCrumbRecursive(treeItem: TreeItem): void {
    if (treeItem?.parent && treeItem?.parent?.level !== ROOT_LEVEL) {
      this.breadCrumbTreeItems.push(treeItem.parent);
      this.pushParentItemsIntoBreadCrumbRecursive(treeItem.parent);
    }
  }

  private onItemCheckboxClicked(eventArgs: CheckboxClickEventArgs): void {
    this.siTreeViewService.triggerMarkForCheck.next();
    this.treeItemCheckboxClicked.emit(eventArgs);
  }

  private onLoadChildren(treeItem: TreeItem): void {
    this.loadChildren.emit(
      new LoadChildrenEventArgs(treeItem, (item, children) =>
        this.childrenLoadingDone(item, children)
      )
    );
  }

  private setFlatTreeSelectedFolder(treeItem?: TreeItem): void {
    if (this.flatTree()) {
      this.latestFolderChanged = treeItem;
      if (treeItem) {
        expand(treeItem);
      }
      this.onBreadCrumbItemClicked(treeItem);
    }
  }

  private onBreadCrumbItemClicked(treeItem?: TreeItem): void {
    if (treeItem && treeItem.level !== ROOT_LEVEL) {
      this.fillFlattenedTree(treeItem.children ?? [], true);
      this.focusFirstItemFlattened();
    } else {
      this.fillFlattenedTree(this._items(), true);
      this.focusFirstItemFlattened();
    }
    this.updateBreadCrumb(treeItem);
  }

  private onScroll(event: Event): void {
    if (this.isVirtualized()) {
      const scrollTop: number = (event.target as Element).scrollTop;
      this.siTreeViewVirtualizationService.handleScroll(
        scrollTop,
        this.siTreeViewConverterService.flattenedTrees
      );
    }
  }

  /**
   * Called by the consumer when he wants a node to be scrolled into view.
   */
  private onScrollIntoViewByConsumer(treeItem: TreeItem | undefined): void {
    if (treeItem) {
      if (this.isVirtualized()) {
        this.siTreeViewVirtualizationService.virtualizeItem(
          treeItem,
          this.siTreeViewConverterService.flattenedTrees
        );
      }
      // wait one cycle until the new children (in case of page virtualization) are created
      const task: () => void = () => {
        this.doShowTreeItem(treeItem, false); // keep previously opened nodes as it is
        asyncScheduler.schedule(() => {
          this.scrollChildIntoView.next(treeItem);
          this.cdRef.markForCheck();
        }, 0);
      };
      asyncScheduler.schedule(task, 0);
    }
  }

  private onScrollIntoView(elementTreeItem: ElementRef): void {
    const clientRectNode = elementTreeItem.nativeElement.getBoundingClientRect();
    const clientRect = this.element.nativeElement.getBoundingClientRect();
    if (
      clientRectNode.top < clientRect.top ||
      clientRectNode.top + this.siTreeViewItemHeightService.itemHeight > clientRect.bottom
    ) {
      elementTreeItem.nativeElement.scrollIntoView();
    }
    this.cdRef.markForCheck();
  }

  private fillFlattenedTree(items: TreeItem[], resetVirtualization: boolean = false): void {
    this.collapseChildrenFlatTreeModeOnly(items);
    this.siTreeViewConverterService.fillFlattenedTree(items, this.flatTree());
    if (resetVirtualization) {
      this.resetVirtualizedItemList();
    } else {
      this.updateVirtualizedItemList();
    }
    this.evaluateForTreeItemsDiffer.next();
  }

  private focusFirstItemFlattened(): void {
    setTimeout(() => this.keyManager.setFirstItemActive());
  }

  private updateHasChildren(): void {
    this.hasAnyChildren = !!this.siTreeViewConverterService.flattenedTrees?.some(item =>
      hasChildren(item)
    );
  }

  protected updateVirtualizedItemList(): void {
    this.updateHasChildren();
    if (this.isVirtualized() && this.initialized) {
      this.siTreeViewVirtualizationService.updateVirtualizedItemList(
        this.siTreeViewConverterService.flattenedTrees
      );
      this.cdRef.markForCheck();
    }
  }

  private resetVirtualizedItemList(): void {
    this.updateHasChildren();
    if (this.isVirtualized() && this.initialized) {
      this.siTreeViewVirtualizationService.resetVirtualizedItemList(
        this.siTreeViewConverterService.flattenedTrees
      );
    }
  }

  /**
   * Track class changes since adding classes like `.tree-sm` or `.tree-xs` change the item height.
   * Changes have to trigger the SiTreeViewItemHeightService otherwise the virtualized items are
   * calculated incorrectly which cause rendering issues.
   */
  private addClassObserver(): void {
    this.domChangeObserver = new MutationObserver((mutations: MutationRecord[]) => {
      mutations.forEach((mutation: MutationRecord) => {
        this.updateTreeItemHeightRequired = true;
        if (this.groupedList()) {
          this.updateGroupItemHeightRequired = true;
        }

        this.cdRef.markForCheck();
      });
    });

    this.domChangeObserver.observe(this.element.nativeElement, {
      attributeFilter: ['class', 'style']
    });
  }

  /**
   * Create an observable to track visible dimensions and item height of the tree view.
   * It's necessary to dynamically increase the `pageSize` to render the correct amount
   * of visible tree items.
   * @returns observable with the current tree dimensions.
   */
  private monitorTreeSizeChanges(): Observable<ElementDimensions> {
    const resize = this.resizeObserver.observe(this.element.nativeElement, 100, true, true);
    const merged = merge(resize, this.siTreeViewItemHeightService.itemHeightChange);
    return merged.pipe(
      withLatestFrom(resize),
      map(x => x[1])
    );
  }

  /**
   * Dynamically calculate and update the virtual pageSize to render the correct amount of tree items.
   * @param dimension - current tree dimensions.
   */
  private updatePageSize(dimension: ElementDimensions): void {
    if (this.isVirtualized()) {
      // Re-calc number of virtualized items based on the visible component dimensions
      const itemHeight = this.siTreeViewItemHeightService.itemHeight;
      // Proceeding with itemHeight==0 leads to an error in
      // SiTreeViewVirtualizationService.updateListItemsTypeCount. It happens
      // when the component is created but not yet visible.
      if (!itemHeight) {
        return;
      }
      // Set page size to half the no. of items visible on the screen following
      // the recommendations in SiTreeViewVirtualizationService.
      const pageSize = Math.floor(dimension.height / itemHeight / 2);
      // Once the pageSize is initialized we are only allowed to increase
      // the number of virtualized items but do never reduce the size.
      // Since this would lead to a incorrect calculation of heightAfter
      // (see calculateBeforeAndAfter)
      if (pageSize > 0 && pageSize > this.siTreeViewVirtualizationService.pageSize) {
        this.siTreeViewVirtualizationService.pageSize = pageSize;
      }
    }
  }

  /**
   * Make sure to always have a single item for single selection or if there is only one item in the array.
   */
  private coerceToSelectionType(
    treeItem: TreeItem[] | TreeItem | undefined
  ): TreeItem[] | TreeItem | undefined {
    if (Array.isArray(treeItem) && (treeItem.length <= 1 || this.singleSelectMode())) {
      // If array is empty, this will set it to undefined
      return treeItem[0];
    }
    return treeItem;
  }

  private treeItemsUpdated(): void {
    this.selectedTreeItems = [];
    const items = this.items();
    this._items.set(items);
    this.virtualRoot = { ...rootDefaults, children: items };
    setTreeItemDefaults(this.virtualRoot, item => this.updateTreeItemDefaults(item));
    initializeTreeItemsRecursive(items, this.virtualRoot, item =>
      this.updateTreeItemDefaults(item)
    );
    this.fillFlattenedTree(items, true);
    this.latestFolderChanged = items[0];
  }

  private selectTreeItems(treeItem: TreeItem | TreeItem[] | undefined): void {
    const items = this.coerceToSelectionType(treeItem);
    const isMultipleTreeItems = Array.isArray(items);
    if (
      (isMultipleTreeItems && items.length) ||
      (!isMultipleTreeItems && items) ||
      this.selectedTreeItems.length
    ) {
      this.manuallySelectedTreeItems = false;
    }
    if (!isMultipleTreeItems && items && !items.selectable) {
      return;
    }
    for (const element of this._items()) {
      selectRecursive(element, false);
    }
    this.selectedTreeItems = [];
    if (!items) {
      this.siTreeViewService.triggerMarkForCheck.next();
      return;
    }
    // If this is single select or multi select with only one item
    if (!isMultipleTreeItems) {
      items.selected = true;
      this.selectedTreeItems.push(items);
      this.setFlatTreeSelectedFolder(items.parent);

      if (this.isVirtualized()) {
        this.siTreeViewVirtualizationService.virtualizeItem(
          items,
          this.siTreeViewConverterService.flattenedTrees
        );
      }
      // wait one cycle until the new children (in case of page virtualization) are created
      const task: () => void = () => {
        this.scrollChildIntoView.next(items);
        this.cdRef.markForCheck();
        this.siTreeViewService.triggerMarkForCheck.next();
      };
      asyncScheduler.schedule(task, 0);
    } else {
      // Multi select with multiple items
      const task: () => void = () => {
        for (const item of items) {
          if (item.selectable === false) {
            continue;
          }
          item.selected = true;
          this.selectedTreeItems.push(item);
        }
        this.cdRef.markForCheck();
        this.siTreeViewService.triggerMarkForCheck.next();
      };
      asyncScheduler.schedule(task, 0);
    }
  }
}
