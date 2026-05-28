/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CdkDrag } from '@angular/cdk/drag-drop';
import { DestroyRef, Directive, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/**
 * Add alongside `cdkDrag` to keep the source element visible during drag,
 * providing copy-drag semantics for tree-view items.
 *
 * The directive clones the CDK placeholder so the original item remains
 * visible while being dragged to another tree.
 *
 * @example
 * ```html
 * <si-tree-view-item cdkDrag siCopyDrag [cdkDragData]="item">
 *   <si-tree-view-item *cdkDragPreview />
 * </si-tree-view-item>
 * ```
 */
@Directive({
  selector: '[siCopyDrag]',
  host: {
    class: 'si-copy-drag'
  }
})
export class SiCopyDragDirective {
  private clone: HTMLElement | null = null;

  constructor() {
    const drag = inject(CdkDrag);
    const destroyRef = inject(DestroyRef);

    destroyRef.onDestroy(() => {
      this.clone?.remove();
    });

    drag.started.pipe(takeUntilDestroyed(destroyRef)).subscribe(() => {
      const placeholder = drag.getPlaceholderElement();
      this.clone = placeholder.cloneNode(true) as HTMLElement;
      this.clone.classList.remove('cdk-drag-placeholder');
      this.clone.style.pointerEvents = 'none';
      this.clone.removeAttribute('id');
      placeholder.after(this.clone);
    });

    drag.ended.pipe(takeUntilDestroyed(destroyRef)).subscribe(() => {
      this.clone?.remove();
      this.clone = null;
    });
  }
}
