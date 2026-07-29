/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { DOCUMENT } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiFormItemComponent } from '@siemens/element-ng/form';
import { SiNumberInputComponent } from '@siemens/element-ng/number-input';

@Component({
  selector: 'app-sample',
  imports: [FormsModule, SiFormItemComponent, SiNumberInputComponent],
  templateUrl: './spacer-controls.html',
  host: { class: 'p-5' }
})
export class SampleComponent implements OnInit {
  inlineSpacer = 16;
  blockSpacer = 16;

  private document = inject(DOCUMENT);

  ngOnInit(): void {
    this.inlineSpacer = this.initializeSpacer('inline', this.inlineSpacer);
    this.blockSpacer = this.initializeSpacer('block', this.blockSpacer);
  }

  applySpacer(direction: 'inline' | 'block', value: number): void {
    this.document.documentElement.style.setProperty(`--element-spacer-${direction}`, `${value}px`);
  }

  private initializeSpacer(direction: 'inline' | 'block', defaultValue: number): number {
    const value = Number.parseFloat(
      this.document.documentElement.style.getPropertyValue(`--element-spacer-${direction}`)
    );

    if (Number.isFinite(value)) {
      return value;
    }

    this.applySpacer(direction, defaultValue);
    return defaultValue;
  }
}
