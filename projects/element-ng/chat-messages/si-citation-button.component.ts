/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  OnInit,
  output,
  PLATFORM_ID,
  signal,
  viewChild
} from '@angular/core';
import { elementGlobal } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiPopoverBodyDirective, SiPopoverDirective } from '@siemens/element-ng/popover';
import { SiTranslatePipe, t, TranslatableString } from '@siemens/element-translate-ng/translate';

import { SiChatCitation } from './si-annotated-text.model';

/**
 * Source citation action button displayed in the action bar of an AI message.
 *
 * Renders a circular icon button (globe icon) that, when hovered or clicked,
 * opens a popover listing all citations referenced in the message.
 * Each citation is displayed as a link (when a URL is present) or a plain button,
 * optionally followed by a short description.
 *
 * A {@link SiCitationButtonComponent#citationClicked} event is emitted whenever
 * the user activates an individual citation inside the popover, allowing the host
 * to intercept navigation and implement custom behaviour.
 *
 * Intended to be used inside the action bar of {@link SiAiMessageComponent} when
 * the `showSourceCitationButton` input is enabled on that component.
 *
 * @experimental
 */
@Component({
  selector: 'si-citation-button',
  imports: [SiIconComponent, SiTranslatePipe, SiPopoverDirective, SiPopoverBodyDirective],
  template: `
    <span [siPopover]="citationsPreview" [siPopoverPlacement]="placement()">
      <button
        type="button"
        class="citation-pill"
        [attr.aria-label]="label() | translate"
        [attr.title]="label() | translate"
        (click)="onButtonClick()"
      >
        <si-icon aria-hidden="true" [icon]="icons.elementGlobal" />
        {{ label() | translate }}
      </button>
    </span>

    <ng-template #citationsPreview>
      <si-popover-body>
        <ul class="list-unstyled mb-0">
          @for (cit of citations(); track cit.id) {
            <li [class.mb-5]="!$last">
              <p class="fw-bold mb-0">{{ cit.title }}</p>
              @if (cit.description) {
                <p class="text-secondary mb-0">{{ cit.description }}</p>
              }
              @if (cit.url) {
                <a
                  class="link-text d-inline-block mt-3"
                  target="_blank"
                  rel="noopener noreferrer"
                  [href]="cit.url"
                  (click)="onCitationClicked(cit, $event)"
                  >{{ viewSource | translate }}
                  <i aria-hidden="true" class="link-icon element-right-2 flip-rtl"></i>
                </a>
              }
            </li>
          }
        </ul>
      </si-popover-body>
    </ng-template>
  `,
  styleUrl: './si-citation-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'si-citation-button-host',
    '(mouseenter)': 'onMouseEnter()',
    '(mouseleave)': 'scheduleHide()'
  }
})
export class SiCitationButtonComponent implements OnInit {
  protected readonly icons = addIcons({ elementGlobal });
  protected readonly viewSource = t(() => $localize`:@@SI_CITATION_PILL.VIEW_SOURCE:View source`);

  private readonly elementRef = inject(ElementRef);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private hideTimer: ReturnType<typeof setTimeout> | undefined;
  private hoverListenerTimeout: ReturnType<typeof setTimeout> | undefined;
  private overlayAbortController: AbortController | undefined;
  private overlayListenersAttached = false;
  private observer: MutationObserver | undefined;

  /** The list of citations to display in the popover. */
  readonly citations = input.required<SiChatCitation[]>();

  /**
   * Accessible label for the citation button.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CITATION_BUTTON.LABEL:View sources`)
   * ```
   */
  readonly label = input<TranslatableString>(
    t(() => $localize`:@@SI_CITATION_BUTTON.LABEL:View sources`)
  );

  /**
   * Emitted when a citation inside the popover is activated (clicked).
   * For link citations, default navigation is prevented so the host can
   * decide whether to open the URL, show a preview, trigger an alert, etc.
   */
  readonly citationClicked = output<SiChatCitation>();

  protected readonly popoverDir = viewChild(SiPopoverDirective);
  protected readonly placement = signal<'top' | 'bottom'>('bottom');

  ngOnInit(): void {
    this.destroyRef.onDestroy(() => {
      clearTimeout(this.hideTimer);
      clearTimeout(this.hoverListenerTimeout);
      this.cleanupOverlayListeners();
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
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.overlayListenersAttached) return;
    this.hoverListenerTimeout = setTimeout(() => {
      const dir = this.popoverDir();
      if (!dir) return;
      const panel = this.document.getElementById(dir.popoverId)?.closest('.cdk-overlay-pane');
      if (!panel) return;
      this.overlayListenersAttached = true;
      this.overlayAbortController = new AbortController();
      const onEnter = (): void => clearTimeout(this.hideTimer);
      const onLeave = (): void => this.scheduleHide();
      panel.addEventListener('mouseenter', onEnter, { signal: this.overlayAbortController.signal });
      panel.addEventListener('mouseleave', onLeave, { signal: this.overlayAbortController.signal });
      this.observer = new MutationObserver(() => {
        if (!this.document.contains(panel)) {
          this.cleanupOverlayListeners();
        }
      });
      this.observer.observe(this.document.body, { childList: true, subtree: true });
    });
  }

  private cleanupOverlayListeners(): void {
    this.overlayListenersAttached = false;
    this.overlayAbortController?.abort();
    this.overlayAbortController = undefined;
    this.observer?.disconnect();
    this.observer = undefined;
  }

  protected onMouseEnter(): void {
    this.updatePlacement();
    this.scheduleShow();
    this.attachOverlayHoverListeners();
  }

  protected onButtonClick(): void {
    this.updatePlacement();
    this.scheduleShow();
    this.attachOverlayHoverListeners();
  }

  protected onCitationClicked(citation: SiChatCitation, event?: MouseEvent): void {
    event?.preventDefault();
    this.citationClicked.emit(citation);
  }
}
