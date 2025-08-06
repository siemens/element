/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  booleanAttribute,
  computed,
  Directive,
  ElementRef,
  HostListener,
  inject,
  input,
  Renderer2,
  signal
} from '@angular/core';
import { SI_FORM_ITEM_CONTROL } from '@spike-rabbit/element-ng/form';

const eventMap = new Map<string, 'insert' | 'delete' | 'paste'>([
  ['insertText', 'insert'],
  ['insertFromPaste', 'paste'],
  ['deleteContentBackward', 'delete']
]);

export interface AddrInputEvent {
  type?: 'insert' | 'delete' | 'paste';
  pos: number;
  change: string | null;
  value?: string | null;
  previous?: string | null;
}

/**
 * Base directive for ip address input fields.
 */
@Directive({
  selector: 'input[siIpInput]',
  providers: [
    {
      provide: SI_FORM_ITEM_CONTROL,
      useExisting: SiIpInputDirective
    }
  ],
  host: {
    '[id]': 'id()',
    '[disabled]': 'disabled() || null'
  }
})
export abstract class SiIpInputDirective {
  private static idCounter = 0;
  protected readonly elementRef = inject(ElementRef<HTMLInputElement>);
  protected readonly renderer = inject(Renderer2);
  protected readonly inputEl = this.elementRef.nativeElement;

  /**
   * @defaultValue
   * ```
   * `si-ip-input-${SiIpInputDirective.idCounter++}`
   * ```
   */
  readonly id = input(`si-ip-input-${SiIpInputDirective.idCounter++}`);

  /**
   * Enable CIDR (Classless Inter-Domain Routing) notation.
   * @defaultValue false
   */
  readonly cidr = input(false, { transform: booleanAttribute });

  /**
   * Whether the ip address input is disabled.
   * @defaultValue false
   */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly disabledInput = input(false, { alias: 'disabled' });

  private readonly disabledNgControl = signal(false);
  protected readonly disabled = computed(() => this.disabledInput() || this.disabledNgControl());
  protected onTouched: () => void = () => {};
  protected onChange: (value: any) => void = () => {};
  protected value?: string | null = '';

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledNgControl.set(isDisabled);
  }

  writeValue(value?: string | null): void {
    this.value = value;
    this.renderer.setProperty(this.inputEl, 'value', value ?? '');
  }

  @HostListener('input', ['$event'])
  protected onInput(e: Event): void {
    const el = e.target as HTMLInputElement;
    const selStart = el.selectionStart ?? 0;
    const { inputType, data } = e as InputEvent;
    const len = data?.length ?? 0;
    this.maskInput({
      value: el.value,
      type: eventMap.get(inputType),
      change: data,
      pos: selStart - len,
      previous: this.value
    });

    this.value = el.value;
    this.onChange(this.value);
  }

  @HostListener('blur')
  protected blur(): void {
    this.onTouched();
  }

  abstract maskInput(e: AddrInputEvent): void;
}
