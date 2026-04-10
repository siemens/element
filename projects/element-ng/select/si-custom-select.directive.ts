/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ConfigurableFocusTrap, ConfigurableFocusTrapFactory } from '@angular/cdk/a11y';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { isPlatformBrowser } from '@angular/common';
import {
  booleanAttribute,
  computed,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
  model,
  output,
  PLATFORM_ID,
  signal,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SI_FORM_ITEM_CONTROL, SiFormItemControl } from '@siemens/element-ng/form';
import { filter, merge, Subject, takeUntil } from 'rxjs';

/**
 * Host directive for building custom selects.
 *
 * Add this as a `hostDirective` on your component and expose the inputs/outputs you need.
 * The directive handles:
 * - {@link ControlValueAccessor} integration (`formControl`, `ngModel`, `[(value)]`)
 * - Disabled / readonly state management
 * - Overlay lifecycle for the dropdown (open/close)
 * - Focus management and focus trapping in the dropdown
 * - Opening the dropdown on click, Enter, Space, ArrowDown, ArrowUp
 * - {@link SiFormItemControl} integration
 *
 * Use {@link SiSelectDropdownDirective} to mark the dropdown template in your component,
 * and call {@link open}, {@link close}, {@link updateValue} from your component logic.
 *
 * @example
 * ```ts
 * @Component({
 *   selector: 'app-my-select',
 *   hostDirectives: [{
 *     directive: SiCustomSelectDirective,
 *     inputs: ['disabled', 'readonly', 'value'],
 *     outputs: ['valueChange']
 *   }],
 *   template: `
 *     <si-select-combobox>
 *       {{ select.value() }}
 *     </si-select-combobox>
 *     <ng-template si-select-dropdown>
 *       <button (click)="select.updateValue('new'); select.close()">Pick</button>
 *     </ng-template>
 *   `
 * })
 * export class MySelectComponent {
 *   readonly select = inject(SiCustomSelectDirective);
 * }
 * ```
 */
@Directive({
  selector: '[siCustomSelect]',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: SiCustomSelectDirective, multi: true },
    { provide: SI_FORM_ITEM_CONTROL, useExisting: SiCustomSelectDirective }
  ],
  host: {
    class: 'dropdown',
    '[style.--si-action-icon-offset.rem]': '1.5',
    role: 'combobox',
    'aria-autocomplete': 'none',
    '[attr.aria-haspopup]': '"listbox"',
    '[attr.aria-expanded]': 'isOpen()',
    '[attr.aria-disabled]': 'disabled()',
    '[attr.tabindex]': 'disabled() ? "-1" : "0"',
    '[class.disabled]': 'disabled()',
    '[class.readonly]': 'readonly()',
    '[class.open]': 'isOpen()',
    '[class.show]': 'isOpen()',
    '(click)': 'open()',
    '(keydown.enter)': 'open()',
    '(keydown.space)': 'open()',
    '(keydown.arrowDown)': 'open()',
    '(keydown.arrowUp)': 'open()'
  }
})
export class SiCustomSelectDirective<T> implements ControlValueAccessor, SiFormItemControl {
  private static idCounter = 0;

  /**
   * Unique identifier.
   *
   * @defaultValue
   * ```
   * `__si-custom-select-${SiCustomSelectDirective.idCounter++}`
   * ```
   */
  readonly id = input(`__si-custom-select-${SiCustomSelectDirective.idCounter++}`);

  /**
   * Whether the select input is disabled.
   *
   * @defaultValue false
   */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly disabledInput = input(false, { alias: 'disabled', transform: booleanAttribute });

  /**
   * Readonly state. Similar to disabled but with higher contrast.
   *
   * @defaultValue false
   */
  readonly readonly = input(false, { transform: booleanAttribute });

  /** Emits when the dropdown open state changes. */
  readonly openChange = output<boolean>();

  /**
   * The current value, supports two-way binding via `[(value)]`.
   *
   * @defaultValue undefined
   */
  readonly value = model<T | undefined>(undefined);

  /**
   * Whether the dropdown is currently open.
   *
   * @defaultValue false
   */
  readonly isOpen = signal(false);

  /** @internal */
  readonly labelledby = computed(() => this.id() + '-label');

  /**
   * This ID will be bound to the `aria-describedby` attribute of the select.
   *
   * @defaultValue
   * ```
   * `${this.id()}-errormessage`
   * ```
   */
  readonly errormessageId = input(`${this.id()}-errormessage`);

  /** Combined disabled state from input and form control. */
  readonly disabled = computed(() => this.disabledInput() || this.disabledByForm());

  /** @internal */
  onTouched: () => void = () => {};

  private onChange: (_: T | undefined) => void = () => {};
  private readonly disabledByForm = signal(false);

  private readonly overlay = inject(Overlay);
  private readonly focusTrapFactory = inject(ConfigurableFocusTrapFactory);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private overlayRef?: OverlayRef;
  private focusTrap?: ConfigurableFocusTrap;
  private readonly closeOverlay$ = new Subject<void>();

  private dropdownTemplateRef?: TemplateRef<void>;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.disposeOverlay();
      this.closeOverlay$.complete();
    });
  }

  /**
   * Registers the dropdown template. Called by the component
   * that uses this directive, typically via a `viewChild` query.
   * @internal
   */
  registerDropdownTemplate(template: TemplateRef<void>): void {
    this.dropdownTemplateRef = template;
  }

  /**
   * Updates the value programmatically.
   * Call this from your dropdown template to set the new value.
   */
  updateValue(value: T): void {
    this.value.set(value);
    this.onChange(value);
  }

  /** Opens the dropdown overlay. */
  open(): void {
    if (this.disabled() || this.readonly() || this.isOpen() || !this.isBrowser) {
      return;
    }

    if (!this.dropdownTemplateRef) {
      return;
    }

    const width = this.elementRef.nativeElement.getBoundingClientRect().width;

    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(this.elementRef)
        .withPositions([
          { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
          { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' }
        ])
        .withFlexibleDimensions(true)
        .withPush(true),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      panelClass: ['dropdown-menu', 'show'],
      minWidth: width + 2
    });

    const portal = new TemplatePortal(this.dropdownTemplateRef, this.viewContainerRef);
    this.overlayRef.attach(portal);

    this.focusTrap = this.focusTrapFactory.create(this.overlayRef.overlayElement);
    this.focusTrap.focusFirstTabbableElementWhenReady();

    this.isOpen.set(true);
    this.openChange.emit(true);

    merge(
      this.overlayRef.backdropClick(),
      this.overlayRef.keydownEvents().pipe(filter(e => e.key === 'Escape'))
    )
      .pipe(takeUntil(this.closeOverlay$), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.close());
  }

  /** Closes the dropdown overlay and restores focus. */
  close(): void {
    if (!this.isOpen()) {
      return;
    }
    this.isOpen.set(false);
    this.disposeOverlay();
    this.openChange.emit(false);
    this.onTouched();
    if (this.isBrowser) {
      this.elementRef.nativeElement.focus();
    }
  }

  /** @internal */
  writeValue(obj: T): void {
    this.value.set(obj);
  }

  /** @internal */
  registerOnChange(fn: (_: T | undefined) => void): void {
    this.onChange = fn;
  }

  /** @internal */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /** @internal */
  setDisabledState(isDisabled: boolean): void {
    this.disabledByForm.set(isDisabled);
  }

  private disposeOverlay(): void {
    if (this.overlayRef) {
      this.closeOverlay$.next();
      this.focusTrap?.destroy();
      this.focusTrap = undefined;
      this.overlayRef.detach();
      this.overlayRef.dispose();
      this.overlayRef = undefined;
    }
  }
}
