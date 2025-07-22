/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, computed, inject, isDevMode } from '@angular/core';

import { CopyrightDetails, SI_COPYRIGHT_DETAILS } from './si-copyright-notice';

@Component({
  selector: 'si-copyright-notice',
  templateUrl: './si-copyright-notice.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiCopyrightNoticeComponent {
  /** @defaultValue this.injectCopyrightDetails() */
  globalCopyrightInfo = this.injectCopyrightDetails();

  protected readonly copyrightInfo = computed(() => {
    const lastYear = this.globalCopyrightInfo.lastUpdateYear;
    const to = lastYear ? `-${lastYear}` : '';
    return `${this.globalCopyrightInfo.company} ${this.globalCopyrightInfo.startYear}${to}`;
  });

  private injectCopyrightDetails(): CopyrightDetails {
    if (isDevMode()) {
      const details = inject(SI_COPYRIGHT_DETAILS, { optional: true });
      if (!details) {
        throw new Error(
          `Missing copyright details. Please provide them using 'provideCopyrightDetails'.`
        );
      }
      return details;
    }
    return inject(SI_COPYRIGHT_DETAILS);
  }
}
