/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  Directive,
  effect,
  input,
  signal
} from '@angular/core';

@Directive({
  selector: '[appCarouselItem]',
  host: {
    '[class.d-none]': '!visible()',
    style: 'min-height: 0; overflow: hidden'
  }
})
export class CarouselItemDirective {
  readonly visible = signal(true);
}

@Component({
  selector: 'app-carousel',
  imports: [],
  template: `
    <div class="flex-grow-1 overflow-hidden" style="min-height: 0" [style.display]="'grid'" [style.grid-template-columns]="'repeat(' + columns() + ', 1fr)'" [style.grid-template-rows]="'repeat(' + rows() + ', 1fr)'" [style.gap.rem]="1">
      <ng-content />
    </div>
    @if (totalPages() > 1) {
      <div class="d-flex justify-content-center gap-2 py-2 mt-4">
        @for (page of pages(); track page) {
          <button
            aria-label="pager"
            type="button"
            class="rounded-circle d-inline-block bg-primary border-0 p-0"
            [style.opacity]="currentPage() === page ? 1 : 0.3"
            [style.width.px]="10"
            [style.height.px]="10"
            (click)="goToPage(page)"
          ></button>
        }
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'd-flex flex-column',
    style: 'flex: 1 1 0; min-height: 0; overflow: hidden'
  }
})
export class CarouselComponent {
  readonly columns = input(2);
  readonly rows = input(1);
  readonly intervalMs = input(8000);

  private readonly items = contentChildren(CarouselItemDirective);
  private readonly pageSize = computed(() => this.columns() * this.rows());
  readonly currentPage = signal(0);
  readonly totalPages = computed(() => Math.ceil(this.items().length / this.pageSize()));
  readonly pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i));

  constructor() {
    effect(onCleanup => {
      const itemCount = this.items().length;
      const pageSize = this.pageSize();
      if (itemCount > 0) {
        const intervalId = setInterval(() => {
          const totalPages = Math.ceil(itemCount / pageSize);
          this.currentPage.set((this.currentPage() + 1) % totalPages);
        }, this.intervalMs());

        onCleanup(() => clearInterval(intervalId));
      }
    });

    effect(() => {
      const items = this.items();
      const start = this.currentPage() * this.pageSize();
      const end = start + this.pageSize();
      items.forEach((item, i) => {
        item.visible.set(i >= start && i < end);
      });
    });
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
  }
}
