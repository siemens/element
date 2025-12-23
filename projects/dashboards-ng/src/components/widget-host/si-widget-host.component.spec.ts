/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import {
  DeleteConfirmationDialogResult,
  SiActionDialogService
} from '@siemens/element-ng/action-modal';
import { MenuItem } from '@siemens/element-ng/common';
import { MenuItemAction } from '@siemens/element-ng/menu';
import { Observable, Subject } from 'rxjs';
import { vi } from 'vitest';

import {
  TEST_WIDGET,
  TEST_WIDGET_CONFIG_0,
  TEST_WIDGET_STANDALONE
} from '../../../test/test-widget/test-widget';
import { TestingModule } from '../../../test/testing.module';
import { SiGridService } from '../../services/si-grid.service';
import { SiWidgetHostComponent } from './si-widget-host.component';

class SiActionDialogMockService {
  result = new Subject<DeleteConfirmationDialogResult>();

  showActionDialog(args: any[]): Observable<DeleteConfirmationDialogResult> {
    return this.result;
  }
}

describe('SiWidgetHostComponent', () => {
  [
    { widget: TEST_WIDGET, name: 'TEST_WIDGET' },
    { widget: TEST_WIDGET_STANDALONE, name: 'TEST_WIDGET_STANDALONE' }
  ].forEach(({ widget, name }) => {
    describe(`with ${name}`, () => {
      let component: SiWidgetHostComponent;
      let fixture: ComponentFixture<SiWidgetHostComponent>;
      let actionDialogService: SiActionDialogMockService;
      let gridService: SiGridService;

      beforeEach(async () => {
        await TestBed.configureTestingModule({
          imports: [BrowserModule, CommonModule, TestingModule, SiWidgetHostComponent],
          providers: [
            { provide: SiActionDialogService, useClass: SiActionDialogMockService },
            SiGridService,
            provideZonelessChangeDetection()
          ],
          schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
      });

      beforeEach(() => {
        fixture = TestBed.createComponent(SiWidgetHostComponent);
        component = fixture.componentInstance;
        actionDialogService = TestBed.inject(
          SiActionDialogService
        ) as unknown as SiActionDialogMockService;
        gridService = TestBed.inject(SiGridService);
        gridService.widgetCatalog.set([TEST_WIDGET]);
        fixture.componentRef.setInput('widgetConfig', TEST_WIDGET_CONFIG_0);
      });

      it('should create', () => {
        expect(component).toBeTruthy();
      });

      it('should instantiate and attach widget instance', async () => {
        fixture.detectChanges();
        vi.useFakeTimers();
        vi.advanceTimersByTime(0);
        await fixture.whenStable();
        expect(component.widgetHost().length).toBe(1);
        vi.useRealTimers();
      });

      it('should not create widget instance without widget', async () => {
        gridService.widgetCatalog.set([]);
        vi.useFakeTimers();
        vi.advanceTimersByTime(0);
        await fixture.whenStable();
        expect(component.widgetHost().length).toBe(0);
        vi.useRealTimers();
      });

      it('#editAction should call onEdit', async () => {
        fixture.detectChanges();
        vi.useFakeTimers();
        vi.advanceTimersByTime(0);
        await fixture.whenStable();
        vi.useRealTimers();
        const spy = vi.spyOn(component, 'onEdit');
        ((component.editAction as MenuItemAction).action! as (param?: any) => void)();

        expect(spy).toHaveBeenCalled();
      });

      it('#onEdit() should emit #widgetConfig', /*(done: DoneFn)*/ async () => {
        fixture.detectChanges();

        component.edit.subscribe(emittedConfig => {
          expect(emittedConfig).toEqual(TEST_WIDGET_CONFIG_0);
          //done();
        });
        component.onEdit();
      });

      it('#removeAction should call onRemove', async () => {
        fixture.detectChanges();
        vi.useFakeTimers();
        vi.advanceTimersByTime(0);
        await fixture.whenStable();
        vi.useRealTimers();
        const spy = vi.spyOn(component, 'onRemove');
        ((component.removeAction as MenuItemAction).action! as (param?: any) => void)();

        expect(spy).toHaveBeenCalled();
      });

      it('#onRemove() should restore card and emit widget config id', /*(done: DoneFn)*/ async () => {
        fixture.detectChanges();
        component.card().expand();
        const spy = vi.spyOn(component.card(), 'restore');
        component.remove.subscribe(emittedId => {
          expect(emittedId).toEqual(TEST_WIDGET_CONFIG_0.id);
          expect(spy).toHaveBeenCalled();
          //done();
        });
        component.onRemove();
        actionDialogService.result.next('delete');
      });

      describe('#setupEditable()', () => {
        it('should setup default edit actions with widgets edit actions', async () => {
          vi.useFakeTimers();
          vi.advanceTimersByTime(0);
          await fixture.whenStable();
          expect(component.primaryActions.length).toBe(0);
          fixture.changeDetectorRef.markForCheck();
          fixture.detectChanges();
          component.setupEditable(true);
          expect(component.primaryActions.length).toBe(3);
          expect((component.primaryActions[0] as MenuItem).title).toBe('Hello User');
          expect(component.primaryActions[1]).toBe(component.editAction);
          expect(component.primaryActions[2]).toBe(component.removeAction);
          expect(component.widgetInstance!.editable).toBe(true);
          vi.useRealTimers();
        });

        it('should setup default edit actions without widgets edit actions', async () => {
          vi.useFakeTimers();
          vi.advanceTimersByTime(0);
          await fixture.whenStable();
          component.widgetInstance!.primaryEditActions = undefined;
          expect(component.primaryActions.length).toBe(0);

          component.setupEditable(true);
          expect(component.primaryActions.length).toBe(2);
          expect(component.primaryActions[0]).toBe(component.editAction);
          expect(component.primaryActions[1]).toBe(component.removeAction);
          expect(component.widgetInstance!.editable).toBe(true);
          vi.useRealTimers();
        });
      });
    });
  });
});
