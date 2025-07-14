/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectorRef, inject, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { Subscription } from 'rxjs';

import { injectSiTranslateService } from './si-translate.inject';
import { SiTranslateService } from './si-translate.service';

/**
 * Translates keys by using the {@link SiTranslateService}.
 * Within Element this pipe should be used instead of ngx-translates `translate` pipe.
 * Outside Element, this pipe should NOT be used.
 *
 * @internal
 */

@Pipe({
  name: 'translate',
  // eslint-disable-next-line @angular-eslint/no-pipe-impure
  pure: false
})
export class SiTranslatePipe implements PipeTransform, OnDestroy {
  private lastKeyParams?: string;
  private value = '';
  private subscription?: Subscription;
  private siTranslateService = injectSiTranslateService();
  private cdRef = inject(ChangeDetectorRef);

  /**
   * Method which is called on any data passed to the pipe.
   * Called by Angular, should not be called directly.
   */
  // The first type is for cases when there is definitely defined string, so that we can use the pipe to assign values to a required variable.
  // The second type is for everything else, so that we can use the pipe for optional inputs
  transform(key: string, params?: any): string;
  transform(key: string | null | undefined, params?: any): string | null | undefined;
  transform(key: string | null | undefined, params?: any): string | null | undefined {
    if (!key) {
      return key;
    }

    const currentKeyParams = params ? `${key}-${JSON.stringify(params)}` : key;

    if (this.lastKeyParams === currentKeyParams) {
      return this.value;
    }

    this.subscription?.unsubscribe();

    const translate = this.siTranslateService.translate(key, params);
    if (typeof translate === 'string') {
      this.updateValue(currentKeyParams, translate);
    } else {
      this.subscription = translate.subscribe(value => this.updateValue(currentKeyParams, value));
    }

    return this.value;
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.subscription = undefined;
  }

  private updateValue(currentKeyParams: string, value: string): void {
    this.lastKeyParams = currentKeyParams;
    this.value = value;
    this.cdRef.markForCheck();
  }
}
