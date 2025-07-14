/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  EmbeddedViewRef,
  inject,
  Injector,
  IterableChangeRecord,
  IterableChanges,
  IterableDiffer,
  IterableDiffers,
  OnDestroy,
  OutputRefSubscription,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';

import { TREE_ITEM_CONTEXT } from '../si-tree-view-item-context';
import { SiTreeViewComponent } from '../si-tree-view.component';
import { TreeItem, TreeItemContext } from '../si-tree-view.model';

@Directive({
  selector: '[siTreeViewItem]'
})
export class SiTreeViewItemDirective implements AfterViewInit, OnDestroy {
  private templateRef = inject(TemplateRef);
  private viewContainerRef = inject(ViewContainerRef);
  private parent = inject(SiTreeViewComponent);
  private differs = inject(IterableDiffers);
  private cdRef = inject(ChangeDetectorRef);
  private differ: IterableDiffer<TreeItem> | null = null;
  private subscription!: OutputRefSubscription;
  private itemsVirtualizedDirty = true;

  ngAfterViewInit(): void {
    if (this.itemsVirtualizedDirty) {
      this.itemsVirtualizedDirty = false;
      const value = this.parent.itemsVirtualized;
      if (!this.differ && value) {
        this.differ = this.differs.find(value).create((_index, item) => item);
      }
    }
    this.evaluateDiffer();

    this.subscription = this.parent.evaluateForTreeItemsDiffer.subscribe(_ =>
      this.evaluateDiffer()
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private evaluateDiffer(): void {
    if (this.differ) {
      const changes = this.differ.diff(this.parent.itemsVirtualized);
      if (changes) this.applyChanges(changes);
    }
  }

  private applyChanges(changes: IterableChanges<TreeItem>): void {
    const viewContainer = this.viewContainerRef;
    changes.forEachOperation(
      (
        record: IterableChangeRecord<TreeItem>,
        adjustedPreviousIndex: number | null,
        currentIndex: number | null
      ) => {
        if (record.previousIndex == null) {
          viewContainer.createEmbeddedView(
            this.templateRef,
            {
              treeItem: record.item,
              index: record.currentIndex,
              parent: this.parent
            },
            {
              injector: Injector.create({
                providers: [
                  {
                    provide: TREE_ITEM_CONTEXT,
                    useValue: {
                      record,
                      parent: this.parent
                    }
                  }
                ]
              }),
              index: currentIndex ?? undefined
            }
          );
        } else if (currentIndex == null) {
          viewContainer.remove(adjustedPreviousIndex ?? undefined);
        } else if (adjustedPreviousIndex !== null) {
          const view = viewContainer.get(adjustedPreviousIndex)!;
          viewContainer.move(view, currentIndex);
          (view as EmbeddedViewRef<TreeItemContext>).context = {
            treeItem: record.item,
            index: record.currentIndex!,
            parent: this.parent
          };
        }
        this.cdRef.detectChanges();
      }
    );

    for (let i = 0, ilen = viewContainer.length; i < ilen; i++) {
      const viewRef = viewContainer.get(i) as EmbeddedViewRef<TreeItemContext>;
      const context = viewRef.context;
      context.index = i;
    }

    changes.forEachIdentityChange((record: IterableChangeRecord<TreeItem>) => {
      if (record.currentIndex) {
        const viewRef = viewContainer.get(record.currentIndex) as EmbeddedViewRef<TreeItemContext>;
        viewRef.context = {
          treeItem: record.item,
          index: record.currentIndex,
          parent: this.parent
        };
        this.cdRef.detectChanges();
      }
    });
  }

  static ngTemplateContextGuard(
    _dir: SiTreeViewItemDirective,
    ctx: unknown
  ): ctx is TreeItemContext {
    return true;
  }
}
