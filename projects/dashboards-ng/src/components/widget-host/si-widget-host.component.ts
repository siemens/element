/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { AsyncPipe, NgClass, NgTemplateOutlet } from '@angular/common';
import {
  Component,
  ComponentRef,
  EnvironmentInjector,
  inject,
  Injector,
  input,
  isSignal,
  OnChanges,
  OnDestroy,
  OnInit,
  output,
  SimpleChanges,
  TemplateRef,
  viewChild,
  ViewContainerRef
} from '@angular/core';
import { SiActionDialogService } from '@siemens/element-ng/action-modal';
// We need one import from the main entry.
// Otherwise, module federation is confused.
// I don't know why.
import type { MenuItem as MenuItemLegacy } from '@siemens/element-ng/common';
import { ContentActionBarMainItem, ViewType } from '@siemens/element-ng/content-action-bar';
import { SiDashboardCardComponent } from '@siemens/element-ng/dashboard';
import { MenuItem } from '@siemens/element-ng/menu';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { WidgetConfig, WidgetConfigEvent, WidgetInstance } from '../../model/widgets.model';
import { SiGridService } from '../../services/si-grid.service';
import { setupWidgetInstance } from '../../widget-loader';

@Component({
  selector: 'si-widget-host',
  imports: [SiDashboardCardComponent, AsyncPipe, NgClass, NgTemplateOutlet],
  templateUrl: './si-widget-host.component.html',
  styleUrl: './si-widget-host.component.scss',
  host: {
    class: 'grid-stack-item'
  }
})
export class SiWidgetHostComponent implements OnInit, OnDestroy, OnChanges {
  private siModal = inject(SiActionDialogService);
  private gridService = inject(SiGridService);
  private injector = inject(Injector);
  private envInjector = inject(EnvironmentInjector);

  private unsubscribe = new Subject<void>();

  readonly widgetConfig = input.required<WidgetConfig>();

  readonly remove = output<string>();
  readonly edit = output<WidgetConfig>();
  readonly initCompleted = output<void>();

  readonly card = viewChild.required<SiDashboardCardComponent>('card');

  readonly widgetHost = viewChild.required('widgetHost', { read: ViewContainerRef });

  protected labelEdit = $localize`:@@DASHBOARD.WIDGET.EDIT:Edit`;
  protected labelRemove = $localize`:@@DASHBOARD.WIDGET.REMOVE:Remove`;
  protected labelExpand = $localize`:@@DASHBOARD.WIDGET.EXPAND:Expand`;
  protected labelRestore = $localize`:@@DASHBOARD.WIDGET.RESTORE:Restore`;
  protected labelDialogMessage = $localize`:@@DASHBOARD.REMOVE_WIDGET_CONFIRMATION_DIALOG.MESSAGE:Do you really want to remove the widget?`;
  protected labelDialogHeading = $localize`:@@DASHBOARD.REMOVE_WIDGET_CONFIRMATION_DIALOG.HEADING:Remove widget`;
  protected labelDialogRemove = $localize`:@@DASHBOARD.REMOVE_WIDGET_CONFIRMATION_DIALOG.REMOVE:Remove`;
  protected labelDialogCancel = $localize`:@@DASHBOARD.REMOVE_WIDGET_CONFIRMATION_DIALOG.CANCEL:Cancel`;

  widgetInstance?: WidgetInstance;
  widgetRef?: ComponentRef<WidgetInstance>;
  /** @defaultValue [] */
  primaryActions: (MenuItemLegacy | ContentActionBarMainItem)[] = [];
  /** @defaultValue [] */
  secondaryActions: (MenuItemLegacy | MenuItem)[] = [];
  /** @defaultValue 'expanded' */
  actionBarViewType: ViewType = 'expanded';
  editable$ = this.gridService.editable$;

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

  protected get accentLine(): string {
    const widgetConfig = this.widgetConfig();
    return widgetConfig.accentLine ? 'accent-' + widgetConfig.accentLine : '';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.widgetConfig) {
      if (this.widgetRef) {
        if (isSignal(this.widgetRef.instance.config)) {
          this.widgetRef.setInput('config', this.widgetConfig());
        } else {
          this.widgetRef.instance.config = this.widgetConfig();
        }
      }
    }
  }

  ngOnInit(): void {
    this.attachWidgetInstance();
    this.editable$
      .pipe<boolean>(takeUntil(this.unsubscribe))
      .subscribe(editable => this.setupEditable(editable));
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  private attachWidgetInstance(): void {
    const widget = this.gridService.getWidget(this.widgetConfig().widgetId);
    if (widget) {
      setupWidgetInstance(
        widget.componentFactory,
        this.widgetHost(),
        this.injector,
        this.envInjector
      ).subscribe({
        next: (widgetRef: ComponentRef<WidgetInstance>) => {
          this.widgetInstance = widgetRef.instance;
          this.widgetRef = widgetRef;
          if (this.widgetInstance.configChange) {
            // Note: setTimeout is needed to prevent ExpressionChangedAfterItHasBeenCheckedError
            // on web component, who pushes their configuration through an event after being attached
            // to the DOM.
            this.widgetInstance.configChange
              .pipe(takeUntil(this.unsubscribe))
              .subscribe(event =>
                setTimeout(() => this.setupEditable(this.editable$.value, event))
              );
          }
          if (isSignal(this.widgetInstance.config)) {
            this.widgetRef.setInput('config', this.widgetConfig());
          } else {
            this.widgetInstance.config = this.widgetConfig();
          }
          this.widgetInstanceFooter = this.widgetInstance.footer;
          this.setupEditable(this.gridService.editable$.value);

          this.initCompleted.emit();
        },
        error: error => console.error('Error: ', error)
      });
    } else {
      console.error(`Cannot find widget with id ${this.widgetConfig().widgetId}`);
      this.initCompleted.emit();
    }
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
    return (
      !widgetConfig.immutable &&
      !!this.gridService.getWidget(widgetConfig.widgetId)?.componentFactory?.editorComponentName
    );
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
