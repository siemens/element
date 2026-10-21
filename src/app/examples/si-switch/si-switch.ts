/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { AfterViewInit, Component, ElementRef, viewChild } from '@angular/core';

@Component({
  selector: 'app-sample',
  templateUrl: './si-switch.html'
})
export class SampleComponent implements AfterViewInit {
  readonly indeterminate = viewChild.required<ElementRef<HTMLInputElement>>('indeterminate');
  readonly indeterminateDisabled =
    viewChild.required<ElementRef<HTMLInputElement>>('indeterminateDisabled');

  ngAfterViewInit(): void {
    this.indeterminate().nativeElement.indeterminate = true;
    this.indeterminateDisabled().nativeElement.indeterminate = true;
  }
}
