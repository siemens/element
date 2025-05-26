/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { CopyrightDetails, SI_COPYRIGHT_DETAILS } from './si-copyright-notice';

@Component({
  selector: 'si-copyright-notice',
  templateUrl: './si-copyright-notice.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiCopyrightNoticeComponent {
  private globalCopyrightInfo: CopyrightDetails | null = inject(SI_COPYRIGHT_DETAILS, {
    optional: true
  });
  /**
   * Copyright information to be displayed.
   *
   * Note: The {@link CopyrightDetails#company} defaults to `Sample Company`,
   * only set it for other companies.
   */
  readonly copyright = input<CopyrightDetails>();

  protected readonly copyrightInfo = computed(() => {
    const lastYear = this.lastUpdateYear();
    const to = lastYear ? `-${lastYear}` : '';
    return `${this.company()} ${this.startYear()}${to}`;
  });

  protected readonly company = computed(
    () => this.copyright()?.company ?? this.globalCopyrightInfo?.company ?? 'Sample Company'
  );

  protected readonly startYear = computed(
    () =>
      this.copyright()?.startYear ?? this.globalCopyrightInfo?.startYear ?? new Date().getFullYear()
  );

  protected readonly lastUpdateYear = computed(
    () => this.copyright()?.lastUpdateYear ?? this.globalCopyrightInfo?.lastUpdateYear ?? undefined
  );
}
