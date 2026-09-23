import { Component } from '@angular/core';
import { SiHeaderLogoDirective } from '@siemens/element-ng/application-header';

@Component({
  selector: 'app-header',
  imports: [SiHeaderLogoDirective],
  templateUrl: './header-logo-template.html'
})
export class HeaderComponent {
  readonly logoLabel = 'Siemens';
}
