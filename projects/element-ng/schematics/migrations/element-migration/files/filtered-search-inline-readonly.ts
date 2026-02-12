/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { SiFilteredSearchModule } from '@siemens/element-ng/filtered-search';

@Component({
  selector: 'app-inline-readonly-test',
  template: `
    <div>
      <si-filtered-search [readonly]="true"></si-filtered-search>
      <si-filtered-search [readonly]="editMode === false" [criteria]="criteria"></si-filtered-search>
      <si-filtered-search
        [readonly]="isDisabled"
        [placeholder]="'Enter search criteria'"
        (search)="onSearch($event)">
      </si-filtered-search>
    </div>
  `,
  imports: [SiFilteredSearchModule],
  standalone: true
})
export class InlineReadonlyTestComponent {
  editMode = false;
  isDisabled = true;
  criteria = [];

  onSearch(event: any): void {
    console.log(event);
  }
}
