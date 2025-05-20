/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import {
  afterNextRender,
  Directive,
  ElementRef,
  HostListener,
  inject,
  Injector,
  OnInit,
  signal
} from '@angular/core';

/** The siemens logo. Should be located inside `.header-brand`. */
@Directive({
  selector: 'si-header-logo, [siHeaderLogo]',
  host: {
    class: 'header-logo px-6 focus-inside',
    '[attr.aria-label]': 'logoText()'
  }
})
export class SiHeaderLogoDirective implements OnInit {
  protected readonly logoText = signal<string | undefined>(undefined);

  private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private injector = inject(Injector);

  ngOnInit(): void {
    this.updateLogoText();
  }

  @HostListener('window:theme-switch')
  protected updateLogoText(): void {
    afterNextRender(
      {
        read: () =>
          this.logoText.set(
            window
              .getComputedStyle(this.elementRef.nativeElement)
              .getPropertyValue('--element-brand-logo-text')
              .replace(/^["']|["']$/g, '')
          )
      },
      { injector: this.injector }
    );
  }
}
