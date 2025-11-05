/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  Component,
  contentChild,
  contentChildren,
  Directive,
  effect,
  ElementRef,
  inject,
  OnInit,
  signal,
  viewChild,
  viewChildren
} from '@angular/core';
import {
  ElementDimensions,
  ResizeObserverService,
  SiResizeObserverDirective
} from '@siemens/element-ng/resize-observer';
import { LOG_EVENT } from '@siemens/live-preview';

@Directive({
  selector: '[appDummy]'
})
export class DummyDirective {}

@Component({
  selector: 'app-sample',
  imports: [DummyDirective],
  templateUrl: './resize-observer.html',
  host: { class: 'p-5' }
})
export class SampleComponent {
  readonly observer = inject(ResizeObserverService);
  readonly main = viewChild.required<ElementRef>('main');
  readonly children = viewChildren(DummyDirective, { read: ElementRef });
  readonly log = inject(LOG_EVENT);
  readonly width = signal(200);
  readonly items = signal(['Item 1', 'Item 2', 'Item 3']);

  constructor() {
    effect(() => {
      const l = this.children();
      for (const item of l) {
        this.observer
          .observe(item.nativeElement, { throttle: 0 })
          .subscribe(i => this.log('content-box', i));
        this.observer
          .observe(item.nativeElement, { throttle: 0, box: 'border-box' })
          .subscribe(i => this.log('border-box', i));
      }
    });
  }

  protected changeSize(): void {
    this.items.update(items => [...items, `Item ${items.length + 1}`]);
  }
  protected sizeChange(entry: ElementDimensions): void {
    this.log('ResizeObserver', entry);
  }
}
