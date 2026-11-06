/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Listbox, Option } from '@angular/aria/listbox';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';
import {
  Component,
  DestroyRef,
  ElementRef,
  inject,
  Injector,
  signal,
  TemplateRef,
  viewChild,
  viewChildren
} from '@angular/core';
import { form, FormField, required, validate } from '@angular/forms/signals';
import { elementMenu, elementSearch, elementUsers } from '@siemens/element-icons';
import { SiAvatarComponent } from '@siemens/element-ng/avatar';
import { SiEmptyStateComponent } from '@siemens/element-ng/empty-state';
import { provideSiFormFieldConfig, SiFormFieldComponent } from '@siemens/element-ng/form';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { ModalRef, SiModalService } from '@siemens/element-ng/modal';
import { SiSearchBarComponent, SiSearchBarInputDirective } from '@siemens/element-ng/search-bar';
import { SiTooltipDirective } from '@siemens/element-ng/tooltip';
import { SiWizardComponent, SiWizardStepComponent } from '@siemens/element-ng/wizard';
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
 * Selection and assignment pattern for narrow places, here a step of a vertical wizard.
 * The page shows the ordered group members; users are picked in an "Add members" dialog.
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
    SiFormFieldComponent,
    SiIconComponent,
    SiSearchBarComponent,
    SiSearchBarInputDirective,
    SiTooltipDirective,
    SiWizardComponent,
    SiWizardStepComponent
  ],
  templateUrl: './entity-selection-assignment-picker.html',
  styles: `
    /* User options: center the action across name and email, and truncate the email before it. */
    .list-item-description {
      grid-column: 3;
    }

    .list-item-description ~ .list-item-primary-action {
      grid-row: 2 / span 2;
    }
  `,
  providers: [GroupAssignment, provideSiFormFieldConfig()],
  host: { class: 'si-layout-fixed-height' }
})
export class SampleComponent {
  private readonly logEvent = inject(LOG_EVENT);
  private readonly injector = inject(Injector);
  private readonly modalService = inject(SiModalService);
  protected readonly assignment = inject(GroupAssignment);

  protected readonly icons = addIcons({ elementMenu, elementSearch, elementUsers });

  protected readonly groupName = form(signal('Fire alarm responders'), path => {
    required(path, { message: 'Enter a group name.' });
    validate(path, ({ value }) =>
      value().length && !value().trim()
        ? { kind: 'whitespace', message: 'Enter a group name.' }
        : undefined
    );
  });

  /** Member list actions in the narrow layout: reordering step by step. */
  protected readonly reorderActions = this.assignment.reorderActions.filter(
    action => action.direction === 'up' || action.direction === 'down'
  );

  private readonly options = viewChildren<Option<string>>(Option);
  private readonly memberListbox = viewChild<Listbox<string>>('memberListbox');
  private readonly memberSearch = viewChild<ElementRef<HTMLInputElement>>('memberSearch');
  private pickerRef?: ModalRef<unknown, string>;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.pickerRef?.hide('cancel'));
  }

  protected openPicker(template: TemplateRef<unknown>): void {
    this.assignment.availableList.reset();
    this.pickerRef = this.modalService.show<unknown, string>(
      template,
      {
        class: 'modal-lg modal-dialog-scrollable modal-fullscreen-md-down',
        ariaLabelledBy: 'add-members-title',
        keyboard: true
      },
      'cancel'
    );
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

  protected dropped(event: CdkDragDrop<User[], User[], User>): void {
    this.assignment.moveTo(event.previousIndex, event.currentIndex);
  }

  protected save(): void {
    this.logEvent('Saved group', {
      name: this.groupName().value(),
      members: this.assignment.save()
    });
  }
}
