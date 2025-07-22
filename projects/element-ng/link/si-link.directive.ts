/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
/* eslint-disable @angular-eslint/no-conflicting-lifecycle */
import { LocationStrategy } from '@angular/common';
import {
  booleanAttribute,
  computed,
  Directive,
  DoCheck,
  HostListener,
  inject,
  InjectionToken,
  input,
  OnChanges,
  OnDestroy,
  output,
  signal
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationExtras, Router, UrlTree } from '@angular/router';
import { injectSiTranslateService } from '@siemens/element-translate-ng/translate';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { AriaCurrentType } from './aria-current.model';
import { Link } from './link.model';
import { SiLinkActionService } from './si-link-action.service';

export const SI_LINK_DEFAULT_NAVIGATION_EXTRA = new InjectionToken<NavigationExtras>(
  'SI_LINK_DEFAULT_NAVIGATION_EXTRA'
);

@Directive({
  selector: '[siLink]',
  host: {
    '[attr.href]': 'href()',
    '[attr.target]': 'target()',
    '[attr.title]': 'title()',
    '[attr.aria-current]': 'isAriaCurrent()',
    '[class]': 'active() ? activeClass() : null'
  },
  exportAs: 'siLink'
})
export class SiLinkDirective implements DoCheck, OnChanges, OnDestroy {
  readonly siLink = input<Link>();
  readonly siLinkDefaultTarget = input<string>();
  readonly actionParam = input<any>();
  readonly activeClass = input<string>();
  /** @defaultValue false */
  readonly exactMatch = input(false, { transform: booleanAttribute });
  /**
   * Type for `aria-current` to set if routerLink is active.
   */
  readonly ariaCurrent = input<AriaCurrentType>();

  readonly activeChange = output<boolean>();

  protected readonly href = signal<string | undefined>(undefined);
  protected readonly target = signal<string | undefined>(undefined);
  protected readonly title = signal<string | undefined>(undefined);
  protected readonly isAriaCurrent = computed(() =>
    this.active() ? (this.ariaCurrent() ?? 'true') : undefined
  );

  /** @defaultValue false */
  readonly active = signal(false);

  private readonly destroyer = new Subject<void>();

  private router = inject(Router, { optional: true });
  private activatedRoute = inject(ActivatedRoute, { optional: true });
  private locationStrategy = inject(LocationStrategy, { optional: true });
  private translateService = injectSiTranslateService();
  private actionService = inject(SiLinkActionService, { optional: true });
  private defaultNavigationExtra = inject(SI_LINK_DEFAULT_NAVIGATION_EXTRA, { optional: true });

  private get urlTree(): UrlTree {
    const link = this.siLink()!.link;
    return this.router!.createUrlTree(
      Array.isArray(link!) ? link! : [link!],
      this.navigationExtras
    );
  }

  private get navigationExtras(): NavigationExtras {
    return {
      relativeTo: this.activatedRoute,
      preserveFragment: true,
      queryParamsHandling: 'merge',
      ...this.defaultNavigationExtra,
      ...this.siLink()!.navigationExtras
    };
  }

  ngOnDestroy(): void {
    this.destroyer.next();
    this.destroyer.complete();
  }

  ngOnChanges(): void {
    const siLink = this.siLink();
    if (!siLink) {
      this.href.set(undefined);
      return;
    }
    this.destroyer.next();

    if (siLink.tooltip) {
      this.translateService
        .translateAsync(siLink.tooltip)
        .pipe(takeUntil(this.destroyer))
        .subscribe(text => this.title.set(text));
    }

    if (siLink.action) {
      this.href.set('');
    } else if (siLink.link) {
      this.subscribeRouter();
    } else if (siLink.href) {
      this.href.set(siLink.href);
      this.target.set(siLink.target ?? this.siLinkDefaultTarget());
    } else {
      // In case the siLink has no link, href or action,
      // we remove the href to avoid the mouse pointer.
      this.href.set(undefined);
    }
  }

  ngDoCheck(): void {
    // this deep-checks if isActive has changed. It then updates the internal state and emits the event
    // to be symmetric with the router-link case. queueMicroTask avoids "Expression has changed after it was checked" errors
    const siLink = this.siLink();
    if (
      siLink &&
      !siLink.link &&
      siLink.isActive !== undefined &&
      this.active() !== siLink.isActive
    ) {
      this.active.set(siLink.isActive);
      queueMicrotask(() => {
        this.activeChange.emit(this.active());
      });
    }
  }

  private subscribeRouter(): void {
    if (!this.router || !this.activatedRoute) {
      return;
    }

    // Initial check
    this.updateActiveByRouter();
    this.router.events
      .pipe(
        takeUntil(this.destroyer),
        filter(e => e instanceof NavigationEnd)
      )
      .subscribe(() => this.updateActiveByRouter());
  }

  private updateActiveByRouter(): void {
    const urlTree = this.urlTree;
    this.active.set(
      this.siLink()!.isActive ??
        this.router!.isActive(
          urlTree,
          this.exactMatch()
            ? {
                queryParams: 'exact',
                matrixParams: 'exact',
                paths: 'exact',
                fragment: 'exact'
              }
            : {
                paths: 'subset',
                queryParams: 'subset',
                fragment: 'ignored',
                matrixParams: 'ignored'
              }
        )
    );
    this.href.set(this.locationStrategy!.prepareExternalUrl(this.router!.serializeUrl(urlTree)));
  }

  @HostListener('click', ['$event'])
  onClick(event: any): void {
    const siLink = this.siLink();
    if (siLink?.action) {
      event.preventDefault();

      const actionParam = this.actionParam();
      if (typeof siLink.action === 'string') {
        this.actionService?.emit(siLink, this.actionParam());
      } else if (actionParam === undefined) {
        siLink.action();
      } else {
        siLink.action(actionParam);
      }
      return;
    }

    // ignore regular links, allow user to open links in new tab or window
    if (
      !siLink ||
      siLink.href ||
      event.button > 0 ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
    ) {
      return;
    }

    event.preventDefault();
    // We have links without any action, href or link. For example grouping navbar items that hold a
    // dropdown with links. That is why we need to check if the link property is set.
    if (siLink.link && this.router) {
      this.router.navigateByUrl(this.urlTree, this.navigationExtras);
    }
  }
}
