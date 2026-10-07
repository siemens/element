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
import { firstValueFrom, take, toArray } from 'rxjs';
import { page } from 'vitest/browser';

import {
  TEST_WIDGET,
  TEST_WIDGET_CONFIG_0,
  TEST_WIDGET_CONFIG_1,
  TEST_WIDGET_CONFIG_2,
  TEST_WIDGET_CONFIGS
} from '../../../test/test-widget/test-widget';
import { TestingModule } from '../../../test/testing.module';
import { Widget, WidgetConfig } from '../../model/widgets.model';
import { SiWidgetHostComponent } from '../widget-host/si-widget-host.component';
import { SiGridstackWrapperComponent } from './si-gridstack-wrapper.component';

describe('SiGridstackWrapperComponent', () => {
  let fixture: ComponentFixture<SiGridstackWrapperComponent>;
  let component: SiGridstackWrapperComponent;
  let widgets: WritableSignal<WidgetConfig[]>;
  let widgetCatalogMap: WritableSignal<Map<string, Widget>>;
  let editable: WritableSignal<boolean>;

  beforeEach(async () => {
    // Use a viewport comfortably above the responsive 1-column breakpoint (576px)
    // so gridstack does not intermittently collapse the layout to a single column.
    await page.viewport(1024, 768);
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
    editable = signal(false);
    fixture = TestBed.createComponent(SiGridstackWrapperComponent, {
      bindings: [
        inputBinding('widgetConfigs', widgets),
        inputBinding('widgetCatalogMap', widgetCatalogMap),
        inputBinding('editable', editable)
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
      await createComponent(TEST_WIDGET_CONFIGS, new Map([[TEST_WIDGET.id, TEST_WIDGET]]));

      const widgetHosts = fixture.debugElement.queryAll(By.css('si-widget-host'));
      expect(widgetHosts).toHaveLength(TEST_WIDGET_CONFIGS.length);
    });

    it('should render grid items', async () => {
      await createComponent(
        [TEST_WIDGET_CONFIG_0, TEST_WIDGET_CONFIG_1],
        new Map([[TEST_WIDGET.id, TEST_WIDGET]])
      );

      expect(fixture.debugElement.queryAll(By.css('si-widget-host'))).toHaveLength(2);
    });

    it('should apply native dimensions and restrictions across edit mode changes', async () => {
      const config: WidgetConfig = {
        ...TEST_WIDGET_CONFIG_0,
        w: 4,
        h: 3,
        noMove: true,
        noResize: true,
        locked: true
      };
      await createComponent([config], new Map([[TEST_WIDGET.id, TEST_WIDGET]]));
      const host = fixture.nativeElement.querySelector('si-widget-host');

      editable.set(true);
      await fixture.whenStable();
      editable.set(false);
      await fixture.whenStable();
      editable.set(true);
      await fixture.whenStable();

      expect(host).toHaveAttribute('gs-w', '4');
      expect(host).toHaveAttribute('gs-h', '3');
      expect(host).toHaveAttribute('gs-no-move', 'true');
      expect(host).toHaveAttribute('gs-no-resize', 'true');
      expect(host).toHaveAttribute('gs-locked', 'true');
      expect(component.getWidgetLayout(config.id)).toMatchObject({ w: 4, h: 3 });
    });

    it.each([
      { w: 1, h: 1, minW: 3, minH: 2, expectedW: 3, expectedH: 2 },
      { w: 8, h: 7, maxW: 4, maxH: 3, expectedW: 4, expectedH: 3 }
    ])('should enforce native size constraints: $expectedW x $expectedH', async options => {
      const { expectedW, expectedH, ...sizing } = options;
      await createComponent(
        [{ id: 'constrained', widgetId: TEST_WIDGET.id, ...sizing }],
        new Map([[TEST_WIDGET.id, TEST_WIDGET]])
      );

      expect(component.getWidgetLayout('constrained')).toMatchObject({
        w: expectedW,
        h: expectedH
      });
    });

    it.each([
      { w: 1, h: 1 },
      { w: 8, h: 5 }
    ])('should clear removed restrictions and size constraints: $w x $h', async sizing => {
      const config: WidgetConfig = {
        ...TEST_WIDGET_CONFIG_0,
        w: 4,
        h: 3,
        minW: 3,
        minH: 2,
        maxW: 6,
        maxH: 4,
        noMove: true,
        noResize: true,
        locked: true
      };
      await createComponent([config], new Map([[TEST_WIDGET.id, TEST_WIDGET]]));
      editable.set(true);
      await fixture.whenStable();

      widgets.set([{ ...TEST_WIDGET_CONFIG_0, ...sizing }]);
      await fixture.whenStable();

      const host = fixture.nativeElement.querySelector('si-widget-host');
      expect(host).not.toHaveAttribute('gs-no-move');
      expect(host).not.toHaveAttribute('gs-no-resize');
      expect(host).not.toHaveAttribute('gs-locked');
      expect(component.getWidgetLayout(config.id)).toMatchObject(sizing);
    });

    it('should hide native resize handles when noResize is set and restore them when removed', async () => {
      await createComponent([TEST_WIDGET_CONFIG_0], new Map([[TEST_WIDGET.id, TEST_WIDGET]]));
      editable.set(true);
      await fixture.whenStable();
      const host = fixture.nativeElement.querySelector('si-widget-host');
      const handle = host.querySelector('.ui-resizable-handle');
      expect(handle).toBeVisible();

      widgets.set([{ ...TEST_WIDGET_CONFIG_0, noResize: true }]);
      await fixture.whenStable();

      expect(handle).not.toBeVisible();
      expect(host.querySelector('.resize-handle')).not.toBeInTheDocument();

      widgets.set([TEST_WIDGET_CONFIG_0]);
      await fixture.whenStable();

      expect(handle).toBeVisible();
    });

    it('should group widgets as a labeled list when not editable', async () => {
      await createComponent(
        [TEST_WIDGET_CONFIG_0, TEST_WIDGET_CONFIG_1],
        new Map([[TEST_WIDGET.id, TEST_WIDGET]])
      );

      const gridStack = fixture.nativeElement.querySelector('.grid-stack');
      expect(gridStack.getAttribute('role')).toBe('list');
      expect(gridStack.getAttribute('aria-label')).toBe('Dashboard widgets');
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
      widgets.set([...widgets(), TEST_WIDGET_CONFIG_2]);
      await fixture.whenStable();

      const widgetHosts = fixture.debugElement.queryAll(By.css('si-widget-host'));
      expect(widgetHosts).toHaveLength(3);
    });

    it('should unmount removed grid items', async () => {
      widgets.set([TEST_WIDGET_CONFIG_1]);
      await fixture.whenStable();

      expect(fixture.debugElement.queryAll(By.css('si-widget-host'))).toHaveLength(1);

      widgets.set([]);
      await fixture.whenStable();

      expect(fixture.debugElement.queryAll(By.css('si-widget-host'))).toHaveLength(0);
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

      // Wait for GridStack to finish batch update and set all DOM attributes with valid values
      await vi.waitFor(() => {
        const firstWidget = fixture.nativeElement.querySelector('[gs-w]');
        expect(firstWidget).toBeTruthy();
        const width = Number(firstWidget.getAttribute('gs-w'));
        const height = Number(firstWidget.getAttribute('gs-h'));
        expect(width).toBeGreaterThan(0);
        expect(height).toBeGreaterThan(0);
      });

      TEST_WIDGET_CONFIGS.forEach(wg => {
        const position = component.getWidgetLayout(wg.id);
        expect(position).toBeDefined();
        expect(position!.id).toBe(wg.id);

        // GridStack may reposition x/y, but width/height should match input
        expect(position!.x).toBeGreaterThanOrEqual(0);
        expect(position!.y).toBeGreaterThanOrEqual(0);
        expect(position!.width).toBe(wg.width);
        expect(position!.height).toBe(wg.height);
        expect(position).toMatchObject({ w: wg.width, h: wg.height });
      });
    });

    it('should report default one-cell dimensions even when GridStack omits the attributes', async () => {
      await createComponent(
        [{ id: 'default-size', widgetId: TEST_WIDGET.id }],
        new Map([[TEST_WIDGET.id, TEST_WIDGET]])
      );

      expect(component.getWidgetLayout('default-size')).toMatchObject({
        w: 1,
        h: 1,
        width: 1,
        height: 1
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
