/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  model,
  signal,
  viewChild
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { isRTL } from '@siemens/element-ng/common';
import { addIcons, elementOk, SiIconNextComponent } from '@siemens/element-ng/icon';
import { SiTranslateModule, TranslatableString } from '@siemens/element-translate-ng/translate';

/**
 * The Element data color palette is used as default.
 * Note: This array needs to be kept in sync with the design system data color tokens.
 */
const defaultDataColors: string[] = [
  'element-data-1',
  'element-data-2',
  'element-data-3',
  'element-data-4',
  'element-data-5',
  'element-data-6',
  'element-data-7',
  'element-data-8',
  'element-data-9',
  'element-data-10',
  'element-data-11',
  'element-data-12',
  'element-data-13',
  'element-data-14',
  'element-data-15',
  'element-data-16'
];
@Component({
  selector: 'si-color-picker',
  imports: [SiIconNextComponent, SiTranslateModule, CdkConnectedOverlay, CdkOverlayOrigin],
  templateUrl: './si-color-picker.component.html',
  styleUrl: './si-color-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: SiColorPickerComponent,
      multi: true
    }
  ]
})
export class SiColorPickerComponent implements ControlValueAccessor {
  // eslint-disable-next-line defaultValue/tsdoc-defaultValue-annotation
  /**
   * The color palette to choose the colors from. As colors, only valid CSS
   * variable names omitting the `--` prefix or Element color tokens omitting
   * the `$` prefix are supported.
   *
   * Note: If custom CSS variables are provided, they need to be defined for
   * both light and dark mode.
   *
   * @defaultValue The first 16 colors of the Element data color palette.
   */
  readonly colorPalette = input<string[]>(defaultDataColors);

  /**
   * The selected color.
   */
  readonly color = model<string>();

  /**
   * Specifies whether the color popup should automatically close on a color selection.
   *
   * @defaultValue false
   */
  readonly autoClose = input(false, { transform: booleanAttribute });

  /**
   * Specifies whether the color picker component is disabled.
   *
   * @defaultValue false
   */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly disabledInput = input(false, { alias: 'disabled' });

  /**
   * Aria label for the color input button.
   */
  readonly ariaLabel = input<TranslatableString>();

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  private readonly colorInputRef =
    viewChild.required<ElementRef<HTMLInputElement>>('colorInputBox');
  private readonly colorPaletteRef = viewChild<ElementRef<HTMLDivElement>>('colorPaletteRef');
  private readonly disabledNgControl = signal(false);
  private readonly numberOfColumns = 4;
  protected readonly disabled = computed(() => this.disabledInput() || this.disabledNgControl());
  protected readonly isOverlayOpen = signal(false);
  protected readonly icons = addIcons({ elementOk });

  protected blur(): void {
    if (!this.autoClose()) {
      this.onTouched();
    }
  }

  protected arrowDown(index: number, event: Event): void {
    const nextIndex = index + this.numberOfColumns;
    this.focusLabel(nextIndex);
    event.preventDefault();
  }

  protected arrowUp(index: number, event: Event): void {
    const prevIndex = index - this.numberOfColumns;
    this.focusLabel(prevIndex);
    event.preventDefault();
  }

  protected arrowLeft(index: number, event: Event): void {
    const prevIndex = index + (isRTL() ? 1 : -1);
    this.focusLabel(prevIndex);
    event.preventDefault();
  }

  protected arrowRight(index: number, event: Event): void {
    const prevIndex = index + (isRTL() ? -1 : +1);
    this.focusLabel(prevIndex);
    event.preventDefault();
  }

  private focusLabel(index: number): void {
    const labels = this.colorPaletteRef()!.nativeElement.querySelectorAll('input');
    const totalSwatches = labels.length;
    const normalizedIndex = (index + totalSwatches) % totalSwatches;
    labels[normalizedIndex].focus();
  }

  protected openOverlay(): void {
    this.isOverlayOpen.set(true);
    this.focusSelectedColor();
  }

  protected overlayDetach(): void {
    this.isOverlayOpen.set(false);
    setTimeout(() => {
      this.colorInputRef().nativeElement?.focus();
    });
  }

  private focusSelectedColor(): void {
    setTimeout(() => {
      this.colorPaletteRef()
        ?.nativeElement.querySelector<HTMLInputElement>('input:checked')
        ?.focus();
    });
  }

  protected selectColor(color: string): void {
    this.color.set(color);
    this.onChange(color!);
    if (this.autoClose()) {
      this.overlayDetach();
    }
  }

  writeValue(value: string): void {
    this.color.set(value);
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledNgControl.set(isDisabled);
  }
}
