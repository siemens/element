/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  ChangeDetectionStrategy,
  Component,
  contentChildren,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  Renderer2,
  ViewContainerRef
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { SiTranslatePlaceholderDirective } from './si-translate-placeholder.directive';
import { injectSiTranslateService } from './si-translate.inject';

/** Regex matching `{{placeholderName}}` tokens, capturing the name. */
const PLACEHOLDER_REGEX = /\{\{\s*([^}]+?)\s*\}\}/;

/**
 * Component that renders a translated string with template-based placeholder interpolation.
 *
 * Instead of using `[innerHTML]` to embed rich markup in translations, this component
 * allows you to define `<ng-template>` slots that are safely rendered in place of
 * `{{placeholder}}` tokens in the translated string.
 *
 * This is XSS-safe by design: no HTML from translation strings is ever parsed or inserted
 * into the DOM. Templates are real Angular views with full binding support.
 *
 * @example
 * Translation file:
 * ```json
 * { "startsIn": "Event begins {{start-time}} in {{location}}" }
 * ```
 *
 * Template:
 * ```html
 * <span siTranslateTemplate key="startsIn" [params]="{ 'start-time': eventStartTime }">
 *   <ng-template siTranslatePlaceholder="location">
 *     <a [routerLink]="['/venues', venueId]">{{ venueName }}</a>
 *   </ng-template>
 * </span>
 * ```
 *
 * Rendered output:
 * ```html
 * <span>Event begins 15:00 in <a href="...">Main Hall</a></span>
 * ```
 *
 * Placeholders without a matching `siTranslatePlaceholder` template fall back to the value
 * from `params` (if provided), or render the raw `{{name}}` token.
 *
 * @experimental
 * @internal
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[siTranslateTemplate]',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiTranslateTemplateComponent {
  private readonly translateService = injectSiTranslateService();
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly renderer = inject(Renderer2);
  private readonly elementRef = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  /** The translation key to resolve. */
  readonly key = input.required<string>({ alias: 'siTranslateTemplate' });

  /** Optional plain-text parameters for placeholders without a template slot. */
  readonly params = input<Record<string, unknown>>();

  /** @internal */
  readonly templates = contentChildren(SiTranslatePlaceholderDirective);

  constructor() {
    // Re-render whenever translation key, params, or templates change.
    effect(onCleanup => {
      const key = this.key();
      const params = this.params();
      const templates = this.templates();

      const sub = this.translateService
        .translateAsync(key, params)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(value => this.render(value, templates, params));

      onCleanup(() => sub.unsubscribe());
    });
  }

  private render(
    translatedText: string,
    slots: readonly SiTranslatePlaceholderDirective[],
    params?: Record<string, unknown>
  ): void {
    // Clear previous content.
    this.viewContainerRef.clear();
    const hostElement: HTMLElement = this.elementRef.nativeElement;

    // Remove any leftover text nodes from previous renders.
    while (hostElement.firstChild) {
      this.renderer.removeChild(hostElement, hostElement.firstChild);
    }

    // The split produces alternating segments: [text, placeholder, text, placeholder, ...]
    // Due to the capture group in the regex, odd-indexed segments are placeholder names.
    // But because we filter empty strings, we need to track position differently.
    // Re-split without filter to maintain positional info:
    const rawSegments = translatedText.split(new RegExp(`(${PLACEHOLDER_REGEX.source})`, 'g'));

    // rawSegments alternates: [text, fullMatch, captureName, text, fullMatch, captureName, ...]
    // Pattern: index % 3 === 0 → text, % 3 === 1 → full match ({{name}}), % 3 === 2 → captured name
    for (let i = 0; i < rawSegments.length; i++) {
      if (i % 3 === 0) {
        // Plain text segment.
        if (rawSegments[i]) {
          const textNode = this.renderer.createText(rawSegments[i]);
          this.renderer.appendChild(hostElement, textNode);
        }
      } else if (i % 3 === 2) {
        // Captured placeholder name.
        const placeholderName = rawSegments[i].trim();
        const slot = slots.find(s => s.name() === placeholderName);

        if (slot) {
          // Create an embedded view from the template and attach its nodes to the host.
          const viewRef = this.viewContainerRef.createEmbeddedView(slot.template);
          for (const node of viewRef.rootNodes) {
            this.renderer.appendChild(hostElement, node);
          }
        } else if (params?.[placeholderName] !== undefined) {
          // Fallback: use the plain-text param value.
          const textNode = this.renderer.createText(String(params[placeholderName]));
          this.renderer.appendChild(hostElement, textNode);
        } else {
          // No template and no param — render the raw placeholder token.
          const textNode = this.renderer.createText(rawSegments[i - 1]);
          this.renderer.appendChild(hostElement, textNode);
        }
      }
      // i % 3 === 1 is the full match ({{name}}) — skip, we use the capture group at i % 3 === 2.
    }
  }
}
