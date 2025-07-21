/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { FocusableOption } from '@angular/cdk/a11y';
import { CdkContextMenuTrigger, CdkMenuTrigger } from '@angular/cdk/menu';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  computed,
  DoCheck,
  ElementRef,
  HostBinding,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  signal,
  TemplateRef,
  viewChild
} from '@angular/core';
import { correctKeyRTL, MenuItem as MenuItemLegacy } from '@siemens/element-ng/common';
import { SiLoadingSpinnerComponent } from '@siemens/element-ng/loading-spinner';
import { MenuItem, SiMenuFactoryComponent } from '@siemens/element-ng/menu';
import { SiTranslatePipe } from '@siemens/element-translate-ng/translate';
import { asyncScheduler, Subject, Subscription } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

import { TREE_ITEM_CONTEXT } from '../si-tree-view-item-context';
import {
  CheckboxClickEventArgs,
  ClickEventArgs,
  FolderStateEventArgs,
  TreeItem
} from '../si-tree-view.model';
import { SiTreeViewService } from '../si-tree-view.service';
import {
  boxClicked,
  doFolderStateChange,
  removeUndefinedState,
  setActive
} from '../si-tree-view.utils';

@Component({
  selector: 'si-tree-view-item',
  imports: [
    CdkContextMenuTrigger,
    CdkMenuTrigger,
    NgClass,
    NgTemplateOutlet,
    SiLoadingSpinnerComponent,
    SiMenuFactoryComponent,
    SiTranslatePipe
  ],
  templateUrl: './si-tree-view-item.component.html',
  styleUrl: './si-tree-view-item.component.scss',
  host: {
    role: 'treeitem',
    '[attr.tabindex]':
      'treeItemContext.record.currentIndex === treeViewComponent.activeIndex ? 0 : -1',
    '[class.focus-none]': 'true',
    '[class.si-tree-ellipsis]': 'treeViewComponent.horizontalScrolling()',
    '[class.si-tree-view-top-level-item]':
      '!treeViewComponent.compactMode() && (treeViewComponent.flatTree() || (treeItem.level ?? 0) < 1)',
    '[attr.aria-haspopup]': 'isContextMenuButtonVisible()'
  }
})
export class SiTreeViewItemComponent
  implements OnInit, OnDestroy, AfterViewInit, FocusableOption, DoCheck
{
  private element = inject(ElementRef);
  private siTreeViewService = inject(SiTreeViewService);
  private cdRef = inject(ChangeDetectorRef);
  protected treeItemContext = inject(TREE_ITEM_CONTEXT);
  protected treeViewComponent = this.treeItemContext.parent;
  /** @internal */
  treeItem: TreeItem = this.treeItemContext.record.item;
  private scrollIntoView: Subject<TreeItem> = this.treeViewComponent.scrollChildIntoView;
  private childrenLoaded: Subject<TreeItem> = this.treeViewComponent.childrenLoaded;

  protected templates = this.treeViewComponent.templates;

  private readonly _contextMenuItems = this.treeViewComponent.contextMenuItems;

  protected readonly contextMenuItems = signal<(MenuItemLegacy | MenuItem)[] | null>([]);

  protected readonly isContextMenuButtonVisible = computed(() => {
    return (
      this.enableContextMenuButton() &&
      !!this._contextMenuItems() &&
      !!this.contextMenuItems()?.length
    );
  });

  protected readonly stickyEndItems = this.treeViewComponent.horizontalScrolling;
  private displayFolderState = this.treeViewComponent.hasAnyChildren;

  protected icons = this.treeViewComponent.computedIcons;

  private savedElement: ElementRef | undefined;
  private subscriptions: Subscription[] = [];
  private indentLevel = this.treeItem.level ?? 0;
  private nextSiblingElement!: HTMLElement;
  protected readonly menuTrigger = viewChild(CdkMenuTrigger);

  @HostBinding('attr.aria-level')
  protected get ariaLevel(): number {
    return (this.treeItem.level ?? 0) + 1;
  }

  @HostBinding('attr.aria-setsize')
  protected get ariaSetsize(): number {
    return this.treeItem.parent?.children?.length ?? 1;
  }

  @HostBinding('attr.aria-posinset')
  protected ariaPosinset?: number;

  @HostBinding('attr.aria-selected')
  protected get ariaSelected(): boolean | null {
    return this.enableSelection() && this.treeItem.selectable ? !!this.treeItem.selected : null;
  }

  @HostBinding('attr.aria-checked')
  protected get ariaChecked(): boolean | null {
    return this.showCheckOrOptionBox && this.treeItem.selectable
      ? this.treeItem.checked === 'checked'
      : null;
  }

  @HostBinding('attr.aria-expanded')
  protected get ariaExpanded(): boolean | null {
    if (this.treeItem.state === 'leaf') {
      return null;
    }
    return this.treeItem.state === 'expanded';
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.scrollIntoView.subscribe(event => this.onScrollIntoViewByConsumer(event))
    );
    this.subscriptions.push(
      this.childrenLoaded.subscribe(event => this.childrenLoadingDone(event))
    );
    this.subscriptions.push(
      this.siTreeViewService.triggerMarkForCheck.subscribe(() => this.cdRef.markForCheck())
    );

    this.updateContextMenuItem();
  }

  ngDoCheck(): void {
    if (this.treeItem.parent?.children && this.ariaPosinset) {
      if (this.treeItem.parent.children[this.ariaPosinset] !== this.treeItem) {
        this.ariaPosinset = this.treeItem.parent.children.indexOf(this.treeItem) + 1;
      }
    } else if (this.treeItem.parent?.children) {
      this.ariaPosinset = this.treeItem.parent.children.indexOf(this.treeItem) + 1;
    } else {
      this.ariaPosinset = 1;
    }
  }

  ngAfterViewInit(): void {
    if (this.savedElement) {
      this.siTreeViewService.scrollIntoViewEvent.next(this.savedElement);
      this.savedElement = undefined;
    }
    this.nextSiblingElement = this.element.nativeElement?.nextElementSibling;
  }

  ngOnDestroy(): void {
    this.subscriptions
      .filter(subscription => !!subscription)
      .forEach(subscription => subscription.unsubscribe());
  }

  protected readonly enableSelection = this.treeViewComponent.enableSelection;

  protected readonly enableContextMenuButton = this.treeViewComponent.enableContextMenuButton;

  protected readonly enableDataField1 = this.treeViewComponent.enableDataField1;

  protected readonly enableDataField2 = this.treeViewComponent.enableDataField2;

  protected readonly deleteChildrenOnCollapse = this.treeViewComponent.deleteChildrenOnCollapse;

  protected get paddingStart(): string {
    return this.siTreeViewService.groupedList
      ? '0'
      : this.indentLevel * this.siTreeViewService.childrenIndentation + 'px';
  }

  protected get biggerPaddingStart(): string {
    const basePadding = this.showFolderStateStart ? 24 : 0;
    return (
      (this.siTreeViewService.groupedList
        ? basePadding
        : this.indentLevel * this.siTreeViewService.childrenIndentation + basePadding) + 'px'
    );
  }

  protected get isGroupedItem(): boolean {
    return this.siTreeViewService.isGroupedItem(this.treeItem);
  }

  protected get showFolderStateStart(): boolean {
    return (
      this.displayFolderState &&
      this.treeViewComponent.folderStateStart() &&
      !this.treeViewComponent.flatTree() &&
      (!!this.isGroupedItem || !this.siTreeViewService.groupedList)
    );
  }

  protected get showFolderStateEnd(): boolean {
    return this.displayFolderState && !this.showFolderStateStart;
  }

  protected get isExpanding(): boolean {
    return this.treeItem.state === 'expanding';
  }

  protected readonly showStateIndicator = this.treeViewComponent.enableStateIndicator;

  protected readonly showIcon = computed(() => {
    return this.treeViewComponent.enableIcon() && !!this.treeItem.icon;
  });

  protected get showCheckOrOptionBox(): boolean {
    return !!this.treeItem.showCheckbox || !!this.treeItem.showOptionbox;
  }

  private updateContextMenuItem(): void {
    const contextMenuItems = this._contextMenuItems();
    if (contextMenuItems) {
      if (Array.isArray(contextMenuItems)) {
        this.contextMenuItems.set(contextMenuItems);
      } else {
        const menuItems = contextMenuItems(this.treeItem);
        if (Array.isArray(menuItems)) {
          this.contextMenuItems.set(menuItems);
        } else if (menuItems) {
          this.subscriptions.push(
            menuItems.subscribe(items => {
              this.contextMenuItems.set(items);
            })
          );
        }
      }
    }
  }

  protected getItemFolderStateClass(): string {
    if (this.treeItem.state === 'collapsed') {
      if (this.treeViewComponent.flatTree()) {
        // flat tree mode
        return this.icons().itemCollapsedFlat;
      } else if (this.treeViewComponent.folderStateStart()) {
        // normal tree mode; folder state icon shown on the left (in LTR) side
        return this.icons().itemCollapsedLeft; // si-tree-view-item-collapsed
      } else {
        // normal tree mode; folder state icon shown on the right (in LTR) side
        return this.icons().itemCollapsed; // si-tree-view-item-collapsed
      }
    } else if (this.treeItem.state === 'expanding') {
      return 'si-tree-view-item-expanding'; // because empty is treated as disabled
    } else if (this.treeItem.state === 'expanded') {
      if (this.treeViewComponent.flatTree()) {
        // flat tree mode
        return this.icons().itemExpandedFlat;
      } else if (this.treeViewComponent.folderStateStart()) {
        // normal tree mode; folder state icon shown on the left (in LTR) side
        return this.icons().itemExpandedLeft; // si-tree-view-item-expanded
      } else {
        // normal tree mode; folder state icon shown on the right (in LTR) side
        return this.icons().itemExpanded; // si-tree-view-item-expanded
      }
    }
    return '';
  }

  /**
   * Show icon if the item is selected.
   * Per default the `filled` icon is used, this can be configured using {@link disableFilledIcons}.
   **/
  protected getIconClass(): string {
    let iconClass = this.treeItem.icon;
    if (this.treeItem.selected && this.treeItem.selectable && this.enableSelection()) {
      iconClass =
        iconClass +
        (!this.treeViewComponent.disableFilledIcons() ? ' ' + iconClass + '-filled' : '');
    }
    return iconClass ?? '';
  }

  protected getStateIndicatorColor(): string {
    return this.treeItem ? (this.treeItem.stateIndicatorColor ?? '') : '';
  }

  protected onItemFolderClicked(newState?: string): void {
    this.nextSiblingElement = this.element.nativeElement?.nextElementSibling;
    const oldState = removeUndefinedState(this.treeItem.state);
    doFolderStateChange(this.treeItem, this.deleteChildrenOnCollapse(), newState);

    this.siTreeViewService.folderClickEvent.next(
      new FolderStateEventArgs(this.treeItem, oldState, removeUndefinedState(this.treeItem.state))
    );

    if (this.treeItem.state === 'expanding') {
      this.siTreeViewService.loadChildrenEvent.next(this.treeItem);
    }

    if (this.treeItem.state === 'expanded') {
      this.scrollChildNodeIntoViewPort();
    }
  }

  private childrenLoadingDone(item: TreeItem): void {
    if (item === this.treeItem) {
      asyncScheduler.schedule(() => this.scrollChildNodeIntoViewPort(), 0);
    }
  }

  private scrollChildNodeIntoViewPort(): void {
    const task = (): void => {
      const container: HTMLElement = this.element.nativeElement.closest('.si-tree-view');
      const first: HTMLElement = this.element.nativeElement;
      this.nextSiblingElement =
        (this.nextSiblingElement?.previousElementSibling as HTMLElement) ?? this.nextSiblingElement;
      const last: HTMLElement = container?.contains(this.nextSiblingElement)
        ? this.nextSiblingElement
        : this.element.nativeElement.parentElement?.lastElementChild;
      const fits =
        container?.offsetHeight -
          (last?.offsetTop + last?.getBoundingClientRect().height - first?.offsetTop) >=
        0;
      const targetElement = fits ? last : first;
      if (targetElement) {
        const observer: IntersectionObserver = new window.IntersectionObserver(
          ([entry]) => {
            requestAnimationFrame(() => {
              const scrollElement = (targetElement.firstChild as HTMLElement) ?? targetElement;
              if (fits) {
                scrollElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
              } else {
                // scrollIntoView messes up with page scroll when body also has a scroll for { block : 'start' }
                const totalScrollTop =
                  container?.scrollTop +
                  first?.getBoundingClientRect().top -
                  container?.getBoundingClientRect().top;
                container?.scrollTo({ top: totalScrollTop, behavior: 'smooth' });
              }
            });
            observer.disconnect();
          },
          {
            root: null,
            threshold: 1
          }
        );
        observer.observe(targetElement);
      }
    };
    asyncScheduler.schedule(task, 0);
  }

  protected onItemClicked(event: Event): void {
    const previousActive = this.treeItem.active;
    this.siTreeViewService.clickEvent.next(new ClickEventArgs(this.treeItem, event as MouseEvent));

    if (
      !this.enableSelection() &&
      (this.treeViewComponent.enableCheckbox() || this.treeViewComponent.enableOptionbox())
    ) {
      this.onBoxClicked();
    }

    // Toggle expand when item is collapsed, collapse only if the node is active
    const toggle =
      (this.treeItem.state === 'expanded' && previousActive) || this.treeItem.state === 'collapsed';
    if (this.expandOnClick() && toggle) {
      this.onItemFolderClicked();
    }
  }

  protected onMouseDownTreeItem(event: MouseEvent): void {
    if (event.shiftKey) {
      // let selection: Selection = window.getSelection();
      // selection.removeAllRanges();
      // we do not want the tree item text selected: thus we prevent the default behavior in this situation
      event.preventDefault();
    }
  }

  protected onToggleContextMenuOpen(): void {
    setActive(this.treeItem, true);
    this.siTreeViewService.scroll$
      .pipe(takeUntil(this.menuTrigger()!.closed), take(1))
      .subscribe(() => this.menuTrigger()?.close());
  }

  protected onToggleContextMenuClose(): void {
    setTimeout(() => this.element.nativeElement.focus());
  }

  protected getInputType(): string {
    // This method will be called only when either of the showCheckbox or showOptionBox is true, thus
    // following condition can be shortened
    return this.treeItem.showCheckbox ? 'checkbox' : 'radio';
  }

  protected onBoxClicked(): void {
    if (!this.treeItem.selectable) {
      return;
    }
    const oldState = this.treeItem.checked ?? 'unchecked';
    boxClicked(this.treeItem, this.treeViewComponent.inheritChecked());
    this.siTreeViewService.checkboxClickEvent.next(
      new CheckboxClickEventArgs(this.treeItem, oldState, this.treeItem.checked ?? 'unchecked')
    );
  }

  protected renderMatchingTemplate(treeItem: TreeItem): TemplateRef<any> {
    // we check in the HTML template if templates exist.
    const templateDirective = this.templates()!.find(td => td.name() === treeItem.templateName);
    return templateDirective ? templateDirective.template : this.templates()![0].template;
  }

  @HostListener('contextmenu', ['$event']) protected onContextMenu(event: Event): boolean {
    this.handleContextMenuEvent(event);
    return false;
  }

  @HostListener('keydown', ['$event'])
  protected onKeydown(event: KeyboardEvent): void {
    const rtlCorrectedKey = correctKeyRTL(event.key);
    if (rtlCorrectedKey === 'Enter') {
      event.preventDefault();
      this.onItemClicked(event);
    } else if (rtlCorrectedKey === 'ContextMenu' || (rtlCorrectedKey === 'F10' && event.shiftKey)) {
      this.handleContextMenuEvent(event);
    } else if (rtlCorrectedKey === 'ArrowLeft') {
      if (
        (!this.treeViewComponent.flatTree() &&
          this.showFolderStateStart &&
          (this.treeItem.state !== 'leaf' || this.isGroupedItem)) ||
        this.showFolderStateEnd
      ) {
        event.preventDefault();
        if (this.treeItem.state !== 'collapsed' && this.treeItem.state !== 'leaf') {
          this.onItemFolderClicked('collapsed');
          return;
        }
      }
      this.siTreeViewService.focusParentEvent.next(this.treeItem);
    } else if (rtlCorrectedKey === 'ArrowRight') {
      if (
        (this.showFolderStateStart && (this.treeItem.state !== 'leaf' || this.isGroupedItem)) ||
        this.showFolderStateEnd
      ) {
        event.preventDefault();
        if (this.treeItem.state !== 'expanded') {
          this.onItemFolderClicked('expanded');
          return;
        }
      }
      this.siTreeViewService.focusFirstChildEvent.next(this.treeItem);
    } else if (
      this.showCheckOrOptionBox &&
      (rtlCorrectedKey === 'Space' || rtlCorrectedKey === ' ')
    ) {
      event.preventDefault();
      this.onBoxClicked();
    }
  }

  private handleContextMenuEvent(event: Event): void {
    if (
      this.isContextMenuButtonVisible() &&
      this.contextMenuItems()?.some(
        item =>
          (!item.type && !item.disabled && !item.isHeading && item.title !== '-') ||
          (item.type !== 'divider' &&
            item.type !== 'header' &&
            (item.type !== 'radio-group' ||
              item.children.some(radioItem => radioItem.type === 'radio' && !radioItem.disabled)) &&
            item.type !== 'radio-group' &&
            !item.disabled)
      )
    ) {
      event.preventDefault();
      event.stopPropagation();
      // Without the setTimeout in Firefox native menu will open as well.
      // Event suppression does not work.
      // Re-check in the future if FF fixes it.
      setTimeout(() => {
        const menuTrigger = this.menuTrigger();
        menuTrigger?.open();
        menuTrigger?.getMenu()!.focusFirstItem('keyboard');
      });
    } else {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  /**
   * Focusses the tree item.
   */
  focus(): void {
    this.element.nativeElement.focus();
  }

  /**
   * Get tree item label.
   */
  getLabel(): string {
    return this.treeItem?.label ?? '';
  }

  /**
   * Called by the consumer when they want a node to be scrolled into view.
   */
  private onScrollIntoViewByConsumer(item: TreeItem): void {
    if (item === this.treeItem) {
      this.savedElement = this.element;
      this.siTreeViewService.scrollIntoViewEvent.next(this.element);
    }
  }

  private expandOnClick(): boolean {
    return (
      this.treeViewComponent.expandOnClick() &&
      this.treeItem.state !== 'leaf' &&
      !!this.treeItem.selectable &&
      !this.treeViewComponent.flatTree()
    );
  }
}
