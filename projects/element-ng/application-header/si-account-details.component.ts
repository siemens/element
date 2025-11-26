/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SiTranslatePipe, TranslatableString } from '@siemens/element-translate-ng/translate';

@Component({
  selector: 'si-account-details',
  imports: [SiTranslatePipe],
  template: `
    <div class="mx-5">
      <div class="si-h5">{{ name() }}</div>
      @if (email()) {
        <div>{{ email() }}</div>
      }
      @if (company() || userRole()) {
        <div class="d-flex align-items-center text-secondary mt-2">
          @if (company()) {
            {{ company() }}
          }
          @if (userRole()) {
            <span class="badge bg-default">{{ userRole()! | translate }}</span>
          }
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiAccountDetailsComponent {
  /** The user's full name. */
  readonly name = input.required<string>();
  /** The user's company name. */
  readonly company = input<string>();
  /** The user's email address. */
  readonly email = input<string>();
  /** The user's role. */
  readonly userRole = input<TranslatableString>();
}
