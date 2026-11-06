/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { computed, Signal, signal } from '@angular/core';
import { form } from '@angular/forms/signals';

import { plural, User } from './users.data';

/**
 * Search and multi-selection state of one list. Selected users that are hidden by the
 * search stay selected, so the selection survives typing and clearing a search term.
 */
export class UserListState {
  readonly query = signal('');
  /** Bound to the search input. Requires an injection context when the state is created. */
  readonly search = form(this.query);
  readonly selectedIds = signal<readonly string[]>([]);
  readonly isFiltering = computed(() => this.query().trim().length > 0);
  readonly visibleUsers = computed(() => {
    const term = this.query().trim().toLocaleLowerCase();
    const users = this.users();
    return term
      ? users.filter(
          user =>
            user.name.toLocaleLowerCase().includes(term) ||
            user.email.toLocaleLowerCase().includes(term)
        )
      : users;
  });
  readonly visibleIds = computed(() => this.visibleUsers().map(user => user.id));
  /** The listbox drops values without an option, so it only gets the shown selection. */
  readonly visibleSelectedIds = computed(() => {
    const selected = new Set(this.selectedIds());
    return this.visibleUsers()
      .filter(user => selected.has(user.id))
      .map(user => user.id);
  });
  /** Selected ids in list order. */
  readonly orderedSelectedIds = computed(() => {
    const selected = new Set(this.selectedIds());
    return this.users()
      .filter(user => selected.has(user.id))
      .map(user => user.id);
  });
  readonly selectedCount = computed(() => this.orderedSelectedIds().length);
  readonly hiddenSelectedCount = computed(
    () => this.selectedCount() - this.visibleSelectedIds().length
  );
  readonly allVisibleSelected = computed(
    () =>
      this.visibleUsers().length > 0 &&
      this.visibleSelectedIds().length === this.visibleUsers().length
  );
  readonly someVisibleSelected = computed(
    () => this.visibleSelectedIds().length > 0 && !this.allVisibleSelected()
  );

  /** Explains the list state, e.g. "6 members" or "2 of 6 selected, 1 hidden by search". */
  readonly countLabel = computed(() => {
    const total = this.users().length;
    const selected = this.selectedCount();
    if (selected) {
      const hidden = this.hiddenSelectedCount();
      return `${selected} of ${total} selected${hidden ? `, ${hidden} hidden by search` : ''}`;
    }
    const shown = this.visibleUsers().length;
    return this.isFiltering() && shown !== total
      ? `${shown} of ${plural(total, this.noun)}`
      : plural(total, this.noun);
  });

  constructor(
    private readonly users: Signal<User[]>,
    private readonly noun: string
  ) {}

  isSelected(id: string): boolean {
    return this.selectedIds().includes(id);
  }

  /** Returns the selection when the user is part of it, otherwise only the user itself. */
  targetIds(id?: string): readonly string[] {
    if (id && !this.isSelected(id)) {
      return [id];
    }
    return this.orderedSelectedIds();
  }

  /** Merges the selection of the shown options with the selected options hidden by search. */
  updateVisibleSelection(value: string[]): void {
    const visibleIds = new Set(this.visibleUsers().map(user => user.id));
    this.selectedIds.update(selected => [...selected.filter(id => !visibleIds.has(id)), ...value]);
  }

  toggleAllVisible(): void {
    const visibleIds = new Set(this.visibleUsers().map(user => user.id));
    const keep = this.selectedIds().filter(id => !visibleIds.has(id));
    this.selectedIds.set(this.allVisibleSelected() ? keep : [...keep, ...visibleIds]);
  }

  /** Index of the first shown user out of `ids`, e.g. to keep the focus after a transfer. */
  firstVisibleIndex(ids: readonly string[]): number {
    return this.visibleUsers().findIndex(user => ids.includes(user.id));
  }

  deselect(ids: readonly string[]): void {
    this.selectedIds.update(selected => selected.filter(id => !ids.includes(id)));
  }

  reset(): void {
    this.query.set('');
    this.selectedIds.set([]);
  }
}
