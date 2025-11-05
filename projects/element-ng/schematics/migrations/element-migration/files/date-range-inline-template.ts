import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SiDateRangeComponent, SiDatepickerModule } from '@siemens/element-ng/datepicker';

@Component({
  selector: 'app-sample',
  template:`<si-date-range [formControl]="dateRange" [debounceTime]="500" />`,
  imports: [ReactiveFormsModule, SiDatepickerModule, SiDateRangeComponent],
  standalone: true
})
export class SampleComponent {
 dateRange = new FormControl<DateRange | null>(null);
}
