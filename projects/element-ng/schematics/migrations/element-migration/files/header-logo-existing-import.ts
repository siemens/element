import { Component, viewChild } from '@angular/core';
import { SiHeaderSiemensLogoComponent, SiHeaderLogoDirective, SiHeaderBrandDirective } from '@siemens/element-ng/application-header';

@Component({
  selector: 'app-header',
  imports: [SiHeaderSiemensLogoComponent, SiHeaderBrandDirective],
  template: '<si-header-siemens-logo aria-label="Siemens" />'
})
export class HeaderComponent {
  readonly logo = viewChild(SiHeaderLogoDirective);
}
