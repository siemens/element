/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { elementGlobal } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';

import { SiChatCitation } from './si-annotated-text.model';

/**
 * Inline citation pill button displayed within AI message text.
 *
 * Renders a fully-rounded pill-shaped button that references a single source
 * citation. When a URL is provided on the citation it acts as a link and opens
 * the source in a new tab; otherwise it renders as a plain button.
 * In both cases a {@link SiCitationPillComponent#clicked} event is emitted on click,
 * allowing the host to intercept default navigation and implement custom behaviour.
 *
 * Intended to be used inside the annotated-text rendering path of
 * {@link SiAiMessageComponent}.
 *
 * @experimental
 */
@Component({
  selector: 'si-citation-pill',
  imports: [SiIconComponent, SiTranslatePipe],
  template: `
    @if (citation().url) {
      <a
        class="citation-pill"
        target="_blank"
        rel="noopener noreferrer"
        [href]="citation().url"
        [attr.title]="citation().title"
        [attr.aria-label]="citation().title"
        (click)="onClicked($event)"
      >
        @if (icon()) {
          <si-icon aria-hidden="true" [icon]="icon()!" />
        }
        {{ label() | translate }}</a
      >
    } @else {
      <button
        type="button"
        class="citation-pill"
        [attr.title]="citation().title"
        [attr.aria-label]="citation().title"
        (click)="onClicked()"
      >
        @if (icon()) {
          <si-icon aria-hidden="true" [icon]="icon()!" />
        }
        {{ label() | translate }}</button
      >
    }
  `,
  styleUrl: './si-citation-pill.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'si-citation-pill-host' }
})
export class SiCitationPillComponent {
  protected readonly icons = addIcons({ elementGlobal });

  /** The citation data to display. */
  readonly citation = input.required<SiChatCitation>();

  /**
   * Icon displayed inside the pill. Pass `undefined` to hide the icon.
   * @defaultValue elementGlobal
   */
  readonly icon = input<string | undefined>(elementGlobal);

  /**
   * Label text displayed inside the pill.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CITATION_PILL.LABEL:Source for this paragraph`)
   * ```
   */
  readonly label = input(t(() => $localize`:@@SI_CITATION_PILL.LABEL:Source for this paragraph`));

  /**
   * Emitted when the pill is clicked. For link pills, default navigation is
   * prevented so the host can decide whether to open the URL, show a preview,
   * trigger an alert, etc.
   */
  readonly clicked = output<SiChatCitation>();

  protected onClicked(event?: MouseEvent): void {
    event?.preventDefault();
    this.clicked.emit(this.citation());
  }
}
