/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  input,
  OnInit,
  signal,
  viewChild
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SI_FORM_ITEM_CONTROL, SiFormItemControl } from '@siemens/element-ng/form';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';

import { SiInputPillComponent } from './si-input-pill.component';
import {
  SiPillsInputValueHandlerDirective,
  SiPillsInputValueHandlerTrigger
} from './si-pills-input-value-handler';

@Component({
  selector: 'si-pills-input',
  imports: [SiInputPillComponent, SiTranslatePipe],
  templateUrl: './si-pills-input.component.html',
  styleUrl: './si-pills-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: SiPillsInputComponent,
      multi: true
    },
    {
      provide: SI_FORM_ITEM_CONTROL,
      useExisting: SiPillsInputComponent
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'form-control',
    role: 'listbox',
    'aria-orientation': 'horizontal',
    '[class.disabled]': 'disabled()',
    '[attr.aria-disabled]': 'disabled()',
    '[class.readonly]': 'readonly()',
    '[attr.aria-readonly]': 'readonly()',
    // using attr so that tabindex is removed if not defined
    '[attr.tabindex]': 'tabindex()',
    '[attr.aria-activedescendant]': 'activeDescendant()',
    '[attr.aria-labelledby]': 'labelledby()',
    '[attr.aria-describedby]': 'errormessageId'
  }
})
export class SiPillsInputComponent implements OnInit, ControlValueAccessor, SiFormItemControl {
  private static idCounter = 0;

  /**
   * The identifier of the pills-input. Will be generated if not provided.
   *
   * @defaultValue
   * ```
   * `__si-pills-input-${SiPillsInputComponent.idCounter++}`
   * ```
   */
  readonly id = input(`__si-pills-input-${SiPillsInputComponent.idCounter++}`);

  /**
   * The aria-label for the inner input where users enter new items.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_PILLS_INPUT.INPUT_ELEMENT_ARIA_LABEL:Create item`)
   * ```
   */
  readonly inputElementAriaLabel = input(
    t(() => $localize`:@@SI_PILLS_INPUT.INPUT_ELEMENT_ARIA_LABEL:Create item`)
  );

  /**
   * Whether the pills-input is disabled.
   *
   * @defaultValue false
   */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly disabledInput = input(false, { alias: 'disabled', transform: booleanAttribute });

  /**
   * Whether the pills-input is readonly
   *
   * @defaultValue false
   */
  readonly readonly = input(false, { transform: booleanAttribute });

  /** The placeholder to be shown if no value is currently present. */
  readonly placeholder = input<string>();

  /**
   * @defaultValue
   * ```
   * `${this.id()}-label`
   * ```
   */
  readonly labelledby = input(`${this.id()}-label`);

  /** @internal */
  readonly errormessageId = `${this.id()}-errormessage`;

  protected inputValue = '';
  protected onTouched: () => void = () => {};
  protected onChange: (val: any) => void = () => {};

  protected readonly pills = signal<string[]>([]);
  protected readonly activePillIndex = signal<number | undefined>(undefined);
  protected readonly inputId = computed(() => `${this.id()}-input`);
  protected readonly disabled = computed(() => this.disabledInput() || this.disabledNgControl());
  protected readonly activeDescendant = computed(() => {
    const activePillIndex = this.activePillIndex();
    return activePillIndex !== undefined ? `${this.id()}-pill-${activePillIndex}` : null;
  });

  protected readonly tabindex = computed(() =>
    this.disabled() ? undefined : this.readonly() ? 0 : -1
  );
  private readonly inputElement = viewChild<ElementRef<HTMLInputElement>>('inputElement');
  private readonly disabledNgControl = signal(false);
  private siPillsInputValueHandlerDirective = inject(SiPillsInputValueHandlerDirective, {
    optional: true
  });
  private readonly cdRef = inject(ChangeDetectorRef);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  ngOnInit(): void {
    this.siPillsInputValueHandlerDirective ??= {
      handle: (value, trigger) => {
        if (trigger !== 'input') {
          return {
            newPills: [value],
            newValue: ''
          };
        }
        return undefined;
      }
    };
  }

  protected input(): void {
    this.inputValue = this.inputElement()!.nativeElement.value;
    this.rebuildValue(this.inputValue, 'input');
  }

  @HostListener('click')
  protected click(): void {
    this.inputElement()?.nativeElement.focus();
  }

  protected blur(): void {
    this.rebuildValue(this.inputValue, 'blur');
    this.activePillIndex.set(undefined);
    this.onTouched();
  }

  protected keydownEnter(event: Event): void {
    this.rebuildValue(this.inputValue, 'keydown.enter');
    event.preventDefault();
  }

  protected keydownBackspace(event: Event): void {
    const count = this.pills().length;
    if (!this.inputValue && count) {
      const lastChipValue = this.pills().at(-1)!;
      this.remove(count - 1, false);
      this.inputValue = lastChipValue;
      event.preventDefault();
    }
  }

  protected remove(index: number, focus = true): void {
    this.pills.update(pills => pills.filter((_, pillIndex) => index !== pillIndex));
    this.onTouched();
    this.onChange(this.pills());
    if (focus) {
      this.inputElement()!.nativeElement.focus();
    }
  }

  private rebuildValue(value: string, trigger: SiPillsInputValueHandlerTrigger): void {
    if (value) {
      const valueParseResult = this.siPillsInputValueHandlerDirective?.handle(value, trigger);
      if (valueParseResult) {
        this.pills.update(pills => [...pills, ...valueParseResult.newPills]);
        // Doesn't update when setting to empty string.
        // Not using setTimeout to avoid flickering.
        this.cdRef.detectChanges();
        this.inputValue = valueParseResult.newValue;
        this.cdRef.detectChanges();

        if (valueParseResult.newPills.length) {
          this.onTouched();
          this.onChange(this.pills());
        }
      }
    }
  }

  @HostListener('keydown.arrowLeft') protected arrowLeft(): void {
    const activePillIndex = this.activePillIndex();
    const count = this.pills().length;
    if (activePillIndex !== undefined) {
      this.activePillIndex.set(Math.max(0, activePillIndex - 1));
    } else if (!this.inputValue.length && count) {
      this.elementRef.nativeElement.focus();
      this.activePillIndex.set(count - 1);
    }
  }

  @HostListener('keydown.arrowRight') protected arrowRight(): void {
    const activePillIndex = this.activePillIndex();
    if (activePillIndex !== undefined) {
      this.activePillIndex.set(activePillIndex + 1);

      if (this.activePillIndex()! >= this.pills().length) {
        this.inputElement()?.nativeElement.focus();
        this.activePillIndex.set(undefined);
      }
    }
  }

  @HostListener('keydown.backspace')
  @HostListener('keydown.delete')
  protected delete(): void {
    const activePillIndex = this.activePillIndex();
    const count = this.pills().length;
    if (activePillIndex !== undefined && !this.readonly()) {
      const targetIndex = count > 1 ? Math.min(activePillIndex, count - 2) : undefined;
      this.remove(activePillIndex, targetIndex === undefined);
      this.activePillIndex.set(targetIndex);
    }
  }

  /** @internal */
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  /** @internal */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /** @internal */
  setDisabledState(isDisabled: boolean): void {
    this.disabledNgControl.set(isDisabled);
  }

  /** @internal */
  writeValue(value?: string[] | null): void {
    this.pills.set(value?.slice() ?? []);
  }
}
