/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  viewChild
} from '@angular/core';
import { elementUpload } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';

import { SiFileUploadDirective, FileUploadError } from './si-file-upload.directive';
import { UploadFile } from './si-file-uploader.model';

@Component({
  selector: 'si-file-dropzone',
  imports: [SiIconComponent, SiTranslatePipe, SiFileUploadDirective],
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
   * t(() => $localize`:@@SI_FILE_UPLOADER.FILE_SELECT:click to upload`)
   * ```
   */
  readonly uploadTextFileSelect = input(
    t(() => $localize`:@@SI_FILE_UPLOADER.FILE_SELECT:click to upload`)
  );
  /**
   * Text or translation key of the drag&drop field (is combined with the `uploadTextFileSelect`).
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_FILE_UPLOADER.DROP:Drop files here or`)
   * ```
   */
  readonly uploadDropText = input(t(() => $localize`:@@SI_FILE_UPLOADER.DROP:Drop files here or`));
  /**
   * Text or translation key for max file size.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_FILE_UPLOADER.MAX_SIZE:Max. {{maxFileSize}} upload size.`)
   * ```
   */
  readonly maxFileSizeText = input(
    t(() => $localize`:@@SI_FILE_UPLOADER.MAX_SIZE:Max. {{maxFileSize}} upload size.`)
  );
  /**
   * Text or translation key for accepted types.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_FILE_UPLOADER.ACCEPTED_FILE_TYPES:Accepted file types: {{accept}}.`)
   * ```
   */
  readonly acceptText = input(
    t(() => $localize`:@@SI_FILE_UPLOADER.ACCEPTED_FILE_TYPES:Accepted file types: {{accept}}.`)
  );
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
   * Event emitted when valid files are added.
   * Invalid files are also included here, but with status 'invalid' and an errorText describing why they were ignored.
   */
  readonly filesAdded = output<UploadFile[]>();

  /**
   * Event emitted when file validation errors occur, including files that were ignored due to size or type.
   */
  readonly fileError = output<FileUploadError>();

  /**
   * Enable directory upload.
   *
   * @defaultValue false
   */
  readonly directoryUpload = input(false, { transform: booleanAttribute });

  protected readonly maxFileSizeString = computed(() => {
    const maxFileSize = this.maxFileSize();
    return maxFileSize ? this.fileUploadDirective().fileSizeToString(maxFileSize) : '';
  });

  protected readonly icons = addIcons({ elementUpload });

  protected dragOver = false;

  private readonly fileUploadDirective = viewChild.required(SiFileUploadDirective);

  protected dropHandler(event: DragEvent): void {
    event.preventDefault();
    if (this.directoryUpload()) {
      this.fileUploadDirective().handleItems(event.dataTransfer!.items);
    } else {
      this.fileUploadDirective().handleFiles(event.dataTransfer!.files);
    }
    this.dragOver = false;
  }

  protected dragOverHandler(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = true;
  }

  protected inputEnterHandler(): void {
    this.fileUploadDirective().triggerClick();
  }

  protected onFilesAdded(files: UploadFile[]): void {
    this.filesAdded.emit(files);
  }

  protected onFileError(error: FileUploadError): void {
    this.fileError.emit(error);
  }

  /**
   * Reset all the files inside the native file input (and therefore the dropzone).
   */
  reset(): void {
    this.fileUploadDirective().reset();
  }
}
