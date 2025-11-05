import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiDateInputDirective, SiDatepickerModule } from '@siemens/element-ng/datepicker';
import { SiFormItemComponent } from '@siemens/element-ng/form';

@Component({
  selector: 'app-sample',
  template:`<si-form-item label="Datepicker">
      <input
        type="text"
        class="form-control"
        siDateInput
        [(ngModel)]="date" [dateInputDebounceTime]="500" />
    </si-form-item>`,
  imports: [FormsModule, SiDatepickerModule, SiDateInputDirective, SiFormItemComponent],
  standalone: true
})
export class SampleComponent {
  date = new Date('2022-03-12');
}
