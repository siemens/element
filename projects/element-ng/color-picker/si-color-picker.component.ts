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
  untracked,
  viewChild,
  viewChildren,
  WritableSignal
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { elementOk } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';

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

/** A single color swatch with its own selection state. */
interface ColorSwatch {
  /** The color token, e.g. a CSS variable name without the `--` prefix. */
  value: string;
  /** Whether this swatch is currently selected. */
  selected: WritableSignal<boolean>;
}
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
  private readonly swatchCells = viewChildren(GridCell);
  private readonly selectedCell = computed(() =>
    this.swatchCells().find(cell => cell.selected())
  );
  private readonly disabledNgControl = signal(false);
  private readonly numberOfColumns = 4;
  protected readonly disabled = computed(() => this.disabledInput() || this.disabledNgControl());
  protected readonly isOverlayOpen = signal(false);
  protected readonly icons = addIcons({ elementOk });

  /** The color palette arranged into rows for the grid layout. */
  protected readonly colorRows = computed(() => {
    const palette = this.colorPalette();
    const selectedColor = untracked(this.color);
    const rows: ColorSwatch[][] = [];
    for (let i = 0; i < palette.length; i += this.numberOfColumns) {
      rows.push(
        palette
          .slice(i, i + this.numberOfColumns)
          .map(value => ({ value, selected: signal(value === selectedColor) }))
      );
    }
    return rows;
  });

  protected blur(): void {
    if (!this.autoClose()) {
      this.onTouched();
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
      (this.selectedCell() ?? this.swatchCells()[0])?.element.focus();
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
