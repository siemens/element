/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  AfterViewInit,
  Component,
  contentChildren,
  ElementRef,
  inject,
  input,
  signal
} from '@angular/core';
import { SiPasswordToggleComponent } from '@siemens/element-ng/password-toggle';

import { SiPasswordStrengthDirective } from './si-password-strength.directive';

@Component({
  selector: 'si-password-strength',
  imports: [SiPasswordToggleComponent],
  template: `
    <si-password-toggle [showVisibilityIcon]="showVisibilityIcon()" (typeChange)="toggle($event)">
      <ng-content />
    </si-password-toggle>
  `,
  styleUrl: './si-password-strength.component.scss',
  host: {
    '[class.bad]': 'bad()',
    '[class.weak]': 'weak()',
    '[class.medium]': 'medium()',
    '[class.good]': 'good()',
    '[class.strong]': 'strong()'
  }
})
export class SiPasswordStrengthComponent implements AfterViewInit {
  /**
   * Whether to show the visibility toggle icon.
   *
   * @defaultValue true
   */
  readonly showVisibilityIcon = input(true);

  private readonly passwordStrengthDirective = contentChildren(SiPasswordStrengthDirective);
  private elRef = inject(ElementRef);

  protected readonly bad = signal(false);
  protected readonly weak = signal(false);
  protected readonly medium = signal(false);
  protected readonly good = signal(false);
  protected readonly strong = signal(false);

  protected toggle(type: string): void {
    const inputEl = this.elRef.nativeElement.querySelector('input');
    if (inputEl) {
      inputEl.type = type;
    }
  }

  ngAfterViewInit(): void {
    this.passwordStrengthDirective().forEach(directive => {
      directive.passwordStrengthChanged.subscribe((strength: number | void) => {
        this.strong.set(strength === 0);
        this.good.set(strength === -1);
        this.medium.set(strength === -2);
        this.weak.set(strength === -3);
        this.bad.set(strength === -4);
      });
    });
  }
}
