/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { AfterViewInit, Component, EventEmitter, Input, OnDestroy } from '@angular/core';
import { MenuItem as MenuItemLegacy } from '@spike-rabbit/element-ng/common';
import { ContentActionBarMainItem } from '@spike-rabbit/element-ng/content-action-bar';
import { MenuItem } from '@spike-rabbit/element-ng/menu';

import { WidgetConfigEvent, WidgetInstance } from '../../model/widgets.model';
import { SiWebComponentWrapperBaseComponent } from './si-web-component-wrapper-base.component';

@Component({
  selector: 'si-web-component-wrapper',
  templateUrl: './si-web-component-wrapper.component.html'
})
export class SiWebComponentWrapperComponent
  extends SiWebComponentWrapperBaseComponent
  implements WidgetInstance, AfterViewInit, OnDestroy
{
  private _editable?: boolean;
  get editable(): boolean {
    return this._editable ?? false;
  }

  @Input() set editable(editable: boolean) {
    this._editable = editable;
    if (this.webComponentHost.nativeElement.children.length > 0) {
      this.webComponentHost.nativeElement.children[0].editable = editable;
    }
  }

  primaryActions?: (MenuItemLegacy | ContentActionBarMainItem)[];
  secondaryActions?: (MenuItemLegacy | MenuItem)[];
  primaryEditActions?: (MenuItemLegacy | ContentActionBarMainItem)[];
  secondaryEditActions?: (MenuItemLegacy | MenuItem)[];

  configChange = new EventEmitter<WidgetConfigEvent>();

  private webComponentEventListener = (event: any): void => this.configChanged(event.detail);

  override ngAfterViewInit(): void {
    super.ngAfterViewInit();
    this.webComponent?.addEventListener('configChange', this.webComponentEventListener);
    this.webComponentHost.nativeElement.appendChild(this.webComponent);
  }

  ngOnDestroy(): void {
    this.webComponent?.removeEventListener('configChange', this.webComponentEventListener);
  }

  private configChanged(event: WidgetConfigEvent): void {
    this.primaryActions = event.primaryActions ?? this.primaryActions;
    this.secondaryActions = event.secondaryActions ?? this.secondaryActions;
    this.primaryEditActions = event.primaryEditActions ?? this.primaryEditActions;
    this.secondaryEditActions = event.secondaryEditActions ?? this.secondaryEditActions;
    this.configChange.emit(event);
  }
}
