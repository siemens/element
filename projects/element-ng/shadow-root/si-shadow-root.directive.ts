/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Overlay, OverlayContainer } from '@angular/cdk/overlay';
import { Directive, ElementRef, inject, DOCUMENT, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SI_THEME_DOM_TARGET, SiThemeService } from '@siemens/element-ng/theme';

import { createShadowRootThemeTarget } from './si-shadow-root-theme-target';

/**
 * This directive is intended to be used in applications that do NOT load element styles in the root HTML element.
 * So typically module federation, single SPA apps or apps that bootstrap element manually in a shadow root.
 *
 * This directive will ensure that overlays created within this shadow root will have the correct styles applied.
 * It does this by creating a new shadow root in the document body
 * and copying the styles from this shadow root to new one.
 *
 * With that approach, we can ensure that overlay can span the entire screen without being limited to the current shadow root.
 *
 * To use this directive, add it to the component / element which creates the shadow root which holds the element styles.
 *
 * @example
 * ```ts
 * @Component({
 *   selector: 'app-root',
 *   encapsulation: ViewEncapsulation.ShadowDom,
 *   hostDirectives: [SiShadowRootDirective],
 *   stylesUrls: ['element-styles.scss'],
 *   template: `<si-element-component />`
 * })
 * export class AppComponent { }
 *
 * ```
 *
 */
@Directive({
  selector: '[siShadowRoot]',
  providers: [
    { provide: OverlayContainer, useExisting: SiShadowRootDirective },
    Overlay,
    SiThemeService,
    { provide: SI_THEME_DOM_TARGET, useFactory: createShadowRootThemeTarget }
  ],
  host: {
    '(window:theme-switch)': 'onThemeSwitch($event)'
  }
})
export class SiShadowRootDirective extends OverlayContainer {
  private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private document = inject(DOCUMENT);
  private destroyRef = inject(DestroyRef);
  private themeTarget = inject(SI_THEME_DOM_TARGET);
  private parentTheme = inject(SiThemeService, { skipSelf: true, optional: true });
  private themeService = inject(SiThemeService, { self: true });

  constructor() {
    super();
    this.parentTheme?.resolvedColorScheme$.pipe(takeUntilDestroyed()).subscribe(colorScheme => {
      this.themeService.applyThemeType(colorScheme);
    });
  }

  protected onThemeSwitch(event: Event): void {
    const themeSwitchEvent = event as CustomEvent<{ dark: boolean }>;
    this.themeService.applyThemeType(themeSwitchEvent.detail.dark ? 'dark' : 'light');
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  protected override _createContainer(): void {
    const sourceShadow = this.elementRef.nativeElement.shadowRoot!;
    const root = this.document.createElement('element-overlay-root');
    const unregisterThemeTarget = this.themeTarget.registerElement?.(root);
    this.document.body.append(root);
    const shadow = root.attachShadow({ mode: 'open' });
    const shadowElement = this.document.createElement('div');
    shadowElement.classList.add('cdk-overlay-container');
    shadow.append(shadowElement);

    const styleCopies = new Map<CSSStyleSheet, Node>();
    const syncStyleElements = (): void => {
      const sourceStyleSheets = new Set(sourceShadow.styleSheets);

      styleCopies.forEach((copy, source) => {
        if (!sourceStyleSheets.has(source)) {
          copy.parentNode?.removeChild(copy);
          styleCopies.delete(source);
        }
      });

      sourceStyleSheets.forEach(source => {
        let copy = styleCopies.get(source);
        if (!copy) {
          copy = source.ownerNode!.cloneNode(true);
          styleCopies.set(source, copy);
        }
        shadow.insertBefore(copy, shadowElement);
      });
    };

    syncStyleElements();
    const observer = new MutationObserver(syncStyleElements);
    observer.observe(sourceShadow, { childList: true });
    this.destroyRef.onDestroy(() => {
      observer.disconnect();
      unregisterThemeTarget?.();
      root.remove();
    });

    this._containerElement = shadowElement;
  }
}
