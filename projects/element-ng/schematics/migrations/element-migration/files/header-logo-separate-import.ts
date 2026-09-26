import { Component, viewChild } from '@angular/core';
import { SiHeaderSiemensLogoComponent } from '@siemens/element-ng/application-header';
import { SiHeaderLogoDirective as Logo } from '@siemens/element-ng/application-header';

@Component({
  selector: 'app-header',
  imports: [SiHeaderSiemensLogoComponent],
  template: '<a si-header-siemens-logo aria-label="Siemens"></a>'
})
export class HeaderComponent {
  readonly logo = viewChild(Logo);
}
