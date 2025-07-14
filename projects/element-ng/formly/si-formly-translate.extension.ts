/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { FormlyFieldConfig } from '@ngx-formly/core';
import { injectSiTranslateService } from '@siemens/element-translate-ng/translate';

export class SiFormlyTranslateExtension {
  private translate = injectSiTranslateService();
  prePopulate(field: FormlyFieldConfig): void {
    const to = field.props ?? {};
    if (to.translate === false || to._translated) {
      return;
    }

    field.expressions ??= {};

    to._translated = true;
    if (to.label) {
      field.expressions['props.label'] = this.translate.translateAsync(to.label);
    }

    if (to.options) {
      // e.g. a select
      let i = -1;
      to.options.forEach((val: any) => {
        i++;
        if (field.expressions) {
          field.expressions[`props.options.${i}.label`] = this.translate.translateAsync(val.label);
        }
      });
    }

    if (to.placeholder) {
      field.expressions['props.placeholder'] = this.translate.translateAsync(to.placeholder);
    }

    if (to.description) {
      field.expressions['props.description'] = this.translate.translateAsync(to.description);
    }

    if (field.validation?.messages) {
      const msgs = field.validation.messages;
      for (const msg in msgs) {
        if (typeof msgs[msg] === 'string') {
          // This unfortunately blocks any opportunity to create context specific messages
          // Specific messages could be done via the "map" function when the schema itself is parsed
          field.expressions[`validation.messages.${msg}`] = this.translate.translateAsync(
            msgs[msg] + ''
          );
        }
      }
    }

    // Trigger a change
    field.expressions = { ...(field.expressions ?? {}) };
  }
}
