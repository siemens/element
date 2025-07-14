/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { AfterViewInit, Component } from '@angular/core';
import { FieldType, FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { SiAccordionComponent, SiCollapsiblePanelComponent } from '@siemens/element-ng/accordion';

@Component({
  selector: 'si-formly-accordion',
  imports: [SiCollapsiblePanelComponent, FormlyModule, SiAccordionComponent],
  templateUrl: './si-formly-accordion.component.html'
})
export class SiFormlyAccordionComponent extends FieldType implements AfterViewInit {
  protected panelToggle(toggle: boolean, fieldGroup: FormlyFieldConfig): void {
    if (this.field.fieldGroup) {
      const openPanelField = this.field.fieldGroup?.find(f => f.props?.opened);
      if (openPanelField?.props) {
        openPanelField.props.opened = false;
      }
    }
    if (fieldGroup.props) {
      fieldGroup.props.opened = toggle;
    }
  }

  ngAfterViewInit(): void {
    if (this.props?.expandFirstPanel !== false) {
      if (this.field.fieldGroup?.[0].props) {
        this.field.fieldGroup[0].props.opened = true;
      }
    }
  }
}
