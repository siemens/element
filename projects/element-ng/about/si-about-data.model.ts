/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
export interface LicenseInfo {
  /**
   * Title of the License Info.
   */
  title: string;
  /**
   * License to be shown as plain text in `<pre>` element.
   */
  text?: string;
  /**
   * URL to license file to be shown in iFrame.
   */
  iframe?: string;
  /**
   * URL to license REST end point. License texts are lazy loaded separately for
   * each component. Requires a service to provide license data.
   */
  api?: string;
  /**
   * In API View, custom license file icon.
   */
  icon?: string;
}

export interface ApiInfo {
  /**
   * Name of License category.
   */
  name: string;
  /**
   * API href.
   */
  href: string;
  /**
   * State if dropdown is open.
   */
  isOpen?: boolean;
  /**
   * License files path.
   */
  files?: ApiInfo[];
  /**
   * Content of license file.
   */
  content?: string;
}
