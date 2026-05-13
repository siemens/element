/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, input } from '@angular/core';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';

import { SiSkipLinkTargetDirective } from './si-skip-link-target.directive';

@Component({
  selector: 'si-skip-links',
  imports: [SiTranslatePipe],
  templateUrl: './si-skip-links.component.html',
  styleUrl: './si-skip-links.component.scss'
})
export class SiSkipLinksComponent {
  /** @defaultValue [] */
  readonly skipLinks = input<readonly SiSkipLinkTargetDirective[]>([]);

  protected jumpToLabel = t(() => $localize`:@@SI_SKIP_LINKS.JUMP_TO:Jump to {{link}}`);
}
