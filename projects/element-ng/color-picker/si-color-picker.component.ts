/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import {
  booleanAttribute,
  Component,
  computed,
  ElementRef,
  input,
  model,
  signal,
  viewChild,
  viewChildren
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { elementOk } from '@siemens/element-icons';
import { defaultConnectedOverlayScrollStrategy, isRTL } from '@siemens/element-ng/common';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';

/**
 * The Element data color palette is used as default.
 * Note: This array needs to be kept in sync with the design system data color tokens.
 */
const defaultDataColors: string[] = [
  'si-sys-data-categorial-1',
  'si-sys-data-categorial-2',
  'si-sys-data-categorial-3',
  'si-sys-data-categorial-4',
  'si-sys-data-categorial-5',
  'si-sys-data-categorial-6',
  'si-sys-data-categorial-7',
  'si-sys-data-categorial-8',
  'si-sys-data-categorial-9',
  'si-sys-data-categorial-10',
  'si-sys-data-categorial-11',
  'si-sys-data-categorial-12',
  'si-sys-data-categorial-13',
  'si-sys-data-categorial-14',
  'si-sys-data-categorial-15',
  'si-sys-data-categorial-16'
];
@Component({
  selector: 'si-color-picker',
  imports: [SiIconComponent, SiTranslatePipe, CdkConnectedOverlay, CdkOverlayOrigin],
  templateUrl: './si-color-picker.component.html',
  styleUrl: './si-color-picker.component.scss',
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
   * Optional CDK scroll strategy used for the color picker overlay.
   *
   * @defaultValue defaultConnectedOverlayScrollStrategy()
   */
  readonly scrollStrategy = input(defaultConnectedOverlayScrollStrategy());

  /**
   * Specifies whether the color picker component is disabled.
   *
   * @defaultValue false
   */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly disabledInput = input(false, { alias: 'disabled' });

  /**
   * Aria label for the color input button.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_COLOR_PICKER.SELECTED_LABEL:Selected color {{color}}`)
   * ```
   */
  readonly ariaLabel = input(
    t(() => $localize`:@@SI_COLOR_PICKER.SELECTED_LABEL:Selected color {{color}}`)
  );

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  private readonly colorInputRef =
    viewChild.required<ElementRef<HTMLInputElement>>('colorInputBox');
  private readonly swatchInputs = viewChildren<ElementRef<HTMLInputElement>>('swatchInput');
  private readonly selectedSwatchInput = computed(() =>
    this.swatchInputs().find(swatchInput => swatchInput.nativeElement.checked)
  );
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
    const labels = this.swatchInputs();
    const totalSwatches = labels.length;
    const normalizedIndex = (index + totalSwatches) % totalSwatches;
    labels[normalizedIndex].nativeElement.focus();
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
      this.selectedSwatchInput()?.nativeElement.focus();
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
