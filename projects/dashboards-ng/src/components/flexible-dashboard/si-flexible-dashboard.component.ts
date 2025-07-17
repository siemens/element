/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { AsyncPipe } from '@angular/common';
import {
  Component,
  computed,
  inject,
  input,
  model,
  OnChanges,
  OnDestroy,
  OnInit,
  output,
  OutputRefSubscription,
  signal,
  SimpleChanges,
  Type,
  viewChild,
  ViewContainerRef
} from '@angular/core';
import { MenuItem } from '@siemens/element-ng/common';
import { SiDashboardComponent } from '@siemens/element-ng/dashboard';
import { BehaviorSubject, combineLatest, of, Subject, Subscription } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { Config, SI_DASHBOARD_CONFIGURATION } from '../../model/configuration';
import { DashboardToolbarItem } from '../../model/si-dashboard-toolbar.model';
import { SI_WIDGET_STORE } from '../../model/si-widget-storage';
import { Widget, WidgetConfig } from '../../model/widgets.model';
import { SiDashboardToolbarComponent } from '../dashboard-toolbar/si-dashboard-toolbar.component';
import { SiGridComponent } from '../grid/si-grid.component';
import { SiWidgetCatalogComponent } from '../widget-catalog/si-widget-catalog.component';
import { SiWidgetInstanceEditorDialogComponent } from '../widget-instance-editor-dialog/si-widget-instance-editor-dialog.component';

/**
 * Dashboard has three state: displaying the *dashboard* (default),
 * showing the *catalog* to add a new widget, or showing an *editor*
 * to edit an existing widget.
 */
type ViewState = 'dashboard' | 'catalog' | 'editor';

/**
 * The component implements a dashboard with adding, removing and resizing widgets.
 * It consists and connects a toolbar, a grid with widgets, and a widget catalog.
 */
@Component({
  selector: 'si-flexible-dashboard',
  imports: [SiDashboardComponent, SiDashboardToolbarComponent, SiGridComponent, AsyncPipe],
  templateUrl: './si-flexible-dashboard.component.html',
  styleUrl: './si-flexible-dashboard.component.scss'
})
export class SiFlexibleDashboardComponent implements OnInit, OnChanges, OnDestroy {
  /**
   * Input to change the dashboard editable state.
   *
   * @defaultValue false
   */
  readonly editable = model(false);

  /**
   * Heading for the dashboard.
   */
  readonly heading = input<string>();

  /**
   * Optionally, provide a custom subclass of the SiWidgetCatalogComponent
   * to use your own catalog component.
   */
  readonly widgetCatalogComponent = input<Type<SiWidgetCatalogComponent>>();

  /**
   * Optionally, provide a custom subclass of the {@link SiWidgetInstanceEditorDialogComponent}
   * to use your own implementation.
   */
  readonly widgetInstanceEditorDialogComponent =
    input<Type<SiWidgetInstanceEditorDialogComponent>>();

  /**
   * Optionally, but it is recommended to include an id for a dashboard.
   * The id is utilized in the persistence calls on the {@link SiWidgetStorage}.
   */
  readonly dashboardId = input<string>();

  /**
   * Sets the available widgets for the widget catalog to the dashboard.
   *
   * @defaultValue [] */
  readonly widgetCatalog = input<Widget[]>([]);

  /**
   * Option to remove the add widget instance button from the primary toolbar.
   *
   * @defaultValue false
   */
  readonly hideAddWidgetInstanceButton = input(false);

  /**
   * Option to hide the dashboard edit button.
   *
   * @defaultValue false
   */
  readonly hideEditButton = input(false);

  /**
   *  Option to display the edit button as a text button instead, only if the window is larger than xs {@link SiResponsiveContainerDirective}.
   *
   * @defaultValue false
   */
  readonly showEditButtonLabel = input(false);

  /**
   * Option to turn off the loading spinner on save and load operations.
   *
   * @defaultValue false
   */
  readonly hideProgressIndicator = input(false);

  /**
   * Option to configure a dashboard instance. Default is the optional value from
   * the {@link SI_DASHBOARD_CONFIGURATION}.
   *
   * @defaultValue inject(SI_DASHBOARD_CONFIGURATION)
   */
  readonly config = input<Config | undefined>(inject(SI_DASHBOARD_CONFIGURATION));

  /**
   * Placeholder text for the search input field in the widget catalog.
   *
   * @defaultValue
   * ```
   * $localize`:@@DASHBOARD.WIDGET_LIBRARY.SEARCH_PLACEHOLDER:Search widget`
   * ```
   */
  readonly searchPlaceholder = input(
    $localize`:@@DASHBOARD.WIDGET_LIBRARY.SEARCH_PLACEHOLDER:Search widget`
  );

  /**
   * The grid component is the actual container for the widgets.
   */
  readonly grid = viewChild.required<SiGridComponent>('grid');

  /** Property to access the dashboard component instance.
   */
  readonly dashboard = viewChild.required<SiDashboardComponent>('dashboard');

  /** The view child holds the container that hosts the widget catalog.
   */
  protected readonly catalogHost = viewChild.required('catalogHost', { read: ViewContainerRef });

  /**
   * Emits the modification state of the grid. It is `unmodified` when the visible state
   * is equal to the loaded state from the widget storage. When the user modifies the dashboard by
   * e.g. while moving the widgets, the dashboard is marked as `modified` and emits `true` and when the user
   * persists the change by saving, or reverts the state by canceling, the state is `unmodified`
   * again and emits `false`.
   */
  readonly isModified = output<boolean>();

  protected labelAddWidget = $localize`:@@DASHBOARD.ADD_WIDGET:Add widget`;
  protected labelEditor = $localize`:@@DASHBOARD.WIDGET_EDITOR_DIALOG.TITLE:Edit`;
  protected labelCatalog = $localize`:@@DASHBOARD.WIDGET_LIBRARY.TITLE:Add widget`;

  protected addWidgetInstanceAction: DashboardToolbarItem = {
    type: 'action',
    label: this.labelAddWidget,
    action: () => this.showWidgetCatalog()
  };

  /**
   * The primary action menu items shown in the edit mode of the dashboard.
   */
  readonly primaryEditActions$ = new BehaviorSubject<(MenuItem | DashboardToolbarItem)[]>([
    this.addWidgetInstanceAction
  ]);
  /**
   * The secondary action menu items shown in the edit mode of the dashboard. When all menu items are more than
   * three, they will be places in the secondary menu of the content action bar.
   */
  readonly secondaryEditActions$ = new BehaviorSubject<(MenuItem | DashboardToolbarItem)[]>([]);

  /**
   * @returns True, if the dashboard shows its widgets and not a catalog or and editor.
   */
  readonly isDashboardVisible = computed(() => this.viewState() === 'dashboard');

  /**
   * The page title of the dashboard, which is either {@link SiFlexibleDashboardComponent.heading} for the
   * default widget view or `DASHBOARD.WIDGET_EDITOR_DIALOG.TITLE` or 'DASHBOARD.WIDGET_LIBRARY.TITLE' when
   * adding new or editing widgets.
   */
  readonly pageTitle = computed(() => {
    const viewState = this.viewState();
    switch (viewState) {
      case 'editor':
        return this.labelEditor;
      case 'catalog':
        return this.labelCatalog;
      default:
        return this.heading();
    }
  });

  private readonly viewState = signal<ViewState>('dashboard');
  private subscriptions: Subscription[] = [];
  private widgetStorage = inject(SI_WIDGET_STORE);
  private hideAddWidgetInstanceButton$ = new BehaviorSubject(this.hideAddWidgetInstanceButton());
  private dashboardId$ = new Subject<string | undefined>();
  private outputRefSubscription: OutputRefSubscription[] = [];
  private readonly toolbar = viewChild.required<SiDashboardToolbarComponent>('toolbar');

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.dashboardId) {
      const dashboard = this.dashboard();
      if (dashboard.isExpanded) {
        dashboard.restore();
      }
      if (this.editable()) {
        this.grid().cancel();
        this.viewState.set('dashboard');
        this.catalogHost().clear();
      }
      this.dashboardId$.next(changes.dashboardId.currentValue);
      this.setupMenuItems();
    }

    if (changes.editable) {
      if (changes.editable.currentValue) {
        this.grid().edit();
      } else {
        this.grid().cancel();
      }
    }
    if (changes.hideAddWidgetInstanceButton) {
      this.hideAddWidgetInstanceButton$.next(changes.hideAddWidgetInstanceButton.currentValue);
    }
  }

  ngOnInit(): void {
    this.setupMenuItems();

    const grid = this.grid();
    this.outputRefSubscription.push(
      grid.widgetInstanceEdit.subscribe(widgetConfig => {
        this.editWidgetInstance(widgetConfig);
      })
    );
    this.outputRefSubscription.push(
      grid.editable.subscribe(editable => {
        this.editable.set(editable);
      })
    );
  }

  ngOnDestroy(): void {
    this.dashboardId$.next(undefined);
    this.subscriptions?.forEach(sub => sub.unsubscribe());
    this.outputRefSubscription?.forEach(sub => sub.unsubscribe());
  }

  /**
   * Shows the widget catalog of the dashboard. If a widget instance is expanded
   * it restores the widget instances before.
   */
  showWidgetCatalog(): void {
    const dashboard = this.dashboard();
    if (dashboard.isExpanded) {
      dashboard.restore();
    }
    if (!this.editable()) {
      this.grid().edit();
    }
    this.viewState.set('catalog');
    const componentType = this.widgetCatalogComponent() ?? SiWidgetCatalogComponent;
    const catalogRef = this.catalogHost().createComponent<SiWidgetCatalogComponent>(componentType);
    catalogRef.setInput('searchPlaceholder', this.searchPlaceholder());
    catalogRef.instance.widgetCatalog = this.widgetCatalog();

    const subscription = catalogRef.instance.closed.subscribe(widgetConfig => {
      subscription.unsubscribe();
      this.viewState.set('dashboard');
      this.catalogHost().clear();
      if (widgetConfig) {
        this.grid().addWidgetInstance(widgetConfig);
      }
    });
  }

  protected onModified(event: boolean): void {
    this.isModified.emit(event);
    this.toolbar().disableSaveButton.set(!event);
  }

  private setupMenuItems(): void {
    const primaryMenuItems = this.widgetStorage.getToolbarMenuItems
      ? this.widgetStorage.getToolbarMenuItems(this.dashboardId()).primary
      : of([]);
    combineLatest([primaryMenuItems, this.hideAddWidgetInstanceButton$])
      .pipe(takeUntil(this.dashboardId$))
      .subscribe(([items, hideAddButton]) => this.setupPrimaryMenuItems(items, hideAddButton));

    const secondaryMenuItems = this.widgetStorage.getToolbarMenuItems
      ? this.widgetStorage.getToolbarMenuItems(this.dashboardId()).secondary
      : undefined;

    if (secondaryMenuItems) {
      secondaryMenuItems
        .pipe(
          takeUntil(this.dashboardId$),
          map(items => items.map(item => this.proxyMenuItemAction(item)))
        )
        .subscribe(items => this.secondaryEditActions$.next(items));
    }
  }

  private setupPrimaryMenuItems(
    items: (MenuItem | DashboardToolbarItem)[],
    hideAddWidgetInstanceButton: boolean
  ): void {
    const next: (MenuItem | DashboardToolbarItem)[] = hideAddWidgetInstanceButton
      ? []
      : [this.addWidgetInstanceAction];
    next.push(...items.map(item => this.proxyMenuItemAction(item)));
    this.primaryEditActions$.next(next);
  }

  private editWidgetInstance(widgetConfig: WidgetConfig): void {
    const dashboard = this.dashboard();
    if (dashboard.isExpanded) {
      dashboard.restore();
    }
    const widget = this.getWidget(widgetConfig.widgetId);
    const widgetInstanceEditorDialogComponent = this.widgetInstanceEditorDialogComponent();
    const componentType =
      widgetInstanceEditorDialogComponent ?? SiWidgetInstanceEditorDialogComponent;

    this.viewState.set('editor');
    const catalogRef =
      this.catalogHost().createComponent<SiWidgetInstanceEditorDialogComponent>(componentType);
    catalogRef.setInput('widgetConfig', widgetConfig);
    catalogRef.setInput('widget', widget);
    const subscription = catalogRef.instance.closed.subscribe(editedWidgetConfig => {
      subscription.unsubscribe();
      this.viewState.set('dashboard');
      this.catalogHost().clear();
      if (editedWidgetConfig) {
        this.grid().updateWidgetInstance(editedWidgetConfig);
      }
    });
  }

  private proxyMenuItemAction(
    item: MenuItem | DashboardToolbarItem
  ): MenuItem | DashboardToolbarItem {
    if ('action' in item) {
      if (!item.action || item.action instanceof String) {
        return item;
      } else {
        const realAction = item.action as (param?: any) => void | any;
        item.action = () => {
          realAction(this.grid());
        };
      }
    }
    return item;
  }

  private getWidget(id: string): Widget | undefined {
    return this.widgetCatalog().find(widget => widget.id === id);
  }
}
