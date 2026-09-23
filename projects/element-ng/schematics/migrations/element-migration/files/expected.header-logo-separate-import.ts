import { Component, viewChild } from '@angular/core';
import { SiHeaderLogoDirective as Logo } from '@siemens/element-ng/application-header';

@Component({
  selector: 'app-header',
  imports: [Logo],
  template: '<a siHeaderLogo></a>'
})
export class HeaderComponent {
  readonly logo = viewChild(Logo);
}
