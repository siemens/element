import { Component, viewChild } from '@angular/core';
import { SiHeaderSiemensLogoComponent, SiHeaderBrandDirective } from '@siemens/element-ng/application-header';

@Component({
  selector: 'app-header',
  imports: [SiHeaderSiemensLogoComponent, SiHeaderBrandDirective],
  template: `
    <a si-header-siemens-logo aria-label="Siemens" routerLink="/" class="d-none d-md-flex"></a>
    <a aria-label="Siemens" si-header-siemens-logo routerLink="/"></a>
    <a [si-header-siemens-logo]="true" [aria-label]="logoLabel"></a>
    <a si-header-siemens-logo attr.aria-label="Siemens"></a>
    <a si-header-siemens-logo [attr.aria-label]="logoLabel"></a>
    <a si-header-siemens-logo aria-label="{{ logoLabel }}"></a>
    <a si-header-siemens-logo></a>
    <si-header-siemens-logo aria-label="Siemens"></si-header-siemens-logo>
    <si-header-siemens-logo [attr.aria-label]="logoLabel" />
    <a aria-label="Keep this label"></a>
    <a siHeaderLogo aria-label="Keep current logo"></a>
    <si-header-logo [attr.aria-label]="logoLabel" />
    <a bind-si-header-siemens-logo="true" aria-label="Ignore bind selector"></a>
    <a si-header-siemens-logo bind-attr.aria-label="logoLabel"></a>
  `
})
export class HeaderComponent {
  readonly logo = viewChild(SiHeaderSiemensLogoComponent);
  readonly logoLabel = 'Siemens';
  readonly unrelated = { SiHeaderSiemensLogoComponent: 'unchanged' };
}
