/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { HttpHeaders, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { inputBinding, outputBinding, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslatableString } from '@siemens/element-translate-ng/translate';

import { FileUploadConfig, FileUploadResult, SiFileUploaderComponent, UploadFile } from './index';

describe('SiFileUploaderComponent', () => {
  let fixture: ComponentFixture<SiFileUploaderComponent>;
  let element: HTMLElement;
  let httpMock: HttpTestingController;

  let uploadConfig: WritableSignal<FileUploadConfig>;
  let maxFileSize: WritableSignal<number | undefined>;
  let maxFiles: WritableSignal<number>;
  let maxConcurrentUploads: WritableSignal<number>;
  let showHttpError: WritableSignal<boolean>;
  let autoUpload: WritableSignal<boolean>;
  let accept: WritableSignal<string | undefined>;
  let uploadTextFileSelect: WritableSignal<TranslatableString>;
  let uploadDropText: WritableSignal<TranslatableString>;
  let clearButtonText: WritableSignal<TranslatableString>;
  let uploadButtonText: WritableSignal<TranslatableString>;
  let errorTextFileType: WritableSignal<TranslatableString>;
  let errorTextFileMaxSize: WritableSignal<TranslatableString>;
  let maxFilesReachedText: WritableSignal<TranslatableString>;
  let disableUpload: WritableSignal<boolean>;
  let retries: WritableSignal<number>;
  let errorUploadFailed: WritableSignal<TranslatableString>;
  let uploadCompletedSpy: (event: FileUploadResult) => void;
  let uploadCanceledSpy: (event: UploadFile) => void;
  let filesChangesSpy: (event: UploadFile[]) => void;

  const getFiles = (): NodeListOf<HTMLElement> =>
    element.querySelectorAll<HTMLElement>('.file-list .file');
  const getUploadButton = (): HTMLButtonElement => element.querySelector('.btn.btn-primary')!;
  const getClearButton = (): HTMLButtonElement => element.querySelector('.btn.btn-secondary')!;
  const getError = (): HTMLElement | null => element.querySelector('.error')!;

  const deleteButton = (): HTMLElement =>
    element.querySelector<HTMLElement>('[aria-label="Remove"]')!;
  const cancelButton = (): HTMLElement =>
    element.querySelector<HTMLElement>('[aria-label="Cancel"]')!;
  const retryButton = (): HTMLElement =>
    element.querySelector<HTMLElement>('[aria-label="Upload"]')!;

  beforeEach(() => {
    uploadConfig = signal<FileUploadConfig>({
      method: 'POST',
      url: '/api/attachments',
      fieldName: 'file',
      headers: new HttpHeaders({ 'Accept': 'application/json' })
    });
    maxFileSize = signal<number | undefined>(undefined);
    maxFiles = signal(10);
    maxConcurrentUploads = signal(3);
    showHttpError = signal(false);
    autoUpload = signal(false);
    accept = signal<string | undefined>(undefined);
    uploadTextFileSelect = signal<TranslatableString>('click to upload');
    uploadDropText = signal<TranslatableString>('Drop files here or');
    clearButtonText = signal<TranslatableString>('Clear');
    uploadButtonText = signal<TranslatableString>('Upload');
    errorTextFileType = signal<TranslatableString>('Incorrect file type selected');
    errorTextFileMaxSize = signal<TranslatableString>('File exceeds allowed maximum size');
    maxFilesReachedText = signal<TranslatableString>('Maximum number of files reached');
    disableUpload = signal(false);
    retries = signal(0);
    errorUploadFailed = signal<TranslatableString>('Upload failed');
    uploadCompletedSpy = vi.fn();
    uploadCanceledSpy = vi.fn();
    filesChangesSpy = vi.fn();

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    httpMock = TestBed.inject(HttpTestingController);

    fixture = TestBed.createComponent(SiFileUploaderComponent, {
      bindings: [
        inputBinding('uploadConfig', uploadConfig),
        inputBinding('maxFileSize', maxFileSize),
        inputBinding('maxFiles', maxFiles),
        inputBinding('maxConcurrentUploads', maxConcurrentUploads),
        inputBinding('showHttpError', showHttpError),
        inputBinding('autoUpload', autoUpload),
        inputBinding('accept', accept),
        inputBinding('uploadTextFileSelect', uploadTextFileSelect),
        inputBinding('uploadDropText', uploadDropText),
        inputBinding('clearButtonText', clearButtonText),
        inputBinding('uploadButtonText', uploadButtonText),
        inputBinding('errorTextFileType', errorTextFileType),
        inputBinding('errorTextFileMaxSize', errorTextFileMaxSize),
        inputBinding('maxFilesReachedText', maxFilesReachedText),
        inputBinding('disableUpload', disableUpload),
        inputBinding('retries', retries),
        inputBinding('errorUploadFailed', errorUploadFailed),
        outputBinding('uploadCompleted', uploadCompletedSpy),
        outputBinding('uploadCanceled', uploadCanceledSpy),
        outputBinding('filesChanges', filesChangesSpy)
      ]
    });
    element = fixture.nativeElement;
  });

  const createFileList = (files: string[], type?: string[]): DataTransfer => {
    const dt = new DataTransfer();
    files.forEach((f, i) => dt.items.add(new File(['blub'], f, { type: type?.[i] })));
    return dt;
  };

  const createFileListWithFileSizeOf1200Bytes = (files: string[]): DataTransfer => {
    const dt = new DataTransfer();
    files.forEach(f => dt.items.add(new File(['blub'.repeat(300)], f)));
    return dt;
  };

  const handleFiles = async (dataTransfer: DataTransfer): Promise<void> => {
    await fixture.whenStable();
    element.querySelector('.drag-and-drop')?.dispatchEvent(new DragEvent('drop', { dataTransfer }));
    await fixture.whenStable();
  };

  const triggerUpload = (): void =>
    element.querySelector<HTMLButtonElement>('.btn-primary')!.click();

  it('should pass text messages to drop zone', async () => {
    uploadTextFileSelect.set('browse files');
    uploadDropText.set('droppi droppi');
    clearButtonText.set('Reset');
    uploadButtonText.set('Do it');
    await fixture.whenStable();
    expect(element.querySelector('.select-file span')!).toHaveTextContent('browse files');
    expect(element.querySelector('.drag-and-drop-description')!).toHaveTextContent('droppi droppi');
    expect(getClearButton()).toHaveTextContent('Reset');
    expect(getUploadButton()).toHaveTextContent('Do it');
  });

  it('should contain file name and size', async () => {
    accept.set('.png');
    await handleFiles(createFileListWithFileSizeOf1200Bytes(['first.png', 'second.png']));
    const files = getFiles();
    expect(files.length).toBe(2);
    expect(files[0]).toHaveTextContent('first.png');
    expect(files[0]).toHaveTextContent('1.17KB');
    expect(files[1]).toHaveTextContent('second.png');
    expect(files[1]).toHaveTextContent('1.17KB');
  });

  it('should filter duplicates', async () => {
    accept.set('.png');
    await handleFiles(createFileListWithFileSizeOf1200Bytes(['first.png', 'second.png']));
    await handleFiles(createFileListWithFileSizeOf1200Bytes(['first.png', 'second.png']));
    const files = getFiles();
    expect(files.length).toBe(2);
  });

  it('should provide option to remove selected file', async () => {
    accept.set('.png');
    await handleFiles(createFileList(['first.png', 'second.png']));

    expect(getFiles().length).toBe(2);
    deleteButton().click();
    await fixture.whenStable();

    expect(getFiles().length).toBe(1);
  });

  it('should allow one to define accepted mime types', async () => {
    accept.set('image/*');
    await fixture.whenStable();
    expect(element.querySelector('.select-file input')!).toHaveAttribute(
      'accept',
      expect.stringContaining('image/*')
    );
  });

  it('should reject files that do not match the "accept" parameter', async () => {
    accept.set('fmwz');
    errorTextFileType.set('Incorrect type');
    await handleFiles(createFileList(['notMatching.fmwr']));
    expect(getError()!).toHaveTextContent('Incorrect type');
  });

  it('should allow files that match a file extension', async () => {
    accept.set('.fmwr');
    errorTextFileType.set('Incorrect type');
    await handleFiles(createFileList(['matching.fmwr']));
    expect(element.querySelector('.file')!).toHaveTextContent('matching.fmwr');
    expect(getUploadButton()).toBeEnabled();
  });

  it('should reject files that do not match a file extension', async () => {
    accept.set('.blub');
    errorTextFileType.set('Incorrect type');
    await handleFiles(createFileList(['wrong.fmwr']));
    expect(element.querySelector('.file')!).toHaveTextContent('wrong.fmwr');
    expect(getUploadButton()).toBeDisabled();
  });

  it('should allow files that match one of the multiple "accept" values', async () => {
    accept.set('image/*,.fmwr');
    errorTextFileType.set('Incorrect type');
    await handleFiles(createFileList(['matching.png', 'bla.fmwr'], ['image/png']));
    const files = element.querySelectorAll<HTMLElement>('.file');
    expect(files[0]!).toHaveTextContent('bla.fmwr');
    expect(files[1]!).toHaveTextContent('matching.png');
    expect(getError()).not.toBeInTheDocument();
  });

  it('should allow files that match extension only', async () => {
    accept.set('.blub');
    errorTextFileType.set('Incorrect type');
    await handleFiles(createFileList(['matching.blub']));
    expect(element.querySelector('.file')!).toHaveTextContent('matching.blub');
    expect(getError()).not.toBeInTheDocument();
  });

  it("should reject files that don't match extension only", async () => {
    accept.set('.blub');
    errorTextFileType.set('Incorrect type');
    await handleFiles(createFileList(['matching.bla']));
    expect(getError()).toBeTruthy();
  });

  it('should reject files that match none of the multiple "accept" values', async () => {
    accept.set('image/*,fmwz');
    errorTextFileType.set('Incorrect type');
    await handleFiles(createFileList(['.notMatching']));
    expect(getError()).toBeTruthy();
  });

  it('should reject files that exceeds "maxFileSize" parameter', async () => {
    maxFileSize.set(1000);
    errorTextFileMaxSize.set('File exceeds allowed maximum size');
    await handleFiles(createFileListWithFileSizeOf1200Bytes(['notMatching.fmwr']));
    expect(getError()!).toHaveTextContent('File exceeds allowed maximum size');
  });

  it('should accept files that less than or equal to "maxFileSize" parameter', async () => {
    maxFileSize.set(50000);
    errorTextFileMaxSize.set('File exceeds allowed maximum size');
    await handleFiles(createFileListWithFileSizeOf1200Bytes(['matching.fmwr']));
    expect(element.querySelector('.file')!).toHaveTextContent('matching.fmwr');
    expect(getError()).not.toBeInTheDocument();
  });

  it('should not show max files when not over the limit', async () => {
    maxFiles.set(2);
    maxFilesReachedText.set('Max number of files reached');
    await handleFiles(createFileList(['file1.png', 'file2.png']));
    const files = getFiles();
    expect(files.length).toBe(2);
    expect(files[0]!).toHaveTextContent('file1.png');
    expect(files[1]!).toHaveTextContent('file2.png');
    expect(element.querySelector('si-inline-notification')).not.toBeInTheDocument();
    expect(getError()).not.toBeInTheDocument();
  });

  it('should accept no more than maxFiles files', async () => {
    maxFiles.set(2);
    maxFilesReachedText.set('Max number of files reached');
    await handleFiles(createFileList(['file1.png', 'file2.png', 'file3.png']));
    const files = getFiles();
    expect(files.length).toBe(2);
    expect(files[0]!).toHaveTextContent('file1.png');
    expect(files[1]!).toHaveTextContent('file2.png');
    expect(element.querySelector('si-inline-notification')!).toHaveTextContent(
      'Max number of files reached'
    );
    expect(getError()).not.toBeInTheDocument();
  });

  it('should clear all files with clear button', async () => {
    await handleFiles(createFileList(['file1.png', 'file2.png', 'file3.png']));
    expect(element.querySelectorAll<HTMLElement>('.file').length).toBe(3);

    element.querySelector<HTMLButtonElement>('.btn-secondary')!.click();
    await fixture.whenStable();

    expect(getFiles().length).toBe(0);
    expect(getError()).not.toBeInTheDocument();
    expect(getClearButton()).toBeDisabled();
    expect(getUploadButton()).toBeDisabled();
  });

  it('should emit filesChanges when files are added or removed', async () => {
    accept.set('.png');

    await handleFiles(createFileList(['first.png', 'second.png']));

    expect(filesChangesSpy).toHaveBeenCalledWith([
      expect.objectContaining({ fileName: 'first.png' }),
      expect.objectContaining({ fileName: 'second.png' })
    ]);

    deleteButton().click();
    await fixture.whenStable();

    expect(filesChangesSpy).toHaveBeenCalledWith([
      expect.objectContaining({ fileName: 'second.png' })
    ]);

    deleteButton().click();
    await fixture.whenStable();

    expect(filesChangesSpy).toHaveBeenCalledWith([]);
  });

  it('should disabled upload button and not upload when disabled', async () => {
    disableUpload.set(true);
    await fixture.whenStable();

    expect(getUploadButton()).toBeDisabled();

    await handleFiles(createFileList(['matching.fmwr']));
    triggerUpload();

    // mock no request
    httpMock.expectNone('/api/attachments');
    httpMock.verify();

    await handleFiles(createFileList(['matching.fmwr']));
    triggerUpload();

    disableUpload.set(false);
    await fixture.whenStable();

    expect(getUploadButton()).toBeEnabled();

    await handleFiles(createFileList(['matching.fmwr']));
    triggerUpload();

    // mock request
    const attachment = { id: 201, fileName: 'matching.fmwr' };
    const req = httpMock.expectOne('/api/attachments');
    req.flush(attachment);
    httpMock.verify();
  });

  it('should emit success response', async () => {
    await handleFiles(createFileList(['matching.fmwr']));
    triggerUpload();

    await fixture.whenStable();
    // mock request
    const attachment = { id: 201, fileName: 'matching.fmwr' };
    const req = httpMock.expectOne('/api/attachments');
    req.flush(attachment);

    await fixture.whenStable();

    expect(uploadCompletedSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        response: expect.objectContaining({ status: 200 })
      })
    );
    expect(vi.mocked(uploadCompletedSpy).mock.calls[0][0].error).toBeUndefined();
    httpMock.verify();
  });

  it('should upload file with correct field name', async () => {
    uploadConfig.update(config => ({ ...config, fieldName: 'test-file' }));
    await fixture.whenStable();

    await handleFiles(createFileList(['matching.fmwr']));
    triggerUpload();

    // mock request
    const attachment = { id: 201, fileName: 'matching.fmwr' };
    const req = httpMock.expectOne('/api/attachments');
    req.flush(attachment);
    httpMock.verify();

    expect(req.request.body.has('test-file')).toBe(true);
  });

  it('should upload file as binary', async () => {
    uploadConfig.update(config => ({ ...config, sendBinary: true }));
    await fixture.whenStable();

    await handleFiles(createFileList(['matching.fmwr']));
    triggerUpload();

    // mock request
    const attachment = { id: 201, fileName: 'matching.fmwr' };
    const req = httpMock.expectOne('/api/attachments');
    req.flush(attachment);
    httpMock.verify();

    expect(req.request.body instanceof Blob).toBe(true);
  });

  it('should upload file with additional fields', async () => {
    uploadConfig.update(config => ({
      ...config,
      additionalFields: {
        'test': 'test value',
        'test2': 'another test value'
      }
    }));
    await fixture.whenStable();

    await handleFiles(createFileList(['matching.fmwr']));
    triggerUpload();

    // mock request
    const attachment = { id: 201, fileName: 'matching.fmwr' };
    const req = httpMock.expectOne('/api/attachments');
    req.flush(attachment);
    httpMock.verify();

    expect(req.request.body.get('test')).toBe('test value');
    expect(req.request.body.get('test2')).toBe('another test value');
  });

  it('should auto-upload', () => {
    vi.useFakeTimers();
    autoUpload.set(true);
    fixture.detectChanges();

    fixture.detectChanges();
    element
      .querySelector('.drag-and-drop')
      ?.dispatchEvent(new DragEvent('drop', { dataTransfer: createFileList(['matching.fmwr']) }));
    fixture.detectChanges();

    // mock request
    const attachment = { id: 201, fileName: 'matching.fmwr' };
    const req = httpMock.expectOne('/api/attachments');
    req.flush(attachment);
    httpMock.verify();

    // There is 4500 ms timeout in fadeOut
    vi.advanceTimersByTime(4500);
    fixture.detectChanges();

    expect(uploadCompletedSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        response: expect.objectContaining({ status: 200 })
      })
    );
    expect(vi.mocked(uploadCompletedSpy).mock.calls[0][0].error).toBeUndefined();

    expect(getFiles().length).toBe(0);
    vi.useRealTimers();
  });

  it('should allow re-uploading file', async () => {
    await handleFiles(createFileList(['matching.fmwr']));
    triggerUpload();

    // mock request
    const attachment = { id: 201, fileName: 'matching.fmwr' };
    const req = httpMock.expectOne('/api/attachments');
    req.flush(attachment);
    httpMock.verify();

    fixture.detectChanges();

    expect(getUploadButton()).toBeDisabled();

    await handleFiles(createFileList(['matching.fmwr']));

    expect(getFiles().length).toBe(1);
    expect(getUploadButton()).toBeEnabled();
  });

  it('should retry and emit error response', async () => {
    retries.set(3);
    await handleFiles(createFileList(['matching.fmwr']));
    triggerUpload();

    for (let i = 0; i < 4; i++) {
      const req = httpMock.expectOne('/api/attachments');
      req.flush({}, { status: 400, statusText: 'FAILED' });
    }

    fixture.detectChanges();

    expect(uploadCompletedSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ status: 400 })
      })
    );
    expect(vi.mocked(uploadCompletedSpy).mock.calls[0][0].response).toBeUndefined();
    httpMock.verify();
  });

  it('should be possible to cancel an upload', async () => {
    await handleFiles(createFileList(['matching.fmwr']));

    triggerUpload();
    fixture.detectChanges();

    cancelButton().click();
    fixture.detectChanges();

    const req = httpMock.expectOne('/api/attachments');
    expect(req.cancelled).toBe(true);
    expect(uploadCanceledSpy).toHaveBeenCalledWith(
      expect.objectContaining({ fileName: 'matching.fmwr', size: '4B', status: 'added' })
    );

    // upload button enabled again for re-upload
    expect(getUploadButton()).toBeEnabled();
  });

  it('should be possible to retry a failed upload', () => {
    vi.useFakeTimers();
    errorUploadFailed.set('failed');
    fixture.detectChanges();
    element
      .querySelector('.drag-and-drop')
      ?.dispatchEvent(new DragEvent('drop', { dataTransfer: createFileList(['matching.fmwr']) }));
    fixture.detectChanges();

    triggerUpload();
    fixture.detectChanges();

    const req = httpMock.expectOne('/api/attachments');
    req.flush({}, { status: 400, statusText: 'FAILED' });

    vi.advanceTimersByTime(100);

    fixture.detectChanges();

    expect(element.querySelector('.error.text-danger')!).toHaveTextContent('failed');
    retryButton().click();

    const reqOk = httpMock.expectOne('/api/attachments');
    reqOk.flush({}, { status: 201, statusText: 'OK' });
    fixture.detectChanges();

    expect(element.querySelector('span[aria-label="Upload completed"]')).toBeDefined();
    vi.useRealTimers();
  });
});
