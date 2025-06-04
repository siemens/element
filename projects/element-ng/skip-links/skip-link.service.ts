/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { DOCUMENT } from '@angular/common';
import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
  inject,
  Injectable
} from '@angular/core';

import { SiSkipLinkTargetDirective } from './si-skip-link-target.directive';
import { SiSkipLinksComponent } from './si-skip-links.component';

@Injectable({
  providedIn: 'root'
})
export class SkipLinkService {
  private skipLinksComponentRef?: ComponentRef<SiSkipLinksComponent>;
  private appRef = inject(ApplicationRef);
  private environmentInjector = inject(EnvironmentInjector);
  private document = inject(DOCUMENT);
  private registeredTargets: SiSkipLinkTargetDirective[] = [];

  registerLink(skipLink: SiSkipLinkTargetDirective): void {
    if (!this.skipLinksComponentRef) {
      this.createSkipLinksComponent();
    }

    this.registeredTargets.push(skipLink);
    this.skipLinksComponentRef!.setInput('skipLinks', this.registeredTargets);
    this.skipLinksComponentRef!.changeDetectorRef.markForCheck();
  }

  unregisterLink(skipLink: SiSkipLinkTargetDirective): void {
    this.registeredTargets.splice(this.registeredTargets.indexOf(skipLink), 1);

    if (this.registeredTargets.length && this.skipLinksComponentRef) {
      this.skipLinksComponentRef.setInput('skipLinks', this.registeredTargets);
      this.skipLinksComponentRef.changeDetectorRef.markForCheck();
    } else {
      this.skipLinksComponentRef?.destroy();
      this.skipLinksComponentRef = undefined;
    }
  }

  private createSkipLinksComponent(): void {
    this.skipLinksComponentRef = createComponent(SiSkipLinksComponent, {
      environmentInjector: this.environmentInjector
    });

    this.appRef.attachView(this.skipLinksComponentRef.hostView);
    this.document.body.insertBefore(
      this.skipLinksComponentRef.location.nativeElement,
      this.document.body.children.item(0)
    );
  }
}
