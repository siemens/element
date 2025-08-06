/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  Component,
  input,
  Input,
  model,
  NO_ERRORS_SCHEMA,
  OnInit,
  output,
  OutputEmitterRef,
  SimpleChange,
  Type
} from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MenuItem } from '@spike-rabbit/element-ng/common';
import { SiLoadingSpinnerModule } from '@spike-rabbit/element-ng/loading-spinner';
import { Observable, of } from 'rxjs';

import { TestingModule } from '../../../test/testing.module';
import { SI_DASHBOARD_CONFIGURATION } from '../../model/configuration';
import { GridConfig } from '../../model/gridstack.model';
import { SI_WIDGET_STORE, SiDefaultWidgetStorage } from '../../model/si-widget-storage';
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
  template: ''
})
export class SiWidgetCatalogMockComponent extends SiWidgetCatalogComponent implements OnInit {
  static staticClosed: OutputEmitterRef<Omit<WidgetConfig, 'id'> | undefined> | undefined =
    undefined;

  override readonly closed = output<Omit<WidgetConfig, 'id'> | undefined>();

  override ngOnInit(): void {
    SiWidgetCatalogMockComponent.staticClosed ??= this.closed;
  }
}

@Component({
  selector: 'si-dashboard-toolbar',
  imports: [TestingModule, SiLoadingSpinnerModule],
  template: ''
})
export class SiDashboardToolbarStubComponent {
  @Input() primaryEditActions: MenuItem[] = [];
  @Input() secondaryEditActions: MenuItem[] = [];
  @Input() disableSaveButton = false;
  @Input() disabled = false;
  @Input() editable = false;
  @Input() hideEditButton = false;
  @Input() showEditButtonLabel = false;
}

@Component({
  selector: 'si-grid',
  imports: [TestingModule, SiLoadingSpinnerModule],
  template: ''
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
  readonly widgetInstanceEdit = output<WidgetConfig>();
  addWidgetInstance(item: Omit<WidgetConfig, 'id'>): void {
    widgetConfig = item;
  }
  edit(): void {}
  cancel(): void {}
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
          remove: { imports: [SiDashboardToolbarComponent, SiGridComponent] },
          add: { imports: [SiDashboardToolbarStubComponent, GridComponent] }
        })
        .compileComponents();
      fixture = TestBed.createComponent(SiFlexibleDashboardComponent);
      component = fixture.componentInstance;
      grid = component.grid();
      fixture.componentRef.setInput('heading', 'Heading');
      fixture.detectChanges();
    });

    it('should create with additional menu items with actions that can be invoked', (done: DoneFn) => {
      let count = 0;
      actionCounter = 0;
      expect(component).toBeTruthy();

      component.primaryEditActions$?.subscribe(menuItems => {
        expect(menuItems.length).toBe(2);
        const action = (menuItems[1] as MenuItem).action as () => void;
        action();
        expect(actionCounter).toBe(1);

        count++;
        if (count >= 2) {
          done();
        }
      });

      component.secondaryEditActions$?.subscribe(menuItems => {
        expect(menuItems.length).toBe(2);
        count++;
        if (count >= 2) {
          done();
        }
      });
    });

    it('#hideAddWidgetInstanceButton should remove the addWidgetInstanceAction action', () => {
      expect(component.primaryEditActions$.value.length).toBe(2);
      fixture.componentRef.setInput('hideAddWidgetInstanceButton', true);
      component.ngOnChanges({ hideAddWidgetInstanceButton: new SimpleChange(false, true, true) });
      expect(component.primaryEditActions$.value.length).toBe(1);
    });

    it('showWidgetCatalog() should show a widget catalog and add the widget config added to the grid', fakeAsync(() => {
      fixture.componentRef.setInput('widgetCatalogComponent', SiWidgetCatalogMockComponent);
      fixture.detectChanges();
      component.showWidgetCatalog();
      fixture.detectChanges();
      SiWidgetCatalogMockComponent.staticClosed?.emit({ widgetId: 'widgetId' });
      tick(200);
      expect(widgetConfig).toBeDefined();
      expect(widgetConfig.widgetId).toEqual('widgetId');
    }));

    it('addWidgetAction action shall call showWidgetCatalog()', () => {
      const spy = spyOn(component, 'showWidgetCatalog').and.callThrough();
      const action = (component.primaryEditActions$.value[0] as MenuItem).action as (
        param?: any
      ) => void;
      action();
      expect(spy).toHaveBeenCalled();
    });

    it('showWidgetCatalog() should restore the dashboard, if expanded', () => {
      fixture.componentRef.setInput('widgetCatalogComponent', SiWidgetCatalogMockComponent);
      const isExpandedSpy = spyOnProperty(
        component.dashboard(),
        'isExpanded',
        'get'
      ).and.returnValue(true);
      const restoreSpy = spyOn(component.dashboard(), 'restore');
      fixture.detectChanges();

      component.showWidgetCatalog();
      expect(isExpandedSpy).toHaveBeenCalled();
      expect(restoreSpy).toHaveBeenCalled();
    });

    it('should call #grid.edit() on changing editable input to true', () => {
      const spy = spyOn(grid, 'edit').and.callThrough();
      expect(component.editable()).toBeFalse();
      fixture.componentRef.setInput('editable', true);
      component.ngOnChanges({ editable: new SimpleChange(false, true, true) });
      expect(spy).toHaveBeenCalled();
    });

    it('should call #grid.cancel() on changing editable input to false', () => {
      expect(component.editable()).toBeFalse();
      grid.editable.set(true);
      expect(component.editable()).toBeTrue();
      const spy = spyOn(grid, 'cancel').and.callThrough();

      fixture.componentRef.setInput('editable', false);
      component.ngOnChanges({ editable: new SimpleChange(true, false, false) });
      expect(spy).toHaveBeenCalled();
    });

    it('should emit editableChange events on changing grid editable state', () => {
      grid.editable.set(true);
      expect(component.editable()).toBeTrue();
    });

    it('should restore the dashboard on dashboardId changes when dashboard is expanded', () => {
      const spy = spyOn(component.dashboard(), 'restore').and.callThrough();
      spyOnProperty(component.dashboard(), 'isExpanded', 'get').and.returnValue(true);

      fixture.componentRef.setInput('dashboardId', '1');
      component.ngOnChanges({ dashboardId: new SimpleChange(undefined, 1, true) });
      fixture.componentRef.setInput('dashboardId', undefined);
      component.ngOnChanges({ dashboardId: new SimpleChange(1, undefined, true) });

      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('should not restore the dashboard on dashboardId changes when dashboard is not expanded', () => {
      const spy = spyOn(component.dashboard(), 'restore').and.callThrough();

      fixture.componentRef.setInput('dashboardId', '1');
      component.ngOnChanges({ dashboardId: new SimpleChange(undefined, 1, true) });
      fixture.componentRef.setInput('dashboardId', undefined);
      component.ngOnChanges({ dashboardId: new SimpleChange(1, undefined, true) });

      expect(spy).toHaveBeenCalledTimes(0);
    });

    it('should cancel edit state on dashboardId changes', () => {
      const spy = spyOn(component.grid(), 'cancel').and.callThrough();
      fixture.componentRef.setInput('editable', true);

      fixture.componentRef.setInput('dashboardId', '1');
      component.ngOnChanges({ dashboardId: new SimpleChange(undefined, 1, true) });
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
