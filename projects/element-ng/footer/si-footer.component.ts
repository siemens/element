/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, input } from '@angular/core';
import { Link, SiLinkDirective } from '@siemens/element-ng/link';
import { SiTranslatePipe } from '@siemens/element-translate-ng/translate';

@Component({
  selector: 'si-footer',
  imports: [SiLinkDirective, SiTranslatePipe],
  templateUrl: './si-footer.component.html',
  styleUrl: './si-footer.component.scss'
})
export class SiFooterComponent {
  /**
   * Copyright of your application.
   */
  readonly copyright = input.required<string>();
  /**
   * List of additional links.
   */
  readonly links = input<Link[]>();
}
