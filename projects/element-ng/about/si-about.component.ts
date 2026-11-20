/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { NgTemplateOutlet } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  inject,
  Injector,
  input,
  OnInit,
  signal
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { elementDocument } from '@siemens/element-icons';
import { SiCollapsiblePanelComponent } from '@siemens/element-ng/accordion';
import { CopyrightDetails, SiCopyrightNoticeComponent } from '@siemens/element-ng/copyright-notice';
import { addIcons, SiIconComponent, SiStatusIconComponent } from '@siemens/element-ng/icon';
import { Link, SiLinkDirective } from '@siemens/element-ng/link';
import { SiTranslatePipe, t, TranslatableString } from '@siemens/element-translate-ng/translate';
import { Subscription } from 'rxjs';

import { ApiInfo, LicenseInfo } from './si-about-data.model';

type ApiLoadState = 'idle' | 'loading' | 'retrying' | 'loaded' | 'error';

interface LicenseFileState {
  name: string;
  href: string;
  content?: string;
  isOpen: boolean;
  state: ApiLoadState;
}

interface LicenseCategoryState {
  name: string;
  href: string;
  files?: LicenseFileState[];
  isOpen: boolean;
  state: ApiLoadState;
}

@Component({
  selector: 'si-about',
  imports: [
    NgTemplateOutlet,
    SiCollapsiblePanelComponent,
    SiCopyrightNoticeComponent,
    SiIconComponent,
    SiLinkDirective,
    SiStatusIconComponent,
    SiTranslatePipe
  ],
  templateUrl: './si-about.component.html',
  styleUrl: './si-about.component.scss'
})
export class SiAboutComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  private indexSubscription?: Subscription;
  private readonly itemSubscriptions = new Map<object, Subscription>();

  /**
   * Alt text for the application logo. Supports `{{appName}}` placeholder for interpolation.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_ABOUT.LOGO_ALT:{{appName}} logo`)
   * ```
   */
  readonly logoAlt = input(t(() => $localize`:@@SI_ABOUT.LOGO_ALT:{{appName}} logo`));

  /**
   * Title shown above the about information.
   */
  readonly aboutTitle = input.required<string>();
  /**
   * Define mode to display the licenses. See {@link LicenseInfo}
   */
  readonly licenseInfo = input.required<LicenseInfo>();
  /**
   * Path to the application logo. Use for image
   */
  readonly icon = input<string>();
  /**
   * Name of element icon. Use as alternative to image
   */
  readonly iconName = input<string>();
  /**
   * Title of this application.
   */
  readonly appName = input.required<string>();
  /**
   * Sub titles of the application. Shown as a list below the application name. (Optional)
   */
  readonly subheading = input<string[]>();
  /**
   * Link to `Acceptable Use Policy`.
   */
  readonly acceptableUsePolicyLink = input<Link>();
  /**
   * Link to `Corporate Information`.
   */
  readonly imprintLink = input<Link>();
  /**
   * Link to `Privacy Notice`.
   */
  readonly privacyLink = input<Link>();
  /**
   * Link to `Cookie Notice`.
   */
  readonly cookieNoticeLink = input<Link>();
  /**
   * Link to `Terms of Use`.
   */
  readonly termsLink = input<Link>();
  /**
   * Additional links listed in the about section.
   *
   * @defaultValue []
   */
  readonly links = input<Link[]>([]);
  /**
   * Copyright information to be displayed. Alternatively, you can use the {@link SI_COPYRIGHT_DETAILS} global inject.
   */
  readonly copyrightDetails = input<CopyrightDetails>();

  protected readonly sanitizedUrl = computed(() => {
    const licenseInfo = this.licenseInfo();
    return licenseInfo.iframe != null
      ? this.sanitizer.bypassSecurityTrustResourceUrl(licenseInfo.iframe)
      : undefined;
  });

  protected readonly licenseApi = signal<LicenseCategoryState[]>([]);
  protected readonly licenseIndexState = signal<ApiLoadState>('idle');
  protected readonly statusAnnouncement = signal<TranslatableString | undefined>(undefined);
  protected readonly icons = addIcons({ elementDocument });

  protected readonly loadingLicensesText = t(
    () => $localize`:@@SI_ABOUT.LOADING_LICENSES:Loading licenses…`
  );
  protected readonly loadingLicenseText = t(
    () => $localize`:@@SI_ABOUT.LOADING_LICENSE_TEXT:Loading license text…`
  );
  protected readonly loadErrorText = t(
    () => $localize`:@@SI_ABOUT.LOAD_ERROR:Could not load licenses.`
  );
  protected readonly loadTextErrorText = t(
    () => $localize`:@@SI_ABOUT.LOAD_TEXT_ERROR:Could not load license text.`
  );
  protected readonly retryText = t(() => $localize`:@@SI_ABOUT.RETRY:Retry`);
  protected readonly noLicensesText = t(
    () => $localize`:@@SI_ABOUT.NO_LICENSES:No licenses available.`
  );
  protected readonly noLicenseText = t(
    () => $localize`:@@SI_ABOUT.NO_LICENSE_TEXT:No license text available.`
  );

  protected readonly retryLicenseIndex = (_item: unknown, event: Event): void => {
    this.loadLicenseIndex(true, this.getRetryButton(event));
  };

  protected readonly retryCategoryFiles = (category: LicenseCategoryState, event: Event): void => {
    this.loadCategoryFiles(category, true, this.getRetryButton(event));
  };

  protected readonly retryFileContent = (file: LicenseFileState, event: Event): void => {
    this.loadFileContent(file, true, this.getRetryButton(event));
  };

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.indexSubscription?.unsubscribe();
      this.itemSubscriptions.forEach(subscription => subscription.unsubscribe());
      this.itemSubscriptions.clear();
    });
  }

  ngOnInit(): void {
    this.loadLicenseIndex();
  }

  protected toggleLoadLicenseApi(category: LicenseCategoryState, opened: boolean): void {
    category.isOpen = opened;
    if (!opened) {
      return;
    }

    if (category.state === 'idle') {
      this.loadCategoryFiles(category);
    } else if (category.state === 'loading' || category.state === 'retrying') {
      this.statusAnnouncement.set(this.loadingLicensesText);
    } else if (category.state === 'loaded' && !category.files?.length) {
      this.statusAnnouncement.set(this.noLicensesText);
    }
  }

  protected toggleLoadLicenseContent(file: LicenseFileState, opened: boolean): void {
    file.isOpen = opened;
    if (!opened) {
      return;
    }

    if (file.state === 'idle') {
      this.loadFileContent(file);
    } else if (file.state === 'loading' || file.state === 'retrying') {
      this.statusAnnouncement.set(this.loadingLicenseText);
    } else if (file.state === 'loaded' && !file.content?.trim()) {
      this.statusAnnouncement.set(this.noLicenseText);
    }
  }

  private loadLicenseIndex(retrying = false, retryButton?: HTMLButtonElement): void {
    const apiUrl = this.licenseInfo().api;
    if (!apiUrl || this.isBusy(this.licenseIndexState())) {
      return;
    }

    this.indexSubscription?.unsubscribe();
    this.licenseIndexState.set(retrying ? 'retrying' : 'loading');
    this.statusAnnouncement.set(this.loadingLicensesText);
    this.indexSubscription = this.http.get<ApiInfo[]>(apiUrl, { responseType: 'json' }).subscribe({
      next: data => {
        const section = this.isRetryFocused(retryButton)
          ? retryButton.closest<HTMLElement>('.license-api-section')
          : null;
        const items = (data ?? []).map(item => this.toCategoryState(item));
        this.licenseApi.set(items);
        this.licenseIndexState.set('loaded');
        this.statusAnnouncement.set(items.length === 0 ? this.noLicensesText : undefined);
        if (section) {
          this.focusAfterRender(() =>
            section.querySelector<HTMLElement>(
              '.license-api .collapsible-header, .license-api-empty'
            )
          );
        }
        if (items.length === 1 && items[0].state === 'idle') {
          this.loadCategoryFiles(items[0]);
        }
      },
      error: () => {
        this.licenseIndexState.set('error');
        this.statusAnnouncement.set(undefined);
      }
    });
  }

  private loadCategoryFiles(
    category: LicenseCategoryState,
    retrying = false,
    retryButton?: HTMLButtonElement
  ): void {
    if (this.isBusy(category.state)) {
      return;
    }

    this.itemSubscriptions.get(category)?.unsubscribe();
    category.state = retrying ? 'retrying' : 'loading';
    if (category.isOpen || retrying) {
      this.statusAnnouncement.set(this.loadingLicensesText);
    }
    this.licenseApi.update(items => [...items]);

    const subscription = this.http
      .get<ApiInfo[]>(category.href, { responseType: 'json' })
      .subscribe({
        next: files => {
          const panel = this.isRetryFocused(retryButton)
            ? retryButton.closest<HTMLElement>('si-collapsible-panel')
            : null;
          category.files = (files ?? []).map(file => this.toFileState(file));
          category.state = 'loaded';
          this.itemSubscriptions.delete(category);
          this.licenseApi.update(items => [...items]);
          if (category.isOpen || retrying) {
            this.statusAnnouncement.set(
              category.files.length === 0 ? this.noLicensesText : undefined
            );
          }
          if (panel) {
            this.focusAfterRender(
              () =>
                panel.querySelector<HTMLElement>('.license-api-file .collapsible-header') ??
                panel.querySelector<HTMLElement>(':scope > .collapsible-header')
            );
          }
        },
        error: () => {
          category.state = 'error';
          this.itemSubscriptions.delete(category);
          this.licenseApi.update(items => [...items]);
          if (category.isOpen || retrying) {
            this.statusAnnouncement.set(undefined);
          }
        }
      });

    if (!subscription.closed) {
      this.itemSubscriptions.set(category, subscription);
    }
  }

  private loadFileContent(
    file: LicenseFileState,
    retrying = false,
    retryButton?: HTMLButtonElement
  ): void {
    if (this.isBusy(file.state)) {
      return;
    }

    this.itemSubscriptions.get(file)?.unsubscribe();
    file.state = retrying ? 'retrying' : 'loading';
    if (file.isOpen || retrying) {
      this.statusAnnouncement.set(this.loadingLicenseText);
    }
    this.licenseApi.update(items => [...items]);

    const subscription = this.http.get(file.href, { responseType: 'text' }).subscribe({
      next: content => {
        const panel = this.isRetryFocused(retryButton)
          ? retryButton.closest<HTMLElement>('si-collapsible-panel')
          : null;
        file.content = content ?? '';
        file.state = 'loaded';
        this.itemSubscriptions.delete(file);
        this.licenseApi.update(items => [...items]);
        if (file.isOpen || retrying) {
          this.statusAnnouncement.set(file.content.trim() ? undefined : this.noLicenseText);
        }
        if (panel) {
          this.focusAfterRender(() =>
            panel.querySelector<HTMLElement>(':scope > .collapsible-header')
          );
        }
      },
      error: () => {
        file.state = 'error';
        this.itemSubscriptions.delete(file);
        this.licenseApi.update(items => [...items]);
        if (file.isOpen || retrying) {
          this.statusAnnouncement.set(undefined);
        }
      }
    });

    if (!subscription.closed) {
      this.itemSubscriptions.set(file, subscription);
    }
  }

  private toCategoryState(item: ApiInfo): LicenseCategoryState {
    return {
      name: item.name,
      href: item.href,
      files: item.files?.map(file => this.toFileState(file)),
      isOpen: false,
      state: item.files !== undefined ? 'loaded' : 'idle'
    };
  }

  private toFileState(item: ApiInfo): LicenseFileState {
    return {
      name: item.name,
      href: item.href,
      content: item.content,
      isOpen: false,
      state: item.content || !item.href ? 'loaded' : 'idle'
    };
  }

  private isBusy(state: ApiLoadState): boolean {
    return state === 'loading' || state === 'retrying';
  }

  private getRetryButton(event: Event): HTMLButtonElement | undefined {
    return event.currentTarget instanceof HTMLButtonElement ? event.currentTarget : undefined;
  }

  private isRetryFocused(button?: HTMLButtonElement): button is HTMLButtonElement {
    return !!button && button.isConnected && button.ownerDocument.activeElement === button;
  }

  private focusAfterRender(getTarget: () => HTMLElement | null): void {
    afterNextRender(
      () => {
        getTarget()?.focus({ preventScroll: true });
      },
      { injector: this.injector }
    );
  }
}
