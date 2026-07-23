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
import { SiActionDialogService } from '@siemens/element-ng/action-modal';
import { SiCircleStatusComponent } from '@siemens/element-ng/circle-status';
import { SiEmptyStateComponent } from '@siemens/element-ng/empty-state';
import { SiSearchBarComponent } from '@siemens/element-ng/search-bar';
import {
  injectSiTranslateService,
  SiTranslatePipe,
  t
} from '@siemens/element-translate-ng/translate';

import { createWidgetConfig, Widget, WidgetConfig } from '../../model/widgets.model';
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
    SiCircleStatusComponent,
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
  /** @defaultValue false */
  readonly enableMultiSelect = input(false, {
    transform: booleanAttribute
  });
  /**
   * Placeholder text for the search input field in the widget catalog.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@DASHBOARD.WIDGET_LIBRARY.SEARCH_PLACEHOLDER:Search widget`)
   * ```
   */
  readonly searchPlaceholder = input(
    t(() => $localize`:@@DASHBOARD.WIDGET_LIBRARY.SEARCH_PLACEHOLDER:Search widget`)
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
   * @defaultValue [] */
  widgetCatalog: Widget[] = [];

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
  protected readonly hasSelection = computed(() => this.selectedWidgets().length > 0);
  /**
   * @deprecated Use `selectedWidgets` and `hasSelection` instead.
   * This property only holds the first selected widget and is not updated when multiple selection is allowed.
   * It will be removed in one of the next major releases.
   */
  protected readonly selected = signal<Widget | undefined>(undefined);
  private readonly singleSelectedWidget = computed(() => {
    const selectedWidgets = this.selectedWidgets();
    return selectedWidgets.length === 1 ? selectedWidgets[0] : undefined;
  });
  private widgetConfig?: Omit<WidgetConfig, 'id'>;
  private readonly singleSelectedWidgetHasEditor = computed(
    () => !!this.singleSelectedWidget()?.componentFactory.editorComponentName
  );

  private readonly translateService = injectSiTranslateService();

  protected labelCancel = t(() => $localize`:@@DASHBOARD.WIDGET_LIBRARY.CANCEL:Cancel`);
  protected labelPrevious = t(() => $localize`:@@DASHBOARD.WIDGET_LIBRARY.PREVIOUS:Previous`);
  protected labelNext = t(() => $localize`:@@DASHBOARD.WIDGET_LIBRARY.NEXT:Next`);
  protected labelAdd = t(() => $localize`:@@DASHBOARD.WIDGET_LIBRARY.ADD:Add`);
  protected labelEmpty = t(() => $localize`:@@DASHBOARD.WIDGET_LIBRARY.EMPTY:Empty`);

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
    () => $localize`:@@DASHBOARD.WIDGET_LIBRARY.WIDGET_CATALOG_LIST:Widget catalog list`
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

  protected readonly disableAddButton = computed(() =>
    this.view() === 'list' ? !this.hasSelection() : this.invalidConfig()
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
        this.selectedWidgets.set([selected]);
      }
    });
  }

  ngOnInit(): void {
    this.filteredWidgetCatalog = this.widgetCatalog;
    if (this.widgetCatalog.length > 0 && !this.enableMultiSelect()) {
      this.selectWidgets([this.widgetCatalog[0]]);
    }
  }

  protected onSearch(searchTerm?: string): void {
    if (!searchTerm || searchTerm.trim().length === 0) {
      this.searchTerm = '';
      this.filteredWidgetCatalog = this.widgetCatalog;
    } else {
      this.searchTerm = searchTerm;
      const term = searchTerm.trim().toLowerCase();
      this.filteredWidgetCatalog = this.widgetCatalog.filter(wd => {
        const name = this.translateService.translateSync(wd.name);
        return name.toLowerCase().includes(term);
      });
    }
    // In multi selection mode, filter is independent of the selection,
    // so we don't need to update the selection with the filtered catalog.
    if (!this.enableMultiSelect()) {
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
      const selectedWidgets = this.selectedWidgets();
      if (selectedWidgets.length === 0) {
        return;
      }

      if (!this.enableMultiSelect() && selectedWidgets.length === 1) {
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
    if (this.enableMultiSelect()) {
      this.selectedWidgets.set([...widgets]);
    } else {
      this.selected.set(widgets.length > 0 ? widgets[0] : undefined);
    }
  }

  private updateSelectionOnFilter(): void {
    const filteredWidgets = new Set(this.filteredWidgetCatalog);
    const selectedFilteredWidgets = this.selectedWidgets().filter(widget =>
      filteredWidgets.has(widget)
    );

    if (selectedFilteredWidgets.length > 0) {
      this.selectedWidgets.set(selectedFilteredWidgets);
      return;
    }

    if (this.filteredWidgetCatalog.length > 0) {
      this.selectedWidgets.set([this.filteredWidgetCatalog[0]]);
      return;
    }

    this.selectedWidgets.set([]);
  }

  private createConfigForSelection(widget: Widget): Omit<WidgetConfig, 'id'> {
    const config = createWidgetConfig(widget);
    if (this.enableMultiSelect() && widget.componentFactory.editorComponentName) {
      return { ...config, setupPending: true };
    }
    return config;
  }
}
