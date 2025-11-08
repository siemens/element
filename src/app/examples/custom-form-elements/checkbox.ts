/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  AfterViewInit,
  Component,
  ElementRef,
  viewChild,
  ChangeDetectionStrategy
} from '@angular/core';

@Component({
  selector: 'app-sample',
  templateUrl: './checkbox.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent implements AfterViewInit {
  readonly indeterminate = viewChild.required<ElementRef>('indeterminate');
  validation = false;

  ngAfterViewInit(): void {
    this.indeterminate().nativeElement.indeterminate = true;
  }
}
