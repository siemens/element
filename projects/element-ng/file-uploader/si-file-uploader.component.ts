/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { NgClass } from '@angular/common';
import {
  HttpClient,
  HttpErrorResponse,
  HttpEvent,
  HttpEventType,
  HttpHeaders,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import {
  booleanAttribute,
  ChangeDetectorRef,
  Component,
  inject,
  input,
  numberAttribute,
  OnChanges,
  output,
  SimpleChanges,
  viewChild
} from '@angular/core';
import {
  addIcons,
  elementCancel,
  elementDelete,
  elementDocument,
  elementRedo,
  SiIconComponent,
  SiIconNextComponent
} from '@siemens/element-ng/icon';
import { SiInlineNotificationComponent } from '@siemens/element-ng/inline-notification';
import { SiProgressbarComponent } from '@siemens/element-ng/progressbar';
import { SiTranslateModule } from '@siemens/element-translate-ng/translate';
import { Observable, Subscription } from 'rxjs';
import { retry } from 'rxjs/operators';

import { SiFileDropzoneComponent } from './si-file-dropzone.component';
import { UploadFile } from './si-file-uploader.model';

/**
 * The FileUploadResult is emitted at completion of the file uploading
 * via the `uploadCompleted` emitter. On success the Http `response` from
 * the backend is provided and on failure, the `error` object is available.
 */
export interface FileUploadResult {
  file: string;
  response?: HttpResponse<unknown>;
  error?: Error;
}

export interface FileUploadConfig {
  headers: HttpHeaders | string | Record<string, string | number | (string | number)[]> | Headers;
  method: 'POST' | 'PUT' | 'PATCH';
  url: string;
  /** Form field name for the uploaded file. */
  fieldName: string;
  /**
   * Additional form fields added in the HTTP request.
   *
   * @example
   * ```json
   * { upload_user: 'Reiner Zufall', expiry_date: ' 21.12.2012' }
   * ```
   */
  additionalFields?: Record<string, string>;
  /** Specify the server response type */
  responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
  /** A function to modify the HTTP request sent on the consumer side. */
  handler?: (req: HttpRequest<unknown>) => Observable<HttpEvent<unknown>>;
  /**
   * When `true`, the file will be sent directly w/o the use of `FormData`.
   * You will also need to set the `Content-Type` header when sending binary. See: {@link headers}
   */
  sendBinary?: boolean;
}

interface ExtUploadFile extends UploadFile {
  httpErrorText?: string;
  subscription?: Subscription;
  successResponse?: HttpResponse<unknown>;
  fadeOut?: boolean;
}

@Component({
  selector: 'si-file-uploader',
  templateUrl: './si-file-uploader.component.html',
  styleUrl: './si-file-uploader.component.scss',
  imports: [
    NgClass,
    SiFileDropzoneComponent,
    SiIconComponent,
    SiIconNextComponent,
    SiInlineNotificationComponent,
    SiProgressbarComponent,
    SiTranslateModule
  ]
})
export class SiFileUploaderComponent implements OnChanges {
  /**
   * Text of the link to open the file select dialog (follows `uploadDropText`).
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_FILE_UPLOADER.FILE_SELECT:click to upload`
   * ```
   */
  readonly uploadTextFileSelect = input($localize`:@@SI_FILE_UPLOADER.FILE_SELECT:click to upload`);
  /**
   * Text instructing a user to drop the files inside the dropzone.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_FILE_UPLOADER.DROP:Drop files here or`
   * ```
   */
  readonly uploadDropText = input($localize`:@@SI_FILE_UPLOADER.DROP:Drop files here or`);
  /**
   * Text to describe the maximum file size.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_FILE_UPLOADER.MAX_SIZE:Maximum upload size`
   * ```
   */
  readonly maxFileSizeText = input($localize`:@@SI_FILE_UPLOADER.MAX_SIZE:Maximum upload size`);
  /**
   * Error message shown when the maximum number of files are reached.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_FILE_UPLOADER.MAX_FILE_REACHED:Maximum number of files reached`
   * ```
   */
  readonly maxFilesReachedText = input(
    $localize`:@@SI_FILE_UPLOADER.MAX_FILE_REACHED:Maximum number of files reached`
  );
  /**
   * Text for the accepted file types.
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
   * Text used inside the upload button.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_FILE_UPLOADER.UPLOAD:Upload`
   * ```
   */
  readonly uploadButtonText = input($localize`:@@SI_FILE_UPLOADER.UPLOAD:Upload`);
  /**
   * Text used inside the clear button.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_FILE_UPLOADER.CLEAR:Clear`
   * ```
   */
  readonly clearButtonText = input($localize`:@@SI_FILE_UPLOADER.CLEAR:Clear`);
  /**
   * Text shown during the file upload.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_FILE_UPLOADER.UPLOADING:Uploading`
   * ```
   */
  readonly uploadingText = input($localize`:@@SI_FILE_UPLOADER.UPLOADING:Uploading`);
  /**
   * Text shown to remove a file from the file list. Required for a11y.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_FILE_UPLOADER.REMOVE:Remove`
   * ```
   */
  readonly removeButtonText = input($localize`:@@SI_FILE_UPLOADER.REMOVE:Remove`);
  /**
   * Text of cancel button. Shown during upload. Required for a11y.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_FILE_UPLOADER.CANCEL:Cancel`
   * ```
   */
  readonly cancelButtonText = input($localize`:@@SI_FILE_UPLOADER.CANCEL:Cancel`);
  /**
   * Text shown if the upload was successful.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_FILE_UPLOADER.UPLOAD_COMPLETED:Upload completed`
   * ```
   */
  readonly successTextTitle = input(
    $localize`:@@SI_FILE_UPLOADER.UPLOAD_COMPLETED:Upload completed`
  );
  /**
   * Text shown if the upload failed.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_FILE_UPLOADER.UPLOAD_FAILED:Upload failed`
   * ```
   */
  readonly errorUploadFailed = input($localize`:@@SI_FILE_UPLOADER.UPLOAD_FAILED:Upload failed`);
  /**
   * On failed upload, show the error received from the server.
   *
   * @defaultValue false
   */
  readonly showHttpError = input(false, { transform: booleanAttribute });
  /**
   * Text shown to indicate that an incorrect file type was added to file list.
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
   * Config for HTTP request to upload file.
   *
   * @defaultValue
   * ```
   * {
   *     headers: new HttpHeaders({ 'Accept': 'application/json' }),
   *     method: 'POST',
   *     url: '',
   *     fieldName: 'upload_file',
   *     responseType: 'json'
   *   }
   * ```
   */
  readonly uploadConfig = input<FileUploadConfig>({
    headers: new HttpHeaders({ 'Accept': 'application/json' }),
    method: 'POST',
    url: '',
    fieldName: 'upload_file',
    responseType: 'json'
  });
  /**
   * Define which file types are suggested in file browser.
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#attr-accept
   */
  readonly accept = input<string>();
  /**
   * Define maximal allowed file size in bytes.
   *
   * @defaultValue undefined
   */
  readonly maxFileSize = input<number | undefined, unknown>(undefined, {
    transform: numberAttribute
  });
  /**
   * Define maximal allowed number of files.
   * When {@link directoryUpload} is enabled, this will have no effect.
   * @defaultValue 10
   */
  readonly maxFiles = input(10, { transform: numberAttribute });
  /**
   * Maximum number of concurrent uploads.
   *
   * @defaultValue 3
   */
  readonly maxConcurrentUploads = input(3, { transform: numberAttribute });
  /**
   * Numbers of retries for failed uploads.
   *
   * @defaultValue 0
   */
  readonly retries = input(0, { transform: numberAttribute });
  /**
   * Auto-upload mode - automatically start upload once files are added.
   *
   * @defaultValue false
   */
  readonly autoUpload = input(false, { transform: booleanAttribute });
  /**
   * Disable the upload button.
   *
   * @defaultValue false
   */
  readonly disableUpload = input(false, { transform: booleanAttribute });

  /**
   * Enable directory upload mode.
   * When enabled, the file input will accept directories and upload all files within as a flat list.
   * The hierarchy of the directory will not be preserved.
   * The `maxFiles` property will have no effect when `directoryUpload` is enabled.
   *
   * **Note:** This feature is not yet available for safari (iOS)
   *
   * @defaultValue false
   */
  readonly directoryUpload = input(false, { transform: booleanAttribute });

  /**
   * Emits when a user press cancel during upload. The event provides the file details.
   */
  readonly uploadCanceled = output<UploadFile>();

  /**
   * Output callback event will provide you if upload is finished. If an error
   * occurred it will be emitted.
   */
  readonly uploadCompleted = output<FileUploadResult>();

  /**
   * Output which fires whenever new files are added to or removed from the uploader.
   */
  readonly filesChanges = output<UploadFile[]>();

  protected readonly icons = addIcons({
    elementCancel,
    elementDelete,
    elementDocument,
    elementRedo
  });
  protected files: ExtUploadFile[] = [];
  protected pending = 0;
  protected uploading = 0;
  protected uploadEnabled = false;
  protected maxFilesReached = false;

  private readonly dropZone = viewChild.required<SiFileDropzoneComponent>('dropZone');
  private cdRef = inject(ChangeDetectorRef);
  private http? = inject(HttpClient, { optional: true });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.maxFiles || changes.disableUpload) {
      this.updateStates();
    }
  }

  protected handleFiles(files: UploadFile[]): void {
    if (!files?.length) {
      return;
    }

    const maxFiles = this.maxFiles();
    // for single-file case, replace exiting file if any
    if (maxFiles === 1 && this.files.length) {
      this.reset(false);
    }

    let numValid = this.countValid();
    for (const file of files) {
      const duplicate = this.isDuplicate(file);
      if (duplicate) {
        // in case this is duplicated: reset if already uploaded or not handled yet
        if (duplicate.status !== 'uploading' && duplicate.status !== 'queued') {
          Object.assign(duplicate, file);
        }
        continue;
      }

      const canAdd = numValid + 1 <= maxFiles;
      const valid = file.status === 'added';
      if (valid && !canAdd) {
        this.maxFilesReached = true;
        break;
      } else if (valid) {
        numValid++;
      }
      this.files.push(file);
    }

    this.files.sort((a, b) => a.fileName.localeCompare(b.fileName));

    this.filesChanges.emit(this.files.slice());

    this.updateStates();

    // needed for drag drop of directory
    this.cdRef.markForCheck();

    if (this.autoUpload()) {
      this.fileUpload(false);
    }
  }

  protected removeFile(index: number): void {
    if (index >= 0) {
      this.files.splice(index, 1);
      this.filesChanges.emit(this.files.slice());
      this.dropZone().reset();
      this.updateStates();
    }
  }

  protected cancelUpload(file: ExtUploadFile): void {
    if (file.subscription) {
      file.subscription.unsubscribe();
      file.subscription = undefined;
      this.uploading--;
    }
    this.pending--;
    file.status = 'added';
    file.progress = 0;
    this.updateStates();

    const { status, fileName, size, progress } = file;
    this.uploadCanceled.emit({
      status,
      fileName,
      size,
      progress,
      file: file.file
    });
  }

  protected retryUpload(file: UploadFile): void {
    file.status = 'added';
    this.doUpload([file], true);
  }

  /**
   * Reset the state.
   */
  reset(emit = true): void {
    this.files.forEach(f => f.subscription?.unsubscribe());
    this.files = [];
    this.dropZone().reset();
    this.updateStates();
    if (emit) {
      this.filesChanges.emit([]);
    }
  }

  /**
   * Uploads the file
   */
  fileUpload(doRetry = true): void {
    if (!this.uploadEnabled) {
      return;
    }
    this.uploadEnabled = false;
    this.doUpload(this.files, doRetry);
  }

  private doUpload(files: UploadFile[], doRetry: boolean): void {
    for (const file of files) {
      if (file.status !== 'added' && (!doRetry || file.status !== 'error')) {
        continue;
      }
      this.pending++;
      file.status = 'queued';
    }
    this.processQueue();
  }

  private processQueue(): void {
    for (let i = 0; i < this.files.length && this.uploading < this.maxConcurrentUploads(); i++) {
      const file = this.files[i];
      if (file.status === 'queued') {
        this.uploading++;
        this.uploadOneFile(file);
      }
    }
  }

  private uploadOneFile(file: ExtUploadFile): void {
    let formData: FormData | undefined;
    const config = this.uploadConfig();
    if (!config.sendBinary) {
      formData = new FormData();

      if (config.additionalFields) {
        Object.keys(config.additionalFields).forEach(key => {
          formData!.append(key, config.additionalFields![key]);
        });
      }
      // this needs to be last for AWS
      formData.append(config.fieldName, file.file, file.fileName);
    }
    const headers =
      config.headers instanceof HttpHeaders ? config.headers : new HttpHeaders(config.headers);

    const req = new HttpRequest(config.method, config.url, formData ?? file.file, {
      headers,
      responseType: config.responseType,
      reportProgress: true
    });

    file.status = 'uploading';
    file.errorText = undefined;
    file.httpErrorText = undefined;

    const requestHandler =
      config.handler ??
      (this.http ? (r: HttpRequest<unknown>) => this.http!.request(r) : undefined);
    if (!requestHandler) {
      return;
    }

    file.subscription = requestHandler(req)
      .pipe(retry(this.retries()))
      .subscribe({
        next: event => this.handleUploadEvent(file, event),
        error: (error: HttpErrorResponse) => this.handleUploadError(file, error),
        complete: () => this.handleUploadComplete(file)
      });
  }

  // this is a light check for duplicate file - name and size only, not content!
  private isDuplicate(file: UploadFile): UploadFile | null {
    for (const uploadFile of this.files) {
      if (uploadFile.file.name === file.file.name && uploadFile.file.size === file.file.size) {
        return uploadFile;
      }
    }
    return null;
  }

  private handleUploadEvent(file: ExtUploadFile, httpEvent: HttpEvent<unknown>): void {
    if (httpEvent instanceof HttpResponse) {
      file.successResponse = httpEvent as HttpResponse<unknown>;
    } else if (httpEvent.type === HttpEventType.UploadProgress && httpEvent.total) {
      file.progress = Math.floor((100 * httpEvent.loaded) / httpEvent.total);
      this.cdRef.markForCheck();
    }
  }

  private handleUploadError(file: ExtUploadFile, error: HttpErrorResponse): void {
    this.uploadCompleted.emit({ file: file.fileName, error });
    file.status = 'error';
    file.errorText = this.errorUploadFailed();
    if (this.showHttpError() && error.status && error.statusText) {
      file.httpErrorText = `${error.status}: ${error.statusText}`;
    }
    this.oneUploadDone(file);
  }

  private handleUploadComplete(file: ExtUploadFile): void {
    this.uploadCompleted.emit({ file: file.fileName, response: file.successResponse });
    file.status = 'success';
    file.progress = 100;
    file.successResponse = undefined;
    if (this.autoUpload()) {
      this.fadeOut(file);
    }
    this.oneUploadDone(file);
  }

  private oneUploadDone(file: ExtUploadFile): void {
    file.subscription = undefined;
    this.pending--;
    this.uploading--;
    this.updateStates();
    this.processQueue();
  }

  private fadeOut(file: ExtUploadFile): void {
    setTimeout(() => {
      file.fadeOut = true;
      this.cdRef.markForCheck();
      setTimeout(() => {
        this.removeFile(this.files.indexOf(file));
        this.cdRef.markForCheck();
      }, 500);
      this.cdRef.markForCheck();
    }, 3500);
  }

  private updateStates(): void {
    this.uploadEnabled =
      !this.disableUpload() &&
      !this.pending &&
      this.files.some(f => f.status === 'added' || f.status === 'error');
    if (this.maxFilesReached && this.countValid() < this.maxFiles()) {
      this.maxFilesReached = false;
    }
  }

  private countValid(): number {
    return this.files.reduce<number>((acc, f) => acc + (f.status !== 'invalid' ? 1 : 0), 0);
  }
}
