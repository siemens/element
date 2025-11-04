import { Component } from '@angular/core';
import { SiNavbarVerticalComponent } from '@siemens/element-ng/navbar-vertical'

@Component({
  selector: 'app-sample',
  template:`<si-navbar-vertical  />`,
   imports: [SiNavbarVerticalComponent],
  standalone: true
})
export class SampleComponent {}
