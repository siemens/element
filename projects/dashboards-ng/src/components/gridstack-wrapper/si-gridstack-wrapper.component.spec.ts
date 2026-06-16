/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { inputBinding, signal, WritableSignal } from '@angular/core';
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
import { page } from 'vitest/browser';

import { TestingModule } from '../../../test/testing.module';
import { Widget, WidgetConfig } from '../../model/widgets.model';
import { SiWidgetHostComponent } from '../widget-host/si-widget-host.component';
import { SiGridstackWrapperComponent } from './si-gridstack-wrapper.component';

describe('SiGridstackWrapperComponent', () => {
  let fixture: ComponentFixture<SiGridstackWrapperComponent>;
  let component: SiGridstackWrapperComponent;
  let widgets: WritableSignal<WidgetConfig[]>;
  let widgetCatalogMap: WritableSignal<Map<string, Widget>>;

  beforeEach(async () => {
    page.viewport(600, 600);
    await TestBed.configureTestingModule({
      imports: [TestingModule],
      providers: [SiActionDialogService]
    }).compileComponents();
  });

  afterEach(() => vi.restoreAllMocks());

  const createComponent = async (
    initialWidgets: WidgetConfig[] = [],
    initialCatalogMap: Map<string, Widget> = new Map()
  ): Promise<void> => {
    widgets = signal(initialWidgets);
    widgetCatalogMap = signal(initialCatalogMap);
    fixture = TestBed.createComponent(SiGridstackWrapperComponent, {
      bindings: [
        inputBinding('widgetConfigs', widgets),
        inputBinding('widgetCatalogMap', widgetCatalogMap)
      ]
    });
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  };

  describe('initialization', () => {
    it('should init the GridStack', async () => {
      await createComponent();

      //@ts-ignore
      expect(component.grid).toBeDefined();
    });

    it('should mount the grid items', async () => {
      const mountSpy = vi
        .spyOn(SiGridstackWrapperComponent.prototype, 'mount')
        .mockImplementation(() => {});

      await createComponent(TEST_WIDGET_CONFIGS, new Map([[TEST_WIDGET.id, TEST_WIDGET]]));

      expect(mountSpy).toHaveBeenCalledWith(TEST_WIDGET_CONFIGS);
    });

    it('should render grid items', async () => {
      await createComponent(
        [TEST_WIDGET_CONFIG_0, TEST_WIDGET_CONFIG_1],
        new Map([[TEST_WIDGET.id, TEST_WIDGET]])
      );

      expect(fixture.debugElement.queryAll(By.css('si-widget-host'))).toHaveLength(2);
    });
  });

  describe('updating grid items', () => {
    beforeEach(async () => {
      await createComponent(
        [TEST_WIDGET_CONFIG_0, TEST_WIDGET_CONFIG_1],
        new Map([[TEST_WIDGET.id, TEST_WIDGET]])
      );
    });

    it('should mount newly added grid items', async () => {
      const mountSpy = vi.spyOn(component, 'mount');

      widgets.update(current => [...current, TEST_WIDGET_CONFIG_2]);
      await fixture.whenStable();

      expect(mountSpy).toHaveBeenCalled();
      expect(mountSpy).toHaveBeenCalledWith([TEST_WIDGET_CONFIG_2]);
    });

    it('should unmount removed grid items', async () => {
      const unmountSpy = vi.spyOn(component, 'unmount');

      widgets.set([TEST_WIDGET_CONFIG_1]);
      await fixture.whenStable();

      expect(unmountSpy).toHaveBeenCalled();
      expect(unmountSpy).toHaveBeenCalledWith([TEST_WIDGET_CONFIG_0]);

      widgets.set([]);
      await fixture.whenStable();

      expect(unmountSpy).toHaveBeenCalled();
      expect(unmountSpy).toHaveBeenCalledWith([TEST_WIDGET_CONFIG_1]);
    });

    it('should not trigger ngOnChanges on SiWidgetHostComponent when widget config reference is unchanged', async () => {
      const widgetHosts = fixture.debugElement.queryAll(By.directive(SiWidgetHostComponent));
      const ngOnChangesSpy = widgetHosts.map(widgetHost =>
        vi.spyOn(widgetHost.componentInstance, 'ngOnChanges')
      );

      widgets.set([TEST_WIDGET_CONFIG_0, TEST_WIDGET_CONFIG_1]);
      await fixture.whenStable();

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
      const spy0 = vi.spyOn(widget0Host.componentInstance, 'ngOnChanges');
      const spy1 = vi.spyOn(widget1Host.componentInstance, 'ngOnChanges');

      const resizedConfig0: WidgetConfig = { ...TEST_WIDGET_CONFIG_0, width: 8, height: 3 };
      widgets.set([resizedConfig0, TEST_WIDGET_CONFIG_1]);
      await fixture.whenStable();

      expect(spy0).toHaveBeenCalledTimes(1);
      expect(spy1).not.toHaveBeenCalled();
    });
  });

  describe('#getWidgetLayout()', () => {
    it('should return layout for a given widget id', async () => {
      await createComponent(TEST_WIDGET_CONFIGS, new Map([[TEST_WIDGET.id, TEST_WIDGET]]));

      TEST_WIDGET_CONFIGS.forEach(wg => {
        const position = component.getWidgetLayout(wg.id);
        expect(position).toBeDefined();
        expect(position!.id).toBe(wg.id);
        expect(position!.x).toBe(wg.x);
        expect(position!.y).toBe(wg.y);
        expect(position!.width).toBe(wg.width);
        expect(position!.height).toBe(wg.height);
      });
    });

    it('should return undefined for unknown widget id', async () => {
      await createComponent([], new Map([[TEST_WIDGET.id, TEST_WIDGET]]));

      const position = component.getWidgetLayout('non-existent-id');
      expect(position).toBeUndefined();
    });
  });

  it('should emit gridstack events', async () => {
    await createComponent();

    const events = ['added', 'removed'];
    const emittedEventsPromise = firstValueFrom(
      outputToObservable(component.gridEvent).pipe(take(events.length), toArray())
    );

    events.forEach(eventName => {
      const event = new CustomEvent(eventName, { bubbles: false, detail: {} });
      //@ts-ignore
      component.grid.el.dispatchEvent(event);
    });

    const emittedEvents = await emittedEventsPromise;
    expect(emittedEvents.map(e => e.event.type)).toEqual(events);
  });
});
