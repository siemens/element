/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { DOCUMENT } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiFormItemComponent } from '@siemens/element-ng/form';
import { SelectItem, SiSelectModule } from '@siemens/element-ng/select';

type Density = 'none' | 'density-compact' | 'density-compact-2';

const densityClasses: Exclude<Density, 'none'>[] = ['density-compact', 'density-compact-2'];

@Component({
  selector: 'app-sample',
  imports: [FormsModule, SiFormItemComponent, SiSelectModule],
  templateUrl: './spacer-controls.html',
  host: { class: 'p-5' }
})
export class SampleComponent implements OnInit {
  density: Density = 'none';

  readonly densityOptions: SelectItem<Density>[] = [
    { type: 'option', value: 'none', label: 'None' },
    { type: 'option', value: 'density-compact', label: 'Compact (Dani Biasi)' },
    { type: 'option', value: 'density-compact-2', label: 'Compact 2 (Dani Ritz)' }
  ];

  private document = inject(DOCUMENT);

  ngOnInit(): void {
    this.density = this.getDensity();
  }

  applyDensity(density: Density): void {
    this.document.documentElement.classList.remove(...densityClasses);

    if (density !== 'none') {
      this.document.documentElement.classList.add(density);
    }
  }

  private getDensity(): Density {
    for (const density of densityClasses) {
      if (this.document.documentElement.classList.contains(density)) {
        return density;
      }
    }

    return 'none';
  }
}
