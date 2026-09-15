/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  DeleteConfirmationDialogResult,
  SiActionDialogService
} from '@siemens/element-ng/action-modal';
import { Observable, Subject } from 'rxjs';

import { TEST_WIDGET_CONFIG_0 } from '../../../test/test-widget/test-widget';
import { WidgetConfig, WidgetSlotTargets } from '../../model/widgets.model';
import { SiWebComponentWrapperComponent } from './si-web-component-wrapper.component';

const testElementTagName = 'si-test-widget-with-slots';

class TestWidgetWithSlotsElement extends HTMLElement {
  config?: WidgetConfig;
  private _widgetSlots?: WidgetSlotTargets;

  get widgetSlots(): WidgetSlotTargets | undefined {
    return this._widgetSlots;
  }

  set widgetSlots(widgetSlots: WidgetSlotTargets | undefined) {
    this._widgetSlots = widgetSlots;
    widgetSlots?.footer.replaceChildren('Web component footer');
  }
}

if (!customElements.get(testElementTagName)) {
  customElements.define(testElementTagName, TestWidgetWithSlotsElement);
}

class SiActionDialogMockService {
  result = new Subject<DeleteConfirmationDialogResult>();

  showDeleteConfirmationDialog(args: any[]): Observable<DeleteConfirmationDialogResult> {
    return this.result;
  }
}

describe('SiWidgetHostComponent', () => {
  let component: SiWebComponentWrapperComponent;
  let fixture: ComponentFixture<SiWebComponentWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiWebComponentWrapperComponent],
      providers: [{ provide: SiActionDialogService, useClass: SiActionDialogMockService }],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SiWebComponentWrapperComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should provide slot targets to the web component', () => {
    const footer = document.createElement('div');
    const widgetSlots = { footer };

    fixture.componentRef.setInput('config', TEST_WIDGET_CONFIG_0);
    fixture.componentRef.setInput('elementTagName', testElementTagName);
    fixture.componentRef.setInput('url', 'data:text/javascript,');
    component.widgetSlots = widgetSlots;
    fixture.detectChanges();

    const webComponent = fixture.nativeElement.querySelector(
      testElementTagName
    ) as TestWidgetWithSlotsElement;
    expect(webComponent.widgetSlots).toBe(widgetSlots);
    expect(footer).toHaveTextContent('Web component footer');
  });
});
