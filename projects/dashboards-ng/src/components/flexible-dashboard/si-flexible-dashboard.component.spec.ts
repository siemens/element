/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  NO_ERRORS_SCHEMA,
  OnInit,
  output,
  OutputEmitterRef,
  signal,
  Type,
  viewChild
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MenuItem } from '@siemens/element-ng/common';
import { SiLoadingSpinnerModule } from '@siemens/element-ng/loading-spinner';
import { BehaviorSubject, firstValueFrom, Observable, of, Subject, zip } from 'rxjs';
import { page } from 'vitest/browser';

import { TEST_WIDGET, TEST_WIDGET_CONFIG_0 } from '../../../test/test-widget/test-widget';
import { TestingModule } from '../../../test/testing.module';
import {
  provideDashboardToolbarItems,
  SI_DASHBOARD_CONFIGURATION
} from '../../model/configuration';
import { GridConfig } from '../../model/gridstack.model';
import {
  DashboardToolbarItem,
  DashboardToolbarItemAction
} from '../../model/si-dashboard-toolbar.model';
import {
  SI_WIDGET_STORE,
  SiDefaultWidgetStorage,
  SiWidgetStorage
} from '../../model/si-widget-storage';
import { Widget, WidgetConfig } from '../../model/widgets.model';
import { SiDashboardToolbarComponent } from '../dashboard-toolbar/si-dashboard-toolbar.component';
import { SiGridComponent } from '../grid/si-grid.component';
import { SiWidgetCatalogComponent } from '../widget-catalog/si-widget-catalog.component';
import { SiWidgetInstanceEditorDialogComponent } from '../widget-instance-editor-dialog/si-widget-instance-editor-dialog.component';
import { SiFlexibleDashboardComponent } from './si-flexible-dashboard.component';

let actionCounter = 0;
let widgetConfig: Omit<WidgetConfig, 'id'>;

@Component({
  selector: 'si-widget-catalog',
  imports: [TestingModule, SiLoadingSpinnerModule],
  template: '',
  changeDetection: ChangeDetectionStrategy.Eager
})
export class SiWidgetCatalogMockComponent extends SiWidgetCatalogComponent implements OnInit {
  static staticClosed: OutputEmitterRef<Omit<WidgetConfig, 'id'>[] | undefined> | undefined =
    undefined;

  override readonly closed = output<Omit<WidgetConfig, 'id'>[] | undefined>();

  override ngOnInit(): void {
    SiWidgetCatalogMockComponent.staticClosed ??= this.closed;
  }
}

@Component({
  selector: 'si-grid',
  imports: [TestingModule, SiLoadingSpinnerModule],
  template: '',
  changeDetection: ChangeDetectionStrategy.Eager
})
export class GridComponent {
  readonly gridConfig = input<GridConfig>();
  readonly dashboardId = input<string>();
  readonly widgetCatalog = input<Widget[]>([]);
  readonly hideProgressIndicator = input(false);
  readonly widgetInstanceEditorDialogComponent =
    input<Type<SiWidgetInstanceEditorDialogComponent>>();
  readonly emitWidgetInstanceEditEvents = input(false);
  readonly editable = model(false);
  readonly isLoading = new BehaviorSubject(false);
  readonly isModified = output<boolean>();
  readonly widgetInstanceEdit = output<WidgetConfig>();
  addWidgetInstance(item: Omit<WidgetConfig, 'id'>): void {
    widgetConfig = item;
  }
  edit(): void {}
  cancel(): void {}
  save(): void {}
}

class TestWidgetStorage extends SiDefaultWidgetStorage {
  override getToolbarMenuItems = (
    dashboardId?: string
  ): {
    primary: Observable<MenuItem[]>;
    secondary: Observable<MenuItem[]>;
  } => {
    return {
      primary: of([
        {
          title: 'IncreaseCounter',
          action: () => {
            actionCounter++;
          }
        }
      ]),
      secondary: of([{ title: 'Help' }, { title: 'Help', action: '--' }])
    };
  };
}

@Component({
  imports: [SiFlexibleDashboardComponent],
  template: `
    <si-flexible-dashboard heading="Heading" [widgetCatalogComponent]="widgetCatalogComponent">
      <div class="si-layout-header" header>
        <h2 class="si-layout-title si-layout-top-element">Custom heading</h2>
      </div>
      <button type="button" class="btn btn-secondary" filters-slot>Default filters</button>
    </si-flexible-dashboard>
  `
})
class CustomHeaderHostComponent {
  readonly dashboard = viewChild.required(SiFlexibleDashboardComponent);
  protected readonly widgetCatalogComponent = SiWidgetCatalogMockComponent;
}

@Component({
  imports: [SiFlexibleDashboardComponent, SiDashboardToolbarComponent],
  template: `
    <si-flexible-dashboard
      heading="Projected toolbar dashboard"
      [widgetCatalogComponent]="widgetCatalogComponent"
      [widgetCatalog]="widgetCatalog"
      [hideEditButton]="true"
      [hideAddWidgetInstanceButton]="true"
      [primaryEditActions]="dashboardActions"
      [dashboardId]="dashboardId()"
    >
      <si-dashboard-toolbar
        editButtonLabel="Customize"
        cancelButtonLabel="Discard"
        saveButtonLabel="Apply"
        addWidgetButtonLabel="Insert widget"
        [hideAddWidgetInstanceButton]="hideAdd()"
        [primaryEditActions]="actions()"
        (save)="saveRequested()"
      >
        <button type="button" class="btn btn-secondary" filters-slot>Projected filters</button>
      </si-dashboard-toolbar>
      <button type="button" class="btn btn-secondary" filters-slot>Default filters</button>
    </si-flexible-dashboard>
  `
})
class ProjectedToolbarHostComponent {
  readonly dashboard = viewChild.required(SiFlexibleDashboardComponent);
  readonly dashboardId = signal<string | undefined>(undefined);
  readonly hideAdd = signal(false);
  readonly actions = signal<DashboardToolbarItem[]>([
    { type: 'action', label: 'Projected action', action: vi.fn() }
  ]);
  readonly saveRequested = vi.fn();
  readonly dashboardActions: DashboardToolbarItem[] = [
    { type: 'action', label: 'Default action', action: vi.fn() }
  ];
  protected readonly widgetCatalogComponent = SiWidgetCatalogMockComponent;
  protected readonly widgetCatalog = [TEST_WIDGET];
}

const pageHeadings = (element: HTMLElement): string[] =>
  Array.from(element.querySelectorAll('.si-dashboard-header h2')).map(
    heading => heading.textContent?.trim() ?? ''
  );

describe('SiFlexibleDashboardComponent', () => {
  let component: SiFlexibleDashboardComponent;
  let fixture: ComponentFixture<SiFlexibleDashboardComponent>;
  let grid: GridComponent;

  describe('with new menu item config', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        providers: [
          { provide: SI_WIDGET_STORE, useClass: TestWidgetStorage },
          { provide: SI_DASHBOARD_CONFIGURATION, useValue: {} }
        ],
        imports: [SiFlexibleDashboardComponent],
        schemas: [NO_ERRORS_SCHEMA]
      })
        .overrideComponent(SiFlexibleDashboardComponent, {
          remove: { imports: [SiGridComponent] },
          add: { imports: [GridComponent] }
        })
        .compileComponents();
      fixture = TestBed.createComponent(SiFlexibleDashboardComponent);
      component = fixture.componentInstance;
      grid = component.grid();
      fixture.componentRef.setInput('heading', 'Heading');
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should create with additional menu items with actions that can be invoked', async () => {
      actionCounter = 0;
      const [primaryMenuItems, secondaryMenuItems] = await firstValueFrom(
        zip(component.primaryEditActions$, component.secondaryEditActions$)
      );

      expect(primaryMenuItems).toHaveLength(2);
      const action = (primaryMenuItems[1] as MenuItem).action as () => void;
      action();
      expect(actionCounter).toBe(1);

      expect(secondaryMenuItems).toHaveLength(2);
    });

    it('#hideAddWidgetInstanceButton should remove the addWidgetInstanceAction action', async () => {
      expect(component.primaryEditActions$.value).toHaveLength(2);
      fixture.componentRef.setInput('hideAddWidgetInstanceButton', true);
      await fixture.whenStable();
      expect(component.primaryEditActions$.value).toHaveLength(1);
    });

    it('showWidgetCatalog() should show a widget catalog and add the widget config added to the grid', async () => {
      vi.useFakeTimers();
      fixture.componentRef.setInput('widgetCatalogComponent', SiWidgetCatalogMockComponent);
      fixture.detectChanges();
      component.showWidgetCatalog();
      fixture.detectChanges();
      SiWidgetCatalogMockComponent.staticClosed?.emit([{ widgetId: 'widgetId' }]);
      vi.advanceTimersByTime(200);
      await fixture.whenStable();
      expect(widgetConfig).toBeDefined();
      expect(widgetConfig.widgetId).toEqual('widgetId');
      vi.useRealTimers();
    });

    it('addWidgetAction action shall call showWidgetCatalog()', () => {
      const spy = vi.spyOn(component, 'showWidgetCatalog');
      const action = (component.primaryEditActions$.value[0] as MenuItem).action as (
        param?: any
      ) => void;
      action();
      expect(spy).toHaveBeenCalled();
    });

    it('showWidgetCatalog() should restore the dashboard, if expanded', () => {
      fixture.componentRef.setInput('widgetCatalogComponent', SiWidgetCatalogMockComponent);
      const isExpandedSpy = vi
        .spyOn(component.dashboard(), 'isExpanded', 'get')
        .mockReturnValue(true);
      const restoreSpy = vi.spyOn(component.dashboard(), 'restore');
      fixture.detectChanges();

      component.showWidgetCatalog();
      expect(isExpandedSpy).toHaveBeenCalled();
      expect(restoreSpy).toHaveBeenCalled();
    });

    it('should emit editableChange events on changing grid editable state', () => {
      grid.editable.set(true);
      expect(component.editable()).toBe(true);
    });

    it('should restore the dashboard on dashboardId changes when dashboard is expanded', () => {
      const spy = vi.spyOn(component.dashboard(), 'restore');
      vi.spyOn(component.dashboard(), 'isExpanded', 'get').mockReturnValue(true);

      fixture.componentRef.setInput('dashboardId', '1');
      fixture.detectChanges();
      fixture.componentRef.setInput('dashboardId', undefined);
      fixture.detectChanges();
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('should not restore the dashboard on dashboardId changes when dashboard is not expanded', () => {
      const spy = vi.spyOn(component.dashboard(), 'restore');

      fixture.componentRef.setInput('dashboardId', '1');
      fixture.detectChanges();
      fixture.componentRef.setInput('dashboardId', undefined);
      fixture.detectChanges();
      expect(spy).toHaveBeenCalledTimes(0);
    });

    it('should cancel edit state on dashboardId changes', () => {
      fixture.componentRef.setInput('editable', true);

      fixture.componentRef.setInput('dashboardId', '1');
      fixture.detectChanges();
      expect(component.editable()).toBe(false);
    });

    it('should render the heading as page title', () => {
      expect(pageHeadings(fixture.nativeElement)).toEqual(['Heading']);
    });

    it('should render the widget catalog title while adding widgets', async () => {
      fixture.componentRef.setInput('widgetCatalogComponent', SiWidgetCatalogMockComponent);
      component.showWidgetCatalog();
      await fixture.whenStable();

      expect(pageHeadings(fixture.nativeElement)).toEqual(['Add widget']);
    });
  });

  describe('with custom header', () => {
    let hostFixture: ComponentFixture<CustomHeaderHostComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        providers: [
          { provide: SI_WIDGET_STORE, useClass: TestWidgetStorage },
          { provide: SI_DASHBOARD_CONFIGURATION, useValue: {} }
        ],
        imports: [CustomHeaderHostComponent],
        schemas: [NO_ERRORS_SCHEMA]
      })
        .overrideComponent(SiFlexibleDashboardComponent, {
          remove: { imports: [SiGridComponent] },
          add: { imports: [GridComponent] }
        })
        .compileComponents();
      hostFixture = TestBed.createComponent(CustomHeaderHostComponent);
      hostFixture.detectChanges();
      await hostFixture.whenStable();
    });

    it('should render the custom header instead of the heading', () => {
      expect(pageHeadings(hostFixture.nativeElement)).toEqual(['Custom heading']);
    });

    it('keeps existing filters projection on the default toolbar', async () => {
      await expect.element(page.getByRole('button', { name: 'Default filters' })).toBeVisible();

      hostFixture.componentInstance.dashboard().editable.set(true);
      await hostFixture.whenStable();
      await expect
        .element(page.getByRole('button', { name: 'Default filters' }))
        .not.toBeInTheDocument();

      await page.getByRole('button', { name: 'Cancel' }).click();
      await expect.element(page.getByRole('button', { name: 'Default filters' })).toBeVisible();
    });

    it('should replace the custom header with the widget catalog title while adding widgets', async () => {
      hostFixture.componentInstance.dashboard().showWidgetCatalog();
      await hostFixture.whenStable();
      expect(pageHeadings(hostFixture.nativeElement)).toEqual(['Add widget']);

      hostFixture.debugElement
        .query(By.directive(SiWidgetCatalogMockComponent))
        .componentInstance.closed.emit(undefined);
      await hostFixture.whenStable();
      expect(pageHeadings(hostFixture.nativeElement)).toEqual(['Custom heading']);
    });
  });

  describe('with common provider for toolbar items', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        providers: [
          provideDashboardToolbarItems({
            primary: [
              {
                type: 'action',
                label: 'IncreaseCounter',
                action: () => {
                  actionCounter++;
                }
              }
            ]
          }),
          { provide: SI_DASHBOARD_CONFIGURATION, useValue: {} }
        ],
        imports: [SiFlexibleDashboardComponent],
        schemas: [NO_ERRORS_SCHEMA]
      })
        .overrideComponent(SiFlexibleDashboardComponent, {
          remove: { imports: [SiGridComponent] },
          add: { imports: [GridComponent] }
        })
        .compileComponents();
      fixture = TestBed.createComponent(SiFlexibleDashboardComponent);
      component = fixture.componentInstance;
      grid = component.grid();
      fixture.componentRef.setInput('heading', 'Heading');
    });

    it('should consider common menu items with actions that can be invoked', async () => {
      actionCounter = 0;

      fixture.detectChanges();
      await fixture.whenStable();
      const menuItems = await firstValueFrom(component.primaryEditActions$);
      expect(menuItems).toHaveLength(2);
      const action = (menuItems[1] as DashboardToolbarItemAction).action as () => void;
      action();
      expect(actionCounter).toBe(1);
    });

    it('should consider dashboard specific menu items together with common menu items', async () => {
      actionCounter = 0;
      fixture.componentRef.setInput('primaryEditActions', [
        {
          type: 'action',
          label: 'IncreaseCounter',
          action: () => {
            actionCounter++;
          }
        }
      ]);
      fixture.detectChanges();
      await fixture.whenStable();
      const menuItems = await firstValueFrom(component.primaryEditActions$);
      expect(menuItems).toHaveLength(3);
      const action = (menuItems[1] as DashboardToolbarItemAction).action as () => void;
      action();
      expect(actionCounter).toBe(1);
    });
  });

  describe('with a projected toolbar', () => {
    let hostFixture: ComponentFixture<ProjectedToolbarHostComponent>;
    let host: ProjectedToolbarHostComponent;
    let projectedGrid: SiGridComponent;

    beforeEach(async () => {
      TestBed.configureTestingModule({
        providers: [
          { provide: SI_DASHBOARD_CONFIGURATION, useValue: {} },
          {
            provide: SI_WIDGET_STORE,
            useValue: {
              load: () => of([]),
              save: () => of([])
            } satisfies SiWidgetStorage
          }
        ]
      }).overrideComponent(SiFlexibleDashboardComponent, {
        remove: { imports: [GridComponent] },
        add: { imports: [SiGridComponent] }
      });
      hostFixture = TestBed.createComponent(ProjectedToolbarHostComponent);
      host = hostFixture.componentInstance;
      hostFixture.detectChanges();
      await hostFixture.whenStable();
      projectedGrid = host.dashboard().grid();
    });

    it('replaces the default toolbar and uses its own settings and filters', async () => {
      const element: HTMLElement = hostFixture.nativeElement;
      expect(element.querySelectorAll('si-dashboard-toolbar')).toHaveLength(1);
      await expect.element(page.getByRole('button', { name: 'Customize' })).toBeVisible();
      await expect.element(page.getByRole('button', { name: 'Projected filters' })).toBeVisible();
      await expect
        .element(page.getByRole('button', { name: 'Default filters' }))
        .not.toBeInTheDocument();

      await page.getByRole('button', { name: 'Customize' }).click();

      expect(host.dashboard().editable()).toBe(true);
      expect(projectedGrid.editable()).toBe(true);
      await expect.element(page.getByRole('button', { name: 'Insert widget' })).toBeVisible();
      await expect.element(page.getByRole('button', { name: 'Projected action' })).toBeVisible();
      await expect
        .element(page.getByRole('button', { name: 'Default action' }))
        .not.toBeInTheDocument();
      await expect
        .element(page.getByRole('button', { name: 'Projected filters' }))
        .not.toBeInTheDocument();
    });

    it('tracks dashboard edit state and cancels without consumer wiring', async () => {
      host.dashboard().editable.set(true);
      await hostFixture.whenStable();
      await expect.element(page.getByRole('button', { name: 'Discard' })).toBeVisible();

      await page.getByRole('button', { name: 'Discard' }).click();

      expect(host.dashboard().editable()).toBe(false);
      expect(projectedGrid.editable()).toBe(false);
      await expect.element(page.getByRole('button', { name: 'Projected filters' })).toBeVisible();
    });

    it('handles save enablement, loading and automatic saving with additive notifications', async () => {
      const save = vi.spyOn(projectedGrid, 'save').mockImplementation(() => {});
      const modified = vi.fn();
      host.dashboard().isModified.subscribe(modified);
      host.dashboard().editable.set(true);
      await hostFixture.whenStable();
      const apply = page.getByRole('button', { name: 'Apply' });
      await expect.element(apply).toBeDisabled();

      projectedGrid.isModified.emit(true);
      await hostFixture.whenStable();
      await expect.element(apply).toBeEnabled();

      projectedGrid.isLoading.next(true);
      await hostFixture.whenStable();
      await expect.element(apply).toBeDisabled();
      await expect.element(page.getByRole('button', { name: 'Discard' })).toBeDisabled();

      projectedGrid.isLoading.next(false);
      await hostFixture.whenStable();
      await apply.click();

      expect(save).toHaveBeenCalledExactlyOnceWith();
      expect(host.saveRequested).toHaveBeenCalledOnce();
      expect(modified).toHaveBeenCalledExactlyOnceWith(true);
      expect(host.dashboard().editable()).toBe(true);
    });

    it('hides during the widget catalog and restores when it closes', async () => {
      await page.getByRole('button', { name: 'Customize' }).click();
      await page.getByRole('button', { name: 'Insert widget' }).click();

      const element: HTMLElement = hostFixture.nativeElement;
      expect(element.querySelector('si-dashboard-toolbar')).toHaveClass('d-none');
      expect(pageHeadings(element)).toEqual(['Add widget']);

      hostFixture.debugElement
        .query(By.directive(SiWidgetCatalogMockComponent))
        .componentInstance.closed.emit(undefined);
      await hostFixture.whenStable();

      expect(element.querySelector('si-dashboard-toolbar')).not.toHaveClass('d-none');
      await expect.element(page.getByRole('button', { name: 'Insert widget' })).toBeVisible();
    });

    it('hides during widget editing and restores when the editor closes', async () => {
      projectedGrid.widgetInstanceEdit.emit(TEST_WIDGET_CONFIG_0);
      await hostFixture.whenStable();
      const element: HTMLElement = hostFixture.nativeElement;
      expect(element.querySelector('si-dashboard-toolbar')).toHaveClass('d-none');

      hostFixture.debugElement
        .query(By.directive(SiWidgetInstanceEditorDialogComponent))
        .componentInstance.closed.emit(undefined);
      await hostFixture.whenStable();

      expect(element.querySelector('si-dashboard-toolbar')).not.toHaveClass('d-none');
      await expect.element(page.getByRole('button', { name: 'Customize' })).toBeVisible();
    });

    it('hides the built-in Add action using the projected toolbar input', async () => {
      host.hideAdd.set(true);
      host.dashboard().editable.set(true);
      await hostFixture.whenStable();

      await expect
        .element(page.getByRole('button', { name: 'Insert widget' }))
        .not.toBeInTheDocument();
      await expect.element(page.getByRole('button', { name: 'Projected action' })).toBeVisible();
    });

    it('resets editing when the dashboard ID changes', async () => {
      host.dashboard().editable.set(true);
      await hostFixture.whenStable();

      host.dashboardId.set('another-dashboard');
      await hostFixture.whenStable();

      expect(host.dashboard().editable()).toBe(false);
      await expect.element(page.getByRole('button', { name: 'Customize' })).toBeVisible();
    });
  });

  describe('with a projected toolbar and real grid persistence', () => {
    let hostFixture: ComponentFixture<ProjectedToolbarHostComponent>;
    let host: ProjectedToolbarHostComponent;
    let saveResult: Subject<WidgetConfig[]>;
    let save: ReturnType<typeof vi.fn<SiWidgetStorage['save']>>;

    beforeEach(async () => {
      saveResult = new Subject<WidgetConfig[]>();
      save = vi.fn(() => saveResult);
      TestBed.configureTestingModule({
        providers: [
          { provide: SI_DASHBOARD_CONFIGURATION, useValue: {} },
          {
            provide: SI_WIDGET_STORE,
            useValue: {
              load: () => of([{ ...TEST_WIDGET_CONFIG_0 }]),
              save
            } satisfies SiWidgetStorage
          }
        ]
      }).overrideComponent(SiFlexibleDashboardComponent, {
        remove: { imports: [GridComponent] },
        add: { imports: [SiGridComponent] }
      });
      hostFixture = TestBed.createComponent(ProjectedToolbarHostComponent);
      host = hostFixture.componentInstance;
      hostFixture.detectChanges();
      await hostFixture.whenStable();
      host.dashboard().editable.set(true);
      await hostFixture.whenStable();
      const dashboardGrid = host.dashboard().grid();
      dashboardGrid.updateWidgetInstance({ ...TEST_WIDGET_CONFIG_0, heading: 'Updated heading' });
      await hostFixture.whenStable();
    });

    it('stays editable while saving and exits edit mode only after success', async () => {
      await expect.element(page.getByRole('button', { name: 'Apply' })).toBeEnabled();
      await page.getByRole('button', { name: 'Apply' }).click();

      expect(save).toHaveBeenCalledOnce();
      expect(host.saveRequested).toHaveBeenCalledOnce();
      expect(host.dashboard().editable()).toBe(true);
      await expect.element(page.getByRole('button', { name: 'Apply' })).toBeDisabled();

      saveResult.next([{ ...TEST_WIDGET_CONFIG_0, heading: 'Updated heading' }]);
      await hostFixture.whenStable();

      expect(host.dashboard().editable()).toBe(false);
      await expect.element(page.getByRole('button', { name: 'Customize' })).toBeVisible();
    });

    it('keeps unsaved changes and enables retry after a save failure', async () => {
      const error = new Error('Storage unavailable');
      const logError = vi.spyOn(console, 'error').mockImplementation(() => {});
      await expect.element(page.getByRole('button', { name: 'Apply' })).toBeEnabled();
      await page.getByRole('button', { name: 'Apply' }).click();

      saveResult.error(error);
      await hostFixture.whenStable();

      expect(logError).toHaveBeenCalledWith('Saving dashboard configuration failed.', error);
      expect(host.dashboard().editable()).toBe(true);
      expect(host.dashboard().grid().visibleWidgetInstances$.value).toMatchObject([
        { heading: 'Updated heading' }
      ]);
      await expect.element(page.getByRole('button', { name: 'Apply' })).toBeEnabled();
    });

    it('restores persisted widgets when cancelling', async () => {
      await expect.element(page.getByRole('button', { name: 'Apply' })).toBeEnabled();
      await page.getByRole('button', { name: 'Discard' }).click();

      expect(host.dashboard().editable()).toBe(false);
      expect(host.dashboard().grid().visibleWidgetInstances$.value).toEqual([TEST_WIDGET_CONFIG_0]);
      expect(save).not.toHaveBeenCalled();
    });
  });
});
