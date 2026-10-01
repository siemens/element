/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { FormlyFieldConfig } from '@ngx-formly/core';
import { FormlySelectOption } from '@ngx-formly/core/select';
import { injectSiTranslateService } from '@siemens/element-translate-ng/translate';
import { distinctUntilChanged, map, of } from 'rxjs';

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
      const labels = options.map(option => option.label);
      // Keep option translations out of Formly's expression subscriptions, which can be
      // recreated when Bootstrap controls register with their parent field.
      to.options = labels.length
        ? this.translate.translateAsync(labels).pipe(
            distinctUntilChanged((previous, current) =>
              labels.every(label => previous[label] === current[label])
            ),
            map(translations =>
              options.map(option => ({ ...option, label: translations[option.label] }))
            )
          )
        : of([]);
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
