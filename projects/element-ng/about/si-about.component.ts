/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgTemplateOutlet } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SiCollapsiblePanelComponent } from '@spike-rabbit/element-ng/accordion';
import {
  CopyrightDetails,
  SiCopyrightNoticeComponent
} from '@spike-rabbit/element-ng/copyright-notice';
import { addIcons, elementDocument, SiIconNextComponent } from '@spike-rabbit/element-ng/icon';
import { Link, SiLinkDirective } from '@spike-rabbit/element-ng/link';
import { SiTranslatePipe } from '@spike-rabbit/element-translate-ng/translate';

import { ApiInfo, LicenseInfo } from './si-about-data.model';

@Component({
  selector: 'si-about',
  imports: [
    NgTemplateOutlet,
    SiCollapsiblePanelComponent,
    SiCopyrightNoticeComponent,
    SiIconNextComponent,
    SiLinkDirective,
    SiTranslatePipe
  ],
  templateUrl: './si-about.component.html',
  styleUrl: './si-about.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiAboutComponent implements OnInit {
  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);

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

  protected readonly licenseApi = signal<ApiInfo[]>([]);
  protected readonly icons = addIcons({ elementDocument });

  ngOnInit(): void {
    const licenseInfo = this.licenseInfo();
    if (licenseInfo.api) {
      this.http.get<ApiInfo[]>(licenseInfo.api, { responseType: 'json' }).subscribe(data => {
        this.licenseApi.set(data);
        if (this.licenseApi().length === 1) {
          data[0].isOpen = false;
          this.licenseApi.set([...data]);
          this.toggleLoadLicenseApi(this.licenseApi()[0]);
        }
      });
    }
  }

  protected toggleLoadLicenseApi(apiInfo: ApiInfo): void {
    const licenseApi = this.licenseApi();
    if (!apiInfo.isOpen && !apiInfo.files) {
      this.http.get<ApiInfo[]>(apiInfo.href, { responseType: 'json' }).subscribe(files => {
        apiInfo.files = files;
        this.licenseApi.set([...licenseApi]);
      });
    }
    apiInfo.isOpen = !apiInfo.isOpen;
    this.licenseApi.set([...licenseApi]);
  }

  protected toggleLoadLicenseContent(apiInfo: ApiInfo): void {
    const licenseApi = this.licenseApi();
    apiInfo.isOpen = !apiInfo.isOpen;
    if (!apiInfo.content) {
      this.http.get(apiInfo.href, { responseType: 'text' }).subscribe((content: string) => {
        apiInfo.content = content;
        this.licenseApi.set([...licenseApi]);
      });
    }
  }
}
