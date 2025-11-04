import { Component } from '@angular/core';
import { SiDatepickerModule } from '@siemens/element-ng/datepicker';

@Component({
  selector: 'app-sample',
  template:`<input siDatepicker  />`,
  imports: [SiDatepickerModule],
  standalone: true
})
export class SampleComponent {}
