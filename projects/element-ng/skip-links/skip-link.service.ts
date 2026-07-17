/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
  inject,
  Injectable,
  DOCUMENT,
  signal,
  inputBinding
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
  private readonly registeredTargets = signal<SiSkipLinkTargetDirective[]>([]);

  registerLink(skipLink: SiSkipLinkTargetDirective): void {
    if (!this.skipLinksComponentRef) {
      this.createSkipLinksComponent();
    }
    this.registeredTargets.update(targets => [...targets, skipLink]);
  }

  unregisterLink(skipLink: SiSkipLinkTargetDirective): void {
    this.registeredTargets.update(targets => targets.filter(t => t !== skipLink));

    if (!this.registeredTargets().length && this.skipLinksComponentRef) {
      this.skipLinksComponentRef?.destroy();
      this.skipLinksComponentRef = undefined;
    }
  }

  private createSkipLinksComponent(): void {
    this.skipLinksComponentRef = createComponent(SiSkipLinksComponent, {
      environmentInjector: this.environmentInjector,
      bindings: [inputBinding('skipLinks', this.registeredTargets)]
    });

    this.appRef.attachView(this.skipLinksComponentRef.hostView);
    this.document.body.insertBefore(
      this.skipLinksComponentRef.location.nativeElement,
      this.document.body.children.item(0)
    );
  }
}
