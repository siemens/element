/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DataService, days, severity } from '../../widgets/charts/data.service';

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
  private dataService = inject(DataService);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    const formControls = {
      day: [this.days[0]],
      severity: [this.severity[0]]
    };
    this.form = this.formBuilder.group(formControls);
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(form => {
      this.dataService.filter.next({ days: form.day, severity: form.severity });
    });
  }
}
