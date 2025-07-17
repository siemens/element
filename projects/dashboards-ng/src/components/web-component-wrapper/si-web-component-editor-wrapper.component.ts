/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

import {
  WidgetConfig,
  WidgetConfigStatus,
  WidgetInstanceEditor,
  WidgetInstanceEditorWizard,
  WidgetInstanceEditorWizardState
} from '../../model/widgets.model';
import { SiWebComponentWrapperBaseComponent } from './si-web-component-wrapper-base.component';

@Component({
  selector: 'si-web-component-editor-wrapper',
  templateUrl: './si-web-component-wrapper.component.html'
})
export class SiWebComponentEditorWrapperComponent
  extends SiWebComponentWrapperBaseComponent
  implements WidgetInstanceEditor, WidgetInstanceEditorWizard, AfterViewInit, OnDestroy
{
  state!: WidgetInstanceEditorWizardState;
  stateChange = new Subject<WidgetInstanceEditorWizardState>();
  configChange = new Subject<WidgetConfig | Omit<WidgetConfig, 'id'>>();

  /**
   * This will be set when setupWidgetInstanceEditor is executed
   */
  statusChangesHandler?: (statusChanges: Partial<WidgetConfigStatus>) => void;

  private webComponentEventListener = (event: any): void => this.configChange.next(event.detail);

  private webComponentStateChangeListener = (event: any): void => {
    this.state = event.detail;
    this.stateChange.next(event.detail);
  };
  private webComponentStatusChangesListener = (event: any): void => {
    this.statusChangesHandler?.(event.detail);
  };

  override ngAfterViewInit(): void {
    super.ngAfterViewInit();
    this.webComponent?.addEventListener('stateChange', this.webComponentStateChangeListener);
    this.webComponent?.addEventListener('statusChanges', this.webComponentStatusChangesListener);
    this.webComponent?.addEventListener('configChange', this.webComponentEventListener);
    this.webComponentHost.nativeElement.appendChild(this.webComponent);
  }

  ngOnDestroy(): void {
    this.webComponent?.removeEventListener('stateChange', this.webComponentStateChangeListener);
    this.webComponent?.removeEventListener('statusChanges', this.webComponentStatusChangesListener);
    this.webComponent?.removeEventListener('configChange', this.webComponentEventListener);
  }

  next(): void {
    this.webComponent?.dispatchEvent(new CustomEvent('next'));
  }

  previous(): void {
    this.webComponent?.dispatchEvent(new CustomEvent('previous'));
  }
}
