/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
export interface UploadFile {
  status: 'added' | 'invalid' | 'queued' | 'uploading' | 'success' | 'error';
  file: File;
  fileName: string;
  size: string;
  errorText?: string;
  progress: number;
}
