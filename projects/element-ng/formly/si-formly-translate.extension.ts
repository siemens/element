/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { FormlyFieldConfig } from '@ngx-formly/core';
import { FormlySelectOption } from '@ngx-formly/core/select';
import { injectSiTranslateService } from '@siemens/element-translate-ng/translate';
import { filter } from 'rxjs';

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

    if (Array.isArray(to.options)) {
      const options: FormlySelectOption[] = to.options;
      options.forEach((option, index) => {
        field.expressions![`props.options.${index}.label`] = this.translate
          .translateAsync(option.label)
          // Compare against the current option rather than the previous emission:
          // Formly can recreate subscriptions when Bootstrap option nodes change.
          .pipe(
            filter(label => {
              const currentOptions = field.props?.options;
              return !Array.isArray(currentOptions) || label !== currentOptions[index]?.label;
            })
          );
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
