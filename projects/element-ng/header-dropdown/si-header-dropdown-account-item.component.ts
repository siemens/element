/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { TranslatableString } from '@siemens/element-translate-ng/translate';

/** User account information. */
export interface AccountItem {
  /** The user's full name. */
  title: string;
  /** The user's company name. */
  company?: string;
  /** The user's email address. */
  email?: string;
  /** The user's role. */
  role?: TranslatableString;
}

@Component({
  selector: 'si-header-dropdown-account-item',
  imports: [TranslatePipe],
  template: `<div class="mx-5">
    @let user = account();
    <div class="si-h5">{{ user.title }}</div>
    @if (user.email) {
      <div>{{ user.email }}</div>
    }
    @if (user.company || user.role) {
      <div class="d-flex align-items-center text-secondary mt-2">
        @if (user.company) {
          {{ user.company }}
        }
        @if (user.role) {
          <span class="badge bg-default">{{ user.role | translate }}</span>
        }
      </div>
    }
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'dropdown-item focus-inside'
  }
})
export class SiHeaderDropdownAccountItemComponent {
  /** The current user account. */
  readonly account = input.required<AccountItem>();
}
