import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SiCheckboxComponent } from '@simpl/element-ng/checkbox';
import { SiRadioComponent } from '@simpl/element-ng/radio';
import { SiSelectComponent } from '@simpl/element-ng/select';
import { SiDatepickerComponent, SiDateInputDirective } from '@simpl/element-ng/datepicker';

@Component({
  selector: 'app-fake-2',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SiCheckboxComponent,
    SiRadioComponent,
    SiSelectComponent,
    SiDatepickerComponent,
    SiDateInputDirective
  ],
  template: `
    <div class="fake-component">
      <h2>Fake Component 2</h2>
      <si-checkbox label="Accept terms"></si-checkbox>
      <si-radio name="option" value="1" label="Option 1"></si-radio>
      <si-radio name="option" value="2" label="Option 2"></si-radio>
      <si-select placeholder="Choose an option">
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
      </si-select>
      <input siDateInput placeholder="Select date" />
      <si-datepicker></si-datepicker>
    </div>
  `,
  styleUrls: ['./fake-2.component.scss']
})
export class Fake2Component {
  selectedOption = '';
  selectedDate: Date | null = null;
}
