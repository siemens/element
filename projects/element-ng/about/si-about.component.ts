/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { NgTemplateOutlet } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { elementDocument } from '@siemens/element-icons';
import { SiCollapsiblePanelComponent } from '@siemens/element-ng/accordion';
import { CopyrightDetails, SiCopyrightNoticeComponent } from '@siemens/element-ng/copyright-notice';
import { addIcons, SiIconComponent, SiStatusIconComponent } from '@siemens/element-ng/icon';
import { Link, SiLinkDirective } from '@siemens/element-ng/link';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';
import { Subscription } from 'rxjs';

import { ApiInfo, LicenseInfo } from './si-about-data.model';

type ApiLoadState = 'idle' | 'loading' | 'loaded' | 'error';

interface LicenseFileState {
  name: string;
  href: string;
  content?: string;
  state: ApiLoadState;
}

interface LicenseCategoryState {
  name: string;
  href: string;
  files?: LicenseFileState[];
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
    this.preserveFocusInRegion(event);
    this.loadLicenseIndex();
  };

  protected readonly retryCategoryFiles = (category: LicenseCategoryState, event: Event): void => {
    this.preserveFocusInRegion(event);
    this.loadCategoryFiles(category);
  };

  protected readonly retryFileContent = (file: LicenseFileState, event: Event): void => {
    this.preserveFocusInRegion(event);
    this.loadFileContent(file);
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
    if (opened && category.state === 'idle') {
      this.loadCategoryFiles(category);
    }
  }

  protected toggleLoadLicenseContent(file: LicenseFileState, opened: boolean): void {
    if (opened && file.state === 'idle') {
      this.loadFileContent(file);
    }
  }

  private loadLicenseIndex(): void {
    const apiUrl = this.licenseInfo().api;
    if (!apiUrl || this.licenseIndexState() === 'loading') {
      return;
    }

    this.indexSubscription?.unsubscribe();
    this.licenseIndexState.set('loading');
    this.indexSubscription = this.http.get<ApiInfo[]>(apiUrl, { responseType: 'json' }).subscribe({
      next: data => {
        const items = (data ?? []).map(item => this.toCategoryState(item));
        this.licenseApi.set(items);
        this.licenseIndexState.set('loaded');
        if (items.length === 1 && items[0].state === 'idle') {
          this.loadCategoryFiles(items[0]);
        }
      },
      error: () => {
        this.licenseIndexState.set('error');
      }
    });
  }

  private loadCategoryFiles(category: LicenseCategoryState): void {
    if (category.state === 'loading') {
      return;
    }

    this.itemSubscriptions.get(category)?.unsubscribe();
    category.state = 'loading';
    this.licenseApi.update(items => [...items]);

    const subscription = this.http
      .get<ApiInfo[]>(category.href, { responseType: 'json' })
      .subscribe({
        next: files => {
          category.files = (files ?? []).map(file => this.toFileState(file));
          category.state = 'loaded';
          this.itemSubscriptions.delete(category);
          this.licenseApi.update(items => [...items]);
        },
        error: () => {
          category.state = 'error';
          this.itemSubscriptions.delete(category);
          this.licenseApi.update(items => [...items]);
        }
      });

    if (!subscription.closed) {
      this.itemSubscriptions.set(category, subscription);
    }
  }

  private loadFileContent(file: LicenseFileState): void {
    if (file.state === 'loading') {
      return;
    }

    this.itemSubscriptions.get(file)?.unsubscribe();
    file.state = 'loading';
    this.licenseApi.update(items => [...items]);

    const subscription = this.http.get(file.href, { responseType: 'text' }).subscribe({
      next: content => {
        file.content = content ?? '';
        file.state = 'loaded';
        this.itemSubscriptions.delete(file);
        this.licenseApi.update(items => [...items]);
      },
      error: () => {
        file.state = 'error';
        this.itemSubscriptions.delete(file);
        this.licenseApi.update(items => [...items]);
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
      state: item.files !== undefined ? 'loaded' : 'idle'
    };
  }

  private toFileState(item: ApiInfo): LicenseFileState {
    return {
      name: item.name,
      href: item.href,
      content: item.content,
      state: item.content !== undefined ? 'loaded' : 'idle'
    };
  }

  private preserveFocusInRegion(event: Event): void {
    const target = event.currentTarget;
    if (target instanceof HTMLElement && target.ownerDocument.activeElement === target) {
      target
        .closest<HTMLElement>('.license-api-panel-content, .license-api-section')
        ?.focus({ preventScroll: true });
    }
  }
}
