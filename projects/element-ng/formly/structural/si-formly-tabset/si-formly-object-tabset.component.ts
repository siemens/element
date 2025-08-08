/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { FieldType, FormlyModule } from '@ngx-formly/core';
import { SiTabNextComponent, SiTabsetNextComponent } from '@siemens/element-ng/tabs-next';

@Component({
  selector: 'si-formly-object-tabset',
  imports: [SiTabsetNextComponent, SiTabNextComponent, FormlyModule],
  templateUrl: './si-formly-object-tabset.component.html'
})
export class SiFormlyObjectTabsetComponent extends FieldType {
  protected tabIndexChange(isActive: boolean, selectedTab: number): void {
    if (this.options?.formState && isActive) {
      this.options.formState.selectedTabIndex = selectedTab;
    }
  }
}
