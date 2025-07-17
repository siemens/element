/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { AsyncPipe } from '@angular/common';
import {
  Component,
  inject,
  input,
  model,
  OnChanges,
  OnDestroy,
  OnInit,
  output,
  SimpleChanges,
  Type,
  viewChild
} from '@angular/core';
import { SiLoadingService, SiLoadingSpinnerDirective } from '@siemens/element-ng/loading-spinner';
import { ModalOptions, SiModalService } from '@siemens/element-ng/modal';
import { BehaviorSubject, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import { SI_DASHBOARD_CONFIGURATION } from '../../model/configuration';
import { GridConfig } from '../../model/gridstack.model';
import { SI_WIDGET_STORE } from '../../model/si-widget-storage';
import { Widget, WidgetConfig } from '../../model/widgets.model';
import { SiGridService } from '../../services/si-grid.service';
import {
  GridWrapperEvent,
  SiGridstackWrapperComponent
} from '../gridstack-wrapper/si-gridstack-wrapper.component';
import { SiWidgetInstanceEditorDialogComponent } from '../widget-instance-editor-dialog/si-widget-instance-editor-dialog.component';

export const NEW_WIDGET_PREFIX = 'new-widget-';

let idCounter = 1;

/**
 * The grid component is the actual component on which the widget instances are placed and visualized. You can think of
 * a headless dashboard, without a title, toolbar or edit buttons.
 */
@Component({
  selector: 'si-grid',
  imports: [SiGridstackWrapperComponent, SiLoadingSpinnerDirective, AsyncPipe],
  templateUrl: './si-grid.component.html',
  styleUrl: './si-grid.component.scss',
  providers: [SiGridService, SiLoadingService]
})
export class SiGridComponent implements OnInit, OnChanges, OnDestroy {
  private storeSubscription?: Subscription;
  private gridService = inject(SiGridService);
  private modalService = inject(SiModalService);
  private widgetStorage = inject(SI_WIDGET_STORE);

  /**
   * Configuration options for a grid instance. Default is the optional
   * value from the {@link SI_DASHBOARD_CONFIGURATION}.
   *
   * @defaultValue inject(SI_DASHBOARD_CONFIGURATION)?.grid
   */
  readonly gridConfig = input<GridConfig | undefined>(inject(SI_DASHBOARD_CONFIGURATION)?.grid);

  /**
   * Sets the grid into editable mode, in which the widget instances can be moved,
   * resized, removed or new ones added.
   *
   * @defaultValue false
   */
  readonly editable = model(false);
  /**
   * This is the internal owner of the current editable state and is used to track if
   * editable or not. Not editable can be changed by either calling the `edit()` api
   * method or by setting the `editable` input. When setting the input, the `ngOnChanges(...)`
   * hook is used to call the `edit()` method. Similar, to get from editable to not editable,
   * `cancel()` or `save()` is used and can be triggered from `ngOnChanges(...)`.
   */
  private editableInternal = false;

  /**
   * An optional, but recommended dashboard id that is used in persistence and passed
   * to the widget store for saving and loading data.
   */
  readonly dashboardId = input<string>();

  /**
   * Provides the available widgets to the grid. When loading the widget configurations from
   * the storage, we need to have the widget definition available to be able to create the widget
   * instances on the grid.
   *
   * @defaultValue [] */
  readonly widgetCatalog = input<Widget[]>([]);

  /**
   * When the user clicks edit on a widget instance, an editor need to appear and the
   * widget editor component need to be loaded. When the grid is used standalone, it
   * takes care and opens a modal dialog and loads the configured widget editor component.
   * When the grid is used in a container like the flexible dashboard, the container manages
   * where the widget instance editor is displayed. In this case this options prevents the grid
   * from showing the editor in the dialog, and emits on `widgetInstanceEdit` on clicking the
   * widget `edit` action.
   *
   * @defaultValue false */
  readonly emitWidgetInstanceEditEvents = input(false);

  /**
   * Option to turn off the loading spinner on save and load operations.
   *
   * @defaultValue false
   */
  readonly hideProgressIndicator = input(false);

  /**
   * Option to configure a custom widget instance editor dialog component. The component provides the
   * editor hosting and the buttons to save and cancel.
   */
  readonly widgetInstanceEditorDialogComponent =
    input<Type<SiWidgetInstanceEditorDialogComponent>>();

  /**
   * Emits the modification state of the grid. It is `unmodified` when the visible state
   * is equal to the loaded state from the widget storage. When the user modifies the dashboard by
   * e.g. while moving the widgets, the dashboard is marked as `modified` and emits `true` and when the user
   * persists the change by saving, or reverts the state by canceling, the state is `unmodified`
   * again and emits `false`.
   */
  readonly isModified = output<boolean>();

  /**
   * Modified state that is emitted in the `isModified` output. Should only be
   changed using the {@link setModified} method.
   */
  private modified = false;

  /**
   * Emits to notify about edit events of widget instances. Only emits
   * if `emitWidgetInstanceEditEvents` is set to `true`.
   */
  readonly widgetInstanceEdit = output<WidgetConfig>();

  /**
   * All widget configuration objects of the visible widget instances.
   *
   * @internal
   */
  readonly visibleWidgetInstances$ = new BehaviorSubject<WidgetConfig[]>([]);

  /**
   * All widget instance configs that are on the grid by loading from the widget
   * storage. Thus, these widget are persisted.
   *
   * @defaultValue []
   * @internal
   */
  persistedWidgetInstances: WidgetConfig[] = [];

  /**
   * Widget instance configs that are added to the grid in edit mode, but not
   * persisted yet, as the user did not confirm the modification by save.
   *
   * @defaultValue []
   * @internal
   */
  transientWidgetInstances: WidgetConfig[] = [];

  /**
   * All widget instance configurations that are removed from the grid in edit mode.
   * These instances are persistently removed on save or re-added again on cancel.
   *
   * @defaultValue []
   * @internal
   */
  markedForRemoval: WidgetConfig[] = [];

  /** @defaultValue viewChild.required(SiGridstackWrapperComponent) */
  readonly gridStackWrapper = viewChild.required(SiGridstackWrapperComponent);

  /**
   * Service used to indicate load and save indication.
   * @deprecated Use `isLoading` instead.
   *
   * @defaultValue inject(SiLoadingService)
   */
  loadingService = inject(SiLoadingService);

  /**
   * Indication for load and save operations.
   */
  readonly isLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  protected initialLoad = true;

  protected get showEmptyState(): boolean {
    return !this.initialLoad && this.visibleWidgetInstances$.value.length === 0;
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Reload widgets if the dashboardId changes. Do not load on inital
    // dashboardId property binding as first load will be done in ngOnInit()
    if (changes.dashboardId && !changes.dashboardId.firstChange) {
      queueMicrotask(() => this.loadAndSubscribeWidgets());
    }

    if (changes.editable) {
      if (changes.editable.currentValue) {
        this.edit();
      } else {
        this.cancel();
      }
    }

    if (changes.widgetCatalog) {
      this.gridService.widgetCatalog = this.widgetCatalog();
    }
  }

  ngOnInit(): void {
    queueMicrotask(() => this.loadAndSubscribeWidgets());
    this.gridService.widgetCatalog = this.widgetCatalog();
  }

  ngOnDestroy(): void {
    this.storeSubscription?.unsubscribe();
    this.isLoading.complete();
    this.loadingService.counter.complete();
  }

  /**
   * Set dashboard grid in editable mode to modify widget instances.
   */
  edit(): void {
    if (!this.editableInternal) {
      this.transientWidgetInstances = [];
      this.markedForRemoval = [];
      this.setModified(false);
      this.editableInternal = true;
      this.editable.set(true);
      this.gridService.editable$.next(this.editableInternal);
    }
  }

  /**
   * Persists the current widget instances to the widget storage and
   * changes the editable and isModified modes.
   */
  save(): void {
    if (!this.editableInternal) {
      return;
    }

    this.isLoading.next(true);
    this.loadingService.counter.next(1);
    // Update position information and remove temporary ids
    const widgets = this.updateWidgetPositions(this.visibleWidgetInstances$.value).map(widget =>
      widget.id.startsWith(NEW_WIDGET_PREFIX) ? { ...widget, id: undefined } : widget
    );
    const toRemove = this.markedForRemoval.filter(
      widget => !widget.id.startsWith(NEW_WIDGET_PREFIX)
    );
    this.widgetStorage
      .save(widgets, toRemove, this.dashboardId())
      .pipe(take(1))
      .subscribe({
        next: (value: WidgetConfig[]) => {
          this.setModified(false);
          this.editableInternal = false;
          this.editable.set(false);
          this.gridService.editable$.next(this.editableInternal);
          this.isLoading.next(false);
          this.loadingService.counter.next(0);
        },
        error: (err: any) => {
          console.error('Saving dashboard configuration failed.', err);
          this.isLoading.next(false);
          this.loadingService.counter.next(0);
        }
      });
  }

  /**
   * Cancel current changes and restore last saved state.
   */
  cancel(): void {
    if (!this.editableInternal) {
      return;
    }

    if (this.modified) {
      this.visibleWidgetInstances$.next([...this.persistedWidgetInstances]);
      this.setModified(false);
    }
    this.editableInternal = false;
    if (this.editable()) {
      this.editable.set(false);
    }
    this.gridService.editable$.next(this.editableInternal);
  }

  /**
   * Adds a new widget instance configuration to the dashboard grid. It is not
   * persisted yet and is added to the transient widget instances.
   *
   * @param widgetInstanceConfig - The new widget configuration.
   */
  addWidgetInstance(widgetInstanceConfig: Omit<WidgetConfig, 'id'>): void {
    const id = `${NEW_WIDGET_PREFIX}${idCounter++}`;
    const newWidget: WidgetConfig = { ...widgetInstanceConfig, id };
    const nextWidgets = this.updateWidgetPositions([
      ...this.visibleWidgetInstances$.value,
      newWidget
    ]);
    this.transientWidgetInstances.push(newWidget);
    this.visibleWidgetInstances$.next(nextWidgets);
  }

  /**
   * Removes a widget instance from the visible widgets and puts it in the
   * {@link markedForRemoval} array.
   *
   * @param widgetInstanceId - The id of the widget instance to be removed.
   */
  removeWidgetInstance(widgetInstanceId: string): void {
    const widgetToRemove = this.visibleWidgetInstances$.value.find(
      widget => widget.id === widgetInstanceId
    );
    if (widgetToRemove) {
      this.markedForRemoval.push(widgetToRemove);
      let nextWidgets = this.visibleWidgetInstances$.value.filter(
        widget => widget.id !== widgetInstanceId
      );
      nextWidgets = this.updateWidgetPositions(nextWidgets);
      this.visibleWidgetInstances$.next(nextWidgets);
    }
  }

  /**
   * Opens the provided widget configuration in the related editor or
   * emits on {@link widgetInstanceEdit}, if {@link emitWidgetInstanceEditEvents}
   * is true.
   *
   * @param widgetInstanceConfig - The config of the widget instance to edit.
   */
  editWidgetInstance(widgetInstanceConfig: WidgetConfig): void {
    // Need to edit a clone to avoid runtime editing
    const widgetConfigClone: WidgetConfig = JSON.parse(JSON.stringify(widgetInstanceConfig));
    if (this.emitWidgetInstanceEditEvents()) {
      this.widgetInstanceEdit.emit(widgetConfigClone);
    } else {
      const widget = this.gridService.getWidget(widgetConfigClone.widgetId);
      const config: ModalOptions<SiWidgetInstanceEditorDialogComponent> = {
        animated: true,
        keyboard: true,
        inputValues: {
          widgetConfig: widgetConfigClone,
          widget
        },
        class: widget?.componentFactory.editorModalClass ?? 'modal-xl'
      };
      const widgetInstanceEditorDialogComponent = this.widgetInstanceEditorDialogComponent();
      const componentType =
        widgetInstanceEditorDialogComponent ?? SiWidgetInstanceEditorDialogComponent;
      const modalRef = this.modalService.show(componentType, config);
      const subscription = modalRef.content.closed.subscribe(editedWidgetConfig => {
        subscription.unsubscribe();
        modalRef.hide();
        if (editedWidgetConfig) {
          this.updateWidgetInstance(editedWidgetConfig);
        }
      });
    }
  }

  /**
   * Updates the visible widgets with an updated configuration. Will update the
   * user interface and emit on {@link isModified}.
   *
   * @param editedWidgetConfig - The config of the widget instance that was updated.
   */
  updateWidgetInstance(editedWidgetConfig: WidgetConfig): void {
    const index = this.visibleWidgetInstances$.value.findIndex(
      wc => wc.id === editedWidgetConfig.id
    );
    if (index >= 0) {
      let nextWidgets = this.updateWidgetPositions([...this.visibleWidgetInstances$.value]);
      nextWidgets[index] = editedWidgetConfig;
      nextWidgets = this.updateWidgetPositions(nextWidgets);
      this.visibleWidgetInstances$.next(nextWidgets);
      setTimeout(() => this.setModified(true), 0);
    }
  }

  protected handleGridEvent(event: GridWrapperEvent): void {
    const relevantEventTypes = ['added', 'removed', 'dragstop', 'resizestop'];
    if (this.editable() && relevantEventTypes.includes(event.event.type)) {
      // Make sure the widget config always holds the latest position information
      const widgets = this.updateWidgetPositions(this.visibleWidgetInstances$.value);
      this.visibleWidgetInstances$.next(widgets);
      setTimeout(() => this.setModified(true), 0);
    }
  }

  private loadAndSubscribeWidgets(): void {
    this.storeSubscription?.unsubscribe();
    // remove existing widgets
    this.visibleWidgetInstances$.next([]);

    // Only when we change the dashboard id, this method is invoked
    // directly. In this case we start the progress here and we stop
    // it in the `next` subscription. The subscription stays hot and
    // also get called when save() is invoked. In this case, we do not
    // want to decrease the progress counter as we do it in the save
    // subscription. To handle this, we use the boolean marker `initialLoad`.
    this.initialLoad = true;
    this.isLoading.next(true);
    this.loadingService.counter.next(1);
    this.storeSubscription = this.widgetStorage.load(this.dashboardId()).subscribe({
      next: widgets => {
        this.visibleWidgetInstances$.next(widgets);
        this.persistedWidgetInstances = widgets;
        if (this.initialLoad) {
          this.initialLoad = false;
          this.isLoading.next(false);
          this.loadingService.counter.next(0);
        }
      },
      error: err => {
        console.error('Loading dashboard configuration failed', err);
        this.isLoading.next(false);
        this.loadingService.counter.next(0);
      }
    });
  }

  private updateWidgetPositions(widgetConfigs: WidgetConfig[]): WidgetConfig[] {
    const layout = this.gridStackWrapper().getLayout();
    const widgets = widgetConfigs.map(widget => {
      const position = layout.find(p => p.id === widget.id);
      if (position) {
        return {
          ...widget,
          x: position.x,
          y: position.y,
          width: position.width,
          height: position.height
        };
      } else {
        return widget;
      }
    });
    return widgets || [];
  }

  private setModified(modified: boolean): void {
    if (this.modified !== modified) {
      this.modified = modified;
      this.isModified.emit(this.modified);
    }
  }
}
