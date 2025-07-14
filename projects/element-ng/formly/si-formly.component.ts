/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  Component,
  computed,
  inject,
  input,
  model,
  OnInit,
  output,
  viewChild
} from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { FormlyFieldConfig, FormlyForm, FormlyFormOptions } from '@ngx-formly/core';
import { FormlyJsonschema } from '@ngx-formly/core/json-schema';
import { JSONSchema7 } from 'json-schema';

@Component({
  selector: 'si-formly',
  // eslint-disable-next-line @angular-eslint/prefer-standalone
  standalone: false,
  templateUrl: './si-formly.component.html'
})
export class SiFormlyComponent<TControl extends { [K in keyof TControl]: AbstractControl }>
  implements OnInit
{
  /**
   * Formly main container to provide modelChange subscriptions.
   */
  readonly formlyForm = viewChild(FormlyForm);

  readonly form = model<FormGroup<TControl>>();
  /**
   * Mapping of field name and its value.
   *
   * @defaultValue
   * ```
   * {}
   * ```
   */
  readonly model = model({});
  /**
   * Define FormlyFormOptions.
   *
   * @defaultValue
   * ```
   * {}
   * ```
   */
  readonly options = input<FormlyFormOptions>({});

  /**
   * JSONSchema7 can be used instead of FormlyFieldConfig array for defining form fields.
   * */
  readonly schema = model<JSONSchema7>();

  /**
   * Define all form fields with FormlyFieldConfig array.
   *
   * @defaultValue []
   */
  readonly fields = input<FormlyFieldConfig[]>([]);

  readonly fieldsChange = output<FormlyFieldConfig[]>();

  /** Define width for field labels in pixel */
  readonly labelWidth = input<number | undefined>();

  protected readonly fieldConfig = computed<FormlyFieldConfig[]>(() => {
    let formlyFieldConfig!: FormlyFieldConfig[];
    const schema = this.schema();
    const labelWidth = this.labelWidth();
    const opts = {
      map: (field: FormlyFieldConfig, s: JSONSchema7): FormlyFieldConfig => {
        if (labelWidth) {
          field.props ??= {};
          field.props.labelWidth = labelWidth;
        }
        return field;
      }
    };
    if (schema) {
      formlyFieldConfig = [this.formlyJsonschema.toFieldConfig(schema, opts)];
    } else {
      formlyFieldConfig = this.fields();
    }
    if (formlyFieldConfig && formlyFieldConfig.length > 0) {
      this.applyLabelWidth(formlyFieldConfig);
    }
    this.fieldsChange.emit(formlyFieldConfig);
    return formlyFieldConfig;
  });

  protected ownForm = false;
  private readonly formlyJsonschema = inject(FormlyJsonschema);

  ngOnInit(): void {
    if (!this.form()) {
      this.ownForm = true;
      this.form.set(new FormGroup<TControl>({} as TControl));
    }
  }

  private applyLabelWidth(formlyFieldConfig: FormlyFieldConfig[]): void {
    const apply = (cfg: FormlyFieldConfig[]): void => {
      cfg.forEach(field => {
        field.props ??= {};
        field.props.labelWidth = this.labelWidth();
        if (Array.isArray(field.fieldGroup)) {
          apply(field.fieldGroup);
        }
        if (typeof field.fieldArray !== 'function') {
          if (Array.isArray(field.fieldArray?.fieldGroup)) {
            apply(field.fieldArray!.fieldGroup);
          }
        }
      });
    };
    apply(formlyFieldConfig);
  }
}
