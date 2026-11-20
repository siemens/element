/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Binding, inputBinding, outputBinding, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { MenuItem } from '@siemens/element-ng/common';
import {
  provideMissingTranslationHandlerForElement,
  provideNgxTranslateForElement
} from '@siemens/element-translate-ng/ngx-translate';
import { BehaviorSubject, firstValueFrom, of, Subject } from 'rxjs';
import { page } from 'vitest/browser';

import { SI_DASHBOARD_TOOLBAR_ITEMS } from '../../model/configuration';
import { DashboardToolbarItem } from '../../model/si-dashboard-toolbar.model';
import { SI_WIDGET_STORE, SiWidgetStorage } from '../../model/si-widget-storage';
import { SiGridComponent } from '../grid/si-grid.component';
import {
  DashboardToolbarContext,
  SI_DASHBOARD_TOOLBAR_CONTEXT
} from './si-dashboard-toolbar-context';
import { SiDashboardToolbarComponent } from './si-dashboard-toolbar.component';

describe('SiDashboardToolbarComponent', () => {
  let fixture: ComponentFixture<SiDashboardToolbarComponent>;
  let grid: SiGridComponent;
  const editable = signal(false);
  const modified = signal(false);
  const dashboardId = signal<string | undefined>(undefined);
  const toolbar = signal<SiDashboardToolbarComponent | undefined>(undefined);
  let dashboard: DashboardToolbarContext;
  let primaryStorageActions: BehaviorSubject<(MenuItem | DashboardToolbarItem)[]>;
  let secondaryStorageActions: BehaviorSubject<(MenuItem | DashboardToolbarItem)[]>;
  let globalActions: { primary: DashboardToolbarItem[]; secondary: DashboardToolbarItem[] };
  let getToolbarMenuItems: ReturnType<
    typeof vi.fn<NonNullable<SiWidgetStorage['getToolbarMenuItems']>>
  >;

  const renderToolbar = async (bindings: Binding[] = []): Promise<void> => {
    grid = TestBed.createComponent(SiGridComponent).componentInstance;
    dashboard = {
      dashboardId,
      grid: signal(grid),
      editable,
      modified,
      isDashboardVisible: signal(true),
      toolbar,
      primaryEditActions$: new BehaviorSubject<(MenuItem | DashboardToolbarItem)[]>([]),
      secondaryEditActions$: new BehaviorSubject<(MenuItem | DashboardToolbarItem)[]>([]),
      edit: () => editable.set(true),
      cancel: () => editable.set(false),
      save: vi.fn(),
      addWidget: vi.fn()
    };
    fixture = TestBed.createComponent(SiDashboardToolbarComponent, { bindings });
    toolbar.set(fixture.componentInstance);
    fixture.detectChanges();
    await fixture.whenStable();
  };

  beforeEach(() => {
    editable.set(false);
    modified.set(false);
    dashboardId.set(undefined);
    toolbar.set(undefined);
    primaryStorageActions = new BehaviorSubject<(MenuItem | DashboardToolbarItem)[]>([]);
    secondaryStorageActions = new BehaviorSubject<(MenuItem | DashboardToolbarItem)[]>([]);
    globalActions = { primary: [], secondary: [] };
    getToolbarMenuItems = vi.fn(() => ({
      primary: primaryStorageActions,
      secondary: secondaryStorageActions
    }));
    TestBed.configureTestingModule({
      providers: [
        { provide: SI_DASHBOARD_TOOLBAR_CONTEXT, useFactory: () => dashboard },
        { provide: SI_DASHBOARD_TOOLBAR_ITEMS, useValue: globalActions },
        {
          provide: SI_WIDGET_STORE,
          useValue: {
            load: () => of([]),
            save: () => of([]),
            getToolbarMenuItems
          } satisfies SiWidgetStorage
        }
      ]
    });
  });

  it('switches the dashboard to edit mode without an editable input', async () => {
    await renderToolbar();

    await page.getByRole('button', { name: 'Edit', exact: true }).click();

    expect(editable()).toBe(true);
    await expect.element(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('cancels dashboard editing', async () => {
    editable.set(true);
    await renderToolbar();

    await page.getByRole('button', { name: 'Cancel' }).click();

    expect(editable()).toBe(false);
    await expect.element(page.getByRole('button', { name: 'Edit', exact: true })).toBeVisible();
  });

  it('saves automatically and emits a request without ending edit mode itself', async () => {
    editable.set(true);
    modified.set(true);
    const saveRequested = vi.fn();
    await renderToolbar([outputBinding('save', saveRequested)]);

    await page.getByRole('button', { name: 'Save' }).click();

    expect(dashboard.save).toHaveBeenCalledExactlyOnceWith();
    expect(saveRequested).toHaveBeenCalledExactlyOnceWith(undefined);
    expect(editable()).toBe(true);
  });

  it('follows dashboard modification state to enable and disable saving', async () => {
    editable.set(true);
    await renderToolbar();
    const save = page.getByRole('button', { name: 'Save' });
    await expect.element(save).toBeDisabled();

    modified.set(true);
    await fixture.whenStable();
    await expect.element(save).toBeEnabled();

    modified.set(false);
    await fixture.whenStable();
    await expect.element(save).toBeDisabled();
  });

  it('disables editing while the grid is loading', async () => {
    await renderToolbar();

    grid.isLoading.next(true);
    await fixture.whenStable();

    await expect.element(page.getByRole('button', { name: 'Edit', exact: true })).toBeDisabled();
  });

  it('disables all edit controls while the grid is loading', async () => {
    editable.set(true);
    modified.set(true);
    await renderToolbar();

    grid.isLoading.next(true);
    await fixture.whenStable();

    await expect.element(page.getByRole('button', { name: 'Add widget' })).toBeDisabled();
    await expect.element(page.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    await expect.element(page.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('hides the edit button when configured', async () => {
    await renderToolbar([inputBinding('hideEditButton', () => true)]);

    await expect
      .element(page.getByRole('button', { name: 'Edit', exact: true }))
      .not.toBeInTheDocument();
  });

  it('uses the consumer label for the edit button accessible name', async () => {
    await renderToolbar([inputBinding('editButtonLabel', () => 'Customize dashboard')]);

    await expect
      .element(page.getByRole('button', { name: 'Customize dashboard', exact: true }))
      .toBeVisible();
    await expect
      .element(page.getByRole('button', { name: 'Edit', exact: true }))
      .not.toBeInTheDocument();

    await page.getByRole('button', { name: 'Customize dashboard', exact: true }).hover();
    await expect.element(page.getByRole('tooltip')).toHaveTextContent('Customize dashboard');
  });

  it('uses the consumer label as visible edit button text when enabled', async () => {
    await renderToolbar([
      inputBinding('editButtonLabel', () => 'Customize dashboard'),
      inputBinding('showEditButtonLabel', () => true)
    ]);

    await expect
      .element(page.getByRole('button', { name: 'Customize dashboard', exact: true }))
      .toHaveTextContent('Customize dashboard');
  });

  it('combines consumer and global actions in order before using per-side storage fallback', async () => {
    editable.set(true);
    globalActions.primary = [{ type: 'action', label: 'Global action', action: vi.fn() }];
    secondaryStorageActions.next([{ title: 'Storage help' }]);
    await renderToolbar([
      inputBinding('hideAddWidgetInstanceButton', () => true),
      inputBinding('primaryEditActions', () => [
        { type: 'action', label: 'Local action', action: vi.fn() }
      ])
    ]);

    const element: HTMLElement = fixture.nativeElement;
    const buttons = Array.from(element.querySelectorAll('button')).map(button =>
      button.textContent?.trim()
    );
    expect(buttons).toEqual(['Local action', 'Global action', 'Storage help', 'Cancel', 'Save']);
    expect(getToolbarMenuItems).toHaveBeenCalledExactlyOnceWith(undefined);
  });

  it('does not request storage actions when both sides have configured actions', async () => {
    editable.set(true);
    globalActions.secondary = [{ type: 'action', label: 'Global help', action: vi.fn() }];
    await renderToolbar([
      inputBinding('primaryEditActions', () => [
        { type: 'action', label: 'Local action', action: vi.fn() }
      ])
    ]);

    expect(getToolbarMenuItems).not.toHaveBeenCalled();
    await expect.element(page.getByRole('button', { name: 'Local action' })).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Global help' })).toBeVisible();
  });

  it('renders primary storage actions without waiting for secondary storage actions', async () => {
    editable.set(true);
    const secondary = new Subject<(MenuItem | DashboardToolbarItem)[]>();
    getToolbarMenuItems.mockReturnValue({
      primary: of([{ title: 'Storage action' }]),
      secondary
    });
    await renderToolbar();

    await expect.element(page.getByRole('button', { name: 'Storage action' })).toBeVisible();
  });

  it('replaces storage subscriptions when the dashboard changes', async () => {
    editable.set(true);
    primaryStorageActions.next([{ title: 'First dashboard action' }]);
    const nextPrimary = new BehaviorSubject<(MenuItem | DashboardToolbarItem)[]>([
      { title: 'Next dashboard action' }
    ]);
    getToolbarMenuItems.mockImplementation(id => ({
      primary: id === 'next' ? nextPrimary : primaryStorageActions,
      secondary: secondaryStorageActions
    }));
    await renderToolbar();

    dashboardId.set('next');
    await fixture.whenStable();
    primaryStorageActions.next([{ title: 'Stale action' }]);
    await fixture.whenStable();

    await expect.element(page.getByRole('button', { name: 'Next dashboard action' })).toBeVisible();
    await expect
      .element(page.getByRole('button', { name: 'Stale action' }))
      .not.toBeInTheDocument();
    expect(primaryStorageActions.observed).toBe(false);

    fixture.destroy();
    expect(nextPrimary.observed).toBe(false);
    expect(secondaryStorageActions.observed).toBe(false);
  });

  it('updates configured actions without retaining the storage fallback', async () => {
    editable.set(true);
    primaryStorageActions.next([{ title: 'Storage action' }]);
    await renderToolbar();

    fixture.componentRef.setInput('primaryEditActions', [
      { type: 'action', label: 'Replacement action', action: vi.fn() }
    ]);
    await fixture.whenStable();

    await expect.element(page.getByRole('button', { name: 'Replacement action' })).toBeVisible();
    await expect
      .element(page.getByRole('button', { name: 'Storage action' }))
      .not.toBeInTheDocument();
    expect(primaryStorageActions.observed).toBe(false);
  });

  it('hides Add widget without discarding other actions or reloading storage', async () => {
    editable.set(true);
    primaryStorageActions.next([{ title: 'Storage action' }]);
    await renderToolbar();

    fixture.componentRef.setInput('hideAddWidgetInstanceButton', true);
    await fixture.whenStable();

    await expect.element(page.getByRole('button', { name: 'Add widget' })).not.toBeInTheDocument();
    await expect.element(page.getByRole('button', { name: 'Storage action' })).toBeVisible();
    expect(getToolbarMenuItems).toHaveBeenCalledOnce();
  });

  it('passes the grid to shared actions before and after switching to the action bar', async () => {
    editable.set(true);
    const action = vi.fn();
    const item: DashboardToolbarItem = Object.freeze({
      type: 'action',
      label: 'Inspect grid',
      action
    });
    const secondaryActions = signal<DashboardToolbarItem[]>([]);
    await renderToolbar([
      inputBinding('primaryEditActions', () => [item]),
      inputBinding('secondaryEditActions', secondaryActions)
    ]);

    await page.getByRole('button', { name: 'Inspect grid' }).click();
    expect(action).toHaveBeenCalledExactlyOnceWith(grid);

    secondaryActions.set([
      { type: 'action', label: 'Help', action: vi.fn() },
      { type: 'action', label: 'Reset', action: vi.fn() }
    ]);
    await fixture.whenStable();
    await page.getByRole('menuitem', { name: 'Inspect grid' }).click();

    expect(action).toHaveBeenCalledTimes(2);
    expect(action.mock.calls[1][0]).toBe(grid);
    expect(item.action).toBe(action);
  });

  it('translates all configurable labels and responds to locale changes', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideTranslateService({
          missingTranslationHandler: provideMissingTranslationHandlerForElement()
        }),
        provideNgxTranslateForElement()
      ]
    });
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', {
      EDIT: 'Customize',
      CANCEL: 'Discard',
      SAVE: 'Apply',
      ADD: 'Insert widget',
      TOGGLE: 'More actions'
    });
    translate.setTranslation('de', {
      EDIT: 'Anpassen',
      CANCEL: 'Verwerfen',
      SAVE: 'Anwenden',
      ADD: 'Widget einfügen',
      TOGGLE: 'Weitere Aktionen'
    });
    await firstValueFrom(translate.use('en'));
    const secondaryActions = signal<DashboardToolbarItem[]>([]);
    await renderToolbar([
      inputBinding('editButtonLabel', () => 'EDIT'),
      inputBinding('cancelButtonLabel', () => 'CANCEL'),
      inputBinding('saveButtonLabel', () => 'SAVE'),
      inputBinding('addWidgetButtonLabel', () => 'ADD'),
      inputBinding('toggleItemLabel', () => 'TOGGLE'),
      inputBinding('secondaryEditActions', secondaryActions)
    ]);
    await expect.element(page.getByRole('button', { name: 'Customize' })).toBeVisible();

    editable.set(true);
    await fixture.whenStable();
    await expect.element(page.getByRole('button', { name: 'Discard' })).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Apply' })).toBeDisabled();
    await expect.element(page.getByRole('button', { name: 'Insert widget' })).toBeVisible();

    secondaryActions.set([
      { type: 'action', label: 'First action', action: vi.fn() },
      { type: 'action', label: 'Second action', action: vi.fn() },
      { type: 'action', label: 'Third action', action: vi.fn() }
    ]);
    await fixture.whenStable();
    await expect.element(page.getByRole('menuitem', { name: 'More actions' })).toBeVisible();

    await firstValueFrom(translate.use('de'));
    await fixture.whenStable();
    await expect.element(page.getByRole('menuitem', { name: 'Weitere Aktionen' })).toBeVisible();
    await expect.element(page.getByRole('menuitem', { name: 'Widget einfügen' })).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Verwerfen' })).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Anwenden' })).toBeDisabled();

    editable.set(false);
    await fixture.whenStable();
    await expect.element(page.getByRole('button', { name: 'Anpassen' })).toBeVisible();
  });
});
