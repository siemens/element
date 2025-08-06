/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  Directive,
  DoCheck,
  ElementRef,
  HostListener,
  inject,
  Injector,
  input,
  OnDestroy,
  signal
} from '@angular/core';
import { NgControl, ValidationErrors } from '@angular/forms';
import { SiTooltipService, TooltipRef } from '@spike-rabbit/element-ng/tooltip';

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

  // Use a counter to track how many events are matched that keep the tooltip active.
  // Active means we are listening to error changes.
  private activationCount = 0;
  protected readonly describedBy = `__si-form-validation-tooltip-${SiFormValidationTooltipDirective.idCounter++}`;

  ngDoCheck(): void {
    if (
      this.activationCount &&
      (this.currentErrors !== this.ngControl.errors || this.touched !== this.ngControl.touched)
    ) {
      this.currentErrors = this.ngControl.errors;
      this.touched = this.ngControl.touched;
      this.updateErrors();
    }
  }

  ngOnDestroy(): void {
    this.destroyTooltip();
  }

  @HostListener('focus')
  @HostListener('mouseenter')
  protected increaseActivation(): void {
    this.activationCount++;
    if (this.activationCount === 1) {
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

    if (!this.tooltipRef && errors.length && this.ngControl.touched) {
      this.tooltipRef = this.tooltipService.createTooltip({
        placement: 'auto',
        element: this.elementRef,
        describedBy: this.describedBy,
        injector: Injector.create({
          providers: [{ provide: SI_FORM_VALIDATION_TOOLTIP_DATA, useValue: this.errors }]
        })
      });
      this.tooltipRef.show(SiFormValidationTooltipComponent);
    } else if (this.tooltipRef && (!errors.length || this.ngControl.pristine)) {
      this.destroyTooltip();
    }

    this.errors.set(errors);
  }

  @HostListener('blur')
  @HostListener('mouseleave')
  protected decreaseActivation(): void {
    this.activationCount--;
    if (!this.activationCount) {
      this.destroyTooltip();
    }
  }

  private destroyTooltip(): void {
    this.tooltipRef?.destroy();
    this.tooltipRef = undefined;
  }
}
