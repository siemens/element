import { Component } from '@angular/core';
import { SiHeaderSiemensLogoComponent } from '@siemens/element-ng/application-header';

@Component({
  selector: 'app-header',
  imports: [SiHeaderSiemensLogoComponent],
  templateUrl: './header-logo-template.html'
})
export class HeaderComponent {
  readonly logoLabel = 'Siemens';
}
