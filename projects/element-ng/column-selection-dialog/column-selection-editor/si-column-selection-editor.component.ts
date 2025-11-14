/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CdkDragHandle } from '@angular/cdk/drag-drop';
import { CdkOption } from '@angular/cdk/listbox';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  viewChild
} from '@angular/core';
import {
  addIcons,
  elementHide,
  elementLock,
  elementMenu,
  elementShow,
  SiIconComponent
} from '@siemens/element-ng/icon';

import { Column } from '../si-column-selection-dialog.types';

@Component({
  selector: 'si-column-selection-editor',
  imports: [CdkDragHandle, SiIconComponent],
  templateUrl: './si-column-selection-editor.component.html',
  styles: `
    .form-control {
      cursor: text;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'd-block my-4 mx-1 rounded-2 elevation-1'
  }
})
export class SiColumnSelectionEditorComponent {
  readonly column = input.required<Column>();
  readonly selected = input.required<boolean>();
  readonly renameInputLabel = input.required<string>();
  readonly columnVisibilityConfigurable = input.required<boolean>();

  readonly titleChange = output();
  readonly visibilityChange = output();
  /** @internal */
  protected readonly cdkOption = inject(CdkOption);
  /** @internal */
  protected editing = false;
  private readonly title = viewChild.required<ElementRef<HTMLInputElement>>('title');
  private readonly elementRef = inject<ElementRef<HTMLDivElement>>(ElementRef);
  /** @internal */
  protected readonly icons = addIcons({
    elementHide,
    elementMenu,
    elementLock,
    elementShow
  });
  /** @internal */
  @HostListener('keydown.enter', ['$event'])
  protected tryEdit(event: Event): void {
    if (this.column().editable) {
      event.stopPropagation();
      this.startEdit();
    }
  }
  /** @internal */
  protected updateTitle(value: string): void {
    this.column().title = value;
    this.titleChange.emit();
  }
  /** @internal */
  protected startEdit(): void {
    if (this.column().editable) {
      this.editing = true;
      setTimeout(() => this.title().nativeElement.focus());
    }
  }
  /** @internal */
  protected stopEdit(): void {
    this.editing = false;
    this.elementRef.nativeElement.focus();
  }
  /** @internal */
  protected toggleVisibility(): void {
    this.cdkOption.toggle();
    // manually toggling does not emit an event, so we have to fire one
    this.visibilityChange.emit();
  }
}
