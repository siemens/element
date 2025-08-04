/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Overlay, OverlayContainer } from '@angular/cdk/overlay';
import { Directive, ElementRef, inject, DOCUMENT } from '@angular/core';

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
  providers: [{ provide: OverlayContainer, useExisting: SiShadowRootDirective }, Overlay]
})
export class SiShadowRootDirective extends OverlayContainer {
  private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private document = inject(DOCUMENT);

  // eslint-disable-next-line @typescript-eslint/naming-convention
  protected override _createContainer(): void {
    const root = document.createElement('element-overlay-root');
    this.document.body.append(root);
    const shadow = root.attachShadow({ mode: 'open' });
    const shadowElement = document.createElement('div');
    shadowElement.classList.add('cdk-overlay-container');
    shadow.append(
      ...Array.from(this.elementRef.nativeElement.shadowRoot!.styleSheets).map(styleSheet =>
        styleSheet.ownerNode!.cloneNode(true)
      ),
      shadowElement
    );

    this._containerElement = shadowElement;
  }
}
