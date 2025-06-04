/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { PercentPipe, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import {
  SelectItem,
  SiSelectActionDirective,
  SiSelectActionsDirective,
  SiSelectComponent,
  SiSelectMultiValueDirective,
  SiSelectOptionTemplateDirective,
  SiSelectSimpleOptionsDirective,
  SiSelectSingleValueDirective
} from '@siemens/element-ng/select';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  templateUrl: './si-select.html',
  host: { class: 'p-5' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    PercentPipe,
    ReactiveFormsModule,
    SiSelectComponent,
    SiSelectMultiValueDirective,
    SiSelectSimpleOptionsDirective,
    SiSelectSingleValueDirective,
    SiSelectActionsDirective,
    SiSelectActionDirective,
    SiSelectOptionTemplateDirective,
    TitleCasePipe,
    TranslateModule
  ]
})
export class SampleComponent {
  readonly logEvent = inject(LOG_EVENT);

  readonly = false;
  disabled = false;
  withFilter = false;
  value = 'fair';
  formControl = new FormControl('good');
  multiValue = ['good', 'fair'];
  groupedMultiValue = ['Value 1.1', 'Value 2.2'];

  readonly optionsList: SelectItem<string>[] = [
    {
      type: 'option',
      value: 'good',
      icon: 'element-face-happy',
      iconColor: 'status-success',
      label: 'Good'
    },
    {
      type: 'option',
      value: 'fair',
      icon: 'element-face-neutral',
      iconColor: 'status-warning',
      label: 'Fair'
    },
    {
      type: 'option',
      value: 'bad',
      icon: 'element-face-unhappy',
      iconColor: 'status-danger',
      label: 'Bad'
    },
    {
      type: 'option',
      value: 'very-bad',
      icon: 'element-face-very-unhappy',
      iconColor: 'status-critical',
      label: 'Very bad',
      disabled: true
    }
  ];

  readonly groupedOptions: SelectItem<string>[] = [
    {
      type: 'group',
      label: 'Group 1',
      options: [
        { type: 'option', value: 'Value 1.1', label: 'Value 1.1' },
        { type: 'option', value: 'Value 1.2', label: 'Value 1.2' },
        { type: 'option', value: 'Value 1.3', label: 'Value 1.3' }
      ]
    },
    {
      type: 'group',
      label: 'Group 2',
      options: [
        { type: 'option', value: 'Value 2.1', label: 'Value 2.1' },
        { type: 'option', value: 'Value 2.2', label: 'Value 2.2' },
        { type: 'option', value: 'Value 2.3', label: 'Value 2.3' }
      ]
    },
    {
      type: 'group',
      label: 'Group 3',
      options: [
        { type: 'option', value: 'Value 3.1', label: 'Value 3.1' },
        { type: 'option', value: 'Value 3.2', label: 'Value 3.2' },
        { type: 'option', value: 'Value 3.3', label: 'Value 3.3' }
      ]
    }
  ];

  readonly drinksOptions: SelectItem<{ id: string; alcohol: number }>[] = [
    {
      type: 'group',
      label: 'Beer',
      options: [
        { type: 'option', value: { id: 'Beer 1', alcohol: 0.05 }, label: 'Beer 1' },
        { type: 'option', value: { id: 'Beer 2', alcohol: 0.07 }, label: 'Beer 2' }
      ]
    },
    {
      type: 'group',
      label: 'Wine',
      options: [
        { type: 'option', value: { id: 'Red wine', alcohol: 0.11 }, label: 'Red wine' },
        { type: 'option', value: { id: 'White wine', alcohol: 0.1 }, label: 'White wine' }
      ]
    }
  ];

  // The si-select will always use the provided options. So we only need the id, as it used in drinksEqualCheckFn
  drinkValue = { id: 'Beer 2' };

  actionsOptions: SelectItem<string>[] = [
    { type: 'option', value: 'value-1', label: 'Value 1' },
    { type: 'option', value: 'value-2', label: 'Value 2' },
    { type: 'option', value: 'value-3', label: 'Value 3' },
    { type: 'option', value: 'value-4', label: 'Value 4' },
    { type: 'option', value: 'value-5', label: 'Value 5' },
    { type: 'option', value: 'value-6', label: 'Value 6' },
    { type: 'option', value: 'value-7', label: 'Value 7' },
    { type: 'option', value: 'value-8', label: 'Value 8' },
    { type: 'option', value: 'value-9', label: 'Value 9' },
    { type: 'option', value: 'value-10', label: 'Value 10' },
    { type: 'option', value: 'value-11', label: 'Value 11' }
  ];

  readonly actionsFormControl = new FormControl(['value-1', 'value-3']);
  readonly disableClearButton = signal(false);

  constructor() {
    this.actionsFormControl.valueChanges.subscribe(value =>
      this.disableClearButton.set(!value || value.length === 0)
    );
  }

  selectionChanged(value: string): void {
    const option = this.optionsList.find(o => o.type === 'option' && o.value === value);
    this.logEvent(`Selection: ${this.value}, '${option?.label}'`);
  }

  drinksEqualCheckFn = (drink1: { id: string }, drink2: { id: string }): boolean =>
    drink1.id === drink2.id;

  disableChange(): void {
    if (this.disabled) {
      this.actionsFormControl.disable();
      this.formControl.disable();
    } else {
      this.actionsFormControl.enable();
      this.formControl.enable();
    }
  }

  containActionOption(searchText: string): boolean {
    return this.actionsOptions.some(option => option.label === searchText);
  }

  createOption(optionName: string): void {
    this.actionsOptions = [
      ...this.actionsOptions,
      { value: optionName, label: optionName, type: 'option' }
    ];
  }
}
