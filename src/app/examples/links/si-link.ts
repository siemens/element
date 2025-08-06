/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Link, SiLinkModule } from '@spike-rabbit/element-ng/link';

@Component({
  selector: 'app-sample',
  imports: [SiLinkModule],
  templateUrl: './si-link.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent {
  simplHrefLink: Link = { href: 'https://simpl.siemens.io', tooltip: 'APP.CLAIM' };
  simplActionLink: Link = { action: () => alert('Hello SiMPL!'), tooltip: 'APP.CLAIM' };
  activeRouterLink: Link = { link: '.', tooltip: 'APP.CLAIM' };
  otherRouterLink: Link = { link: '../links', tooltip: 'APP.CLAIM' };
}
