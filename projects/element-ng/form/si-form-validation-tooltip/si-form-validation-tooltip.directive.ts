/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  computed,
  Directive,
  DoCheck,
  ElementRef,
  inject,
  Injector,
  input,
  signal
} from '@angular/core';
import { NgControl, ValidationErrors } from '@angular/forms';
import { SiTooltipService } from '@siemens/element-ng/tooltip';

import { SiFormContainerComponent } from '../si-form-container/si-form-container.component';
import { SiFormError } from '../si-form-item/si-form-item.component';
import { SiFormValidationErrorMapper } from '../si-form-validation-error.model';
import { SiFormValidationErrorService } from '../si-form-validation-error.service';
import {
  SI_FORM_VALIDATION_TOOLTIP_DATA,
  SiFormValidationTooltipComponent
} from './si-form-validation-tooltip.component';

/**
 * Directive to show a tooltip with validation errors of a form control.
 *
 * In general, `si-form-item` should be used.
 * This directive is intended only for cases where the tooltip cannot be shown inline.
 * This is typically the case for tables and lists where the validation message would break the layout.
 *
 * @example
 * ```html
 * <input siFormValidationTooltip [formControl]="control" />
 * ```
 */
@Directive({
  selector: '[siFormValidationTooltip]',
  providers: [SiTooltipService],
  host: {
    '[attr.aria-describedby]': 'describedBy'
  }
})
export class SiFormValidationTooltipDirective implements DoCheck {
  private static idCounter = 0;

  private tooltipService = inject(SiTooltipService);
  private formValidationService = inject(SiFormValidationErrorService);
  private formContainer = inject(SiFormContainerComponent, { optional: true });
  readonly formErrorMapper = input<SiFormValidationErrorMapper>();
  private ngControl = inject(NgControl);
  private elementRef = inject(ElementRef);

  protected readonly describedBy = `__si-form-validation-tooltip-${SiFormValidationTooltipDirective.idCounter++}`;
  private readonly errors = signal<SiFormError[]>([]);
  private readonly touched = signal(false);
  private readonly canShowTooltip = computed(() => this.errors().length > 0 && this.touched());
  private currentErrors: ValidationErrors | null = null;

  constructor() {
    this.tooltipService.createTooltip({
      placement: () => 'auto',
      element: this.elementRef,
      describedBy: this.describedBy,
      injector: Injector.create({
        providers: [{ provide: SI_FORM_VALIDATION_TOOLTIP_DATA, useValue: this.errors }]
      }),
      canShow: this.canShowTooltip,
      tooltip: () => SiFormValidationTooltipComponent,
      // Not actually used, but errors in the context triggers a resize if the errors changes.
      tooltipContext: this.errors
    });
  }

  ngDoCheck(): void {
    const nextErrors = this.ngControl.errors;
    this.touched.set(!!this.ngControl.touched);

    if (this.currentErrors !== nextErrors) {
      this.currentErrors = nextErrors;
      this.updateErrors();
    }
  }

  private updateErrors(): void {
    const errors = this.formValidationService
      .resolveErrors(
        this.ngControl.name,
        this.currentErrors,
        this.formErrorMapper(),
        this.formContainer?.formErrorMapper()
      )
      .filter(error => !!error.message);

    this.errors.set(errors);
  }
}
