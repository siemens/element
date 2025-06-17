/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { LiveAnnouncer } from '@angular/cdk/a11y';
import {
  CDK_DRAG_CONFIG,
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray
} from '@angular/cdk/drag-drop';
import { CdkListbox, CdkOption } from '@angular/cdk/listbox';
import { CdkScrollableModule } from '@angular/cdk/scrolling';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  model,
  OnInit,
  viewChild,
  viewChildren
} from '@angular/core';
import { addIcons, elementCancel, SiIconNextComponent } from '@siemens/element-ng/icon';
import { ModalRef } from '@siemens/element-ng/modal';
import {
  SiTranslateModule,
  SiTranslateService,
  TranslatableString
} from '@siemens/element-translate-ng/translate';
import { first } from 'rxjs/operators';

import { SiColumnSelectionEditorComponent } from './column-selection-editor/si-column-selection-editor.component';
import { Column, ColumnSelectionDialogResult } from './si-column-selection-dialog.types';

const dragConfig = {
  dragStartThreshold: 0,
  pointerDirectionChangeThreshold: 5,
  zIndex: 10000
};

@Component({
  selector: 'si-column-selection-dialog',
  templateUrl: './si-column-selection-dialog.component.html',
  styleUrl: './si-column-selection-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CdkDrag,
    CdkDropList,
    CdkListbox,
    CdkOption,
    CdkScrollableModule,
    SiIconNextComponent,
    SiTranslateModule,
    SiColumnSelectionEditorComponent
  ],
  providers: [{ provide: CDK_DRAG_CONFIG, useValue: dragConfig }]
})
export class SiColumnSelectionDialogComponent implements OnInit {
  readonly titleId = input<string>();
  readonly heading = input<TranslatableString>();
  readonly bodyTitle = input<TranslatableString>();
  /**
   * @defaultValue
   * ```
   * $localize`:@@SI_COLUMN_SELECTION_DIALOG.SUBMIT:Apply`
   * ```
   */
  readonly submitBtnName = input<TranslatableString>(
    $localize`:@@SI_COLUMN_SELECTION_DIALOG.SUBMIT:Apply`
  );
  /**
   * @defaultValue
   * ```
   * $localize`:@@SI_COLUMN_SELECTION_DIALOG.CANCEL:Cancel`
   * ```
   */
  readonly cancelBtnName = input<TranslatableString>(
    $localize`:@@SI_COLUMN_SELECTION_DIALOG.CANCEL:Cancel`
  );
  /**
   * @defaultValue
   * ```
   * $localize`:@@SI_COLUMN_SELECTION_DIALOG.RESTORE_TO_DEFAULT:Restore to default`
   * ```
   */
  readonly restoreToDefaultBtnName = input<TranslatableString>(
    $localize`:@@SI_COLUMN_SELECTION_DIALOG.RESTORE_TO_DEFAULT:Restore to default`
  );
  /**
   * @defaultValue
   * ```
   * $localize`:@@SI_COLUMN_SELECTION_DIALOG.HIDDEN:Hidden`
   * ```
   */
  readonly hiddenText = input<TranslatableString>(
    $localize`:@@SI_COLUMN_SELECTION_DIALOG.HIDDEN:Hidden`
  );
  /**
   * @defaultValue
   * ```
   * $localize`:@@SI_COLUMN_SELECTION_DIALOG.VISIBLE:Visible`
   * ```
   */
  readonly visibleText = input<TranslatableString>(
    $localize`:@@SI_COLUMN_SELECTION_DIALOG.VISIBLE:Visible`
  );
  /** @defaultValue false */
  readonly restoreEnabled = input(false, { transform: booleanAttribute });
  readonly columns = model.required<Column[]>();
  /**
   * @defaultValue
   * ```
   * {}
   * ```
   */
  readonly translationParams = input<Record<string, unknown>>({});

  /**
   * @defaultValue
   * ```
   * $localize`:@@SI_COLUMN_SELECTION_DIALOG.LIST_ARIA_LABEL:
   *     List of possible columns.
   *     Items can be moved using Alt+ArrowUp or Alt+ArrowDown.
   *     Press Enter to rename supported items.`
   * ```
   */
  readonly listAriaLabel = input(
    $localize`:@@SI_COLUMN_SELECTION_DIALOG.LIST_ARIA_LABEL:List of possible columns. Items can be moved using Alt+ArrowUp or Alt+ArrowDown. Press Enter to rename supported items.`
  );

  /**
   * @defaultValue
   * ```
   * $localize`:@@SI_COLUMN_SELECTION_DIALOG.RENAME_INPUT_ARIA_LABEL:Rename column`
   * ```
   */
  readonly renameInputAriaLabel = input(
    $localize`:@@SI_COLUMN_SELECTION_DIALOG.RENAME_INPUT_ARIA_LABEL:Rename column`
  );

  /**
   * @defaultValue
   * ```
   * $localize`:@@SI_COLUMN_SELECTION_DIALOG.ITEM_MOVED:Item is now at position {{targetPosition}}`
   * ```
   */
  readonly a11yItemMovedMessage = input<TranslatableString>(
    $localize`:@@SI_COLUMN_SELECTION_DIALOG.ITEM_MOVED:Item is now at position {{targetPosition}}`
  );
  /**
   * @defaultValue
   * ```
   * $localize`:@@SI_COLUMN_SELECTION_DIALOG.ITEM_NOT_MOVED:Item was not moved`
   * ```
   */

  readonly a11yItemNotMovedMessage = input<TranslatableString>(
    $localize`:@@SI_COLUMN_SELECTION_DIALOG.ITEM_NOT_MOVED:Item was not moved`
  );
  /** @defaultValue true */
  readonly columnVisibilityConfigurable = input(true, { transform: booleanAttribute });

  private readonly listOptions = viewChildren(CdkOption);

  private readonly modalBodyElement = viewChild.required<ElementRef<HTMLDivElement>>('modalBody');

  private tempHeaderData: Column[] = [];

  protected readonly modalRef = inject(
    ModalRef<SiColumnSelectionDialogComponent, ColumnSelectionDialogResult>
  );
  protected readonly icons = addIcons({ elementCancel });

  protected visibleIds: string[] = [];

  private readonly liveAnnouncer = inject(LiveAnnouncer);
  private readonly translateService = inject(SiTranslateService);

  ngOnInit(): void {
    this.setupColumnData();
  }

  /** @internal */
  get backupColumns(): Column[] {
    return this.tempHeaderData;
  }

  protected submitColumnSelection(): void {
    this.modalRef.hide({ type: 'ok', columns: this.columns() });
  }

  protected cancelColumnSelection(): void {
    this.columns.set([]);
    this.tempHeaderData.forEach(element => this.columns.update(a => [...a, element]));
    this.modalRef.hide({ type: 'cancel', columns: this.columns() });
  }

  protected drop(event: CdkDragDrop<string[]>): void {
    const columns = this.columns();
    if (columns[event.currentIndex].draggable) {
      moveItemInArray(columns, event.previousIndex, event.currentIndex);
      this.emitChange();
    }
  }

  protected restoreToDefault(): void {
    this.modalRef.hidden.next({
      type: 'restoreDefault',
      columns: this.columns(),
      updateColumns: columns => {
        this.columns.set(columns);
        this.setupColumnData();
      }
    });
  }

  protected moveDown(index: number, event: Event): void {
    const columns = this.columns();
    const listOptions = this.listOptions();
    if (columns[index].draggable) {
      let targetIndex = index + 1;
      while (columns[targetIndex] && !columns[targetIndex].draggable) {
        targetIndex++;
      }

      if (targetIndex !== index && columns[targetIndex]?.draggable) {
        event.preventDefault();
        moveItemInArray(columns, index, targetIndex);

        // When moving the first partially visible item down,
        // the browser tries to keep its position stable within the viewport by automatically scrolling down.
        // This behavior is not wanted here, so we restore the previous scroll after moving the item
        // TODO: check if this could be solved easier
        if (
          listOptions.at(index)!.element.getBoundingClientRect().top <=
          this.modalBodyElement().nativeElement.getBoundingClientRect().top
        ) {
          const previousScrollTop = this.modalBodyElement().nativeElement.scrollTop;
          setTimeout(() => (this.modalBodyElement().nativeElement.scrollTop = previousScrollTop));
        }

        // When moving the last visible element down, the scroll position is not adopted. So its scroll out of view.
        // We correct this manually by scrolling it back into view
        const targetElement = listOptions.at(targetIndex)!.element;
        if (
          targetElement.getBoundingClientRect().bottom >
          this.modalBodyElement().nativeElement.getBoundingClientRect().bottom
        ) {
          targetElement.scrollIntoView({ block: 'end' });
        }

        this.announceSuccessfulMove(targetIndex);
        this.emitChange();
      } else {
        this.announceNotSuccessfulMove();
      }
    }
  }

  protected moveUp(index: number, event: Event): void {
    const columns = this.columns();
    if (columns[index].draggable) {
      let targetIndex = index - 1;
      while (columns[targetIndex] && !columns[targetIndex].draggable) {
        targetIndex--;
      }

      if (targetIndex !== index && columns[targetIndex]?.draggable) {
        event.preventDefault();
        moveItemInArray(columns, index, targetIndex);
        // it seems like this is only necessary for move up. Don't know why
        setTimeout(() => this.listOptions().at(targetIndex)!.focus());
        this.announceSuccessfulMove(targetIndex);
        this.emitChange();
      } else {
        this.announceNotSuccessfulMove();
      }
    }
  }

  protected emitChange(): void {
    this.modalRef.hidden.next({ type: 'instant', columns: this.columns() });
  }

  protected updateVisibility(): void {
    const value = this.listOptions()
      .filter(option => option.isSelected())
      .map(option => option.value);
    for (const column of this.columns()) {
      column.visible = value.includes(column.id);
    }
    this.emitChange();
  }

  private setupColumnData(): void {
    const columns = this.columns();
    this.tempHeaderData = columns.map(x => Object.assign({}, x));
    this.visibleIds = columns.filter(column => column.visible).map(column => column.id);
  }

  private announceSuccessfulMove(index: number): void {
    this.announceMove(this.a11yItemMovedMessage(), {
      ...this.translationParams,
      targetPosition: index + 1
    });
  }

  private announceNotSuccessfulMove(): void {
    this.announceMove(this.a11yItemNotMovedMessage(), this.translationParams());
  }

  private announceMove(message?: string, translationParams?: Record<string, unknown>): void {
    if (message) {
      this.translateService
        .translateAsync(message, translationParams)
        .pipe(first())
        .subscribe(translatedMessage => this.liveAnnouncer.announce(translatedMessage));
    }
  }
}
