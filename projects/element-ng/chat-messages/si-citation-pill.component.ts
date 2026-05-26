/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { DOCUMENT } from '@angular/common';
/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  OnInit,
  output,
  signal,
  viewChild
} from '@angular/core';
import { elementGlobal } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import {
  SiPopoverDirective,
  SiPopoverTitleDirective,
  SiPopoverBodyDirective
} from '@siemens/element-ng/popover';
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
  imports: [
    SiIconComponent,
    SiTranslatePipe,
    SiPopoverDirective,
    SiPopoverTitleDirective,
    SiPopoverBodyDirective
  ],
  template: `
    <span role="group" [siPopover]="citationPreview" [siPopoverPlacement]="placement()">
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
          (click)="onClicked($event)"
        >
          @if (icon()) {
            <si-icon aria-hidden="true" [icon]="icon()!" />
          }
          {{ label() | translate }}</button
        >
      }
    </span>

    <ng-template #citationPreview>
      <si-popover-title>{{ citation().title }}</si-popover-title>
      <si-popover-body>
        @if (citation().description) {
          <p class="text-secondary mb-0">{{ citation().description }}</p>
        }
        @if (citation().url) {
          <a
            class="link-text d-inline-block mt-3"
            target="_blank"
            rel="noopener noreferrer"
            [href]="citation().url"
            >{{ viewSource | translate }}
            <i aria-hidden="true" class="link-icon element-right-2 flip-rtl"></i>
          </a>
        }
      </si-popover-body>
    </ng-template>
  `,
  styleUrl: './si-citation-pill.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'si-citation-pill-host',
    '(mouseenter)': 'onMouseEnter()',
    '(mouseleave)': 'scheduleHide()'
  }
})
export class SiCitationPillComponent implements OnInit {
  protected readonly icons = addIcons({ elementGlobal });
  protected readonly viewSource = t(() => $localize`:@@SI_CITATION_PILL.VIEW_SOURCE:View source`);
  private readonly elementRef = inject(ElementRef);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private hideTimer: ReturnType<typeof setTimeout> | undefined;
  private overlayListenersAttached = false;
  private observer: MutationObserver | undefined;

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

  protected readonly popoverDir = viewChild(SiPopoverDirective);
  protected readonly placement = signal<'top' | 'bottom'>('bottom');

  ngOnInit(): void {
    this.destroyRef.onDestroy(() => {
      clearTimeout(this.hideTimer);
      this.observer?.disconnect();
    });
  }

  private updatePlacement(): void {
    const windowRef = this.document.defaultView;
    if (!windowRef) return;
    const rect = (this.elementRef.nativeElement as HTMLElement).getBoundingClientRect();
    const spaceBelow = windowRef.innerHeight - rect.bottom;
    this.placement.set(spaceBelow < rect.top ? 'top' : 'bottom');
  }

  private scheduleShow(): void {
    clearTimeout(this.hideTimer);
    this.popoverDir()?.show();
  }

  protected scheduleHide(): void {
    clearTimeout(this.hideTimer);
    this.hideTimer = setTimeout(() => this.popoverDir()?.hide(), 150);
  }

  private attachOverlayHoverListeners(): void {
    if (this.overlayListenersAttached) return;
    // Run after the overlay is attached to the DOM
    setTimeout(() => {
      const dir = this.popoverDir();
      if (!dir) return;
      const panel = this.document.getElementById(dir.popoverId)?.closest('.cdk-overlay-pane');
      if (!panel) return;
      this.overlayListenersAttached = true;
      const onEnter = (): void => clearTimeout(this.hideTimer);
      const onLeave = (): void => this.scheduleHide();
      panel.addEventListener('mouseenter', onEnter);
      panel.addEventListener('mouseleave', onLeave);
      // Reset flag once the panel is removed from the DOM
      this.observer = new MutationObserver(() => {
        if (!this.document.contains(panel)) {
          this.overlayListenersAttached = false;
          this.observer?.disconnect();
          this.observer = undefined;
        }
      });
      this.observer.observe(this.document.body, { childList: true, subtree: true });
    });
  }

  protected onMouseEnter(): void {
    this.updatePlacement();
    this.scheduleShow();
    this.attachOverlayHoverListeners();
  }

  protected onClicked(event?: MouseEvent): void {
    event?.preventDefault();
    event?.stopPropagation();
    this.updatePlacement();
    this.clicked.emit(this.citation());
  }
}
