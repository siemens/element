/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { SiSearchBarComponent, SiSearchBarInputDirective } from '@siemens/element-ng/search-bar';

import { UserListState } from './user-list-state';

/** Search and select-all row above a user list. Projected content becomes the list actions. */
@Component({
  selector: 'app-user-list-header',
  imports: [FormField, SiSearchBarComponent, SiSearchBarInputDirective],
  template: `
    <div class="p-4 pb-2">
      <si-search-bar colorVariant="base-0" [showIcon]="true">
        <input
          siSearchBarInput
          [placeholder]="placeholder()"
          [attr.aria-label]="placeholder()"
          [formField]="list().search"
        />
      </si-search-bar>
    </div>
    <div class="list-item border-bottom">
      <div class="list-item-check">
        <input
          type="checkbox"
          class="form-check-input m-0"
          [attr.aria-label]="selectAllLabel()"
          [checked]="list().allVisibleSelected()"
          [indeterminate]="list().someVisibleSelected()"
          [disabled]="!list().visibleUsers().length"
          (change)="list().toggleAllVisible()"
        />
      </div>
      <span class="list-item-title" aria-live="polite">{{ list().countLabel() }}</span>
      <div class="list-item-primary-action d-flex flex-wrap justify-content-end gap-2">
        <ng-content />
      </div>
    </div>
  `
})
export class UserListHeaderComponent {
  readonly list = input.required<UserListState>();
  readonly placeholder = input.required<string>();
  readonly selectAllLabel = input.required<string>();
}
