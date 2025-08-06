/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, input, output, signal } from '@angular/core';
import { addIcons, elementHide, elementShow, SiIconNextComponent } from '@siemens/element-ng/icon';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';

@Component({
  selector: 'si-password-toggle',
  imports: [SiIconNextComponent, SiTranslatePipe],
  templateUrl: './si-password-toggle.component.html',
  styleUrl: './si-password-toggle.component.scss',
  host: {
    '[class.show-visibility-icon]': 'showVisibilityIcon()'
  }
})
export class SiPasswordToggleComponent {
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

  /** The `type` attribute for the `<input>` ('password' | 'text'). */
  get inputType(): string {
    return this.showPassword() ? 'text' : 'password';
  }

  protected toggle(): void {
    this.showPassword.set(!this.showPassword());
    this.typeChange.emit(this.inputType);
  }
}
