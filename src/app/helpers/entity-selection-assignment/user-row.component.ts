/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, input } from '@angular/core';
import { SiAvatarComponent } from '@siemens/element-ng/avatar';

import { User } from './users.data';

/**
 * Content of a user option: checkbox, avatar, name and email. Use it inside a
 * `li.list-item.align-indicator-center`. Projected content becomes the trailing action.
 */
@Component({
  selector: 'app-user-row',
  imports: [SiAvatarComponent],
  template: `
    <div class="list-item-check">
      <input
        type="checkbox"
        class="form-check-input m-0"
        tabindex="-1"
        aria-hidden="true"
        inert
        [checked]="selected()"
      />
    </div>
    <div class="list-item-indicator" aria-hidden="true">
      <si-avatar size="small" [altText]="user().name" />
    </div>
    <span class="list-item-title text-truncate">{{ user().name }}</span>
    <span class="list-item-description text-secondary text-truncate">{{ user().email }}</span>
    <div class="list-item-primary-action">
      <ng-content />
    </div>
  `,
  styles: `
    /* The parts take part in the grid of the surrounding list item. */
    :host {
      display: contents;
    }

    /* Center the action across the name and email rows, like the checkbox and avatar. */
    .list-item-primary-action {
      grid-row: 2 / span 2;
    }

    /* Keep the email clear of the action, so it truncates before the drag handle. */
    .list-item-description {
      grid-column: 3;
    }
  `
})
export class UserRowComponent {
  readonly user = input.required<User>();
  readonly selected = input(false);
}
