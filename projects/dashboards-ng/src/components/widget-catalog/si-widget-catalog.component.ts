/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  Component,
  ComponentRef,
  computed,
  EnvironmentInjector,
  inject,
  Injector,
  input,
  isSignal,
  OnDestroy,
  OnInit,
  output,
  OutputRefSubscription,
  signal,
  viewChild,
  ViewContainerRef
} from '@angular/core';
import { SiActionDialogService } from '@siemens/element-ng/action-modal';
import { SiCircleStatusComponent } from '@siemens/element-ng/circle-status';
import { SiEmptyStateComponent } from '@siemens/element-ng/empty-state';
import { SiSearchBarComponent } from '@siemens/element-ng/search-bar';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';
import { Subscription } from 'rxjs';

import {
  createWidgetConfig,
  Widget,
  WidgetConfig,
  WidgetConfigStatus,
  WidgetInstanceEditor,
  WidgetInstanceEditorWizard,
  WidgetInstanceEditorWizardState
} from '../../model/widgets.model';
import { setupWidgetEditor } from '../../widget-loader';

/**
 * Default widget catalog implementation to show all available widgets that can be added
 * to a dashboard. It consists of a list view, that lists all available widgets and after
 * selection, a host in which the widget specific editor is loaded. Applications can either
 * stay with the default catalog or implement their own by extending this class.
 */
@Component({
  selector: 'si-widget-catalog',
  imports: [SiSearchBarComponent, SiCircleStatusComponent, SiEmptyStateComponent, SiTranslatePipe],
  templateUrl: './si-widget-catalog.component.html',
  styleUrl: './si-widget-catalog.component.scss'
})
export class SiWidgetCatalogComponent implements OnInit, OnDestroy {
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

  protected readonly editorHost = viewChild.required('editorHost', { read: ViewContainerRef });

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
  private readonly hasEditor = signal<boolean>(false);

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

  /** Indicates if the current config is valid or not. If invalid, the add button is disabled. */
  private readonly invalidConfig = signal(false);

  /**
   * Marks the widget configuration as modified. Is set when widget editor instance
   * emits configChange events. Triggers edit discard confirmation dialog when widget config
   * is modified but not added to the dashboard.
   * */
  private widgetConfigModified = false;
  private widgetInstanceEditor?: WidgetInstanceEditor;
  private readonly editorWizardState = signal<WidgetInstanceEditorWizardState | undefined>(
    undefined
  );
  private widgetInstanceEditorRef?: ComponentRef<WidgetInstanceEditor>;

  private subscriptions: Subscription[] | OutputRefSubscription[] = [];
  private dialogService = inject(SiActionDialogService);
  private injector = inject(Injector);
  private envInjector = inject(EnvironmentInjector);

  ngOnInit(): void {
    this.filteredWidgetCatalog = this.widgetCatalog;
    if (this.widgetCatalog.length > 0) {
      this.selectWidget(this.widgetCatalog[0]);
    }
  }

  ngOnDestroy(): void {
    this.tearDownEditor();
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
    if (!this.widgetConfigModified) {
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
      if (this.isEditorWizdard(this.widgetInstanceEditor)) {
        this.widgetInstanceEditor.next();
        this.editorWizardState.set(this.widgetInstanceEditor.state);
      }
    }
  }

  protected onPrevious(): void {
    if (this.isEditorWizdard(this.widgetInstanceEditor) && this.editorWizardState()?.hasPrevious) {
      this.widgetInstanceEditor.previous();
      this.editorWizardState.set(this.widgetInstanceEditor.state);
    } else if (!this.widgetConfigModified) {
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

    setupWidgetEditor(
      selected.componentFactory,
      this.editorHost(),
      this.injector,
      this.envInjector
    ).subscribe({
      next: componentRef => {
        this.widgetInstanceEditorRef = componentRef;
        this.widgetInstanceEditor = componentRef.instance;
        if (isSignal(this.widgetInstanceEditor.config)) {
          this.widgetInstanceEditorRef.setInput('config', this.widgetConfig);
        } else {
          this.widgetInstanceEditor.config = this.widgetConfig!;
        }
        // To be used by webcomponent wrapper
        if ('statusChangesHandler' in this.widgetInstanceEditor) {
          this.widgetInstanceEditor.statusChangesHandler = this.handleStatusChanges.bind(this);
        }

        let hasStatusChangesEmitter = false;
        if (this.widgetInstanceEditor.statusChanges) {
          hasStatusChangesEmitter = true;
          this.subscriptions.push(
            this.widgetInstanceEditor.statusChanges.subscribe(statusChanges => {
              this.handleStatusChanges(statusChanges);
            }) as Subscription
          );
        }

        if (this.widgetInstanceEditor.configChange) {
          this.subscriptions.push(
            this.widgetInstanceEditor.configChange.subscribe(config => {
              if (!hasStatusChangesEmitter) {
                this.invalidConfig.set(!!config.invalid);
                this.widgetConfigModified = true;
              }
            }) as Subscription
          );
        }

        if (this.isEditorWizdard(this.widgetInstanceEditor)) {
          this.editorWizardState.set(this.widgetInstanceEditor.state);

          if (this.widgetInstanceEditor.stateChange) {
            this.subscriptions.push(
              this.widgetInstanceEditor.stateChange.subscribe(state => {
                this.editorWizardState.set(state);
              }) as Subscription
            );
          }
        }
      },
      error: error => {
        console.error(error);
      }
    });
  }

  private tearDownEditor(): void {
    this.invalidConfig.set(false);
    this.widgetConfigModified = false;
    this.editorWizardState.set(undefined);
    this.widgetInstanceEditor = undefined;
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions = [];
  }

  private setupCatalog(): void {
    if (this.editorHost().length > 0) {
      this.editorHost().remove(0);
    }
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
    if (widget?.componentFactory?.editorComponentName) {
      this.hasEditor.set(true);
    } else {
      this.hasEditor.set(false);
    }
  }

  private isEditorWizdard(
    editor?: WidgetInstanceEditor | WidgetInstanceEditorWizard
  ): editor is WidgetInstanceEditorWizard {
    return !!editor && 'state' in editor;
  }

  private handleStatusChanges(statusChanges: Partial<WidgetConfigStatus>): void {
    if (statusChanges.invalid !== undefined) {
      this.invalidConfig.set(statusChanges.invalid);
    }
    if (statusChanges.modified !== undefined) {
      this.widgetConfigModified = statusChanges.modified;
    }
  }
}
