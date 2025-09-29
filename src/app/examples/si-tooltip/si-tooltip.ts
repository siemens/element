/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { SiIconComponent } from '@siemens/element-ng/icon';
import { SiTabsetComponent, SiTabComponent } from '@siemens/element-ng/tabs';
import { SiTooltipDirective } from '@siemens/element-ng/tooltip';

@Component({
  selector: 'app-sample',
  imports: [SiIconComponent, SiTooltipDirective, SiTabsetComponent, SiTabComponent],
  templateUrl: './si-tooltip.html'
})
export class SampleComponent implements AfterViewInit, OnDestroy {
  @ViewChild('focusButton') focusButton!: ElementRef<HTMLButtonElement>;
  private focusTimeout?: ReturnType<typeof setTimeout>;

  html = `<strong>I'm a microwave</strong>`;

  ngAfterViewInit(): void {
    if (!this.focusButton) return;

    this.focusTimeout = setTimeout(() => {
      this.focusButton.nativeElement.focus();
    });
  }

  ngOnDestroy(): void {
    if (this.focusTimeout) {
      clearTimeout(this.focusTimeout);
    }
  }
}
