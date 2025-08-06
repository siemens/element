/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SiActionDialogService } from '@spike-rabbit/element-ng/action-modal';
import {
  TEST_WIDGET,
  TEST_WIDGET_CONFIG_0,
  TEST_WIDGET_CONFIG_1,
  TEST_WIDGET_CONFIG_2,
  TEST_WIDGET_CONFIGS
} from 'projects/dashboards-ng/test/test-widget/test-widget';

import { TestingModule } from '../../../test/testing.module';
import { WidgetConfig } from '../../model/widgets.model';
import { SiGridService } from '../../services/si-grid.service';
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
    gridService.widgetCatalog = [];
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
      gridService.widgetCatalog = [TEST_WIDGET];
      host.widgets = TEST_WIDGET_CONFIGS;
      const gridStackWrapper = host.gridStackWrapper();
      spyOn(gridStackWrapper!, 'mount');
      fixture.detectChanges();

      expect(gridStackWrapper!.mount).toHaveBeenCalled();
      expect(gridStackWrapper!.mount).toHaveBeenCalledWith(TEST_WIDGET_CONFIGS);
    });

    it('should render grid items', () => {
      fixture = TestBed.createComponent(HostComponent);
      host = fixture.componentInstance;
      gridService.widgetCatalog = [TEST_WIDGET];
      host.widgets = [TEST_WIDGET_CONFIG_0, TEST_WIDGET_CONFIG_1];
      fixture.detectChanges();

      expect(fixture.debugElement.queryAll(By.css('si-widget-host')).length).toBe(2);
    });
  });

  describe('updating grid items', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(HostComponent);
      host = fixture.componentInstance;
      gridService.widgetCatalog = [TEST_WIDGET];
      host.widgets = [TEST_WIDGET_CONFIG_0, TEST_WIDGET_CONFIG_1];
      fixture.detectChanges();
    });

    it('should mount newly added grid items', () => {
      host.widgets = [...host.widgets, TEST_WIDGET_CONFIG_2];

      const gridStackWrapper = host.gridStackWrapper();
      spyOn(gridStackWrapper!, 'mount');
      fixture.detectChanges();

      expect(gridStackWrapper!.mount).toHaveBeenCalled();
      expect(gridStackWrapper!.mount).toHaveBeenCalledWith([TEST_WIDGET_CONFIG_2]);
    });

    it('should unmount removed grid items', () => {
      host.widgets = [TEST_WIDGET_CONFIG_1];
      spyOn(host.gridStackWrapper()!, 'unmount').and.callThrough();
      fixture.detectChanges();

      expect(host.gridStackWrapper()!.unmount).toHaveBeenCalled();
      expect(host.gridStackWrapper()!.unmount).toHaveBeenCalledWith([TEST_WIDGET_CONFIG_0]);

      host.widgets = [];
      fixture.detectChanges();

      expect(host.gridStackWrapper()!.unmount).toHaveBeenCalled();
      expect(host.gridStackWrapper()!.unmount).toHaveBeenCalledWith([TEST_WIDGET_CONFIG_1]);
    });
  });

  describe('#getLayout()', () => {
    it('should return layout of grid items', () => {
      fixture = TestBed.createComponent(HostComponent);
      host = fixture.componentInstance;
      gridService.widgetCatalog = [TEST_WIDGET];
      host.widgets = TEST_WIDGET_CONFIGS;
      fixture.detectChanges();
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
      gridService.widgetCatalog = [TEST_WIDGET];
      host.widgets = [];
      fixture.detectChanges();
      const layout = host.gridStackWrapper()!.getLayout();
      expect(layout).toEqual([]);
    });
  });

  it('should emit gridstack events', (done: DoneFn) => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();

    const events = ['added', 'removed'];
    let index = 0;
    host.gridStackWrapper()?.gridEvent.subscribe(wrapperEvent => {
      expect(wrapperEvent.event.type).toBe(events[index]);
      index++;
      if (index === events.length) {
        done();
      }
    });
    events.forEach(eventName => {
      const event = new CustomEvent(eventName, { bubbles: false, detail: {} });
      //@ts-ignore
      host.gridStackWrapper()?.grid.el.dispatchEvent(event);
    });
  });
});
