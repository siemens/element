/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

import { TranslatableString } from '@siemens/element-translate-ng/translate';

/** */
export interface UploadFile {
  status: 'added' | 'invalid' | 'queued' | 'uploading' | 'success' | 'error';
  file: File;
  fileName: string;
  size: string;
  errorText?: TranslatableString;
  progress: number;
}
