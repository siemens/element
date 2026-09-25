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
  ElementRef,
  EnvironmentInjector,
  inject,
  Injector,
  input,
  isSignal,
  OnChanges,
  output,
  runInInjectionContext,
  signal,
  SimpleChanges,
  TemplateRef,
  viewChild,
  ViewContainerRef
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { elementApps } from '@siemens/element-icons';
import { SiActionDialogService } from '@siemens/element-ng/action-modal';
// We need one import from the main entry.
// Otherwise, module federation is confused.
// I don't know why.
import type { MenuItem as MenuItemLegacy } from '@siemens/element-ng/common';
import { ContentActionBarMainItem, ViewType } from '@siemens/element-ng/content-action-bar';
import { SiDashboardCardComponent } from '@siemens/element-ng/dashboard';
import { SiEmptyStateComponent } from '@siemens/element-ng/empty-state';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { MenuItem } from '@siemens/element-ng/menu';
import {
  injectSiTranslateService,
  SiTranslatePipe,
  t
} from '@siemens/element-translate-ng/translate';
import { GridStack, GridItemHTMLElement } from 'gridstack';

import {
  WidgetComponentFactory,
  WidgetConfig,
  WidgetConfigEvent,
  WidgetInstance
} from '../../model/widgets.model';
import { setupWidgetInstance } from '../../widget-loader';
import { SiWidgetKeyboardInteractionDirective } from './si-widget-keyboard-interaction.directive';

@Component({
  selector: 'si-widget-host',
  imports: [
    SiDashboardCardComponent,
    SiEmptyStateComponent,
    NgTemplateOutlet,
    SiTranslatePipe,
    SiIconComponent,
    SiWidgetKeyboardInteractionDirective
  ],
  templateUrl: './si-widget-host.component.html',
  styleUrl: './si-widget-host.component.scss',
  host: {
    class: 'grid-stack-item',
    // In non-edit mode, expose each widget as a labeled list item so screen
    // readers group the widgets and let users jump between them. In edit mode
    // the inner card carries the interactive `application` role instead.
    '[attr.role]': "editable() ? null : 'listitem'",
    '[attr.aria-roledescription]': "editable() ? null : 'widget'",
    '[attr.aria-label]': 'editable() || !widgetAriaLabel() ? null : widgetAriaLabel()'
  }
})
export class SiWidgetHostComponent implements AfterViewInit, OnChanges {
  private readonly siModal = inject(SiActionDialogService);
  private readonly injector = inject(Injector);
  private readonly envInjector = inject(EnvironmentInjector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translateService = injectSiTranslateService();
  private readonly elementAppsIcon = addIcons({ elementApps }).elementApps;
  /** @internal */
  readonly elementRef = inject<ElementRef<GridItemHTMLElement>>(ElementRef).nativeElement;

  readonly widgetConfig = input.required<WidgetConfig>();
  readonly grid = input<GridStack>();

  /**
   * The component factory for this widget's type.
   */
  readonly componentFactory = input<WidgetComponentFactory>();

  /**
   * Icon for the widget, displayed in the configuration placeholder.
   *
   * @defaultValue this.elementAppsIcon
   */
  readonly widgetIcon = input<string>();

  /**
   * Sets the widget host into editable mode.
   *
   * @defaultValue false
   */
  readonly editable = input(false);

  readonly remove = output<string>();
  readonly edit = output<WidgetConfig>();
  readonly gridEvent = output<Event>();

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
  protected readonly widgetAriaLabel = computed(() => {
    const widgetHeading = this.widgetConfig().heading;
    if (widgetHeading) {
      return this.translateService.translateSync(widgetHeading);
    }
    return null;
  });
  protected readonly emptyStateIcon = computed(() => this.widgetIcon() ?? this.elementAppsIcon);

  widgetInstance?: WidgetInstance;
  widgetRef?: ComponentRef<WidgetInstance>;
  private attaching = false;
  /** @defaultValue [] */
  protected readonly primaryActions = signal<(MenuItemLegacy | ContentActionBarMainItem)[]>([]);
  /** @defaultValue [] */
  protected readonly secondaryActions = signal<(MenuItemLegacy | MenuItem)[]>([]);
  /** @defaultValue 'expanded' */
  protected readonly actionBarViewType = signal<ViewType>('expanded');
  /** @defaultValue [] */
  private readonly editablePrimaryActions = signal<(MenuItemLegacy | ContentActionBarMainItem)[]>(
    []
  );
  /** @defaultValue [] */
  private readonly editableSecondaryActions = signal<(MenuItemLegacy | MenuItem)[]>([]);

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
  private readonly editAction: ContentActionBarMainItem = {
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
  protected readonly widgetInstanceFooter = signal<TemplateRef<unknown> | undefined>(undefined);

  protected readonly accentLine = computed(() => {
    const { accentLine } = this.widgetConfig();
    return accentLine && !this.setupPending() ? 'accent-' + accentLine : '';
  });
  protected readonly setupPending = computed(() => !!this.widgetConfig().setupPending);
  protected readonly headingIconName = computed(() => {
    const icon = this.widgetConfig().headingIcon;
    return typeof icon === 'string' ? icon : icon && Object.keys(icon)[0];
  });

  ngOnChanges(changes: SimpleChanges<this>): void {
    if (changes.widgetConfig) {
      const headingIcon = this.widgetConfig().headingIcon;
      if (headingIcon && typeof headingIcon !== 'string') {
        runInInjectionContext(this.injector, () => addIcons(headingIcon));
      }
      const options = {
        ...this.widgetConfig(),
        w: this.widgetConfig().width,
        h: this.widgetConfig().height,
        x: this.widgetConfig().x,
        y: this.widgetConfig().y,
        minW: this.widgetConfig().minWidth,
        minH: this.widgetConfig().minHeight
      };
      if (!changes.widgetConfig.firstChange) {
        this.grid()?.update(this.elementRef, options);
      } else {
        this.grid()?.makeWidget(this.elementRef, options);
      }
    }
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
          this.widgetInstanceFooter.set(this.widgetInstance.footer);
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
    this.widgetInstanceFooter.set(undefined);
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
      this.editablePrimaryActions.set([]);
      if (this.isEditable()) {
        this.editablePrimaryActions.set([...this.editablePrimaryActions(), this.editAction]);
      }
      if (!this.widgetConfig().isNotRemovable) {
        this.editablePrimaryActions.set([...this.editablePrimaryActions(), this.removeAction]);
      }
      if (widgetConfig.primaryEditActions) {
        this.primaryActions.set([
          ...widgetConfig.primaryEditActions,
          ...this.editablePrimaryActions()
        ]);
      } else {
        this.primaryActions.set(this.editablePrimaryActions());
      }
      if (widgetConfig.secondaryEditActions) {
        this.secondaryActions.set([
          ...widgetConfig.secondaryEditActions,
          ...this.editableSecondaryActions()
        ]);
      } else {
        this.secondaryActions.set(this.editableSecondaryActions());
      }
      this.actionBarViewType.set('expanded');
    } else {
      this.actionBarViewType.set(this.widgetConfig().actionBarViewType ?? 'expanded');
      this.primaryActions.set(widgetConfig.primaryActions ?? []);
      this.secondaryActions.set(widgetConfig.secondaryActions ?? []);
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
