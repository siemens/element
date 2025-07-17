/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Widget } from '../model/widgets.model';

@Injectable()
export class SiGridService {
  /** @defaultValue [] */
  widgetCatalog: Widget[] = [];

  /**
   * Observable that emits true if si-grid is set to editable.
   * The owner of the editable state is the si-grid component.
   * This subject is used to propagate these state changes via
   * the si-widget-host components to the widgets.
   */
  editable$ = new BehaviorSubject<boolean>(false);

  getWidget(id: string): Widget | undefined {
    return this.widgetCatalog.find(widget => widget.id === id);
  }
}
