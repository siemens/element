/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgClass } from '@angular/common';
import { Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SiFormItemComponent } from '@spike-rabbit/element-ng/form';
import { SiNumberInputComponent } from '@spike-rabbit/element-ng/number-input';
import { SiWizardComponent, SiWizardStepComponent } from '@spike-rabbit/element-ng/wizard';
import { LOG_EVENT } from '@spike-rabbit/live-preview';

@Component({
  selector: 'app-sample',
  imports: [
    ReactiveFormsModule,
    SiNumberInputComponent,
    SiFormItemComponent,
    SiWizardComponent,
    SiWizardStepComponent,
    NgClass
  ],
  templateUrl: './si-wizard-playground.html'
})
export class SampleComponent implements OnInit {
  protected readonly logEvent = inject(LOG_EVENT);
  protected readonly wizard = viewChild.required(SiWizardComponent);
  protected readonly configForm = new FormGroup({
    enableCompletionPage: new FormControl<boolean>(true, { nonNullable: true }),
    completionPageVisibleTime: new FormControl<number>(2000, { nonNullable: true }),
    validStep: new FormControl<boolean>(true, { nonNullable: true }),
    hasCancel: new FormControl<boolean>(false, { nonNullable: true }),
    hasNavigation: new FormControl<boolean>(true, { nonNullable: true }),
    verticalLayout: new FormControl(false),
    inlineNavigation: new FormControl(true),
    cardWizard: new FormControl(true),
    showVerticalDivider: new FormControl(false),
    showStepNumbers: new FormControl(false),
    stepCount: new FormControl<number>(3, { nonNullable: true }),
    verticalLayoutMinSize: new FormControl<number | undefined>(undefined),
    verticalLayoutMaxSize: new FormControl<number | undefined>(undefined)
  });

  protected readonly steps = signal<string[]>([]);

  ngOnInit(): void {
    this.generateSteps(this.configForm.value.stepCount!);
    this.configForm.controls.verticalLayout.valueChanges.subscribe(v => {
      if (v) {
        // vertical layout implies inline navigation
        this.configForm.controls.inlineNavigation.setValue(false);
      } else {
        this.configForm.controls.showVerticalDivider.setValue(false);
      }
    });
    this.configForm.valueChanges.subscribe(v => {
      if (v.stepCount && this.steps().length !== v.stepCount) {
        this.generateSteps(v.stepCount);
      }
    });
  }

  protected canNext(): boolean {
    const wizard = this.wizard();
    return wizard.index + 1 < wizard.stepCount && !!wizard.currentStep?.isNextNavigable;
  }

  private generateSteps(amount: number): void {
    this.steps.set(new Array(amount).fill(1).map((value, index) => `Step ${index + 1}`));
  }
}
