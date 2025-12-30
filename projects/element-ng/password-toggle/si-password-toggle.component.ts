/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, contentChild, DoCheck, input, output, signal } from '@angular/core';
import { NgControl } from '@angular/forms';
import { addIcons, elementHide, elementShow, SiIconComponent } from '@siemens/element-ng/icon';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';

@Component({
  selector: 'si-password-toggle',
  imports: [SiIconComponent, SiTranslatePipe],
  templateUrl: './si-password-toggle.component.html',
  styleUrl: './si-password-toggle.component.scss',
  host: {
    class: 'form-control-wrapper',
    '[class.ng-invalid]': 'isInvalid()',
    '[class.ng-touched]': 'isTouched()',
    '[class.show-visibility-icon]': 'showVisibilityIcon()'
  }
})
export class SiPasswordToggleComponent implements DoCheck {
  protected readonly ngControl = contentChild(NgControl);
  /**
   * Whether to show the visibility toggle icon.
   *
   * @defaultValue true
   */
  readonly showVisibilityIcon = input(true);

  /**
   * Emits the `type` attribute for the `<input>` ('password' | 'text')
   * whenever the password visibility is getting toggled.
   */
  readonly typeChange = output<string>();

  /**
   * The aria-label (translatable) for the password show icon.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_PASSWORD_TOGGLE.SHOW:show password`)
   * ```
   */
  readonly showLabel = input(t(() => $localize`:@@SI_PASSWORD_TOGGLE.SHOW:show password`));
  /**
   * The aria-label (translatable) for the password hide icon.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_PASSWORD_TOGGLE.HIDE:hide password`)
   * ```
   */
  readonly hideLabel = input(t(() => $localize`:@@SI_PASSWORD_TOGGLE.HIDE:hide password`));

  protected readonly showPassword = signal<boolean>(false);
  protected readonly icons = addIcons({ elementHide, elementShow });
  protected readonly isTouched = signal(false);
  protected readonly isInvalid = signal(false);

  /** The `type` attribute for the `<input>` ('password' | 'text'). */
  get inputType(): string {
    return this.showPassword() ? 'text' : 'password';
  }

  ngDoCheck(): void {
    const control = this.ngControl()?.control;
    this.isTouched.set(!!control?.touched);
    this.isInvalid.set(!!control?.invalid);
  }

  protected toggle(): void {
    this.showPassword.set(!this.showPassword());
    this.typeChange.emit(this.inputType);
  }
}
