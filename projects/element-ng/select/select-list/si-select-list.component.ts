/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { CdkListbox, CdkOption, ListboxValueChangeEvent } from '@angular/cdk/listbox';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, OnInit, viewChild } from '@angular/core';
import { SiTranslateModule } from '@siemens/element-translate-ng/translate';

import { SiSelectOptionRowComponent } from '../select-option/si-select-option-row.component';
import { SiSelectGroupTemplateDirective } from '../si-select-group-template.directive';
import { SiSelectOptionRowTemplateDirective } from '../si-select-option-row-template.directive';
import { SiSelectListBase } from './si-select-list.base';

@Component({
  selector: 'si-select-list',
  imports: [
    CommonModule,
    CdkListbox,
    SiTranslateModule,
    CdkOption,
    SiSelectOptionRowTemplateDirective,
    SiSelectGroupTemplateDirective,
    SiSelectOptionRowComponent
  ],
  templateUrl: './si-select-list.component.html',
  styleUrl: './si-select-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiSelectListComponent<T> extends SiSelectListBase<T> implements OnInit {
  private readonly listbox = viewChild.required<CdkListbox, ElementRef<HTMLUListElement>>(
    CdkListbox,
    {
      read: ElementRef
    }
  );

  override ngOnInit(): void {
    super.ngOnInit();
    setTimeout(() => this.listbox().nativeElement.focus());
  }

  protected listBoxValueChange(changeEvent: ListboxValueChangeEvent<T>): void {
    this.selectionStrategy.updateFromUser(changeEvent.value.slice());
  }
}
