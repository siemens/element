/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SiHeaderLogoDirective } from './si-header-logo.directive';

/**
 * The siemens logo.
 * Should be located inside `.header-brand`.
 *
 * @deprecated Use the {@link SiHeaderLogoDirective} instead.
 * The new component will use the logo provided by the global theme instead
 * of containing a hard coded siemens logo.
 * ```html
 * // previous
 * <a si-header-siemens-logo routerLink="/" aria-label="Siemens" class="d-none d-md-flex"></a>
 * // new
 * <a siHeaderLogo routerLink="/" class="d-none d-md-flex"></a>
 * ```
 *
 */
@Component({
  selector: 'si-header-siemens-logo, [si-header-siemens-logo]',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiHeaderSiemensLogoComponent extends SiHeaderLogoDirective {}
