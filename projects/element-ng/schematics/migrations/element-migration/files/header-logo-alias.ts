import { Component, viewChild } from '@angular/core';
import { SiHeaderSiemensLogoComponent as Logo, SiHeaderBrandDirective } from '@simpl/element-ng/application-header';
import { SiHeaderSiemensLogoComponent } from 'other/element-ng/application-header';

@Component({
  selector: 'app-header',
  imports: [Logo, SiHeaderBrandDirective],
  template: '<a si-header-siemens-logo aria-label="Siemens"></a>'
})
export class HeaderComponent {
  readonly logo = viewChild(Logo);
  readonly unrelated = SiHeaderSiemensLogoComponent;
}
