/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Directive, ElementRef, inject, input, linkedSignal, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { SiDashboardCardComponent } from '@siemens/element-ng/dashboard';
import { injectSiTranslateService, t } from '@siemens/element-translate-ng/translate';
import { GridItemHTMLElement, GridStackNode } from 'gridstack';
import { first } from 'rxjs';

@Directive({
  selector: 'si-dashboard-card[siWidgetKeyboardInteraction]',
  host: {
    '[class.shadow-3]': 'keyboardActive()',
    '[class.si-widget-keyboard-active]': 'keyboardActive()',
    '[attr.aria-description]': 'editable() && !card.isExpanded() ? a11yWidgetDescription() : null',
    '(keydown.enter)': 'onToggleActive($event)',
    '(keydown.space)': 'onToggleActive($event)',
    '(keydown.escape)': 'onDeactivate($event)',
    '(keydown.arrowRight)': 'onArrowKey($event)',
    '(keydown.arrowLeft)': 'onArrowKey($event)',
    '(keydown.arrowUp)': 'onArrowKey($event)',
    '(keydown.arrowDown)': 'onArrowKey($event)',
    '(keydown.shift.arrowRight)': 'onArrowKey($event)',
    '(keydown.shift.arrowLeft)': 'onArrowKey($event)',
    '(keydown.shift.arrowUp)': 'onArrowKey($event)',
    '(keydown.shift.arrowDown)': 'onArrowKey($event)',
    '(focusout)': 'onFocusOut()'
  },
  exportAs: 'siWidgetKeyboardInteraction'
})
export class SiWidgetKeyboardInteractionDirective {
  protected readonly card = inject(SiDashboardCardComponent);
  private readonly cardElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly liveAnnouncer = inject(LiveAnnouncer);
  private readonly translateService = injectSiTranslateService();

  readonly siWidgetKeyboardInteraction = input.required<GridItemHTMLElement>();
  readonly editable = input.required<boolean>();
  readonly gridEvent = output<Event>();
  /** @defaultValue false */
  readonly keyboardActive = linkedSignal({
    source: this.editable,
    computation: (editable, previous) => editable && (previous?.value ?? false)
  });

  protected readonly a11yWidgetDescription = toSignal(
    this.translateService.translateAsync(
      t(
        () =>
          $localize`:@@DASHBOARD.WIDGET.A11Y.DESCRIPTION:Press Enter or Space to activate. Then use arrow keys to move, Shift+arrow keys to resize, Escape to exit.`
      )
    ),
    { initialValue: '' }
  );
  private readonly a11yWidgetMovedMessage = t(
    () => $localize`:@@DASHBOARD.WIDGET.A11Y.MOVED:Widget moved to column {{column}}, row {{row}}.`
  );
  private readonly a11yWidgetResizedMessage = t(
    () =>
      $localize`:@@DASHBOARD.WIDGET.A11Y.RESIZED:Widget resized to {{columns}} columns wide, {{rows}} rows tall.`
  );
  private readonly a11yWidgetActivatedMessage = t(
    () =>
      $localize`:@@DASHBOARD.WIDGET.A11Y.ACTIVATED:Widget activated. Use arrow keys to move, Shift+arrow keys to resize, Escape to exit.`
  );
  private readonly a11yWidgetDeactivatedMessage = t(
    () => $localize`:@@DASHBOARD.WIDGET.A11Y.DEACTIVATED:Widget deactivated.`
  );
  private moveInProgress = false;

  protected onToggleActive(event: Event): void {
    if (!this.editable() || this.card.isExpanded() || event.target !== event.currentTarget) {
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
    if (this.keyboardActive() && !this.moveInProgress) {
      this.keyboardActive.set(false);
    }
  }

  protected onArrowKey(event: Event): void {
    if (!this.keyboardActive()) {
      return;
    }

    const node = this.siWidgetKeyboardInteraction().gridstackNode;
    if (!node?.grid) {
      return;
    }

    const keyEvent = event as KeyboardEvent;
    this.moveInProgress = true;
    if (keyEvent.shiftKey) {
      this.handleResize(keyEvent, node);
    } else {
      this.handleMove(keyEvent, node);
    }
    this.cardElement.focus();
    this.moveInProgress = false;
  }

  private handleResize(event: KeyboardEvent, node: GridStackNode): void {
    const el = this.siWidgetKeyboardInteraction();
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
    node.grid!.update(el, { w, h });
    this.gridEvent.emit(new Event('resizestop'));
    this.announceTranslated(this.a11yWidgetResizedMessage, { columns: w, rows: h });
  }

  private handleMove(event: KeyboardEvent, node: GridStackNode): void {
    const el = this.siWidgetKeyboardInteraction();
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

  private announceTranslated(message: string, params: Record<string, unknown>): void {
    this.translateService
      .translateAsync(message, params)
      .pipe(first())
      .subscribe(msg => this.liveAnnouncer.announce(msg, 'assertive'));
  }
}
