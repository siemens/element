/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  forwardRef,
  input,
  model,
  OnChanges,
  OnDestroy,
  OnInit,
  output,
  signal,
  SimpleChanges,
  viewChild
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { isRTL, listenGlobal } from '@siemens/element-ng/common';
import { SiIconComponent } from '@siemens/element-ng/icon';
import { SiTranslatePipe } from '@siemens/element-translate-ng/translate';

import { StatusToggleItem } from './status-toggle.model';

@Component({
  selector: 'si-status-toggle',
  imports: [NgClass, SiIconComponent, SiTranslatePipe],
  templateUrl: './si-status-toggle.component.html',
  styleUrl: './si-status-toggle.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      // eslint-disable-next-line @angular-eslint/no-forward-ref
      useExisting: forwardRef(() => SiStatusToggleComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiStatusToggleComponent implements ControlValueAccessor, OnInit, OnDestroy, OnChanges {
  /** List of status items. */
  readonly items = input.required<StatusToggleItem[]>();
  /**
   * Disabled state for the whole component.
   * @defaultValue false
   **/
  readonly disabled = input(false);
  /** Value of currently selected status item. */
  readonly value = model<string | number>();

  /** Emitted when an item is clicked. */
  readonly itemClick = output<string | number>();

  private readonly containerElement = viewChild.required<ElementRef>('container');
  private readonly draggableElement = viewChild.required<ElementRef>('draggable');

  private boundingX = 0;
  private x0 = 0;
  private offset0 = 0;
  private onChange?: (value: string | number) => void;
  private onTouched?: () => void;
  private unlistenDragEvents: (() => void)[] = [];
  private readonly internalDisabled = signal(false);

  protected readonly selectedIndex = signal<number | undefined>(undefined);
  protected readonly draggablePosition = signal('');
  protected readonly animated = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.internalDisabled());

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.value || changes.values) {
      this.setValue(this.value(), true, false);
    }
  }

  ngOnInit(): void {
    const selectedIndex = this.items().findIndex(v => v.value === this.value());
    if (selectedIndex >= 0) {
      this.selectItem(selectedIndex, false, false);
    }
  }

  ngOnDestroy(): void {
    this.handleDragEnd();
  }

  /** @internal */
  writeValue(value: string | number): void {
    this.setValue(value, true, false);
  }

  /** @internal */
  registerOnChange(fn: (value: string | number) => void): void {
    this.onChange = fn;
  }

  /** @internal */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /** @internal */
  setDisabledState(isDisabled: boolean): void {
    this.internalDisabled.set(isDisabled);
  }

  protected handleMouseDown(event: MouseEvent): void {
    if (this.isDisabled() || event.buttons !== 1) {
      return;
    }
    if (this.handleDragStart(event)) {
      this.unlistenDragEvents.push(listenGlobal('mousemove', e => this.handleDragMove(e)));
      this.unlistenDragEvents.push(listenGlobal('mouseup', e => this.handleDragEnd(e)));
    }
  }

  protected handleTouchStart(event: TouchEvent): void {
    if (event.touches.length !== 1 || this.disabled()) {
      return;
    }
    if (this.handleDragStart(event)) {
      this.unlistenDragEvents.push(listenGlobal('touchmove', e => this.handleDragMove(e), true));
      this.unlistenDragEvents.push(listenGlobal('touchend', e => this.handleDragEnd(e)));
    }
  }

  private handleDragStart(event: Event): boolean {
    const rect = this.containerElement().nativeElement.getBoundingClientRect();
    this.boundingX = rect.x;
    const draggable = this.draggableElement().nativeElement;

    this.offset0 = draggable.offsetLeft;
    this.x0 = this.getX(event);

    // adjust for click outside current selection
    const clickIndex = this.getUnderlyingIndex(this.x0, true);
    const currentIndex = this.getUnderlyingIndex(this.offset0);
    const factor = isRTL() ? -1 : 1;
    this.offset0 += (clickIndex - currentIndex) * draggable.offsetWidth * factor;

    this.handleDragMove(event);
    return true;
  }

  private handleDragEnd(event?: Event): void {
    this.arrangeToUnderlyingItem(event);
    this.unlistenDragEvents.forEach(handler => handler());
    this.unlistenDragEvents.length = 0;
  }

  private getOffset(event: Event, isStart = false): number {
    const containerWidth = this.containerElement().nativeElement.clientWidth;
    const draggableWidth = this.draggableElement().nativeElement.clientWidth;

    const dX = this.getX(event) - this.x0;
    const left = Math.min(Math.max(0, this.offset0 + dX), containerWidth - draggableWidth);
    return isStart && isRTL() ? containerWidth - draggableWidth - left : left;
  }

  private getUnderlyingIndex(offsetLeft: number, floor = false): number {
    const pos = offsetLeft / this.draggableElement().nativeElement.clientWidth;
    const element = floor ? Math.floor(pos) : Math.round(pos);
    const len = this.items().length;
    const index = isRTL() ? len - element - 1 : element;
    return Math.max(0, Math.min(len - 1, index));
  }

  private arrangeToUnderlyingItem(event?: Event): void {
    if (event && !this.isDisabled()) {
      const index = this.getUnderlyingIndex(this.getOffset(event));
      this.selectItem(this.items()[index].disabled ? this.selectedIndex() : index);
      this.onTouched?.();
    }
  }

  private handleDragMove(event: Event): void {
    if (event.cancelable) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.draggablePosition.set(`${this.getOffset(event, true)}px`);
    this.animated.set(false);
  }

  private getX(event: Event): number {
    const clientX =
      (event as MouseEvent).clientX ?? (event as TouchEvent).changedTouches[0]?.clientX ?? '';
    return clientX - this.boundingX;
  }

  private setValue(val?: string | number, animated = true, emit = false): void {
    this.selectItem(
      this.items().findIndex(v => v.value === val),
      animated,
      emit
    );
  }

  protected selectItem(index: number | undefined, animated = true, emit = true): void {
    if (index === undefined || index === -1 || this.isDisabled()) {
      return;
    }

    const values = this.items();
    const value = values[index];
    if (!value.disabled) {
      const prevIndex = this.selectedIndex();

      this.value.set(value.value);
      this.animated.set(animated);
      this.selectedIndex.set(index);
      this.draggablePosition.set(`${(100 / values.length) * index}%`);

      if (emit && index !== prevIndex) {
        if (this.onChange) {
          this.onChange(this.value()!);
        }
      }

      if (emit) {
        this.itemClick.emit(this.value()!);
      }
    }
  }
}
