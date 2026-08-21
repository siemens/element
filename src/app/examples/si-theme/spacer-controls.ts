/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { DOCUMENT } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiFormItemComponent } from '@siemens/element-ng/form';
import { SiNumberInputComponent } from '@siemens/element-ng/number-input';
import { SelectItem, SiSelectModule } from '@siemens/element-ng/select';

type Density = 'none' | 'density-compact-dani' | 'density-compact-andre';
type FontUnit = 'px' | 'rem';
type CssUnit = FontUnit | '';

const densityClasses: Exclude<Density, 'none'>[] = [
  'density-compact-dani',
  'density-compact-andre'
];
const spacerDefaults = [2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 96];

interface CssVariableControl {
  id: string;
  name: string;
  label: string;
  fallbackValue: number;
  fallbackUnit: CssUnit;
  value: number | undefined;
  unit: CssUnit;
  customized: boolean;
}

interface TypographyControlPair {
  fontSize: CssVariableControl;
  lineHeight: CssVariableControl;
}

const createSpacerControls = (direction: 'inline' | 'block'): CssVariableControl[] => {
  return spacerDefaults.map((value, index) => {
    const number = index + 1;
    const name = `--element-spacer-${direction}-${number}`;

    return {
      id: name.slice(2),
      name,
      label: `${direction === 'inline' ? 'Inline' : 'Block'} ${number}`,
      fallbackValue: value,
      fallbackUnit: 'px',
      value,
      unit: 'px',
      customized: false
    };
  });
};

const typographyControlDefinitions: readonly (readonly [string, string, number, number])[] = [
  ['body', 'Body', 0.875, 16 / 14],
  ['body-lg', 'Body LG', 1, 1.25],
  ['body-lg-bold', 'Body LG bold', 1, 1.25],
  ['body-paragraph', 'Body paragraph', 0.875, 20 / 14],
  ['body-sm', 'Body SM', 0.75, 16 / 12],
  ['h1', 'Heading 1', 1.75, 36 / 28],
  ['h1-bold', 'Heading 1 bold', 1.75, 36 / 28],
  ['h2', 'Heading 2', 1.5, 32 / 24],
  ['h3', 'Heading 3', 1.25, 24 / 20],
  ['h4', 'Heading 4', 1, 1.25],
  ['h4-bold', 'Heading 4 bold', 1, 1.25],
  ['h5', 'Heading 5', 0.875, 20 / 14],
  ['h5-bold', 'Heading 5 bold', 0.875, 20 / 14],
  ['h6', 'Heading 6', 0.75, 16 / 12],
  ['display', 'Display', 2, 40 / 32],
  ['display-bold', 'Display bold', 2.5, 52 / 40],
  ['display-lg', 'Display LG', 2.5, 52 / 40],
  ['display-xl', 'Display XL', 3, 64 / 48],
  ['display-xxl', 'Display XXL', 3.625, 72 / 58],
  ['code-sm', 'Code SM', 0.75, 16 / 12],
  ['code', 'Code', 0.875, 20 / 14],
  ['code-lg', 'Code LG', 1, 20 / 16]
];

const typographyControls: TypographyControlPair[] = typographyControlDefinitions.map(
  ([suffix, label, fontSize, lineHeight]) => {
    const fontSizeName = `--element-font-size-${suffix}`;
    const lineHeightName = `--element-line-height-${suffix}`;

    return {
      fontSize: {
        id: fontSizeName.slice(2),
        name: fontSizeName,
        label: `Font size ${label}`,
        fallbackValue: fontSize,
        fallbackUnit: 'rem',
        value: fontSize,
        unit: 'rem',
        customized: false
      },
      lineHeight: {
        id: lineHeightName.slice(2),
        name: lineHeightName,
        label: `Line height ${label}`,
        fallbackValue: lineHeight,
        fallbackUnit: '',
        value: lineHeight,
        unit: '',
        customized: false
      }
    };
  }
);

@Component({
  selector: 'app-sample',
  imports: [FormsModule, SiFormItemComponent, SiNumberInputComponent, SiSelectModule],
  templateUrl: './spacer-controls.html',
  host: { class: 'p-5' }
})
export class SampleComponent implements OnInit {
  density: Density = 'none';

  readonly inlineSpacerControls = createSpacerControls('inline');
  readonly blockSpacerControls = createSpacerControls('block');
  readonly typographyControls = typographyControls;

  readonly densityOptions: SelectItem<Density>[] = [
    { type: 'option', value: 'none', label: 'None' },
    { type: 'option', value: 'density-compact-dani', label: 'Compact (Dani Biasi)' },
    { type: 'option', value: 'density-compact-andre', label: 'Compact (Andre Fischbach)' }
  ];

  private document = inject(DOCUMENT);

  ngOnInit(): void {
    this.density = this.getDensity();
    this.initializeControls();
  }

  applyDensity(density: Density): void {
    this.document.documentElement.classList.remove(...densityClasses);

    if (density !== 'none') {
      this.document.documentElement.classList.add(density);
    }

    this.updateUncustomizedControls();
  }

  toggleCustomization(control: CssVariableControl): void {
    const rootElement = this.document.documentElement;

    if (control.customized) {
      rootElement.style.setProperty(control.name, this.toCssValue(control));
    } else {
      rootElement.style.removeProperty(control.name);
      this.setCurrentValue(control);
    }
  }

  applyCustomization(control: CssVariableControl): void {
    if (control.customized && control.value !== undefined) {
      this.document.documentElement.style.setProperty(control.name, this.toCssValue(control));
    }
  }

  changeFontUnit(control: CssVariableControl, unit: FontUnit): void {
    if (unit === control.unit) {
      return;
    }

    if (control.value !== undefined) {
      control.value = unit === 'px' ? control.value * 16 : control.value / 16;
    }

    control.unit = unit;
    this.applyCustomization(control);
  }

  resultingLineHeight(fontSize: CssVariableControl, lineHeight: CssVariableControl): string {
    const fontSizeInPixels =
      (fontSize.value ?? fontSize.fallbackValue) * (fontSize.unit === 'rem' ? 16 : 1);
    const lineHeightRatio = lineHeight.value ?? lineHeight.fallbackValue;

    return `${this.formatNumber(fontSizeInPixels * lineHeightRatio)} px`;
  }

  private getDensity(): Density {
    for (const density of densityClasses) {
      if (this.document.documentElement.classList.contains(density)) {
        return density;
      }
    }

    return 'none';
  }

  private initializeControls(): void {
    for (const control of this.allControls) {
      control.customized =
        this.document.documentElement.style.getPropertyValue(control.name) !== '';
      this.setCurrentValue(control);
    }
  }

  private updateUncustomizedControls(): void {
    for (const control of this.allControls) {
      if (!control.customized) {
        this.setCurrentValue(control);
      }
    }
  }

  private setCurrentValue(control: CssVariableControl): void {
    const rootElement = this.document.documentElement;
    const inlineValue = rootElement.style.getPropertyValue(control.name).trim();
    const computedValue = this.document.defaultView
      ?.getComputedStyle(rootElement)
      .getPropertyValue(control.name)
      .trim();

    const cssValue = inlineValue !== '' ? inlineValue : computedValue;
    const parsedValue = cssValue ? this.parseCssValue(cssValue) : undefined;

    control.value = parsedValue?.value ?? control.fallbackValue;
    control.unit = parsedValue?.unit ?? control.fallbackUnit;
  }

  private parseCssValue(value: string): { value: number; unit: CssUnit } | undefined {
    const match = /^(-?(?:\d+|\d*\.\d+))(px|rem)?$/.exec(value);

    if (!match) {
      return undefined;
    }

    return { value: Number(match[1]), unit: (match[2] ?? '') as CssUnit };
  }

  private toCssValue(control: CssVariableControl): string {
    return `${control.value ?? control.fallbackValue}${control.unit}`;
  }

  private formatNumber(value: number): string {
    return value.toFixed(2).replace(/\.?0+$/, '');
  }

  private get allControls(): CssVariableControl[] {
    return [
      ...this.inlineSpacerControls,
      ...this.blockSpacerControls,
      ...this.typographyControls.flatMap(({ fontSize, lineHeight }) => [fontSize, lineHeight])
    ];
  }
}
