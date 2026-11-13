/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Listbox, Option } from '@angular/aria/listbox';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import {
  afterNextRender,
  computed,
  inject,
  Injectable,
  Injector,
  Signal,
  signal
} from '@angular/core';
import {
  elementDoubleDown,
  elementDoubleUp,
  elementDown2,
  elementUp2
} from '@siemens/element-icons';
import { addIcons } from '@siemens/element-ng/icon';

import { UserListState } from './user-list-state';
import { INITIAL_MEMBER_IDS, nonMemberIds, plural, USERS_BY_ID } from './users.data';

export type MoveDirection = 'up' | 'down' | 'top' | 'bottom';

const MOVE_KEYS: Record<string, MoveDirection> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  Home: 'top',
  End: 'bottom'
};

const MOVE_LABELS: Record<MoveDirection, string> = {
  up: 'up',
  down: 'down',
  top: 'to the top',
  bottom: 'to the bottom'
};

/** Keyboard alternative to drag and drop in the member list: Alt+Arrow/Home/End and Delete. */
export const memberKeyAction = (event: KeyboardEvent): MoveDirection | 'remove' | undefined => {
  if (event.altKey) {
    return MOVE_KEYS[event.key];
  }
  return event.key === 'Delete' || event.key === 'Backspace' ? 'remove' : undefined;
};

/**
 * Focuses the option at the index after the DOM changed. The listbox picks up the new
 * option order through a mutation observer, so `gotoIndex` waits for the next microtask.
 * With `onlyIfLost`, a still enabled button keeps the focus.
 */
export const focusOption = (
  injector: Injector,
  listbox: Listbox<string> | undefined,
  index: number,
  onlyIfLost = false
): void => {
  afterNextRender(
    () =>
      queueMicrotask(() => {
        const active = document.activeElement as HTMLButtonElement | null;
        const lost = !active || active === document.body || active.disabled;
        if (onlyIfLost && !lost && !active?.closest('[role="listbox"]')) {
          return;
        }
        listbox?.gotoIndex(index);
      }),
    { injector }
  );
};

/** Keeps the focus in a list after options were transferred out of it. */
export const focusNear = (
  injector: Injector,
  listbox: Listbox<string> | undefined,
  list: UserListState,
  index: number
): void => {
  const shown = list.visibleUsers().length;
  if (index >= 0 && shown) {
    focusOption(injector, listbox, Math.min(index, shown - 1), true);
  }
};

/** Value of the active option among the candidates, e.g. for keyboard shortcuts. */
export const activeValue = (
  options: readonly Option<string>[],
  candidates: readonly string[]
): string | undefined =>
  options.find(option => option.active() && candidates.includes(option.value()))?.value();

/** Scrolls the option into view after it was rendered, e.g. a newly added member. */
export const revealOption = (
  injector: Injector,
  options: Signal<readonly Option<string>[]>,
  id: string
): void => {
  afterNextRender(
    () =>
      options()
        .find(option => option.value() === id)
        ?.element.scrollIntoView({ block: 'nearest' }),
    { injector }
  );
};

/**
 * State of the assignment: all users not in the group (alphabetical) and the ordered group
 * members, with transfers, reordering, save and reset. Screen readers are told about
 * every change. Provide it per component.
 */
@Injectable()
export class GroupAssignment {
  private readonly liveAnnouncer = inject(LiveAnnouncer);

  private readonly icons = addIcons({
    elementDoubleDown,
    elementDoubleUp,
    elementDown2,
    elementUp2
  });

  readonly reorderActions: {
    direction: MoveDirection;
    label: string;
    shortcut: string;
    icon: string;
  }[] = [
    {
      direction: 'top',
      label: 'Move to top',
      shortcut: 'Alt+Home',
      icon: this.icons.elementDoubleUp
    },
    { direction: 'up', label: 'Move up', shortcut: 'Alt+ArrowUp', icon: this.icons.elementUp2 },
    {
      direction: 'down',
      label: 'Move down',
      shortcut: 'Alt+ArrowDown',
      icon: this.icons.elementDown2
    },
    {
      direction: 'bottom',
      label: 'Move to bottom',
      shortcut: 'Alt+End',
      icon: this.icons.elementDoubleDown
    }
  ];

  private readonly savedMemberIds = signal<readonly string[]>(INITIAL_MEMBER_IDS);
  private readonly memberIds = signal<readonly string[]>(INITIAL_MEMBER_IDS);
  private readonly availableIds = signal<readonly string[]>(nonMemberIds(INITIAL_MEMBER_IDS));

  readonly members = computed(() => this.memberIds().map(id => USERS_BY_ID.get(id)!));
  readonly availableUsers = computed(() => this.availableIds().map(id => USERS_BY_ID.get(id)!));
  readonly memberList = new UserListState(this.members, 'member');
  readonly availableList = new UserListState(this.availableUsers, 'user');

  readonly hasChanges = computed(() => {
    const saved = this.savedMemberIds();
    const current = this.memberIds();
    return saved.length !== current.length || saved.some((id, index) => id !== current[index]);
  });

  canMove(direction: MoveDirection, id?: string): boolean {
    const ids = this.memberList.targetIds(id);
    if (this.memberList.isFiltering() || !ids.length) {
      return false;
    }
    const memberIds = this.memberIds();
    const moving = new Set(ids);
    const towardsStart = direction === 'up' || direction === 'top';
    const reachable = towardsStart ? memberIds : [...memberIds].reverse();
    // The move is possible unless the targeted members already form a block at that end.
    return reachable.slice(0, ids.length).some(memberId => !moving.has(memberId));
  }

  /**
   * Moves the member, or the selection it belongs to, as one block.
   * Returns the moved ids, empty if nothing moved.
   */
  move(direction: MoveDirection, id?: string): readonly string[] {
    if (!this.canMove(direction, id)) {
      return [];
    }
    const ids = this.memberList.targetIds(id);
    const list = [...this.memberIds()];
    const last = list.length - 1;
    // The k-th moved member never passes the k-th position from the edge,
    // so a selection moves as a block and keeps its order.
    const ordered = direction === 'up' || direction === 'top' ? ids : [...ids].reverse();
    ordered.forEach((memberId, k) => {
      const from = list.indexOf(memberId);
      const to = {
        up: Math.max(from - 1, k),
        down: Math.min(from + 1, last - k),
        top: k,
        bottom: last - k
      }[direction];
      moveItemInArray(list, from, to);
    });
    this.memberIds.set(list);
    this.announce(`Moved ${this.subject(ids, 'member')} ${MOVE_LABELS[direction]}`);
    return ids;
  }

  /** Moves a single member to a new position, e.g. after a drop. */
  moveTo(previousIndex: number, currentIndex: number): void {
    if (previousIndex === currentIndex) {
      return;
    }
    const list = [...this.memberIds()];
    moveItemInArray(list, previousIndex, currentIndex);
    this.memberIds.set(list);
    const name = USERS_BY_ID.get(list[currentIndex])!.name;
    this.announce(`Moved ${name} to position ${currentIndex + 1} of ${list.length}`);
  }

  /** Adds users at the given position or at the end of the group. */
  add(ids: readonly string[], index = this.memberIds().length): void {
    if (!ids.length) {
      return;
    }
    const members = [...this.memberIds()];
    const available = [...this.availableIds()];
    ids.forEach((id, k) => transferArrayItem(available, members, available.indexOf(id), index + k));
    this.memberIds.set(members);
    this.availableIds.set(available);
    this.availableList.deselect(ids);
    this.announce(`${this.subject(ids, 'user')} added to the group`);
  }

  /** Removes members. "All users" stays in alphabetical order. */
  remove(ids: readonly string[]): void {
    if (!ids.length) {
      return;
    }
    const members = [...this.memberIds()];
    const available = [...this.availableIds()];
    ids.forEach(memberId => {
      const name = USERS_BY_ID.get(memberId)!.name;
      const sortedIndex = available.findIndex(
        availableId => USERS_BY_ID.get(availableId)!.name.localeCompare(name) > 0
      );
      transferArrayItem(
        members,
        available,
        members.indexOf(memberId),
        sortedIndex < 0 ? available.length : sortedIndex
      );
    });
    this.memberIds.set(members);
    this.availableIds.set(available);
    this.memberList.deselect(ids);
    this.announce(`${this.subject(ids, 'member')} removed from the group`);
  }

  reset(): void {
    this.memberIds.set(this.savedMemberIds());
    this.availableIds.set(nonMemberIds(this.savedMemberIds()));
    this.memberList.reset();
    this.availableList.reset();
    this.announce('Changes discarded');
  }

  /** Returns the saved member names in order. */
  save(): string[] {
    this.savedMemberIds.set(this.memberIds());
    this.memberList.selectedIds.set([]);
    this.announce('Group members saved');
    return this.members().map(user => user.name);
  }

  private subject(ids: readonly string[], noun: string): string {
    return ids.length === 1 ? USERS_BY_ID.get(ids[0])!.name : plural(ids.length, noun);
  }

  private announce(message: string): void {
    this.liveAnnouncer.announce(message);
  }
}
