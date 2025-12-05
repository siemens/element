/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  Component,
  OnInit,
  output,
  OutputEmitterRef,
  provideZonelessChangeDetection,
  SimpleChange
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SiActionDialogService } from '@siemens/element-ng/action-modal';
import { SiLoadingSpinnerModule } from '@siemens/element-ng/loading-spinner';
import { TEST_WIDGET } from 'projects/dashboards-ng/test/test-widget/test-widget';
import { vi, type Mock } from 'vitest';

import { TestingModule } from '../../../test/testing.module';
import { SI_DASHBOARD_CONFIGURATION } from '../../model/configuration';
import {
  SI_WIDGET_STORE,
  SiDefaultWidgetStorage,
  SiWidgetStorage
} from '../../model/si-widget-storage';
import { WidgetConfig } from '../../model/widgets.model';
import { SiWidgetInstanceEditorDialogComponent } from '../widget-instance-editor-dialog/si-widget-instance-editor-dialog.component';
import { NEW_WIDGET_PREFIX, SiGridComponent } from './si-grid.component';

@Component({
  selector: 'si-widget-editor-dialog',
  imports: [TestingModule, SiLoadingSpinnerModule],
  template: ''
})
export class SiWidgetEditorDialogMockComponent
  extends SiWidgetInstanceEditorDialogComponent
  implements OnInit
{
  static staticClosed: OutputEmitterRef<WidgetConfig | undefined> | undefined = undefined;

  override readonly closed = output<WidgetConfig | undefined>();

  override ngOnInit(): void {
    SiWidgetEditorDialogMockComponent.staticClosed ??= this.closed;
  }
}

describe('SiGridComponent', () => {
  let component: SiGridComponent;
  let fixture: ComponentFixture<SiGridComponent>;
  let widgetStorage: SiWidgetStorage;
  let widgetStorageLoadSpy: Mock;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiGridComponent],
      providers: [
        { provide: SiWidgetStorage, useClass: SiDefaultWidgetStorage },
        { provide: SI_DASHBOARD_CONFIGURATION, useValue: {} },
        provideZonelessChangeDetection(),
        SiActionDialogService
      ]
    })
      .overrideComponent(SiGridComponent, {
        remove: { imports: [SiWidgetEditorDialogMockComponent] },
        add: { imports: [SiWidgetEditorDialogMockComponent] }
      })
      .compileComponents();
    sessionStorage.clear();
    fixture = TestBed.createComponent(SiGridComponent);
    component = fixture.componentInstance;

    widgetStorage = TestBed.inject(SI_WIDGET_STORE);
    widgetStorageLoadSpy = vi.spyOn(widgetStorage, 'load');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(widgetStorageLoadSpy).toHaveBeenCalled();
  });

  it('#edit() should change editable state to true', async () => {
    expect(component.editable()).toBe(false);
    component.editable.subscribe(editable => {
      expect(editable).toBe(true);
      expect(component.editable()).toBe(true);
    });
    component.edit();
  });

  it('#cancel() should change editable state to false', async () => {
    fixture.componentRef.setInput('editable', true);
    fixture.detectChanges();
    expect(component.editable()).toBe(true);
    component.editable.subscribe(editable => {
      expect(editable).toBe(false);
      expect(component.editable()).toBe(false);
    });
    component.cancel();
  });

  describe('#save()', () => {
    it('should change editable state to false', async () => {
      fixture.componentRef.setInput('editable', true);
      fixture.detectChanges();
      expect(component.editable()).toBe(true);
      const spy = vi.spyOn(widgetStorage, 'save');
      component.editable.subscribe(editable => {
        expect(editable).toBe(false);
        expect(component.editable()).toBe(false);
      });
      component.save();
      expect(spy).toHaveBeenCalled();
    });

    it('should remove temporary ids of widget config', async () => {
      component.ngOnChanges({ dashboardId: new SimpleChange(undefined, undefined, true) });
      component.edit();
      await fixture.whenStable();

      const spy = vi.spyOn(widgetStorage, 'save');
      component.addWidgetInstance({ widgetId: 'id' });
      component.addWidgetInstance({ widgetId: 'id' });
      component.save();
      await fixture.whenStable();
      expect(component.visibleWidgetInstances$.value.length).toBe(2);
      component.edit();
      await fixture.whenStable();
      component.removeWidgetInstance(component.visibleWidgetInstances$.value[0].id);
      component.addWidgetInstance({ widgetId: 'id' });

      const preSaveWidgets = component.visibleWidgetInstances$.value;
      expect(preSaveWidgets.length).toBe(2);
      expect(preSaveWidgets[0].id).toBeDefined();
      expect(preSaveWidgets[0].id.startsWith(NEW_WIDGET_PREFIX)).toBe(false);
      expect(preSaveWidgets[1].id).toBeDefined();
      expect(preSaveWidgets[1].id.startsWith(NEW_WIDGET_PREFIX)).toBe(true);

      component.save();
      const widgets = component.visibleWidgetInstances$.value;
      expect(widgets[0].id.startsWith(NEW_WIDGET_PREFIX)).toBe(false);
      expect(widgets[1].id.startsWith(NEW_WIDGET_PREFIX)).toBe(false);
      expect(spy).toHaveBeenCalled();
    });
  });

  it('should call edit() on setting editable to true', () => {
    const spy = vi.spyOn(component, 'edit');
    expect(component.editable()).toBe(false);

    fixture.componentRef.setInput('editable', true);
    component.ngOnChanges({ editable: new SimpleChange(false, true, false) });
    expect(spy).toHaveBeenCalled();
    expect(component.editable()).toBe(true);
  });

  it('should call cancel() on setting editable to false', () => {
    const spy = vi.spyOn(component, 'cancel');
    fixture.componentRef.setInput('editable', true);
    expect(component.editable()).toBe(true);
    expect(spy).not.toHaveBeenCalled();

    fixture.componentRef.setInput('editable', false);
    component.ngOnChanges({ editable: new SimpleChange(true, false, false) });
    expect(spy).toHaveBeenCalled();
    expect(component.editable()).toBe(false);
  });

  it('#addWidget() shall add a new WidgetConfig to the visible widgets of the grid and assign unique ids', () => {
    component.addWidgetInstance({ widgetId: 'id' });
    component.addWidgetInstance({ widgetId: 'id' });

    const widgets = component.visibleWidgetInstances$.value;
    expect(widgets.length).toBe(2);
    expect(widgets[0].widgetId).toBe('id');
    expect(widgets[1].widgetId).toBe('id');
    expect(widgets[0].id).toBeDefined();
    expect(widgets[1].id).toBeDefined();
    expect(widgets[0].id).not.toEqual(widgets[1].id);
  });

  it('#removeWidget() shall remove WidgetConfig from visible widgets', () => {
    component.addWidgetInstance({ widgetId: 'id' });
    component.addWidgetInstance({ widgetId: 'id' });
    expect(component.visibleWidgetInstances$.value.length).toBe(2);

    const widget1 = component.visibleWidgetInstances$.value[0];
    component.removeWidgetInstance(widget1.id);
    expect(component.visibleWidgetInstances$.value.length).toBe(1);
  });

  describe('#editWidgetInstance()', () => {
    it('shall open the editor and update the visible widgets with the edited configuration', async () => {
      vi.useFakeTimers();
      fixture.componentRef.setInput('widgetCatalog', [TEST_WIDGET]);
      fixture.detectChanges();
      component.addWidgetInstance({ widgetId: TEST_WIDGET.id });
      component.save();
      const widgetConfig = component.visibleWidgetInstances$.value[0];
      fixture.componentRef.setInput(
        'widgetInstanceEditorDialogComponent',
        SiWidgetEditorDialogMockComponent
      );

      component.editWidgetInstance(widgetConfig);
      const editedWidgetConfig: WidgetConfig = { ...widgetConfig, minHeight: 2 };
      SiWidgetEditorDialogMockComponent.staticClosed?.emit(editedWidgetConfig);
      vi.advanceTimersByTime(200);
      fixture.detectChanges();
      expect(component.visibleWidgetInstances$.value[0].minHeight).toBe(2);
      vi.useRealTimers();
    });

    it('shall emit an edit event if #emitWidgetInstanceEditEvents is set to true', async () => {
      fixture.componentRef.setInput('widgetCatalog', [TEST_WIDGET]);
      fixture.detectChanges();
      await fixture.whenStable();
      component.addWidgetInstance({ widgetId: TEST_WIDGET.id, payload: TEST_WIDGET.payload });
      component.save();
      await fixture.whenStable();
      const widgetConfig = component.visibleWidgetInstances$.value[0];
      fixture.componentRef.setInput(
        'widgetInstanceEditorDialogComponent',
        SiWidgetEditorDialogMockComponent
      );

      fixture.componentRef.setInput('emitWidgetInstanceEditEvents', true);
      const spy = vi.spyOn(component.widgetInstanceEdit, 'emit');
      component.editWidgetInstance(widgetConfig);
      expect(spy).toHaveBeenCalledWith(widgetConfig);
    });
  });

  it('#handleGridEvent() shall update visible widgets and mark grid as modified', async () => {
    component.addWidgetInstance({ widgetId: 'id' });
    component.save();
    component.edit();

    component.isModified.subscribe(modified => {
      expect(modified).toBe(true);
    });
    fixture.debugElement
      .query(By.css('si-gridstack-wrapper'))
      .triggerEventHandler('gridEvent', { event: { type: 'added' } });
  });

  it('should load widgets when dashboardId changes', async () => {
    const widgetConfig: WidgetConfig = { id: 'myId', widgetId: 'myWidgetId' };
    const myDashboardId = 'myDashboardId';
    fixture.componentRef.setInput('dashboardId', myDashboardId);
    widgetStorage.save([widgetConfig], [], myDashboardId);

    component.ngOnChanges({ dashboardId: new SimpleChange(undefined, myDashboardId, false) });
    await fixture.whenStable();

    expect(component.visibleWidgetInstances$.value[0].id).toBe('myId');
    expect(component.visibleWidgetInstances$.value[0].widgetId).toBe('myWidgetId');
  });
});
