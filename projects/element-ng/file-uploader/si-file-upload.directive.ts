/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  Directive,
  ElementRef,
  inject,
  input,
  LOCALE_ID,
  booleanAttribute,
  output
} from '@angular/core';
import { t, TranslatableString } from '@siemens/element-translate-ng/translate';

import { UploadFile } from './si-file-uploader.model';

export interface FileUploadError extends UploadFile {
  status: 'invalid';
  errorText: TranslatableString;
}

/**
 * Directive for handling file uploads with validation for file type and size.
 *
 * @example
 * ```html
 * <input
 *   #fileInput
 *   type="file"
 *   class="d-none"
 *   siFileUpload
 *   [accept]="accept()"
 *   [maxFileSize]="maxFileSize()"
 *   [multiple]="true"
 *   (validFiles)="onFilesAdded($event)"
 *   (fileError)="onFileError($event)"
 * />
 * ```
 */
@Directive({
  selector: 'input[type="file"][siFileUpload]',
  standalone: true,
  host: {
    '[attr.accept]': 'accept()',
    '[multiple]': 'directoryUpload() || multiple()',
    '[attr.webkitdirectory]': 'directoryUpload() ? "" : null',
    '(change)': 'onInputChange($event)'
  }
})
export class SiFileUploadDirective {
  /**
   * Text or translation key of message title if incorrect file type is dragged / dropped.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_FILE_UPLOADER.ERROR_FILE_TYPE:Incorrect file type selected`)
   * ```
   */
  readonly errorTextFileType = input(
    t(() => $localize`:@@SI_FILE_UPLOADER.ERROR_FILE_TYPE:Incorrect file type selected`)
  );

  /**
   * Message or translation key if file exceeds the maximum file size limit.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_FILE_UPLOADER.ERROR_FILE_SIZE_EXCEEDED:File exceeds allowed maximum size`)
   * ```
   */
  readonly errorTextFileMaxSize = input(
    t(
      () =>
        $localize`:@@SI_FILE_UPLOADER.ERROR_FILE_SIZE_EXCEEDED:File exceeds allowed maximum size`
    )
  );

  /**
   * Define which file types are suggested in file browser.
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#attr-accept
   */
  readonly accept = input<string>();

  /**
   * Define maximal allowed file size in bytes.
   */
  readonly maxFileSize = input<number>();

  /**
   * Defines whether the file input allows selecting multiple files.
   * When {@link directoryUpload} is enabled, this will have no effect.
   *
   * @defaultValue false
   */
  readonly multiple = input(false, { transform: booleanAttribute });

  /**
   * Enable directory upload.
   *
   * @defaultValue false
   */
  readonly directoryUpload = input(false, { transform: booleanAttribute });

  /**
   * Event emitted when valid files are added.
   * Invalid files (due to size or type) will be ignored and instead the {@link fileError} event will be emitted.
   */
  readonly validFiles = output<UploadFile[]>();

  /**
   * Event emitted when valid files are added.
   * Also includes invalid files, but with status 'invalid' and an errorText describing why they were ignored.
   */
  readonly filesAdded = output<UploadFile[]>();

  /**
   * Event emitted when file validation errors occur, including files that were ignored due to size or type.
   */
  readonly fileError = output<FileUploadError>();

  private readonly elementRef = inject(ElementRef<HTMLInputElement>);
  private locale = inject(LOCALE_ID).toString();
  private numberFormat = new Intl.NumberFormat(this.locale, { maximumFractionDigits: 2 });

  protected onInputChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.handleFiles(inputElement.files);
  }

  /**
   * Handle files from input or drag and drop
   */
  handleFiles(files: FileList | null): void {
    if (!files?.length) {
      return;
    }

    const newFiles: UploadFile[] = [];
    const validFiles: UploadFile[] = [];

    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < files.length; i++) {
      const uploadFile = this.makeUploadFile(files[i]);
      newFiles.push(uploadFile);

      if (uploadFile.status === 'invalid' && uploadFile.errorText) {
        this.fileError.emit(uploadFile as FileUploadError);
      } else if (uploadFile.status === 'added') {
        validFiles.push(uploadFile);
      }
    }

    if (newFiles.length > 0) {
      newFiles.sort((a, b) => a.fileName.localeCompare(b.fileName));
      this.filesAdded.emit(newFiles);
    }

    if (validFiles.length > 0) {
      validFiles.sort((a, b) => a.fileName.localeCompare(b.fileName));
      this.validFiles.emit(validFiles);
    }

    this.reset();
  }

  /**
   * Handle directory entries for drag and drop
   */
  handleItems(items: DataTransferItemList): void {
    const newFiles: UploadFile[] = [];
    let pendingEntries = 0;

    const traverseFileTree = (item: FileSystemEntry): void => {
      if (item.isFile) {
        (item as FileSystemFileEntry).file(file => {
          const uploadFile = this.makeUploadFile(file);
          newFiles.push(uploadFile);

          if (uploadFile.status === 'invalid' && uploadFile.errorText) {
            this.fileError.emit(uploadFile as FileUploadError);
          }

          if (--pendingEntries === 0) {
            if (newFiles.length > 0) {
              this.filesAdded.emit(newFiles);
            }
            const validFiles = newFiles.filter(f => f.status === 'added');
            if (validFiles.length > 0) {
              this.filesAdded.emit(validFiles);
            }
            this.reset();
          }
        });
      } else if (item.isDirectory) {
        const dirReader = (item as FileSystemDirectoryEntry).createReader();
        dirReader.readEntries(entries => {
          for (const entry of entries) {
            pendingEntries++;
            traverseFileTree(entry);
          }
          if (--pendingEntries === 0) {
            if (newFiles.length > 0) {
              this.filesAdded.emit(newFiles);
            }
            const validFiles = newFiles.filter(f => f.status === 'added');
            if (validFiles.length > 0) {
              this.filesAdded.emit(validFiles);
            }
            this.reset();
          }
        });
      }
    };

    // items is not an array but of type DataTransferItemList
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < items.length; i++) {
      const item = items[i].webkitGetAsEntry();
      if (item) {
        pendingEntries++;
        traverseFileTree(item);
      }
    }
  }

  /**
   * Reset the file input value
   */
  reset(): void {
    this.elementRef.nativeElement.value = '';
  }

  /**
   * Trigger the file input click
   */
  triggerClick(): void {
    this.elementRef.nativeElement.click();
  }

  private makeUploadFile(file: File): UploadFile {
    const uploadFile: UploadFile = {
      fileName: file.name,
      file,
      size: this.fileSizeToString(file.size),
      progress: 0,
      status: 'added'
    };
    // use MIME type of file if set. Otherwise fall back to file name ending
    const ext = '.' + uploadFile.file.name.split('.').pop();
    if (!this.verifyFileType(uploadFile.file.type, ext)) {
      uploadFile.status = 'invalid';
      uploadFile.errorText = this.errorTextFileType();
    } else if (!this.verifyFileSize(uploadFile.file.size)) {
      uploadFile.status = 'invalid';
      uploadFile.errorText = this.errorTextFileMaxSize();
    }
    return uploadFile;
  }

  private verifyFileSize(size: number): boolean {
    const maxFileSize = this.maxFileSize();
    return !maxFileSize || size <= maxFileSize;
  }

  private verifyFileType(fileType: string | undefined, ext: string | undefined): boolean {
    const accept = this.accept();
    if (!accept) {
      return true;
    }
    if (fileType === undefined && ext === undefined) {
      return false;
    }
    // Spec says that comma is the delimiter for filetypes. Also allow pipe for compatibility
    return accept.split(/,|\|/).some(acceptedType => {
      // convert accept glob into regex (example: images/* --> images/.*)
      const acceptedRegexStr = acceptedType.replace(/\./g, '\\.').replace('*', '.*').trim();
      const acceptedRegex = new RegExp(acceptedRegexStr, 'i');

      // if fileType is set and accepted type looks like a MIME type, match that otherwise extension
      if (fileType && acceptedType.includes('/')) {
        return !!fileType.match(acceptedRegex);
      }
      return !!ext?.match(acceptedRegex);
    });
  }

  fileSizeToString(num: number): string {
    return SiFileUploadDirective.formatFileSize(num, this.numberFormat);
  }

  static formatFileSize(num: number, formatter?: Intl.NumberFormat): string {
    const numberFormat = formatter ?? new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
    let suffix = 'B';
    if (num >= 1_073_741_824) {
      num /= 1_073_741_824;
      suffix = 'GB';
    } else if (num >= 1_048_576) {
      num /= 1_048_576;
      suffix = 'MB';
    } else if (num >= 1_024) {
      num /= 1_024;
      suffix = 'KB';
    }
    return numberFormat.format(num) + suffix;
  }
}
