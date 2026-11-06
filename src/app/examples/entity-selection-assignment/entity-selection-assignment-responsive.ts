/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Listbox, Option } from '@angular/aria/listbox';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';
import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  Injector,
  signal,
  TemplateRef,
  viewChild,
  viewChildren
} from '@angular/core';
import {
  elementDoubleLeft,
  elementDoubleRight,
  elementLeft2,
  elementMenu,
  elementPlus,
  elementRight2,
  elementSearch,
  elementUsers
} from '@siemens/element-icons';
import { SiEmptyStateComponent } from '@siemens/element-ng/empty-state';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { ModalRef, SiModalService } from '@siemens/element-ng/modal';
import { SiResponsiveContainerDirective } from '@siemens/element-ng/resize-observer';
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
import { UserListHeaderComponent } from './user-list-header.component';
import { UserRowComponent } from './user-row.component';
import { User } from './users.data';

/**
 * Selection and assignment pattern that adapts to its container. With enough room, both
 * lists are shown side by side. In narrow containers, the available users move into an
 * "Add members" picker dialog.
 */
@Component({
  selector: 'app-sample',
  imports: [
    CdkDrag,
    CdkDragHandle,
    CdkDropList,
    Listbox,
    NgTemplateOutlet,
    Option,
    SiEmptyStateComponent,
    SiIconComponent,
    SiTooltipDirective,
    UserListHeaderComponent,
    UserRowComponent
  ],
  templateUrl: './entity-selection-assignment-responsive.html',
  providers: [GroupAssignment],
  host: { class: 'si-layout-fixed-height' },
  hostDirectives: [SiResponsiveContainerDirective]
})
export class SampleComponent {
  private readonly logEvent = inject(LOG_EVENT);
  private readonly injector = inject(Injector);
  private readonly modalService = inject(SiModalService);
  private readonly container = inject(SiResponsiveContainerDirective);
  protected readonly assignment = inject(GroupAssignment);

  protected readonly icons = addIcons({
    elementDoubleLeft,
    elementDoubleRight,
    elementLeft2,
    elementMenu,
    elementPlus,
    elementRight2,
    elementSearch,
    elementUsers
  });

  /** Both lists fit side by side from the `md` container breakpoint on. */
  protected readonly sideBySide = computed(() => !this.container.xs() && !this.container.sm());

  /** Member list actions in the narrow layout: reordering step by step. */
  protected readonly narrowReorderActions = this.assignment.reorderActions.filter(
    action => action.direction === 'up' || action.direction === 'down'
  );

  /** While a member is dragged, "All users" highlights as drop target. */
  protected readonly draggingMember = signal(false);

  private readonly options = viewChildren<Option<string>>(Option);
  private readonly memberListbox = viewChild<Listbox<string>>('memberListbox');
  private readonly availableListbox = viewChild<Listbox<string>>('availableListbox');
  private pickerRef?: ModalRef<unknown, string>;

  constructor() {
    // The picker belongs to the narrow layout only.
    effect(() => {
      if (this.sideBySide()) {
        this.pickerRef?.hide('cancel');
      }
    });
  }

  protected add(ids: readonly string[]): void {
    const list = this.assignment.availableList;
    const index = list.firstVisibleIndex(ids);
    this.assignment.add(ids);
    revealOption(this.injector, this.options, ids[0]);
    // After a transfer, the focus stays in the source list.
    focusNear(this.injector, this.availableListbox(), list, index);
  }

  protected addSelected(): void {
    const ids = this.assignment.availableList.orderedSelectedIds();
    this.pickerRef?.hide('add');
    this.assignment.add(ids);
    revealOption(this.injector, this.options, ids[0]);
  }

  protected remove(ids: readonly string[]): void {
    const list = this.assignment.memberList;
    const index = list.firstVisibleIndex(ids);
    this.assignment.remove(ids);
    focusNear(this.injector, this.memberListbox(), list, index);
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

  protected openPicker(template: TemplateRef<unknown>): void {
    this.assignment.availableList.reset();
    this.pickerRef = this.modalService.show<unknown, string>(
      template,
      {
        class: 'modal-lg modal-dialog-scrollable modal-fullscreen-md-down',
        ariaLabelledBy: 'add-members-title',
        animated: true,
        keyboard: true
      },
      'cancel'
    );
  }

  protected save(): void {
    this.logEvent('Saved group members', this.assignment.save());
  }
}
