/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Grid, GridCell, GridRow } from '@angular/aria/grid';
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
import { defaultConnectedOverlayScrollStrategy } from '@siemens/element-ng/common';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';

/**
 * The Element data color palette is used as default.
 * Note: This array needs to be kept in sync with the design system data color tokens.
 */
const defaultDataColors: string[] = [
  'si-sys-color-data-categorical-1',
  'si-sys-color-data-categorical-2',
  'si-sys-color-data-categorical-3',
  'si-sys-color-data-categorical-4',
  'si-sys-color-data-categorical-5',
  'si-sys-color-data-categorical-6',
  'si-sys-color-data-categorical-7',
  'si-sys-color-data-categorical-8',
  'si-sys-color-data-categorical-9',
  'si-sys-color-data-categorical-10',
  'si-sys-color-data-categorical-11',
  'si-sys-color-data-categorical-12',
  'si-sys-color-data-categorical-13',
  'si-sys-color-data-categorical-14',
  'si-sys-color-data-categorical-15',
  'si-sys-color-data-categorical-16'
];
@Component({
  selector: 'si-color-picker',
  imports: [
    SiIconComponent,
    SiTranslatePipe,
    CdkConnectedOverlay,
    CdkOverlayOrigin,
    Grid,
    GridRow,
    GridCell
  ],
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
  private static idCounter = 0;

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

  /**
   * Aria label for the color palette.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_COLOR_PICKER.PALETTE_LABEL:Color palette`)
   * ```
   */
  readonly colorPaletteAriaLabel = input(
    t(() => $localize`:@@SI_COLOR_PICKER.PALETTE_LABEL:Color palette`)
  );

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  private readonly colorInputRef =
    viewChild.required<ElementRef<HTMLInputElement>>('colorInputBox');
  private readonly swatches = viewChildren(GridCell);
  private readonly disabledNgControl = signal(false);
  private readonly numberOfColumns = 4;
  protected readonly disabled = computed(() => this.disabledInput() || this.disabledNgControl());
  protected readonly isOverlayOpen = signal(false);
  protected readonly paletteId = `__si-color-picker-palette-${SiColorPickerComponent.idCounter++}`;
  protected readonly icons = addIcons({ elementOk });

  /** The palette split into the visible rows, so that the grid navigation follows the layout. */
  protected readonly colorRows = computed(() => {
    const palette = this.colorPalette();
    const rows: string[][] = [];
    for (let i = 0; i < palette.length; i += this.numberOfColumns) {
      rows.push(palette.slice(i, i + this.numberOfColumns));
    }
    return rows;
  });

  protected blur(): void {
    if (!this.autoClose()) {
      this.onTouched();
    }
  }

  protected swatchSelectedChange(swatch: GridCell, color: string, selected: boolean): void {
    if (selected) {
      this.selectColor(color);
    } else if (swatch.active() && this.color() === color) {
      // The grid toggles the selected swatch off when it is chosen again, but a color stays selected.
      // Restoring it emits `selectedChange` again, so it is handled like any other selection.
      swatch.selected.set(true);
    }
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
      const swatches = this.swatches();
      (swatches.find(swatch => swatch.selected()) ?? swatches.at(0))?.element.focus();
    });
  }

  private selectColor(color: string): void {
    if (this.color() !== color) {
      this.color.set(color);
      this.onChange(color);
    }
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
