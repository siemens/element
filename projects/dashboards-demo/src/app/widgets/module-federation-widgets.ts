/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Widget } from '@siemens/dashboards-ng';

import { environment } from '../../environments/environment';

export const DOWNLOAD_WIDGET: Widget = environment.useModuleFederation
  ? {
      id: 'download',
      name: 'Download (module-federation)',
      componentFactory: {
        factoryType: 'module-federation',
        type: 'module',
        remoteEntry: `${environment.mfeBaseUrl}/remoteEntry.js`,
        exposedModule: './Download',
        componentName: 'DownloadComponent'
      }
    }
  : {
      id: 'download',
      name: 'Download (native-federation)',
      componentFactory: {
        factoryType: 'native-federation',
        type: 'module',
        remoteEntry: `${environment.mfeEsmBaseUrl}/remoteEntry.json`,
        exposedModule: './Download',
        componentName: 'DownloadComponent'
      }
    };

export const UPLOAD_WIDGET: Widget = environment.useModuleFederation
  ? {
      id: 'upload',
      name: 'Upload (module-federation)',
      componentFactory: {
        factoryType: 'module-federation',
        type: 'module',
        remoteEntry: `${environment.mfeBaseUrl}/remoteEntry.js`,
        exposedModule: './Upload',
        componentName: 'UploadComponent'
      }
    }
  : {
      id: 'upload',
      name: 'Upload (module-federation on native-federation shell)',
      componentFactory: {
        factoryType: 'native-federation-module-bridge',
        id: 'mfe/Upload',
        componentName: 'UploadComponent'
      }
    };
