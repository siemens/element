import { Component, viewChild } from '@angular/core';
import { SiHeaderLogoDirective as Logo, SiHeaderBrandDirective } from '@simpl/element-ng/application-header';
import { SiHeaderSiemensLogoComponent } from 'other/element-ng/application-header';

@Component({
  selector: 'app-header',
  imports: [Logo, SiHeaderBrandDirective],
  template: '<a siHeaderLogo></a>'
})
export class HeaderComponent {
  readonly logo = viewChild(Logo);
  readonly unrelated = SiHeaderSiemensLogoComponent;
}
