/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Grid, GridCell, GridCellWidget, GridRow } from '@angular/aria/grid';
import {
  afterNextRender,
  Component,
  computed,
  DOCUMENT,
  inject,
  Injector,
  input,
  output,
  signal,
  viewChildren
} from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { SiResizeObserverDirective } from '@siemens/element-ng/resize-observer';
import { SiTranslatePipe } from '@siemens/element-translate-ng/translate';

import { SiLaunchpadAppComponent } from './si-launchpad-app.component';
import { App, AppCategory, FavoriteChangeEvent } from './si-launchpad.model';

@Component({
  selector: 'si-launchpad-category',
  imports: [
    Grid,
    GridCell,
    GridCellWidget,
    GridRow,
    SiLaunchpadAppComponent,
    SiResizeObserverDirective,
    SiTranslatePipe,
    RouterLinkActive,
    RouterLink
  ],
  templateUrl: './si-launchpad-category.component.html',
  host: {
    class: 'd-block',
    '[class.has-title]': '!!category().name'
  }
})
export class SiLaunchpadCategoryComponent {
  private static idCounter = 0;

  readonly category = input.required<AppCategory>();
  /** @defaultValue false */
  readonly enableFavorites = input(false);
  /** Id of the element labelling the apps grid if the category has no name. */
  readonly labelledBy = input<string>();

  readonly favoriteChange = output<FavoriteChangeEvent>();

  protected readonly activatedRoute = inject(ActivatedRoute, { optional: true });
  protected readonly titleId = `__si-launchpad-category-title-${SiLaunchpadCategoryComponent.idCounter++}`;

  /** Until measured, all apps are rendered in a single wrapping row. */
  private readonly columns = signal(Infinity);
  private readonly cells = viewChildren(GridCell);
  private readonly widgets = viewChildren(GridCellWidget);
  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);

  /** Apps split into the rows visible on screen, so that arrow key navigation follows the layout. */
  protected readonly rows = computed(() => {
    const apps = this.category().apps;
    const columns = this.columns();
    const rows: App[][] = [];
    for (let i = 0; i < apps.length; i += columns) {
      rows.push(apps.slice(i, i + columns));
    }
    return rows;
  });

  protected toggleFavorite(app: App, favorite: boolean): void {
    this.favoriteChange.emit({ app, favorite });
  }

  protected isFavoriteToggleDisabled(app: App): boolean {
    return '_noFavorite' in app && !!app._noFavorite;
  }

  protected updateColumns(): void {
    const cell = this.cells().at(0)?.element;
    const row = cell?.parentElement;
    const cellWidth = cell?.getBoundingClientRect().width;
    if (!row || !cellWidth) {
      return;
    }

    const gap = parseFloat(getComputedStyle(row).columnGap) || 0;
    // Same rule flex-wrap uses to break equally wide items into lines.
    const columns = Math.max(
      1,
      Math.floor((row.getBoundingClientRect().width + gap) / (cellWidth + gap))
    );
    if (columns === this.columns()) {
      return;
    }

    // Apps moving to another row are re-created, so the focus needs to be restored.
    const focusedIndex = this.widgets().findIndex(
      widget => widget.element === this.document.activeElement
    );
    this.columns.set(columns);
    if (focusedIndex !== -1) {
      afterNextRender(() => this.widgets()[focusedIndex]?.element.focus(), {
        injector: this.injector
      });
    }
  }
}
