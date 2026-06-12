/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { NgTemplateOutlet } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ComponentRef,
  computed,
  DestroyRef,
  EnvironmentInjector,
  inject,
  Injector,
  input,
  isSignal,
  OnChanges,
  output,
  SimpleChanges,
  TemplateRef,
  viewChild,
  ViewContainerRef
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SiActionDialogService } from '@siemens/element-ng/action-modal';
// We need one import from the main entry.
// Otherwise, module federation is confused.
// I don't know why.
import type { MenuItem as MenuItemLegacy } from '@siemens/element-ng/common';
import { ContentActionBarMainItem, ViewType } from '@siemens/element-ng/content-action-bar';
import { SiDashboardCardComponent } from '@siemens/element-ng/dashboard';
import { SiEmptyStateComponent } from '@siemens/element-ng/empty-state';
import { MenuItem } from '@siemens/element-ng/menu';
import { t } from '@siemens/element-translate-ng/translate';

import {
  WidgetComponentFactory,
  WidgetConfig,
  WidgetConfigEvent,
  WidgetInstance
} from '../../model/widgets.model';
import { setupWidgetInstance } from '../../widget-loader';

@Component({
  selector: 'si-widget-host',
  imports: [SiDashboardCardComponent, SiEmptyStateComponent, NgTemplateOutlet],
  templateUrl: './si-widget-host.component.html',
  styleUrl: './si-widget-host.component.scss',
  host: {
    class: 'grid-stack-item'
  }
})
export class SiWidgetHostComponent implements AfterViewInit, OnChanges {
  private readonly siModal = inject(SiActionDialogService);
  private readonly injector = inject(Injector);
  private readonly envInjector = inject(EnvironmentInjector);
  private readonly destroyRef = inject(DestroyRef);

  readonly widgetConfig = input.required<WidgetConfig>();

  /**
   * The component factory for this widget's type.
   */
  readonly componentFactory = input<WidgetComponentFactory>();

  /**
   * CSS icon class for the widget, displayed in the configuration placeholder.
   *
   * @defaultValue 'element-apps'
   */
  readonly iconClass = input('element-apps');

  /**
   * Sets the widget host into editable mode.
   *
   * @defaultValue false
   */
  readonly editable = input(false);

  readonly remove = output<string>();
  readonly edit = output<WidgetConfig>();

  readonly card = viewChild.required<SiDashboardCardComponent>('card');

  readonly widgetHost = viewChild.required('widgetHost', { read: ViewContainerRef });

  protected labelEdit = t(() => $localize`:@@DASHBOARD.WIDGET.EDIT:Edit`);
  protected labelRemove = t(() => $localize`:@@DASHBOARD.WIDGET.REMOVE:Remove`);
  protected labelSetup = t(() => $localize`:@@DASHBOARD.WIDGET.SETUP:Setup required`);
  protected labelSetupMessage = t(
    () => $localize`:@@DASHBOARD.WIDGET.SETUP_MESSAGE:Edit widget to display data`
  );
  protected labelExpand = t(() => $localize`:@@DASHBOARD.WIDGET.EXPAND:Expand`);
  protected labelRestore = t(() => $localize`:@@DASHBOARD.WIDGET.RESTORE:Restore`);
  protected labelDialogMessage = t(
    () =>
      $localize`:@@DASHBOARD.REMOVE_WIDGET_CONFIRMATION_DIALOG.MESSAGE:Do you really want to remove the widget?`
  );
  protected labelDialogHeading = t(
    () => $localize`:@@DASHBOARD.REMOVE_WIDGET_CONFIRMATION_DIALOG.HEADING:Remove widget`
  );
  protected labelDialogRemove = t(
    () => $localize`:@@DASHBOARD.REMOVE_WIDGET_CONFIRMATION_DIALOG.REMOVE:Remove`
  );
  protected labelDialogCancel = t(
    () => $localize`:@@DASHBOARD.REMOVE_WIDGET_CONFIRMATION_DIALOG.CANCEL:Cancel`
  );

  protected readonly emptyStateIcon = computed(() => `${this.iconClass()} si-display-xl`);

  widgetInstance?: WidgetInstance;
  widgetRef?: ComponentRef<WidgetInstance>;
  private attaching = false;
  /** @defaultValue [] */
  primaryActions: (MenuItemLegacy | ContentActionBarMainItem)[] = [];
  /** @defaultValue [] */
  secondaryActions: (MenuItemLegacy | MenuItem)[] = [];
  /** @defaultValue 'expanded' */
  actionBarViewType: ViewType = 'expanded';
  /** @defaultValue [] */
  editablePrimaryActions: (MenuItemLegacy | ContentActionBarMainItem)[] = [];
  /** @defaultValue [] */
  editableSecondaryActions: (MenuItemLegacy | MenuItem)[] = [];

  /**
   * @defaultValue
   * ```
   * {
   *   type: 'action',
   *   label: this.labelEdit,
   *   icon: 'element-edit',
   *   iconOnly: true,
   *   action: () => this.onEdit()
   * }
   * ```
   */
  editAction: ContentActionBarMainItem = {
    type: 'action',
    label: this.labelEdit,
    icon: 'element-edit',
    iconOnly: true,
    action: () => this.onEdit()
  };
  /**
   * @defaultValue
   * ```
   * {
   *   type: 'action',
   *   label: this.labelRemove,
   *   icon: 'element-delete',
   *   iconOnly: true,
   *   action: () => this.onRemove()
   * }
   * ```
   */
  removeAction: ContentActionBarMainItem = {
    type: 'action',
    label: this.labelRemove,
    icon: 'element-delete',
    iconOnly: true,
    action: () => this.onRemove()
  };
  protected widgetInstanceFooter?: TemplateRef<unknown>;

  protected readonly accentLine = computed(() => {
    const { accentLine } = this.widgetConfig();
    return accentLine && !this.setupPending() ? 'accent-' + accentLine : '';
  });
  protected readonly setupPending = computed(() => !!this.widgetConfig().setupPending);

  ngOnChanges(changes: SimpleChanges<this>): void {
    if (changes.componentFactory && !changes.componentFactory.firstChange) {
      this.detachWidgetInstance();
      this.syncWidgetAttachment();
    }

    if (changes.widgetConfig && !changes.widgetConfig.firstChange) {
      this.syncWidgetAttachment();
      if (this.widgetRef) {
        if (isSignal(this.widgetRef.instance.config)) {
          this.widgetRef.setInput('config', this.widgetConfig());
        } else {
          this.widgetRef.instance.config = this.widgetConfig();
        }
      }
    }

    if (changes.editable && !changes.editable.firstChange) {
      this.setupEditable(this.editable());
    }
  }

  ngAfterViewInit(): void {
    this.syncWidgetAttachment();
  }

  private syncWidgetAttachment(): void {
    if (this.widgetConfig().setupPending) {
      this.detachWidgetInstance();
      this.setupEditable(this.editable());
      return;
    }

    if (!this.widgetRef) {
      this.attachWidgetInstance();
    }
  }

  private attachWidgetInstance(): void {
    if (this.widgetRef || this.attaching) {
      return;
    }

    const componentFactory = this.componentFactory();
    if (componentFactory) {
      this.attaching = true;
      setupWidgetInstance(
        componentFactory,
        this.widgetHost(),
        this.injector,
        this.envInjector
      ).subscribe({
        next: (widgetRef: ComponentRef<WidgetInstance>) => {
          this.attaching = false;
          this.widgetInstance = widgetRef.instance;
          this.widgetRef = widgetRef;
          if (this.widgetInstance.configChange) {
            // Note: setTimeout is needed to prevent ExpressionChangedAfterItHasBeenCheckedError
            // on web component, who pushes their configuration through an event after being attached
            // to the DOM.
            this.widgetInstance.configChange
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe(event => setTimeout(() => this.setupEditable(this.editable(), event)));
          }
          if (isSignal(this.widgetInstance.config)) {
            this.widgetRef.setInput('config', this.widgetConfig());
          } else {
            this.widgetInstance.config = this.widgetConfig();
          }
          this.widgetInstanceFooter = this.widgetInstance.footer;
          this.setupEditable(this.editable());
        },
        error: error => {
          this.attaching = false;
          console.error('Error: ', error);
        }
      });
    } else {
      console.error(`Cannot find widget with id ${this.widgetConfig().widgetId}`);
    }
  }

  private detachWidgetInstance(): void {
    this.widgetRef?.destroy();
    this.widgetRef = undefined;
    this.widgetInstance = undefined;
    this.widgetInstanceFooter = undefined;
    this.widgetHost().clear();
  }

  setupEditable(editable: boolean, widgetConfig?: WidgetConfigEvent): void {
    widgetConfig ??= {
      primaryActions: this.widgetInstance?.primaryActions,
      secondaryActions: this.widgetInstance?.secondaryActions,
      primaryEditActions: this.widgetInstance?.primaryEditActions,
      secondaryEditActions: this.widgetInstance?.secondaryEditActions
    };
    if (editable) {
      this.editablePrimaryActions = [];
      if (this.isEditable()) {
        this.editablePrimaryActions.push(this.editAction);
      }
      if (!this.widgetConfig().isNotRemovable) {
        this.editablePrimaryActions.push(this.removeAction);
      }
      if (widgetConfig.primaryEditActions) {
        this.primaryActions = [...widgetConfig.primaryEditActions, ...this.editablePrimaryActions];
      } else {
        this.primaryActions = this.editablePrimaryActions;
      }
      if (widgetConfig.secondaryEditActions) {
        this.secondaryActions = [
          ...widgetConfig.secondaryEditActions,
          ...this.editableSecondaryActions
        ];
      } else {
        this.secondaryActions = this.editableSecondaryActions;
      }
      this.actionBarViewType = 'expanded';
    } else {
      this.actionBarViewType = this.widgetConfig().actionBarViewType ?? 'expanded';
      this.primaryActions = widgetConfig.primaryActions ?? [];
      this.secondaryActions = widgetConfig.secondaryActions ?? [];
    }

    if (this.widgetInstance?.editable !== undefined) {
      if (isSignal(this.widgetInstance.editable)) {
        this.widgetRef?.setInput('editable', editable);
      } else {
        this.widgetInstance.editable = editable;
      }
    }
  }

  private doRemove(): void {
    const card = this.card();
    if (card.isExpanded()) {
      card.restore();
    }
    const widgetConfig = this.widgetConfig();
    if (widgetConfig.id) {
      this.remove.emit(widgetConfig.id);
    }
  }

  private isEditable(): boolean {
    const widgetConfig = this.widgetConfig();
    return !widgetConfig.immutable && !!this.componentFactory()?.editorComponentName;
  }

  onEdit(): void {
    this.edit.emit(this.widgetConfig());
  }

  onRemove(): void {
    this.siModal
      .showActionDialog({
        type: 'delete-confirm',
        message: this.labelDialogMessage,
        heading: this.labelDialogHeading,
        deleteBtnName: this.labelDialogRemove,
        cancelBtnName: this.labelDialogCancel
      })
      .subscribe(result => {
        if (result === 'delete') {
          this.doRemove();
        }
      });
  }
}
