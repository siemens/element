/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  Component,
  inject,
  input,
  OnInit,
  output,
  OnDestroy,
  ChangeDetectionStrategy
} from '@angular/core';
import { SiTranslatePipe, t, TranslatableString } from '@siemens/element-translate-ng/translate';

import { SiLandingPageComponent } from '../si-landing-page.component';

/**
 * A component for displaying legal agreements that require explicit user acknowledgment.
 *
 * This component provides a standardized interface for presenting legal documents,
 * terms of service, privacy policies, or other agreements that users must
 * explicitly accept before proceeding.
 *
 * @example
 * ```html
 * <si-explicit-legal-acknowledge
 *   [heading]="agreementTitle"
 *   [subheading]="agreementDescription"
 *   [disableAcceptance]="isProcessing"
 *   (accept)="handleAcceptance()"
 *   (back)="handleBack()">
 *   <div>
 *     <h3>Terms of Service</h3>
 *     <p>Please read and accept our terms before continuing.</p>
 *     <ul>
 *       <li>Term 1: You agree to ...</li>
 *       <li>Term 2: You acknowledge ...</li>
 *     </ul>
 *   </div>
 * </si-explicit-legal-acknowledge>
 * ```
 */
@Component({
  selector: 'si-explicit-legal-acknowledge',
  imports: [SiTranslatePipe],
  templateUrl: './si-explicit-legal-acknowledge.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiExplicitLegalAcknowledgeComponent implements OnInit, OnDestroy {
  /**
   * Heading of the agreement.
   */
  readonly heading = input.required<TranslatableString>();
  /**
   * Short description of the agreement.
   */
  readonly subheading = input.required<TranslatableString>();
  /**
   * Label for accept button.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_EXPLICIT_LEGAL_ACKNOWLEDGE.ACCEPT:Accept`)
   * ```
   */
  readonly acceptButtonLabel = input(
    t(() => $localize`:@@SI_EXPLICIT_LEGAL_ACKNOWLEDGE.ACCEPT:Accept`)
  );
  /**
   * Description of back button.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_EXPLICIT_LEGAL_ACKNOWLEDGE.BACK:Back`)
   * ```
   */
  readonly backButtonLabel = input(t(() => $localize`:@@SI_EXPLICIT_LEGAL_ACKNOWLEDGE.BACK:Back`));
  /**
   * Disables the acceptance button.
   *
   * @defaultValue false
   */
  readonly disableAcceptance = input(false);
  /**
   * Emits end user license agreement on acceptance event.
   */
  readonly accept = output<void>();
  /**
   * Emits on back click.
   */
  readonly back = output<void>();
  /**
   * Reference to the landing page parent component.
   */
  protected landingPage = inject(SiLandingPageComponent, { skipSelf: true, optional: true });

  protected handleBack(): void {
    this.back.emit();
  }

  protected handleAccept(): void {
    this.accept.emit();
  }

  ngOnInit(): void {
    this.landingPage?.isFullHeightSection.set(true);
  }

  ngOnDestroy(): void {
    this.landingPage?.isFullHeightSection.set(false);
  }
}
