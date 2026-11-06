/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Listbox, Option } from '@angular/aria/listbox';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';
import { NgTemplateOutlet } from '@angular/common';
import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  Injector,
  signal,
  TemplateRef,
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
import { ModalRef, SiModalService } from '@siemens/element-ng/modal';
import { SiResponsiveContainerDirective } from '@siemens/element-ng/resize-observer';
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
 * Selection and assignment pattern inside a dialog. A wide dialog shows both lists side by
 * side. In a narrow dialog, "Add members" switches the same dialog to the available users,
 * so no second dialog is stacked on top.
 */
@Component({
  selector: 'app-sample',
  imports: [
    CdkDrag,
    CdkDragHandle,
    CdkDropList,
    FormField,
    Listbox,
    NgTemplateOutlet,
    Option,
    SiAvatarComponent,
    SiEmptyStateComponent,
    SiIconComponent,
    SiResponsiveContainerDirective,
    SiSearchBarComponent,
    SiSearchBarInputDirective,
    SiTooltipDirective
  ],
  templateUrl: './entity-selection-assignment-modal.html',
  styles: `
    /* User options: center the action across name and email, and truncate the email before it. */
    .list-item-description {
      grid-column: 3;
    }

    .list-item-description ~ .list-item-primary-action {
      grid-row: 2 / span 2;
    }

    /* The lists scroll inside a dialog of stable height. */
    .editor {
      block-size: min(40rem, 70vh);
    }
  `,
  providers: [GroupAssignment],
  host: { class: 'si-layout-fixed-height' }
})
export class SampleComponent {
  private readonly logEvent = inject(LOG_EVENT);
  private readonly injector = inject(Injector);
  private readonly modalService = inject(SiModalService);
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

  private readonly layout = viewChild<SiResponsiveContainerDirective>('layout');

  /** Both lists fit side by side from the `md` container breakpoint of the dialog on. */
  protected readonly sideBySide = computed(() => {
    const layout = this.layout();
    return !layout || (!layout.xs() && !layout.sm());
  });

  /** In a narrow dialog, whether the available users are shown instead of the members. */
  protected readonly picking = signal(false);

  /** Member list actions in the narrow layout: reordering step by step. */
  protected readonly narrowReorderActions = this.assignment.reorderActions.filter(
    action => action.direction === 'up' || action.direction === 'down'
  );

  /** While a member is dragged, "All users" highlights as drop target. */
  protected readonly draggingMember = signal(false);

  private readonly options = viewChildren<Option<string>>(Option);
  private readonly memberListbox = viewChild<Listbox<string>>('memberListbox');
  private readonly availableListbox = viewChild<Listbox<string>>('availableListbox');
  private readonly memberSearch = viewChild<ElementRef<HTMLInputElement>>('memberSearch');
  private readonly availableSearch = viewChild<ElementRef<HTMLInputElement>>('availableSearch');
  private readonly addMembersButton = viewChild<ElementRef<HTMLButtonElement>>('addMembersButton');
  private editorRef?: ModalRef<unknown, string>;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.editorRef?.hide('cancel'));
    // Side by side, the available users are always shown.
    effect(() => {
      if (this.sideBySide()) {
        this.picking.set(false);
      }
    });
  }

  protected openEditor(template: TemplateRef<unknown>): void {
    this.picking.set(false);
    this.assignment.memberList.reset();
    this.assignment.availableList.reset();
    this.editorRef = this.modalService.show<unknown, string>(
      template,
      {
        class: 'modal-xl modal-dialog-scrollable',
        ariaLabelledBy: 'edit-members-title',
        keyboard: true
      },
      'cancel'
    );
    this.editorRef.hidden.subscribe(result => {
      if (result !== 'save' && this.assignment.hasChanges()) {
        this.assignment.reset();
      }
    });
  }

  protected showPicker(): void {
    this.assignment.availableList.reset();
    this.picking.set(true);
    afterNextRender(() => this.availableSearch()?.nativeElement.focus(), {
      injector: this.injector
    });
  }

  protected closePicker(): void {
    this.picking.set(false);
    afterNextRender(() => this.addMembersButton()?.nativeElement.focus(), {
      injector: this.injector
    });
  }

  protected addPicked(): void {
    const ids = this.assignment.availableList.orderedSelectedIds();
    this.closePicker();
    this.assignment.add(ids);
    revealOption(this.injector, this.options, ids[0]);
  }

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
    this.editorRef?.hide('save');
    this.logEvent('Saved group members', this.assignment.save());
  }
}
