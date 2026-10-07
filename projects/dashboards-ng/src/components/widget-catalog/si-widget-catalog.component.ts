/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CdkListbox, CdkOption } from '@angular/cdk/listbox';
import {
  ChangeDetectionStrategy,
  booleanAttribute,
  Component,
  computed,
  effect,
  inject,
  input,
  isSignal,
  OnInit,
  output,
  signal
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { elementSpecialObject } from '@siemens/element-icons';
import { SiActionDialogService } from '@siemens/element-ng/action-modal';
import { SiBadgeComponent } from '@siemens/element-ng/badge';
import { SiEmptyStateComponent } from '@siemens/element-ng/empty-state';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiSearchBarComponent } from '@siemens/element-ng/search-bar';
import {
  injectSiTranslateService,
  SiTranslatePipe,
  t
} from '@siemens/element-translate-ng/translate';

import { createWidgetConfig, Widget, WidgetConfig } from '../../model/widgets.model';
import { SiFlexibleDashboardComponent } from '../flexible-dashboard/si-flexible-dashboard.component';
import { SiWidgetEditorBase } from '../si-widget-editor-base';

/**
 * Default widget catalog implementation to show all available widgets that can be added
 * to a dashboard. It consists of a list view, that lists all available widgets and after
 * selection, a host in which the widget specific editor is loaded. Applications can either
 * stay with the default catalog or implement their own by extending this class.
 */
@Component({
  selector: 'si-widget-catalog',
  imports: [
    SiSearchBarComponent,
    SiIconComponent,
    SiBadgeComponent,
    SiEmptyStateComponent,
    SiTranslatePipe,
    CdkListbox,
    CdkOption
  ],
  templateUrl: './si-widget-catalog.component.html',
  styleUrl: './si-widget-catalog.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager
})
export class SiWidgetCatalogComponent extends SiWidgetEditorBase implements OnInit {
  /**
   * Option to enable multi-select in the widget catalog.
   * When enabled, the user can select multiple widgets to add to the dashboard at once.
   * @defaultValue false
   * */
  readonly multiSelect = input(false, {
    transform: booleanAttribute
  });
  /**
   * Placeholder text for the search input field in the widget catalog.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@DASHBOARD.WIDGET_LIBRARY.SEARCH_PLACEHOLDER:Search…`)
   * ```
   */
  readonly searchPlaceholder = input(
    t(() => $localize`:@@DASHBOARD.WIDGET_LIBRARY.SEARCH_PLACEHOLDER:Search…`)
  );
  /**
   * Emits when the catalog is `closed`, either by canceling or by adding or saving
   * widget configurations. On cancel `undefined` is emitted, otherwise an array of
   * the related widget configurations is emitted. In single-select mode the array
   * always contains exactly one entry.
   */
  readonly closed = output<Omit<WidgetConfig, 'id'>[] | undefined>();

  /**
   * View defines if the catalog widget list or the widget editor is visible.
   *
   * @internal
   * @defaultValue 'list'
   */
  readonly view = signal<'list' | 'editor' | 'editor-only'>('list');

  /**
   * Property to provide the available widgets to the catalog. The flexible
   * dashboard creates the catalog by Angular's `createComponent()` method
   * and sets the available widgets to this attribute.
   *
   * @deprecated This property will be removed in v52. Use the signal `widgetList` instead.
   * @defaultValue [] */
  widgetCatalog: Widget[] = [];

  /**
   * Property to provide the available widgets to the catalog. The flexible
   * dashboard creates the catalog by Angular's `createComponent()` method
   * and sets the available widgets to this attribute.
   *
   * @defaultValue [] */
  readonly widgetList = signal<Widget[]>([]);

  private readonly widgetInstances = toSignal(
    inject(SiFlexibleDashboardComponent).grid().visibleWidgetInstances$,
    { requireSync: true }
  );

  protected readonly widgetStates = computed(() => {
    const counts = new Map<string, number>();
    for (const instance of this.widgetInstances()) {
      counts.set(instance.widgetId, (counts.get(instance.widgetId) ?? 0) + 1);
    }

    return new Map(
      this.widgetCatalogList.map(widget => {
        const added =
          widget.maxInstances !== undefined &&
          widget.maxInstances > 0 &&
          (counts.get(widget.id) ?? 0) >= widget.maxInstances;
        return [
          widget.id,
          {
            disabled: widget.maxInstances === 0 || added,
            added,
            badge: added ? this.labelAdded : widget.badge
          }
        ];
      })
    );
  });

  /**
   * Holds the search term from the catalog to be visible when going back
   * by pressing the previous button from the widget edit view.
   */
  protected searchTerm = '';
  /**
   * Array used to hold the search result on the widget catalog.
   * @defaultValue [] */
  protected filteredWidgetCatalog: Widget[] = [];
  protected readonly selectedWidgets = signal<Widget[]>([]);
  protected readonly hasSelection = computed(() =>
    this.selectedWidgets().some(widget => this.isWidgetEnabled(widget))
  );
  /**
   * @deprecated Use `selectedWidgets` and `hasSelection` instead.
   * This property only holds the first selected widget and is not updated when multiple selection is allowed.
   * It will be removed in one of the next major releases.
   */
  protected readonly selected = signal<Widget | undefined>(undefined);
  private readonly singleSelectedWidget = computed(() => {
    const selectedWidgets = this.selectedWidgets().filter(widget => this.isWidgetEnabled(widget));
    return selectedWidgets.length === 1 ? selectedWidgets[0] : undefined;
  });
  private widgetConfig?: Omit<WidgetConfig, 'id'>;
  private readonly singleSelectedWidgetHasEditor = computed(
    () => !!this.singleSelectedWidget()?.componentFactory.editorComponentName
  );

  private readonly translateService = injectSiTranslateService();
  /** Default indicator for widgets without an `iconClass`, as specified in the design. */
  protected readonly icons = addIcons({ elementSpecialObject });
  /**
   * TODO: Remove this property in v52. Use the signal `widgetList` instead.
   */
  private get widgetCatalogList(): Widget[] {
    return this.widgetList().length ? this.widgetList() : this.widgetCatalog;
  }

  protected labelCancel = t(() => $localize`:@@DASHBOARD.WIDGET_LIBRARY.CANCEL:Cancel`);
  protected labelPrevious = t(() => $localize`:@@DASHBOARD.WIDGET_LIBRARY.PREVIOUS:Previous`);
  protected labelNext = t(() => $localize`:@@DASHBOARD.WIDGET_LIBRARY.NEXT:Next`);
  protected labelAdd = t(() => $localize`:@@DASHBOARD.WIDGET_LIBRARY.ADD:Add`);
  protected labelAdded = t(() => $localize`:@@DASHBOARD.WIDGET_LIBRARY.ADDED:Added`);
  protected labelEmpty = t(() => $localize`:@@DASHBOARD.WIDGET_LIBRARY.EMPTY:No widgets found`);
  protected labelEmptyMessage = t(
    () => $localize`:@@DASHBOARD.WIDGET_LIBRARY.EMPTY_MESSAGE:Refine search`
  );

  protected labelDialogHeading = t(
    () =>
      $localize`:@@DASHBOARD.WIDGET_LIBRARY.DISCARD_CONFIG_CHANGE_DIALOG.HEADING:Widget configuration changed`
  );
  protected labelDialogCancel = t(
    () => $localize`:@@DASHBOARD.WIDGET_LIBRARY.DISCARD_CONFIG_CHANGE_DIALOG.CANCEL:Cancel`
  );
  protected labelDialogMessage = t(
    () =>
      $localize`:@@DASHBOARD.WIDGET_LIBRARY.DISCARD_CONFIG_CHANGE_DIALOG.MESSAGE:The widget configuration changed. Do you want to discard the changes?`
  );
  protected labelDialogDiscard = t(
    () => $localize`:@@DASHBOARD.WIDGET_LIBRARY.DISCARD_CONFIG_CHANGE_DIALOG.DISCARD:Discard`
  );
  protected labelWidgetCatalogList = t(
    () => $localize`:@@DASHBOARD.WIDGET_LIBRARY.WIDGET_CATALOG_LIST:Widget catalog`
  );

  protected readonly showAddButton = computed(() =>
    this.view() === 'list' ? !this.singleSelectedWidgetHasEditor() : true
  );

  protected readonly showNextButton = computed(() =>
    this.view() === 'list'
      ? this.singleSelectedWidgetHasEditor()
      : this.editorWizardState() !== undefined
  );

  protected readonly showPreviousButton = computed(() => this.view() === 'editor');

  protected readonly disableAddButton = computed(
    () => !this.hasSelection() || (this.view() !== 'list' && this.invalidConfig())
  );
  protected readonly disableNextButton = computed(() => {
    const wizardState = this.editorWizardState();
    if (this.view() === 'list') {
      return !this.singleSelectedWidgetHasEditor();
    } else if (!wizardState) {
      return true;
    } else if (!wizardState.hasNext) {
      return true;
    } else if (wizardState.disableNext !== undefined) {
      return wizardState.disableNext;
    } else {
      return false;
    }
  });

  private dialogService = inject(SiActionDialogService);

  constructor() {
    super();
    effect(() => {
      const selected = this.selected();
      if (selected) {
        this.selectWidgets([selected]);
      }
    });
    effect(() => {
      const selectedWidgets = this.selectedWidgets();
      const enabledWidgets = selectedWidgets.filter(widget => this.isWidgetEnabled(widget));
      if (enabledWidgets.length !== selectedWidgets.length) {
        this.selectWidgets(enabledWidgets);
      }
    });
  }

  ngOnInit(): void {
    this.filteredWidgetCatalog = this.widgetCatalogList;
    if (!this.multiSelect()) {
      const firstEnabledWidget = this.widgetCatalogList.find(widget =>
        this.isWidgetEnabled(widget)
      );
      this.selectWidgets(firstEnabledWidget ? [firstEnabledWidget] : []);
    }
  }

  protected onSearch(searchTerm?: string): void {
    if (!searchTerm || searchTerm.trim().length === 0) {
      this.searchTerm = '';
      this.filteredWidgetCatalog = this.widgetCatalogList;
    } else {
      this.searchTerm = searchTerm;
      const term = searchTerm.trim().toLowerCase();
      this.filteredWidgetCatalog = this.widgetCatalogList.filter(wd => {
        const name = this.translateService.translateSync(wd.name);
        return name.toLowerCase().includes(term);
      });
    }
    // In multi selection mode, filter is independent of the selection,
    // so we don't need to update the selection with the filtered catalog.
    if (!this.multiSelect()) {
      this.updateSelectionOnFilter();
    }
  }

  protected onCancel(): void {
    if (!this.widgetConfigModified()) {
      this.closed.emit(undefined);
    } else {
      this.dialogService
        .showActionDialog({
          type: 'edit-discard',
          disableSave: true,
          heading: this.labelDialogHeading,
          cancelBtnName: this.labelDialogCancel,
          disableSaveMessage: this.labelDialogMessage,
          disableSaveDiscardBtnName: this.labelDialogDiscard
        })
        .subscribe(result => {
          if (result === 'discard') {
            this.closed.emit(undefined);
          }
        });
    }
  }

  protected onNext(): void {
    if (this.view() === 'list') {
      this.setupWidgetInstanceEditor();
    } else {
      if (this.isEditorWizard(this.widgetInstanceEditor)) {
        this.widgetInstanceEditor.next();
        this.editorWizardState.set(this.widgetInstanceEditor.state);
      }
    }
  }

  protected onPrevious(): void {
    if (this.isEditorWizard(this.widgetInstanceEditor) && this.editorWizardState()?.hasPrevious) {
      this.widgetInstanceEditor.previous();
      this.editorWizardState.set(this.widgetInstanceEditor.state);
    } else if (!this.widgetConfigModified()) {
      this.setupCatalog();
    } else {
      this.dialogService
        .showActionDialog({
          type: 'edit-discard',
          disableSave: true,
          heading: this.labelDialogHeading,
          cancelBtnName: this.labelDialogCancel,
          message: this.labelDialogMessage,
          discardBtnName: this.labelDialogDiscard
        })
        .subscribe(result => {
          if (result === 'discard') {
            this.setupCatalog();
          }
        });
    }
  }

  private setupWidgetInstanceEditor(): void {
    const selected = this.singleSelectedWidget();
    if (!selected) {
      return;
    }
    this.tearDownEditor();
    this.view.set('editor');
    this.widgetConfig = createWidgetConfig(selected);

    this.loadWidgetEditor(selected.componentFactory, this.editorHost()).subscribe({
      next: componentRef => {
        this.initializeEditor(componentRef, this.widgetConfig!);
      },
      error: error => {
        console.error(error);
      }
    });
  }

  private setupCatalog(): void {
    this.editorHost().clear();
    this.tearDownEditor();
    this.widgetConfig = undefined;
    this.view.set('list');
  }

  protected onAddWidget(): void {
    if (this.view() === 'list') {
      const selectedWidgets = this.selectedWidgets().filter(widget => this.isWidgetEnabled(widget));
      if (selectedWidgets.length === 0) {
        return;
      }

      if (!this.multiSelect() && selectedWidgets.length === 1) {
        const [selectedWidget] = selectedWidgets;
        if (selectedWidget.componentFactory.editorComponentName) {
          return;
        }
        this.closed.emit([createWidgetConfig(selectedWidget)]);
        return;
      }

      const configs = selectedWidgets.map(widget => this.createConfigForSelection(widget));
      this.closed.emit(configs);
      return;
    }

    const selectedWidget = this.singleSelectedWidget();
    if (!selectedWidget) {
      return;
    }

    if (!this.widgetConfig) {
      this.widgetConfig = createWidgetConfig(selectedWidget);
    } else {
      // Make sure we use the same config object as the editor
      if (isSignal(this.widgetInstanceEditor?.config)) {
        this.widgetConfig = this.widgetInstanceEditor?.config() ?? this.widgetConfig;
      } else {
        this.widgetConfig = this.widgetInstanceEditor?.config ?? this.widgetConfig;
      }
    }

    this.closed.emit([this.widgetConfig]);
  }

  protected selectWidgets(widgets: readonly Widget[]): void {
    const enabledWidgets = widgets.filter(widget => this.isWidgetEnabled(widget));
    const selection = this.multiSelect() ? enabledWidgets : enabledWidgets.slice(0, 1);
    this.selectedWidgets.set(selection);
    if (!this.multiSelect()) {
      this.selected.set(selection[0]);
    }
  }

  private isWidgetEnabled(widget: Widget): boolean {
    return !this.widgetStates().get(widget.id)?.disabled;
  }

  private updateSelectionOnFilter(): void {
    const filteredWidgets = new Set(this.filteredWidgetCatalog);
    const selectedFilteredWidgets = this.selectedWidgets().filter(
      widget => filteredWidgets.has(widget) && this.isWidgetEnabled(widget)
    );

    if (selectedFilteredWidgets.length > 0) {
      this.selectWidgets(selectedFilteredWidgets);
      return;
    }

    const firstEnabledWidget = this.filteredWidgetCatalog.find(widget =>
      this.isWidgetEnabled(widget)
    );
    this.selectWidgets(firstEnabledWidget ? [firstEnabledWidget] : []);
  }

  private createConfigForSelection(widget: Widget): Omit<WidgetConfig, 'id'> {
    const config = createWidgetConfig(widget);
    if (this.multiSelect() && widget.componentFactory.editorComponentName) {
      return { ...config, setupPending: true };
    }
    return config;
  }
}
