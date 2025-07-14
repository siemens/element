/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  LOCALE_ID,
  output,
  viewChild
} from '@angular/core';
import { addIcons, elementUpload, SiIconNextComponent } from '@siemens/element-ng/icon';
import { SiTranslateModule } from '@siemens/element-translate-ng/translate';

import { UploadFile } from './si-file-uploader.model';

@Component({
  selector: 'si-file-dropzone',
  imports: [SiIconNextComponent, SiTranslateModule],
  templateUrl: './si-file-dropzone.component.html',
  styleUrl: './si-file-dropzone.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiFileDropzoneComponent {
  /**
   * Text or translation key of the input file selector (is combined with the `uploadTextRest`).
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_FILE_UPLOADER.FILE_SELECT:click to upload`
   * ```
   */
  readonly uploadTextFileSelect = input($localize`:@@SI_FILE_UPLOADER.FILE_SELECT:click to upload`);
  /**
   * Text or translation key of the drag&drop field (is combined with the `uploadTextFileSelect`).
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_FILE_UPLOADER.DROP:Drop files here or`
   * ```
   */
  readonly uploadDropText = input($localize`:@@SI_FILE_UPLOADER.DROP:Drop files here or`);
  /**
   * Text or translation key for max file size.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_FILE_UPLOADER.MAX_SIZE:Maximum upload size`
   * ```
   */
  readonly maxFileSizeText = input($localize`:@@SI_FILE_UPLOADER.MAX_SIZE:Maximum upload size`);
  /**
   * Text or translation key for accepted types.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_FILE_UPLOADER.ACCEPTED_FILE_TYPES:Accepted file types`
   * ```
   */
  readonly acceptText = input(
    $localize`:@@SI_FILE_UPLOADER.ACCEPTED_FILE_TYPES:Accepted file types`
  );
  /**
   * Text or translation key of message title if incorrect file type is dragged / dropped.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_FILE_UPLOADER.ERROR_FILE_TYPE:Incorrect file type selected`
   * ```
   */
  readonly errorTextFileType = input(
    $localize`:@@SI_FILE_UPLOADER.ERROR_FILE_TYPE:Incorrect file type selected`
  );
  /**
   * Message or translation key if file exceeds the maximum file size limit.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_FILE_UPLOADER.ERROR_FILE_SIZE_EXCEEDED:File exceeds allowed maximum size`
   * ```
   */
  readonly errorTextFileMaxSize = input(
    $localize`:@@SI_FILE_UPLOADER.ERROR_FILE_SIZE_EXCEEDED:File exceeds allowed maximum size`
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
   * Event emitted when files are added.
   */
  readonly filesAdded = output<UploadFile[]>();

  /**
   * Enable directory upload.
   *
   * @defaultValue false
   */
  readonly directoryUpload = input(false, { transform: booleanAttribute });

  protected readonly maxFileSizeString = computed(() => {
    const maxFileSize = this.maxFileSize();
    return maxFileSize ? this.fileSizeToString(maxFileSize) : '';
  });

  protected readonly icons = addIcons({ elementUpload });

  protected dragOver = false;

  private readonly fileInput = viewChild.required<ElementRef>('fileInput');
  private locale = inject(LOCALE_ID).toString();
  private numberFormat = new Intl.NumberFormat(this.locale, { maximumFractionDigits: 2 });

  protected dropHandler(event: DragEvent): void {
    event.preventDefault();
    if (this.directoryUpload()) {
      this.handleItems(event.dataTransfer!.items);
    } else {
      this.handleFiles(event.dataTransfer!.files);
    }
    this.dragOver = false;
  }

  protected dragOverHandler(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = true;
  }

  protected inputEnterHandler(): void {
    this.fileInput().nativeElement.click();
  }

  protected inputHandler(event: Event): void {
    this.handleFiles((event.target as HTMLInputElement).files);
  }

  protected handleFiles(files: FileList | null): void {
    if (!files?.length) {
      return;
    }

    const newFiles: UploadFile[] = [];

    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < files.length; i++) {
      newFiles.push(this.makeUploadFile(files[i]));
    }
    newFiles.sort((a, b) => a.fileName.localeCompare(b.fileName));

    this.filesAdded.emit(newFiles);
    this.reset();
  }

  /**
   * Reset all the files inside the native file input (and therefore the dropzone).
   */
  reset(): void {
    this.fileInput().nativeElement.value = '';
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
      const acceptedRegexStr = acceptedType.replace('.', '.').replace('*', '.*').trim();
      const acceptedRegex = new RegExp(acceptedRegexStr, 'i');

      // if fileType is set and accepted type looks like a MIME type, match that otherwise extension
      if (fileType && acceptedType.includes('/')) {
        return !!fileType.match(acceptedRegex);
      }
      return !!ext?.match(acceptedRegex);
    });
  }

  private fileSizeToString(num: number): string {
    let suffix = 'B';
    if (num >= 1_073_741_824) {
      num /= 1_073_741_824;
      suffix = 'GB';
    }
    if (num >= 1_048_576) {
      num /= 1_048_576;
      suffix = 'MB';
    } else if (num >= 1_024) {
      num /= 1_024;
      suffix = 'KB';
    }
    return this.numberFormat.format(num) + suffix;
  }

  private handleItems(items: DataTransferItemList): void {
    const newFiles: UploadFile[] = [];
    let pendingEntries = 0;

    const traverseFileTree = (item: FileSystemEntry): void => {
      if (item.isFile) {
        (item as FileSystemFileEntry).file(file => {
          newFiles.push(this.makeUploadFile(file));
          if (--pendingEntries === 0) {
            this.filesAdded.emit(newFiles);
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
            this.filesAdded.emit(newFiles);
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
}
