/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SiTranslateModule } from '@siemens/element-translate-ng/translate';

import { SiSkipLinkTargetDirective } from './si-skip-link-target.directive';

@Component({
  selector: 'si-skip-links',
  templateUrl: './si-skip-links.component.html',
  styleUrl: './si-skip-links.component.scss',
  imports: [SiTranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiSkipLinksComponent {
  /** @defaultValue [] */
  readonly skipLinks = input<readonly SiSkipLinkTargetDirective[]>([]);

  protected jumpToLabel = $localize`:@@SI_SKIP_LINKS.JUMP_TO:Jump to {{link}}`;
}
