/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { computed, Injectable, signal } from '@angular/core';

import { Widget } from '../model/widgets.model';

@Injectable()
export class SiGridService {
  /** @defaultValue [] */
  readonly widgetCatalog = signal<Widget[]>([]);

  private readonly widgetCatalogMap = computed(
    () => new Map(this.widgetCatalog().map(widget => [widget.id, widget]))
  );

  getWidget(id: string): Widget | undefined {
    return this.widgetCatalogMap().get(id);
  }
}
