/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Component, viewChild } from '@angular/core';
import { outputToObservable } from '@angular/core/rxjs-interop';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SiActionDialogService } from '@siemens/element-ng/action-modal';
import {
  TEST_WIDGET,
  TEST_WIDGET_CONFIG_0,
  TEST_WIDGET_CONFIG_1,
  TEST_WIDGET_CONFIG_2,
  TEST_WIDGET_CONFIGS
} from 'projects/dashboards-ng/test/test-widget/test-widget';
import { firstValueFrom, take, toArray } from 'rxjs';

import { TestingModule } from '../../../test/testing.module';
import { WidgetConfig } from '../../model/widgets.model';
import { SiGridService } from '../../services/si-grid.service';
import { SiWidgetHostComponent } from '../widget-host/si-widget-host.component';
import { SiGridstackWrapperComponent } from './si-gridstack-wrapper.component';

@Component({
  imports: [TestingModule, SiGridstackWrapperComponent],
  template: '<si-gridstack-wrapper [widgetConfigs]="widgets" />'
})
class HostComponent {
  readonly gridStackWrapper = viewChild(SiGridstackWrapperComponent);
  widgets: WidgetConfig[] = [];
}

describe('SiGridstackWrapperComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let gridService: SiGridService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [SiActionDialogService, SiGridService]
    }).compileComponents();
    gridService = TestBed.inject(SiGridService);
    gridService.widgetCatalog.set([]);
  });

  describe('initialization', () => {
    it('should init the GridStack', () => {
      fixture = TestBed.createComponent(HostComponent);
      host = fixture.componentInstance;
      fixture.detectChanges();

      //@ts-ignore
      expect(host.gridStackWrapper()?.grid).toBeDefined();
    });

    it('should mount the grid items', () => {
      fixture = TestBed.createComponent(HostComponent);
      host = fixture.componentInstance;
      gridService.widgetCatalog.set([TEST_WIDGET]);
      host.widgets = TEST_WIDGET_CONFIGS;
      const gridStackWrapper = host.gridStackWrapper();
      spyOn(gridStackWrapper!, 'mount');
      fixture.detectChanges();

      expect(gridStackWrapper!.mount).toHaveBeenCalled();
      expect(gridStackWrapper!.mount).toHaveBeenCalledWith(TEST_WIDGET_CONFIGS);
    });

    it('should render grid items', async () => {
      fixture = TestBed.createComponent(HostComponent);
      host = fixture.componentInstance;
      gridService.widgetCatalog.set([TEST_WIDGET]);
      host.widgets = [TEST_WIDGET_CONFIG_0, TEST_WIDGET_CONFIG_1];
      fixture.detectChanges();

      // to avoid injector destroyed error
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(fixture.debugElement.queryAll(By.css('si-widget-host')).length).toBe(2);
    });
  });

  describe('updating grid items', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(HostComponent);
      host = fixture.componentInstance;
      gridService.widgetCatalog.set([TEST_WIDGET]);
      host.widgets = [TEST_WIDGET_CONFIG_0, TEST_WIDGET_CONFIG_1];
      fixture.detectChanges();
    });

    it('should mount newly added grid items', async () => {
      host.widgets = [...host.widgets, TEST_WIDGET_CONFIG_2];

      const gridStackWrapper = host.gridStackWrapper();
      spyOn(gridStackWrapper!, 'mount');
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      // to avoid injector destroyed error
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(gridStackWrapper!.mount).toHaveBeenCalled();
      expect(gridStackWrapper!.mount).toHaveBeenCalledWith([TEST_WIDGET_CONFIG_2]);
    });

    it('should unmount removed grid items', async () => {
      host.widgets = [TEST_WIDGET_CONFIG_1];
      spyOn(host.gridStackWrapper()!, 'unmount').and.callThrough();
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(host.gridStackWrapper()!.unmount).toHaveBeenCalled();
      expect(host.gridStackWrapper()!.unmount).toHaveBeenCalledWith([TEST_WIDGET_CONFIG_0]);

      host.widgets = [];
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      // to avoid injector destroyed error
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(host.gridStackWrapper()!.unmount).toHaveBeenCalled();
      expect(host.gridStackWrapper()!.unmount).toHaveBeenCalledWith([TEST_WIDGET_CONFIG_1]);
    });

    it('should not trigger ngOnChanges on SiWidgetHostComponent when widget config reference is unchanged', async () => {
      const widgetHosts = fixture.debugElement.queryAll(By.directive(SiWidgetHostComponent));
      const ngOnChangesSpy = widgetHosts.map(widgetHost =>
        spyOn(widgetHost.componentInstance, 'ngOnChanges').and.callThrough()
      );

      // Re-assign the same config references inside a new array
      host.widgets = [TEST_WIDGET_CONFIG_0, TEST_WIDGET_CONFIG_1];
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      // to avoid injector destroyed error
      await new Promise(resolve => setTimeout(resolve, 0));

      ngOnChangesSpy.forEach(spy => expect(spy).not.toHaveBeenCalled());
    });

    it('should only trigger ngOnChanges on the resized widget, not on unchanged ones', async () => {
      const widgetHosts = fixture.debugElement.queryAll(By.directive(SiWidgetHostComponent));
      const widget0Host = widgetHosts.find(
        wh => wh.componentInstance.widgetConfig().id === TEST_WIDGET_CONFIG_0.id
      )!;
      const widget1Host = widgetHosts.find(
        wh => wh.componentInstance.widgetConfig().id === TEST_WIDGET_CONFIG_1.id
      )!;
      const spy0 = spyOn(widget0Host.componentInstance, 'ngOnChanges').and.callThrough();
      const spy1 = spyOn(widget1Host.componentInstance, 'ngOnChanges').and.callThrough();

      // Simulate resize of widget 0 by creating a new reference with updated dimensions
      const resizedConfig0: WidgetConfig = { ...TEST_WIDGET_CONFIG_0, width: 8, height: 3 };
      host.widgets = [resizedConfig0, TEST_WIDGET_CONFIG_1];
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      // to avoid injector destroyed error
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(spy0).toHaveBeenCalledTimes(1);
      expect(spy1).not.toHaveBeenCalled();
    });
  });

  describe('#getLayout()', () => {
    it('should return layout of grid items', async () => {
      fixture = TestBed.createComponent(HostComponent);
      host = fixture.componentInstance;
      gridService.widgetCatalog.set([TEST_WIDGET]);
      host.widgets = TEST_WIDGET_CONFIGS;
      fixture.detectChanges();
      // to avoid injector destroyed error
      await new Promise(resolve => setTimeout(resolve, 0));
      const layout = host.gridStackWrapper()!.getLayout();
      expect(layout).toBeDefined();
      expect(layout.length).toBe(TEST_WIDGET_CONFIGS.length);
      layout.forEach(position => {
        const wg = TEST_WIDGET_CONFIGS.find(wc => wc.id === position.id)!;
        expect(position.x).toBe(wg.x);
        expect(position.y).toBe(wg.y);
        expect(position.width).toBe(wg.width);
        expect(position.height).toBe(wg.height);
      });
    });

    it('should return empty array without widgets', () => {
      fixture = TestBed.createComponent(HostComponent);
      host = fixture.componentInstance;
      gridService.widgetCatalog.set([TEST_WIDGET]);
      host.widgets = [];
      fixture.detectChanges();
      const layout = host.gridStackWrapper()!.getLayout();
      expect(layout).toEqual([]);
    });
  });

  it('should emit gridstack events', async () => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();

    const events = ['added', 'removed'];
    const emittedEventsPromise = firstValueFrom(
      outputToObservable(host.gridStackWrapper()!.gridEvent).pipe(take(events.length), toArray())
    );

    events.forEach(eventName => {
      const event = new CustomEvent(eventName, { bubbles: false, detail: {} });
      //@ts-ignore
      host.gridStackWrapper()?.grid.el.dispatchEvent(event);
    });

    const emittedEvents = await emittedEventsPromise;
    expect(emittedEvents.map(e => e.event.type)).toEqual(events);
  });
});
