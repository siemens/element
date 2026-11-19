import { LiveAnnouncer } from '@angular/cdk/a11y';
import { afterNextRender, Component, DestroyRef, inject, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { injectSiTranslateService, t } from '@siemens/element-translate-ng/translate';
import { take } from 'rxjs';

@Component({
  selector: 'si-message-loader',
  template: `
    <i aria-hidden="true"></i>
    <i aria-hidden="true"></i>
    <i aria-hidden="true"></i>
  `,
  styleUrl: './si-message-loader.component.scss'
})
export class SiMessageLoaderComponent {
  /**
   * Status text announced to assistive technology when the loader appears.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_MESSAGE_LOADER.LOADING_TEXT:Waiting for a response`)
   * ```
   */
  readonly loadingText = input(
    t(() => $localize`:@@SI_MESSAGE_LOADER.LOADING_TEXT:Waiting for a response`)
  );

  private readonly destroyRef = inject(DestroyRef);
  private readonly liveAnnouncer = inject(LiveAnnouncer);
  private readonly translateService = injectSiTranslateService();

  constructor() {
    afterNextRender(() => {
      this.translateService
        .translateAsync(this.loadingText())
        .pipe(take(1), takeUntilDestroyed(this.destroyRef))
        .subscribe(message => this.liveAnnouncer.announce(message));
    });
  }
}
