import { Component } from '@angular/core';
import { SiFormModule } from '@siemens/element-ng/form'

@Component({
  selector: 'app-sample',
  template:`<si-form-item label="FORM.CLASS"  >`,
  imports: [SiFormModule],
  standalone: true
})
export class SampleComponent {}
