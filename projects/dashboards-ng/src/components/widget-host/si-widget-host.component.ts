/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { NgTemplateOutlet } from '@angular/common';
import {
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
  OnInit,
  output,
  signal,
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
import { MenuItem } from '@siemens/element-ng/menu';
import {
  injectSiTranslateService,
  SiTranslatePipe,
  t
} from '@siemens/element-translate-ng/translate';
import { GridItemHTMLElement, GridStackNode } from 'gridstack';
import { first } from 'rxjs';

import {
  WidgetComponentFactory,
  WidgetConfig,
  WidgetConfigEvent,
  WidgetInstance
} from '../../model/widgets.model';
import { setupWidgetInstance } from '../../widget-loader';

@Component({
  selector: 'si-widget-host',
  imports: [SiDashboardCardComponent, NgTemplateOutlet, SiTranslatePipe],
  templateUrl: './si-widget-host.component.html',
  styleUrl: './si-widget-host.component.scss',
  host: {
    class: 'grid-stack-item'
  }
})
export class SiWidgetHostComponent implements OnInit, OnChanges {
  private readonly siModal = inject(SiActionDialogService);
  private readonly injector = inject(Injector);
  private readonly envInjector = inject(EnvironmentInjector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translateService = injectSiTranslateService();
  private readonly liveAnnouncer = inject(LiveAnnouncer);
  private readonly elementRef = inject<ElementRef<GridItemHTMLElement>>(ElementRef).nativeElement;

  /** @defaultValue false */
  readonly keyboardActive = signal(false);

  readonly widgetConfig = input.required<WidgetConfig>();

  /**
   * The component factory for this widget's type.
   */
  readonly componentFactory = input<WidgetComponentFactory>();

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
  private a11yWidgetMovedMessage = t(
    () => $localize`:@@DASHBOARD.WIDGET.A11Y.MOVED:Widget moved to column {{column}}, row {{row}}.`
  );
  private a11yWidgetResizedMessage = t(
    () =>
      $localize`:@@DASHBOARD.WIDGET.A11Y.RESIZED:Widget resized to {{columns}} columns wide, {{rows}} rows tall.`
  );
  private a11yWidgetActivatedMessage = t(
    () =>
      $localize`:@@DASHBOARD.WIDGET.A11Y.ACTIVATED:Widget activated. Use arrow keys to move, Shift+arrow keys to resize, Escape to exit.`
  );
  private a11yWidgetDeactivatedMessage = t(
    () => $localize`:@@DASHBOARD.WIDGET.A11Y.DEACTIVATED:Widget deactivated.`
  );
  protected a11yWidgetDescription = t(
    () =>
      $localize`:@@DASHBOARD.WIDGET.A11Y.DESCRIPTION:Press Enter or Space to activate. Then use arrow keys to move, Shift+arrow keys to resize, Escape to exit.`
  );

  widgetInstance?: WidgetInstance;
  widgetRef?: ComponentRef<WidgetInstance>;
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
    return accentLine ? 'accent-' + accentLine : '';
  });

  ngOnChanges(changes: SimpleChanges<this>): void {
    if (changes.widgetConfig) {
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

  ngOnInit(): void {
    this.attachWidgetInstance();
  }

  protected onToggleActive(event: Event): void {
    if (!this.editable() || event.target !== event.currentTarget) {
      return;
    }
    event.preventDefault();
    const active = !this.keyboardActive();
    this.keyboardActive.set(active);
    this.announceTranslated(
      active ? this.a11yWidgetActivatedMessage : this.a11yWidgetDeactivatedMessage,
      {}
    );
  }

  protected onDeactivate(event: Event): void {
    if (!this.keyboardActive()) {
      return;
    }
    event.preventDefault();
    this.keyboardActive.set(false);
    this.announceTranslated(this.a11yWidgetDeactivatedMessage, {});
  }

  protected onFocusOut(): void {
    if (this.keyboardActive()) {
      this.keyboardActive.set(false);
    }
  }

  protected onArrowKey(event: Event): void {
    if (!this.keyboardActive()) {
      return;
    }

    const el = this.elementRef;
    const node = el?.gridstackNode;
    if (!node?.grid) {
      return;
    }

    const keyEvent = event as KeyboardEvent;
    if (keyEvent.shiftKey) {
      this.handleResize(keyEvent, node);
    } else {
      this.handleMove(keyEvent, node);
    }
  }

  private handleResize(event: KeyboardEvent, node: GridStackNode): void {
    const el = this.elementRef;
    let { w, h } = node;
    switch (event.key) {
      case 'ArrowRight':
        w = (w ?? 1) + 1;
        break;
      case 'ArrowLeft':
        w = Math.max(node.minW ?? 1, (w ?? 1) - 1);
        break;
      case 'ArrowDown':
        h = (h ?? 1) + 1;
        break;
      case 'ArrowUp':
        h = Math.max(node.minH ?? 1, (h ?? 1) - 1);
        break;
      default:
        return;
    }
    if (w === node.w && h === node.h) {
      return;
    }
    event.preventDefault();
    const grid = node.grid;
    grid!.update(el, { w, h });
    this.gridEvent.emit(new Event('resizestop'));
    this.announceTranslated(this.a11yWidgetResizedMessage, { columns: w, rows: h });
  }

  private handleMove(event: KeyboardEvent, node: GridStackNode): void {
    const el = this.elementRef;
    const { x, y } = node;
    const grid = node.grid;
    let newX = x ?? 0;
    let newY = y ?? 0;

    switch (event.key) {
      case 'ArrowRight':
        do {
          newX++;
          grid!.update(el, { x: newX, y });
        } while (node.x === x && newX < grid!.getColumn());
        break;
      case 'ArrowLeft':
        if (newX <= 0) {
          break;
        }
        do {
          newX--;
          grid!.update(el, { x: newX, y });
        } while (node.x === x && newX > 0);
        break;
      case 'ArrowDown':
        do {
          newY++;
          grid!.update(el, { x, y: newY });
        } while (node.y === y && newY < grid!.getRow());
        break;
      case 'ArrowUp':
        if (newY <= 0) {
          break;
        }
        do {
          newY--;
          grid!.update(el, { x, y: newY });
        } while (node.y === y && newY > 0);
        break;
      default:
        return;
    }
    event.preventDefault();
    this.gridEvent.emit(new Event('dragstop'));
    this.scrollIntoViewAfterTransition(el);
    this.announceTranslated(this.a11yWidgetMovedMessage, {
      column: (node.x ?? 0) + 1,
      row: (node.y ?? 0) + 1
    });
  }

  private scrollIntoViewAfterTransition(el: HTMLElement): void {
    const onEnd = (): void => {
      el.removeEventListener('transitionend', onEnd);
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    };
    el.addEventListener('transitionend', onEnd, { once: true });
  }

  private announce(message: string): void {
    this.liveAnnouncer.announce(message, 'assertive');
  }

  private announceTranslated(message: string, params: Record<string, unknown>): void {
    this.translateService
      .translateAsync(message, params)
      .pipe(first())
      .subscribe(msg => this.announce(msg));
  }

  private attachWidgetInstance(): void {
    const componentFactory = this.componentFactory();
    if (componentFactory) {
      setupWidgetInstance(
        componentFactory,
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
        error: error => console.error('Error: ', error)
      });
    } else {
      console.error(`Cannot find widget with id ${this.widgetConfig().widgetId}`);
    }
  }

  setupEditable(editable: boolean, widgetConfig?: WidgetConfigEvent): void {
    if (!editable) {
      this.keyboardActive.set(false);
    }
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
