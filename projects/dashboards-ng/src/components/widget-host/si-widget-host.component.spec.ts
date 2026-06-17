/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA, WritableSignal, inputBinding, signal } from '@angular/core';
import { outputToObservable } from '@angular/core/rxjs-interop';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { WidgetComponentFactory } from '@siemens/dashboards-ng';
import {
  DeleteConfirmationDialogResult,
  SiActionDialogService
} from '@siemens/element-ng/action-modal';
import { MenuItemAction } from '@siemens/element-ng/menu';
import { GridItemHTMLElement } from 'gridstack';
import { firstValueFrom, Observable, Subject } from 'rxjs';
import { page, userEvent } from 'vitest/browser';

import {
  TEST_WIDGET,
  TEST_WIDGET_CONFIG_0,
  TEST_WIDGET_STANDALONE
} from '../../../test/test-widget/test-widget';
import { TestingModule } from '../../../test/testing.module';
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
      let componentFactory: WritableSignal<WidgetComponentFactory | undefined>;

      beforeEach(async () => {
        await TestBed.configureTestingModule({
          imports: [BrowserModule, CommonModule, TestingModule, SiWidgetHostComponent],
          providers: [{ provide: SiActionDialogService, useClass: SiActionDialogMockService }],
          schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        componentFactory = signal(widget.componentFactory);
        fixture = TestBed.createComponent(SiWidgetHostComponent, {
          bindings: [
            inputBinding('componentFactory', componentFactory),
            inputBinding('widgetConfig', () => TEST_WIDGET_CONFIG_0)
          ]
        });
        component = fixture.componentInstance;
        actionDialogService = TestBed.inject(
          SiActionDialogService
        ) as unknown as SiActionDialogMockService;
      });

      it('should create', () => {
        expect(component).toBeTruthy();
      });

      it('should instantiate and attach widget instance', async () => {
        fixture.detectChanges();
        vi.useFakeTimers();
        vi.advanceTimersByTime(0);
        await fixture.whenStable();
        expect(component.widgetHost()).toHaveLength(1);
        vi.useRealTimers();
      });

      it('should not create widget instance without widget', async () => {
        componentFactory.set(undefined);
        vi.useFakeTimers();
        vi.advanceTimersByTime(0);
        await fixture.whenStable();
        expect(component.widgetHost()).toHaveLength(0);
        vi.useRealTimers();
      });

      it('#onEdit() should emit #widgetConfig', async () => {
        fixture.detectChanges();

        const editPromise = firstValueFrom(outputToObservable(component.edit));
        component.onEdit();
        const emittedConfig = await editPromise;
        expect(emittedConfig).toEqual(TEST_WIDGET_CONFIG_0);
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

      it('#onRemove() should restore card and emit widget config id', async () => {
        fixture.detectChanges();
        component.card().expand();
        const spy = vi.spyOn(component.card(), 'restore');

        const removePromise = firstValueFrom(outputToObservable(component.remove));

        component.onRemove();
        actionDialogService.result.next('delete');

        const emittedId = await removePromise;
        expect(emittedId).toEqual(TEST_WIDGET_CONFIG_0.id);
        expect(spy).toHaveBeenCalled();
      });

      describe('#setupEditable()', () => {
        beforeEach(async () => {
          // The widget host is `display: flex` and normally sized by gridstack. Without a grid
          // placing the widget, the card collapses to its intrinsic content width, leaving the
          // content action bar too narrow for the `siAutoCollapsableList` to reveal any button.
          // Give the host an explicit width to mirror a real grid cell so the buttons can render.
          fixture.nativeElement.style.width = '600px';
          await fixture.whenStable();
        });

        it('#editAction should call onEdit', async () => {
          component.setupEditable(true);
          await fixture.whenStable();
          const spy = vi.spyOn(component, 'onEdit');
          const actionBar = fixture.nativeElement.querySelector('si-content-action-bar');
          expect(actionBar).toBeInTheDocument();
          const editButton = page.getByRole('menuitem', { name: 'Edit' });
          await expect.element(editButton).toBeVisible();
          await userEvent.click(editButton);
          expect(spy).toHaveBeenCalled();
        });

        it('should setup default edit actions with widgets edit actions', async () => {
          await fixture.whenStable();
          let actionBar = fixture.nativeElement.querySelector('si-content-action-bar');
          expect(actionBar).not.toBeInTheDocument();
          component.setupEditable(true);
          await fixture.whenStable();
          actionBar = fixture.nativeElement.querySelector('si-content-action-bar');
          expect(actionBar).toBeInTheDocument();
          await expect.element(page.getByRole('menuitem', { name: 'Hello User' })).toBeVisible();
          await expect.element(page.getByRole('menuitem', { name: 'Edit' })).toBeVisible();
          await expect.element(page.getByRole('menuitem', { name: 'Remove' })).toBeVisible();
          expect(component.widgetInstance!.editable).toBe(true);
        });

        it('should setup default edit actions without widgets edit actions', async () => {
          await fixture.whenStable();
          component.widgetInstance!.primaryEditActions = undefined;
          let actionBar = fixture.nativeElement.querySelector('si-content-action-bar');
          expect(actionBar).not.toBeInTheDocument();

          component.setupEditable(true);
          await fixture.whenStable();
          actionBar = fixture.nativeElement.querySelector('si-content-action-bar');
          expect(actionBar).toBeInTheDocument();
          await expect.element(page.getByRole('menuitem', { name: 'Edit' })).toBeVisible();
          await expect.element(page.getByRole('menuitem', { name: 'Remove' })).toBeVisible();
          expect(component.widgetInstance!.editable).toBe(true);
        });
      });
    });
  });

  describe('keyboard a11y interaction', () => {
    let component: SiWidgetHostComponent;
    let fixture: ComponentFixture<SiWidgetHostComponent>;
    let hostEl: HTMLElement;
    let cardEl: HTMLElement;
    let mockGrid: {
      update: ReturnType<typeof vi.fn>;
      getColumn: ReturnType<typeof vi.fn>;
      getRow: ReturnType<typeof vi.fn>;
    };
    let mockNode: any;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [BrowserModule, CommonModule, TestingModule, SiWidgetHostComponent],
        providers: [{ provide: SiActionDialogService, useClass: SiActionDialogMockService }],
        schemas: [NO_ERRORS_SCHEMA]
      }).compileComponents();
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(SiWidgetHostComponent);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('componentFactory', TEST_WIDGET.componentFactory);
      fixture.componentRef.setInput('widgetConfig', { ...TEST_WIDGET_CONFIG_0, heading: 'Test' });
      fixture.componentRef.setInput('editable', true);
      fixture.detectChanges();

      hostEl = fixture.nativeElement;
      cardEl = hostEl.querySelector('si-dashboard-card')!;
      // Set gridstack attributes simulating a placed widget
      hostEl.setAttribute('gs-x', '2');
      hostEl.setAttribute('gs-y', '1');
      hostEl.setAttribute('gs-w', '4');
      hostEl.setAttribute('gs-h', '3');

      // Mock gridstackNode on the element
      mockNode = { x: 2, y: 1, w: 4, h: 3, grid: null };
      mockGrid = {
        update: vi.fn().mockImplementation((_el: unknown, opts: unknown) => {
          Object.assign(mockNode, opts);
        }),
        getColumn: vi.fn().mockReturnValue(12),
        getRow: vi.fn().mockReturnValue(100)
      };
      mockNode.grid = mockGrid;
      (hostEl as GridItemHTMLElement).gridstackNode = mockNode;
    });

    it('should set tabindex on card when editable', () => {
      expect(cardEl.getAttribute('tabindex')).toBe('0');
    });

    it('should not set tabindex on card when not editable', () => {
      fixture.componentRef.setInput('editable', false);
      fixture.detectChanges();
      expect(cardEl.getAttribute('tabindex')).toBeNull();
    });

    it('should activate keyboard mode on Enter', () => {
      cardEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      expect(component.keyboardActive()).toBe(true);
    });

    it('should activate keyboard mode on Space', () => {
      cardEl.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
      expect(component.keyboardActive()).toBe(true);
    });

    it('should deactivate keyboard mode on Enter/Space when active', () => {
      component.keyboardActive.set(true);
      cardEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      expect(component.keyboardActive()).toBe(false);
    });

    it('should deactivate keyboard mode on Escape', () => {
      component.keyboardActive.set(true);
      cardEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(component.keyboardActive()).toBe(false);
    });

    it('should not handle arrows when not active', () => {
      cardEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      expect(mockGrid.update).not.toHaveBeenCalled();
    });

    describe('move with arrows', () => {
      beforeEach(() => {
        component.keyboardActive.set(true);
      });

      it('should move right', () => {
        cardEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
        expect(mockGrid.update).toHaveBeenCalledWith(hostEl, { x: 3, y: 1 });
      });

      it('should move left', () => {
        cardEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
        expect(mockGrid.update).toHaveBeenCalledWith(hostEl, { x: 1, y: 1 });
      });

      it('should not move left past 0', () => {
        mockNode.x = 0;
        cardEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
        expect(mockGrid.update).not.toHaveBeenCalled();
      });

      it('should move down', () => {
        cardEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        expect(mockGrid.update).toHaveBeenCalledWith(hostEl, { x: 2, y: 2 });
      });

      it('should move up', () => {
        cardEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
        expect(mockGrid.update).toHaveBeenCalledWith(hostEl, { x: 2, y: 0 });
      });

      it('should not move up past 0', () => {
        mockNode.y = 0;
        cardEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
        expect(mockGrid.update).not.toHaveBeenCalled();
      });
    });

    describe('resize with shift+arrows', () => {
      beforeEach(() => {
        component.keyboardActive.set(true);
      });

      it('should increase width with Shift+ArrowRight', () => {
        cardEl.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'ArrowRight', shiftKey: true, bubbles: true })
        );
        expect(mockGrid.update).toHaveBeenCalledWith(hostEl, { w: 5, h: 3 });
      });

      it('should decrease width with Shift+ArrowLeft', () => {
        cardEl.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'ArrowLeft', shiftKey: true, bubbles: true })
        );
        expect(mockGrid.update).toHaveBeenCalledWith(hostEl, { w: 3, h: 3 });
      });

      it('should not decrease width below 1', () => {
        mockNode.w = 1;
        cardEl.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'ArrowLeft', shiftKey: true, bubbles: true })
        );
        expect(mockGrid.update).not.toHaveBeenCalled();
      });

      it('should increase height with Shift+ArrowDown', () => {
        cardEl.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'ArrowDown', shiftKey: true, bubbles: true })
        );
        expect(mockGrid.update).toHaveBeenCalledWith(hostEl, { w: 4, h: 4 });
      });

      it('should decrease height with Shift+ArrowUp', () => {
        cardEl.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'ArrowUp', shiftKey: true, bubbles: true })
        );
        expect(mockGrid.update).toHaveBeenCalledWith(hostEl, { w: 4, h: 2 });
      });

      it('should not decrease height below 1', () => {
        mockNode.h = 1;
        cardEl.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'ArrowUp', shiftKey: true, bubbles: true })
        );
        expect(mockGrid.update).not.toHaveBeenCalled();
      });
    });

    describe('screen reader announcements', () => {
      let liveAnnouncer: LiveAnnouncer;

      beforeEach(() => {
        liveAnnouncer = TestBed.inject(LiveAnnouncer);
        vi.spyOn(liveAnnouncer, 'announce');
      });

      it('should announce activation', () => {
        cardEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        expect(liveAnnouncer.announce).toHaveBeenCalledWith(
          expect.stringContaining('activated'),
          'assertive'
        );
      });

      it('should announce deactivation on Escape', () => {
        component.keyboardActive.set(true);
        cardEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        expect(liveAnnouncer.announce).toHaveBeenCalledWith(
          expect.stringContaining('deactivated'),
          'assertive'
        );
      });
    });

    it('should deactivate keyboard mode when editable is set to false', () => {
      component.keyboardActive.set(true);
      component.setupEditable(false);
      expect(component.keyboardActive()).toBe(false);
    });
  });
});
