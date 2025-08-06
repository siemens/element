/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Widget } from '@spike-rabbit/dashboards-ng';

import { environment } from '../../environments/environment';

export const DOWNLOAD_WIDGET: Widget = {
  id: 'download',
  name: 'Download (module-federation)',
  componentFactory: {
    factoryType: 'module-federation',
    type: 'module',
    remoteEntry: `${environment.mfeBaseUrl}/remoteEntry.js`,
    exposedModule: './Download',
    componentName: 'DownloadComponent'
  }
};

export const UPLOAD_WIDGET: Widget = {
  id: 'upload',
  name: 'Upload (module-federation)',
  componentFactory: {
    factoryType: 'module-federation',
    type: 'module',
    remoteEntry: `${environment.mfeBaseUrl}/remoteEntry.js`,
    exposedModule: './Upload',
    componentName: 'UploadComponent'
  }
};
