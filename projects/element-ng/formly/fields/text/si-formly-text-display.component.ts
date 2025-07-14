/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import { SiTranslateModule } from '@siemens/element-translate-ng/translate';

import { getFieldValue, getKeyPath } from '../../utils';

@Component({
  selector: 'si-formly-text-display',
  imports: [FormlyModule, ReactiveFormsModule, SiTranslateModule],
  templateUrl: './si-formly-text-display.component.html'
})
export class SiFormlyTextDisplayComponent extends FieldType<FieldTypeConfig> {
  protected get value(): any {
    if (!this.props.key) {
      return this.formControl.value;
    }

    let sourceModel = this.model;
    if (Array.isArray(this.model)) {
      // The model is the arry itself when using this field as item into an array type...
      sourceModel = this.formControl.value;
    }
    if (this.props.key.indexOf('.') === -1) {
      // Special case for Array types:
      return sourceModel[this.props.key];
    }
    const path = getKeyPath(this.props.key);
    return getFieldValue(sourceModel, path);
  }
}
