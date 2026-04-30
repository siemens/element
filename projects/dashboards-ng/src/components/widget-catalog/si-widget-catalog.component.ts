/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CdkListbox, CdkOption } from '@angular/cdk/listbox';
import {
  Component,
  computed,
  inject,
  input,
  isSignal,
  OnInit,
  output,
  signal,
  viewChild
} from '@angular/core';
import { SiActionDialogService } from '@siemens/element-ng/action-modal';
import { SiCircleStatusComponent } from '@siemens/element-ng/circle-status';
import { SiEmptyStateComponent } from '@siemens/element-ng/empty-state';
import { SiSearchBarComponent } from '@siemens/element-ng/search-bar';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';

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
  styleUrl: './si-widget-catalog.component.scss'
})
export class SiWidgetCatalogComponent extends SiWidgetEditorBase implements OnInit {
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
   * a widget configuration. On cancel `undefined` is emitted, otherwise the related
   * widget configuration is emitted.
   */
  readonly closed = output<Omit<WidgetConfig, 'id'> | undefined>();

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
  protected readonly selected = signal<Widget | undefined>(undefined);
  private widgetConfig?: Omit<WidgetConfig, 'id'>;
  private readonly hasEditor = computed(
    () => !!this.selected()?.componentFactory.editorComponentName
  );

  protected labelCancel = t(() => $localize`:@@DASHBOARD.WIDGET_LIBRARY.CANCEL:Cancel`);
  protected labelPrevious = t(() => $localize`:@@DASHBOARD.WIDGET_LIBRARY.PREVIOUS:Back`);
  protected labelNext = t(() => $localize`:@@DASHBOARD.WIDGET_LIBRARY.NEXT:Next`);
  protected labelAdd = t(() => $localize`:@@DASHBOARD.WIDGET_LIBRARY.ADD:Create`);
  protected labelEmpty = t(() => $localize`:@@DASHBOARD.WIDGET_LIBRARY.EMPTY:No widgets in library`);

  protected labelDialogHeading = t(
    () =>
      $localize`:@@DASHBOARD.WIDGET_LIBRARY.DISCARD_CONFIG_CHANGE_DIALOG.HEADING:Unsaved widget data`
  );
  protected labelDialogCancel = t(
    () => $localize`:@@DASHBOARD.WIDGET_LIBRARY.DISCARD_CONFIG_CHANGE_DIALOG.CANCEL:Cancel`
  );
  protected labelDialogMessage = t(
    () =>
      $localize`:@@DASHBOARD.WIDGET_LIBRARY.DISCARD_CONFIG_CHANGE_DIALOG.MESSAGE:Discard changes?`
  );
  protected labelDialogDiscard = t(
    () => $localize`:@@DASHBOARD.WIDGET_LIBRARY.DISCARD_CONFIG_CHANGE_DIALOG.DISCARD:Discard`
  );
  protected labelWidgetCatalogList = t(
    () => $localize`:@@DASHBOARD.WIDGET_LIBRARY.WIDGET_CATALOG_LIST:Widget catalog`
  );

  protected readonly showAddButton = computed(() =>
    this.view() === 'list' ? !this.hasEditor() : true
  );

  protected readonly showNextButton = computed(() =>
    this.view() === 'list' ? this.hasEditor() : this.editorWizardState() !== undefined
  );

  protected readonly showPreviousButton = computed(() => this.view() === 'editor');

  protected readonly disableAddButton = computed(() => !this.selected() || this.invalidConfig());
  protected readonly disableNextButton = computed(() => {
    const wizardState = this.editorWizardState();
    if (this.view() === 'list') {
      return !this.selected();
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
  private readonly widgetCdkListbox = viewChild(CdkListbox<Widget>);

  ngOnInit(): void {
    this.filteredWidgetCatalog = this.widgetCatalog;
    if (this.widgetCatalog.length > 0) {
      this.selectWidget(this.widgetCatalog[0]);
    }
  }

  protected onSearch(searchTerm?: string): void {
    if (!searchTerm || searchTerm.trim().length === 0) {
      this.searchTerm = '';
      this.filteredWidgetCatalog = this.widgetCatalog;
    } else {
      this.searchTerm = searchTerm;
      this.filteredWidgetCatalog = this.widgetCatalog.filter(wd =>
        wd.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
      );
    }
    if (this.filteredWidgetCatalog.length > 0) {
      this.selectWidget(this.filteredWidgetCatalog[0]);
    } else {
      this.selectWidget(undefined);
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
    const selected = this.selected();
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
    const selected = this.selected();
    if (!selected) {
      return;
    }

    if (!this.widgetConfig) {
      this.widgetConfig = createWidgetConfig(selected);
    } else {
      // Make sure we use the same config object as the editor
      if (isSignal(this.widgetInstanceEditor?.config)) {
        this.widgetConfig = this.widgetInstanceEditor?.config() ?? this.widgetConfig;
      } else {
        this.widgetConfig = this.widgetInstanceEditor?.config ?? this.widgetConfig;
      }
    }
    this.closed.emit(this.widgetConfig);
  }

  protected selectWidget(widget?: Widget): void {
    this.selected.set(widget);
    if (widget) {
      // need to keep this in setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
      setTimeout(() => {
        this.widgetCdkListbox()?.selectValue(widget);
      });
    }
  }
}
