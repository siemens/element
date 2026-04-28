/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SiEventBus } from '@siemens/dashboards-ng';

import { days, severity } from '../../widgets/charts/data.service';

@Component({
  selector: 'app-dashboard-filters',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './dashboard-filters.component.html',
  styleUrl: './dashboard-filters.component.scss'
})
export class DashboardFiltersComponent implements OnInit {
  form!: FormGroup;

  readonly days = days;
  readonly severity = severity;

  private formBuilder = inject(FormBuilder);
  private eventBus = inject(SiEventBus);

  ngOnInit(): void {
    const formControls = {
      day: [this.days[0]],
      severity: [this.severity[0]]
    };
    this.form = this.formBuilder.group(formControls);
    this.form.valueChanges.subscribe(form => {
      this.eventBus.emit('filter', [
        { key: 'days', value: form.day },
        { key: 'severity', value: form.severity }
      ]);
    });
  }
}
