/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { FieldType, FormlyModule } from '@ngx-formly/core';
import { SiTranslatePipe } from '@siemens/element-translate-ng/translate';

@Component({
  selector: 'si-formly-button',
  imports: [NgClass, SiTranslatePipe, FormlyModule],
  templateUrl: './si-formly-button.component.html'
})
export class SiFormlyButtonComponent extends FieldType {
  protected click(): void {
    const listener = this.props.clickListener;
    let args = this.props.clickArgs ?? [];
    if (args && !Array.isArray(args)) {
      args = [args];
    }
    if (!listener) {
      return;
    }

    if (typeof listener === 'string') {
      try {
        /* eslint-disable */
        const getFn = Function('formState', 'model', 'field', `return ${listener};`);
        const fn = getFn.apply(this, [this.formState, this.model, this.field]);
        if (typeof fn === 'function') {
          fn.apply(this, args);
        } else {
          console.warn(`The dyn ui button ${this.key} has no valid click listener`);
        }
      } catch (error) {
        console.warn(`Error while executing dyn ui button "${this.key}" click listener.`, error);
      }
      /* eslint-enable */
      return;
    }

    if (typeof listener === 'function') {
      try {
        listener.apply(this, args);
      } catch (error) {
        console.warn(
          `Error while executing dyn ui button "${this.key}" direct click listener.`,
          error
        );
      }
    }
  }
}
