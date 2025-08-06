/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, DestroyRef, inject, OnInit, TemplateRef, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { SiFormFieldsetComponent, SiFormItemComponent } from '@spike-rabbit/element-ng/form';
import { ModalRef, SiModalService } from '@spike-rabbit/element-ng/modal';
import { SiNumberInputComponent } from '@spike-rabbit/element-ng/number-input';
import {
  SelectOption,
  SiSelectComponent,
  SiSelectMultiValueDirective,
  SiSelectSimpleOptionsDirective
} from '@spike-rabbit/element-ng/select';
import { SiWizardComponent, SiWizardStepComponent } from '@spike-rabbit/element-ng/wizard';
import { LOG_EVENT } from '@spike-rabbit/live-preview';

@Component({
  selector: 'app-sample',
  imports: [
    ReactiveFormsModule,
    SiWizardComponent,
    SiWizardStepComponent,
    SiFormItemComponent,
    SiFormFieldsetComponent,
    SiNumberInputComponent,
    SiSelectComponent,
    SiSelectSimpleOptionsDirective,
    SiSelectMultiValueDirective
  ],
  templateUrl: './si-wizard-forms.html',
  host: { class: 'p-5' }
})
export class SampleComponent implements OnInit {
  protected readonly logEvent = inject(LOG_EVENT);
  protected readonly modalService = inject(SiModalService);
  protected readonly formBuilder = inject(FormBuilder);
  protected readonly destroyerRef = inject(DestroyRef);
  protected readonly dialog = viewChild.required('wizardForm', { read: TemplateRef });

  protected readonly form1 = this.formBuilder.group({
    label1: [''],
    label2: [''],
    toggleLabel: [false]
  });

  protected readonly form2 = this.formBuilder.group({
    label3: [''],
    multiValue: [[]]
  });

  protected readonly form3 = this.formBuilder.group({
    check1: [''],
    check2: [''],
    radio: ['']
  });

  protected readonly multiValueOptions: SelectOption<string>[] = [
    { type: 'option', value: 'option-1', label: 'Option 1', icon: 'element-manager' },
    { type: 'option', value: 'option-2', label: 'Option 2', icon: 'element-engineer' },
    { type: 'option', value: 'option-3', label: 'Option 3', icon: 'element-installer' },
    { type: 'option', value: 'option-4', label: 'Option 4', icon: 'element-support' },
    { type: 'option', value: 'option-5', label: 'Option 5', icon: 'element-manager' }
  ];

  protected modalRef?: ModalRef;

  constructor() {
    this.destroyerRef.onDestroy(() => this.modalRef?.hide());
  }

  ngOnInit(): void {
    this.showUserForm();
  }

  protected showUserForm(): void {
    this.modalRef = this.modalService.show(this.dialog(), {
      keyboard: true,
      ignoreBackdropClick: false,
      class: 'modal-lg'
    });
  }
}
