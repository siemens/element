/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Overlay } from '@angular/cdk/overlay';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiFormItemComponent } from '@siemens/element-ng/form';
import { SiPopoverDirective } from '@siemens/element-ng/popover';
import { SiTooltipDirective } from '@siemens/element-ng/tooltip';
import { SiTypeaheadDirective } from '@siemens/element-ng/typeahead';

@Component({
  selector: 'app-sample',
  imports: [
    CdkScrollable,
    FormsModule,
    SiPopoverDirective,
    SiTypeaheadDirective,
    SiFormItemComponent
  ],
  templateUrl: './overlay-scroll-strategy.html'
})
export class SampleComponent {
  private readonly overlay = inject(Overlay);

  readonly popoverScrollStrategy = this.overlay.scrollStrategies.close();

  readonly countries = ['Canada', 'France', 'Germany', 'India', 'Japan', 'United Kingdom'];
  selectedCountry = '';
}
