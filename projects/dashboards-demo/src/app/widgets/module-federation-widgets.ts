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
      },
      defaults: {
        height: 3
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
      },
      defaults: {
        height: 3
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
      },
      defaults: {
        height: 3
      }
    }
  : {
      id: 'upload',
      name: 'Upload (module-federation on native-federation shell)',
      componentFactory: {
        factoryType: 'native-federation-module-bridge',
        id: 'mfe/Upload',
        componentName: 'UploadComponent'
      },
      defaults: {
        height: 3
      }
    };
