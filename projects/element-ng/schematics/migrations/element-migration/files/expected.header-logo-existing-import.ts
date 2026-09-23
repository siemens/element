import { Component, viewChild } from '@angular/core';
import { SiHeaderLogoDirective, SiHeaderBrandDirective } from '@siemens/element-ng/application-header';

@Component({
  selector: 'app-header',
  imports: [SiHeaderLogoDirective, SiHeaderBrandDirective],
  template: '<si-header-logo />'
})
export class HeaderComponent {
  readonly logo = viewChild(SiHeaderLogoDirective);
}
