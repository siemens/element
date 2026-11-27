/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Listbox, Option } from '@angular/aria/listbox';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';
import {
  Component,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChild,
  viewChildren
} from '@angular/core';
import { FormField } from '@angular/forms/signals';
import {
  elementDoubleLeft,
  elementDoubleRight,
  elementLeft2,
  elementMenu,
  elementRight2,
  elementSearch,
  elementUsers
} from '@siemens/element-icons';
import { SiAvatarComponent } from '@siemens/element-ng/avatar';
import { SiEmptyStateComponent } from '@siemens/element-ng/empty-state';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiSearchBarComponent, SiSearchBarInputDirective } from '@siemens/element-ng/search-bar';
import { SiTooltipDirective } from '@siemens/element-ng/tooltip';
import { LOG_EVENT } from '@siemens/live-preview';

import {
  activeValue,
  focusNear,
  focusOption,
  GroupAssignment,
  memberKeyAction,
  MoveDirection,
  revealOption
} from './group-assignment';
import { User } from './users.data';

/**
 * Selection and assignment pattern with both lists side by side. Users are picked from
 * all users and added to an ordered list of group members by buttons, drag and drop or keyboard.
 */
@Component({
  selector: 'app-sample',
  imports: [
    CdkDrag,
    CdkDragHandle,
    CdkDropList,
    FormField,
    Listbox,
    Option,
    SiAvatarComponent,
    SiEmptyStateComponent,
    SiIconComponent,
    SiSearchBarComponent,
    SiSearchBarInputDirective,
    SiTooltipDirective
  ],
  templateUrl: './entity-selection-assignment-side-by-side.html',
  styles: `
    /* User options: center the action across name and email, and truncate the email before it. */
    .list-item-description {
      grid-column: 3;
    }

    .list-item-description ~ .list-item-primary-action {
      grid-row: 2 / span 2;
    }
  `,
  providers: [GroupAssignment],
  host: { class: 'si-layout-fixed-height' }
})
export class SampleComponent {
  private readonly logEvent = inject(LOG_EVENT);
  private readonly injector = inject(Injector);
  protected readonly assignment = inject(GroupAssignment);

  protected readonly icons = addIcons({
    elementDoubleLeft,
    elementDoubleRight,
    elementLeft2,
    elementMenu,
    elementRight2,
    elementSearch,
    elementUsers
  });

  /** While a member is dragged, "All users" highlights as drop target. */
  protected readonly draggingMember = signal(false);

  private readonly options = viewChildren<Option<string>>(Option);
  private readonly memberListbox = viewChild<Listbox<string>>('memberListbox');
  private readonly availableListbox = viewChild<Listbox<string>>('availableListbox');
  private readonly memberSearch = viewChild<ElementRef<HTMLInputElement>>('memberSearch');
  private readonly availableSearch = viewChild<ElementRef<HTMLInputElement>>('availableSearch');

  protected add(ids: readonly string[]): void {
    const list = this.assignment.availableList;
    const index = list.firstVisibleIndex(ids);
    this.assignment.add(ids);
    revealOption(this.injector, this.options, ids[0]);
    // After a transfer, the focus stays in the source list.
    focusNear(this.injector, this.availableListbox(), list, index, () =>
      this.availableSearch()?.nativeElement.focus()
    );
  }

  protected remove(ids: readonly string[]): void {
    const list = this.assignment.memberList;
    const index = list.firstVisibleIndex(ids);
    this.assignment.remove(ids);
    focusNear(this.injector, this.memberListbox(), list, index, () =>
      this.memberSearch()?.nativeElement.focus()
    );
  }

  protected move(direction: MoveDirection, id?: string): void {
    const ids = this.assignment.move(direction, id);
    if (ids.length) {
      const index = this.assignment.memberList.firstVisibleIndex([id ?? ids[0]]);
      focusOption(this.injector, this.memberListbox(), index, !id);
    }
  }

  protected memberKeydown(event: KeyboardEvent): void {
    const action = memberKeyAction(event);
    const memberIds = this.assignment.members().map(user => user.id);
    const id = action && activeValue(this.options(), memberIds);
    if (!action || !id) {
      return;
    }
    event.preventDefault();
    if (action === 'remove') {
      this.remove(this.assignment.memberList.targetIds(id));
    } else {
      this.move(action, id);
    }
  }

  protected droppedOnMembers(event: CdkDragDrop<User[], User[], User>): void {
    if (event.previousContainer !== event.container) {
      this.assignment.add([event.item.data.id], event.currentIndex);
    } else {
      this.assignment.moveTo(event.previousIndex, event.currentIndex);
    }
  }

  protected droppedOnAvailable(event: CdkDragDrop<User[], User[], User>): void {
    if (event.previousContainer !== event.container) {
      this.assignment.remove([event.item.data.id]);
    }
  }

  protected save(): void {
    this.logEvent('Saved group members', this.assignment.save());
  }
}
