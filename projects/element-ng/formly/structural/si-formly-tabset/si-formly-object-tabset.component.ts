/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { FieldType, FormlyModule } from '@ngx-formly/core';
import { SiTabComponent, SiTabsetComponent } from '@siemens/element-ng/tabs';

@Component({
  selector: 'si-formly-object-tabset',
  imports: [SiTabsetComponent, SiTabComponent, FormlyModule],
  templateUrl: './si-formly-object-tabset.component.html'
})
export class SiFormlyObjectTabsetComponent extends FieldType {
  protected tabIndexChange(selectedTab: number): void {
    if (this.options?.formState) {
      this.options.formState.selectedTabIndex = selectedTab;
    }
  }
}
