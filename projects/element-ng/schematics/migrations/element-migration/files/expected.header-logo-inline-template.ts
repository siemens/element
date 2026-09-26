import { Component, viewChild } from '@angular/core';
import { SiHeaderLogoDirective, SiHeaderBrandDirective } from '@siemens/element-ng/application-header';

@Component({
  selector: 'app-header',
  imports: [SiHeaderLogoDirective, SiHeaderBrandDirective],
  template: `
    <a siHeaderLogo routerLink="/" class="d-none d-md-flex"></a>
    <a siHeaderLogo routerLink="/"></a>
    <a [siHeaderLogo]="true"></a>
    <a siHeaderLogo></a>
    <a siHeaderLogo></a>
    <a siHeaderLogo></a>
    <a siHeaderLogo></a>
    <si-header-logo></si-header-logo>
    <si-header-logo />
    <a aria-label="Keep this label"></a>
    <a siHeaderLogo aria-label="Keep current logo"></a>
    <si-header-logo [attr.aria-label]="logoLabel" />
    <a bind-si-header-siemens-logo="true" aria-label="Ignore bind selector"></a>
    <a siHeaderLogo bind-attr.aria-label="logoLabel"></a>
  `
})
export class HeaderComponent {
  readonly logo = viewChild(SiHeaderLogoDirective);
  readonly logoLabel = 'Siemens';
  readonly unrelated = { SiHeaderSiemensLogoComponent: 'unchanged' };
}
