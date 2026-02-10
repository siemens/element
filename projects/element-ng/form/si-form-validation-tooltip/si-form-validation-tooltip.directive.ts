/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  Directive,
  DoCheck,
  ElementRef,
  inject,
  Injector,
  input,
  OnDestroy,
  signal
} from '@angular/core';
import { NgControl, ValidationErrors } from '@angular/forms';
import { SiTooltipService, TooltipRef } from '@siemens/element-ng/tooltip';

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
export class SiFormValidationTooltipDirective implements OnDestroy, DoCheck {
  private static idCounter = 0;

  private tooltipService = inject(SiTooltipService);
  private formValidationService = inject(SiFormValidationErrorService);
  private formContainer = inject(SiFormContainerComponent, { optional: true });
  readonly formErrorMapper = input<SiFormValidationErrorMapper>();
  private ngControl = inject(NgControl);
  private elementRef = inject(ElementRef);

  private tooltipRef?: TooltipRef;
  private readonly errors = signal<SiFormError[]>([]);
  private currentErrors: ValidationErrors | null = null;
  private touched: boolean | null = null;
  protected readonly describedBy = `__si-form-validation-tooltip-${SiFormValidationTooltipDirective.idCounter++}`;

  ngDoCheck(): void {
    const nextErrors = this.ngControl.errors;
    const nextTouched = this.ngControl.touched;

    if (this.currentErrors !== nextErrors || this.touched !== nextTouched) {
      this.currentErrors = nextErrors;
      this.touched = nextTouched;
      this.updateErrors();
    }
  }

  ngOnDestroy(): void {
    this.destroyTooltip();
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

    const shouldShow = errors.length > 0 && !!this.ngControl.touched;

    if (shouldShow) {
      this.createTooltip();
    } else {
      this.destroyTooltip();
    }

    this.errors.set(errors);
  }

  private createTooltip(): void {
    this.tooltipRef ??= this.tooltipService.createTooltip({
      placement: 'auto',
      element: this.elementRef,
      describedBy: this.describedBy,
      injector: Injector.create({
        providers: [{ provide: SI_FORM_VALIDATION_TOOLTIP_DATA, useValue: this.errors }]
      }),
      tooltip: () => SiFormValidationTooltipComponent,
      tooltipContext: () => undefined
    });
  }

  private destroyTooltip(): void {
    this.tooltipRef?.destroy();
    this.tooltipRef = undefined;
  }
}
