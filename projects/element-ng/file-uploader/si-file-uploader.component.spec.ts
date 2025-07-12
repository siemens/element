/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { HttpErrorResponse, HttpHeaders, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ChangeDetectionStrategy, Component, SimpleChange, viewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';

import { runOnPushChangeDetection } from '../test-helpers/change-detection.helper';
import { FileUploadResult, SiFileUploaderComponent, UploadFile } from './index';

@Component({
  imports: [SiFileUploaderComponent],
  template: `
    <si-file-uploader
      [uploadConfig]="uploadConfig"
      [maxFileSize]="maxFileSize"
      [maxFiles]="maxFiles"
      [maxConcurrentUploads]="maxConcurrentUploads"
      [showHttpError]="showHttpError"
      [autoUpload]="autoUpload"
      [accept]="accept"
      [uploadTextFileSelect]="uploadTextFileSelect"
      [uploadDropText]="uploadDropText"
      [clearButtonText]="clearButtonText"
      [uploadButtonText]="uploadButtonText"
      [errorTextFileType]="errorTextFileType"
      [errorTextFileMaxSize]="errorTextFileMaxSize"
      [maxFilesReachedText]="maxFilesReachedText"
      [disableUpload]="disableUpload"
      [retries]="retries"
      [errorUploadFailed]="errorUploadFailed"
      (uploadCompleted)="uploadCompleted()"
      (uploadCanceled)="uploadCanceled($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestHostComponent {
  readonly fileUploader = viewChild.required(SiFileUploaderComponent);
  uploadConfig!: any;
  maxFileSize!: number;
  maxFiles = 10;
  maxConcurrentUploads = 3;
  showHttpError!: boolean;
  autoUpload!: boolean;
  accept!: string;
  uploadTextFileSelect = 'click to upload';
  uploadDropText = 'Drop files here or';
  clearButtonText = 'Clear';
  uploadButtonText = 'Upload';
  errorTextFileType = 'Incorrect file type selected';
  errorTextFileMaxSize = 'File exceeds allowed maximum size';
  maxFilesReachedText = 'Maximum number of files reached';
  disableUpload = false;
  retries = 0;
  errorUploadFailed!: string;
  uploadCompleted = (): void => {};
  uploadCanceled = (event: UploadFile): void => {};
}

describe('SiFileUploaderComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;
  let element: HTMLElement;
  let httpMock: HttpTestingController;

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
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;

    component.uploadConfig = {
      method: 'POST',
      url: '/api/attachments',
      fieldName: 'file',

      headers: new HttpHeaders({ 'Accept': 'application/json' })
    };
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

  const handleFiles = (dataTransfer: DataTransfer): void => {
    fixture.detectChanges();
    element.querySelector('.drag-and-drop')?.dispatchEvent(new DragEvent('drop', { dataTransfer }));
    fixture.detectChanges();
  };

  const triggerUpload = (): void =>
    element.querySelector<HTMLButtonElement>('.btn-primary')!.click();

  it('should pass text messages to drop zone', () => {
    component.uploadTextFileSelect = 'browse files';
    component.uploadDropText = 'droppi droppi';
    component.clearButtonText = 'Reset';
    component.uploadButtonText = 'Do it';
    fixture.detectChanges();
    expect(element.querySelector('.select-file span')!.innerHTML).toContain('browse files');
    expect(element.querySelector('.drag-and-drop-description')!.innerHTML).toContain(
      'droppi droppi'
    );
    expect(getClearButton().innerHTML).toContain('Reset');
    expect(getUploadButton().innerHTML).toContain('Do it');
  });

  it('should contain file name and size', () => {
    component.accept = '.png';
    handleFiles(createFileListWithFileSizeOf1200Bytes(['first.png', 'second.png']));
    const files = getFiles();
    expect(files.length).toBe(2);
    expect(files[0].innerHTML).toContain('first.png');
    expect(files[0].innerHTML).toContain('1.17KB');
    expect(files[1].innerHTML).toContain('second.png');
    expect(files[1].innerHTML).toContain('1.17KB');
  });

  it('should filter duplicates', () => {
    component.accept = '.png';
    handleFiles(createFileListWithFileSizeOf1200Bytes(['first.png', 'second.png']));
    handleFiles(createFileListWithFileSizeOf1200Bytes(['first.png', 'second.png']));
    const files = getFiles();
    expect(files.length).toBe(2);
  });

  it('should provide option to remove selected file', fakeAsync(() => {
    component.accept = '.png';
    handleFiles(createFileList(['first.png', 'second.png']));

    expect(getFiles().length).toBe(2);
    deleteButton().click();
    tick();
    fixture.detectChanges();

    expect(getFiles().length).toBe(1);
  }));

  it('should allow one to define accepted mime types', () => {
    component.accept = 'image/*';
    fixture.detectChanges();
    expect(element.querySelector('.select-file input')!.getAttribute('accept')).toContain(
      'image/*'
    );
  });

  it('should reject files that do not match the "accept" parameter', () => {
    component.accept = 'fmwz';
    component.errorTextFileType = 'Incorrect type';
    handleFiles(createFileList(['notMatching.fmwr']));
    expect(getError()!.innerHTML).toContain('Incorrect type');
  });

  it('should allow files that match a file extension', () => {
    component.accept = '.fmwr';
    component.errorTextFileType = 'Incorrect type';
    handleFiles(createFileList(['matching.fmwr']));
    expect(element.querySelector('.file')!.innerHTML).toContain('matching.fmwr');
    expect(getUploadButton().disabled).toBeFalsy();
  });

  it('should reject files that do not match a file extension', () => {
    component.accept = '.blub';
    component.errorTextFileType = 'Incorrect type';
    handleFiles(createFileList(['wrong.fmwr']));
    expect(element.querySelector('.file')!.innerHTML).toContain('wrong.fmwr');
    expect(getUploadButton().disabled).toBeTruthy();
  });

  it('should allow files that match one of the multiple "accept" values', () => {
    component.accept = 'image/*,.fmwr';
    component.errorTextFileType = 'Incorrect type';
    handleFiles(createFileList(['matching.png', 'bla.fmwr'], ['image/png']));
    const files = element.querySelectorAll<HTMLElement>('.file');
    expect(files[0]!.innerHTML).toContain('bla.fmwr');
    expect(files[1]!.innerHTML).toContain('matching.png');
    expect(getError()).toBeFalsy();
  });

  it('should allow files that match extension only', () => {
    component.accept = '.blub';
    component.errorTextFileType = 'Incorrect type';
    handleFiles(createFileList(['matching.blub']));
    expect(element.querySelector('.file')!.innerHTML).toContain('matching.blub');
    expect(getError()).toBeFalsy();
  });

  it("should reject files that don't match extension only", () => {
    component.accept = '.blub';
    component.errorTextFileType = 'Incorrect type';
    handleFiles(createFileList(['matching.bla']));
    expect(getError()).toBeTruthy();
  });

  it('should reject files that match none of the multiple "accept" values', () => {
    component.accept = 'image/*,fmwz';
    component.errorTextFileType = 'Incorrect type';
    handleFiles(createFileList(['.notMatching']));
    expect(getError()).toBeTruthy();
  });

  it('should reject files that exceeds "maxFileSize" parameter', () => {
    component.maxFileSize = 1000;
    component.errorTextFileMaxSize = 'File exceeds allowed maximum size';
    handleFiles(createFileListWithFileSizeOf1200Bytes(['notMatching.fmwr']));
    expect(getError()!.innerHTML).toContain('File exceeds allowed maximum size');
  });

  it('should accept files that less than or equal to "maxFileSize" parameter', () => {
    component.maxFileSize = 50000;
    component.errorTextFileMaxSize = 'File exceeds allowed maximum size';
    handleFiles(createFileListWithFileSizeOf1200Bytes(['matching.fmwr']));
    expect(element.querySelector('.file')!.innerHTML).toContain('matching.fmwr');
    expect(getError()).toBeFalsy();
  });

  it('should not show max files when not over the limit', () => {
    component.maxFiles = 2;
    component.maxFilesReachedText = 'Max number of files reached';
    handleFiles(createFileList(['file1.png', 'file2.png']));
    const files = getFiles();
    expect(files.length).toBe(2);
    expect(files[0]!.innerHTML).toContain('file1.png');
    expect(files[1]!.innerHTML).toContain('file2.png');
    expect(element.querySelector('si-inline-notification')).toBeFalsy();
    expect(getError()).toBeFalsy();
  });

  it('should accept no more than maxFiles files', () => {
    component.maxFiles = 2;
    component.maxFilesReachedText = 'Max number of files reached';
    handleFiles(createFileList(['file1.png', 'file2.png', 'file3.png']));
    const files = getFiles();
    expect(files.length).toBe(2);
    expect(files[0]!.innerHTML).toContain('file1.png');
    expect(files[1]!.innerHTML).toContain('file2.png');
    expect(element.querySelector('si-inline-notification')!.innerHTML).toContain(
      component.maxFilesReachedText
    );
    expect(getError()).toBeFalsy();
  });

  it('should clear all files with clear button', () => {
    handleFiles(createFileList(['file1.png', 'file2.png', 'file3.png']));
    expect(element.querySelectorAll<HTMLElement>('.file').length).toBe(3);

    element.querySelector<HTMLButtonElement>('.btn-secondary')!.click();
    fixture.detectChanges();

    expect(getFiles().length).toBe(0);
    expect(getError()).toBeFalsy();
    expect(getClearButton().disabled).toBeTruthy();
    expect(getUploadButton().disabled).toBeTruthy();
  });

  it('should emit filesChanges when files are added or removed', fakeAsync(() => {
    component.accept = '.png';

    const fileUploader = component.fileUploader();
    spyOn(fileUploader.filesChanges, 'emit');

    handleFiles(createFileList(['first.png', 'second.png']));

    expect(fileUploader.filesChanges.emit).toHaveBeenCalledWith([
      jasmine.objectContaining({ fileName: 'first.png' }),
      jasmine.objectContaining({ fileName: 'second.png' })
    ]);

    deleteButton().click();

    tick();
    fixture.detectChanges();

    expect(fileUploader.filesChanges.emit).toHaveBeenCalledWith([
      jasmine.objectContaining({ fileName: 'second.png' })
    ]);

    deleteButton().click();

    tick();
    fixture.detectChanges();

    expect(fileUploader.filesChanges.emit).toHaveBeenCalledWith([]);
  }));

  it('should disabled upload button and not upload when disabled', () => {
    component.disableUpload = true;

    fixture.detectChanges();

    expect(getUploadButton().disabled).toBeTruthy();

    handleFiles(createFileList(['matching.fmwr']));
    triggerUpload();

    // mock no request
    httpMock.expectNone('/api/attachments');
    httpMock.verify();

    handleFiles(createFileList(['matching.fmwr']));
    triggerUpload();

    component.disableUpload = false;

    component.fileUploader().ngOnChanges({ disableUpload: new SimpleChange(true, false, false) });

    runOnPushChangeDetection(fixture);

    expect(getUploadButton().disabled).toBeFalsy();

    handleFiles(createFileList(['matching.fmwr']));
    triggerUpload();

    // mock request
    const attachment = { id: 201, fileName: 'matching.fmwr' };
    const req = httpMock.expectOne('/api/attachments');
    req.flush(attachment);
    httpMock.verify();
  });

  it('should emit success response', (done: DoneFn) => {
    component.fileUploader().uploadCompleted.subscribe(result => {
      expect(result).toBeDefined();
      expect(result.response).toBeDefined();
      expect(result.error).toBeUndefined();
      expect(result.response?.status).toBe(200);
      done();
    });

    handleFiles(createFileList(['matching.fmwr']));
    triggerUpload();

    fixture.detectChanges();
    // mock request
    const attachment = { id: 201, fileName: 'matching.fmwr' };
    const req = httpMock.expectOne('/api/attachments');
    req.flush(attachment);
    httpMock.verify();
  });

  it('should upload file with correct field name', () => {
    component.uploadConfig.fieldName = 'test-file';

    handleFiles(createFileList(['matching.fmwr']));
    triggerUpload();

    // mock request
    const attachment = { id: 201, fileName: 'matching.fmwr' };
    const req = httpMock.expectOne('/api/attachments');
    req.flush(attachment);
    httpMock.verify();

    expect(req.request.body.has(component.uploadConfig.fieldName)).toBeTrue();
  });

  it('should upload file as binary', () => {
    component.uploadConfig.sendBinary = true;

    handleFiles(createFileList(['matching.fmwr']));
    triggerUpload();

    // mock request
    const attachment = { id: 201, fileName: 'matching.fmwr' };
    const req = httpMock.expectOne('/api/attachments');
    req.flush(attachment);
    httpMock.verify();

    expect(req.request.body instanceof Blob).toBeTrue();
  });

  it('should upload file with additional fields', () => {
    component.uploadConfig.additionalFields = {
      'test': 'test value',
      'test2': 'another test value'
    };

    handleFiles(createFileList(['matching.fmwr']));
    triggerUpload();

    // mock request
    const attachment = { id: 201, fileName: 'matching.fmwr' };
    const req = httpMock.expectOne('/api/attachments');
    req.flush(attachment);
    httpMock.verify();

    expect(req.request.body.get('test')).toBe('test value');
    expect(req.request.body.get('test2')).toBe('another test value');
  });

  it('should auto-upload', fakeAsync(() => {
    let result: FileUploadResult | undefined;
    component.autoUpload = true;
    component.fileUploader().uploadCompleted.subscribe(res => (result = res));

    handleFiles(createFileList(['matching.fmwr']));

    // mock request
    const attachment = { id: 201, fileName: 'matching.fmwr' };
    const req = httpMock.expectOne('/api/attachments');
    req.flush(attachment);
    httpMock.verify();

    flush();
    fixture.detectChanges();

    expect(result).toBeDefined();
    expect(result!.response).toBeDefined();
    expect(result!.error).toBeUndefined();
    expect(result!.response?.status).toBe(200);

    expect(getFiles().length).toBe(0);
  }));

  it('should allow re-uploading file', fakeAsync(() => {
    handleFiles(createFileList(['matching.fmwr']));
    triggerUpload();

    // mock request
    const attachment = { id: 201, fileName: 'matching.fmwr' };
    const req = httpMock.expectOne('/api/attachments');
    req.flush(attachment);
    httpMock.verify();

    flush();
    fixture.detectChanges();

    expect(getUploadButton().disabled).toBeTruthy();

    handleFiles(createFileList(['matching.fmwr']));
    flush();
    fixture.detectChanges();

    expect(getFiles().length).toBe(1);
    expect(getUploadButton().disabled).toBeFalsy();
  }));

  it('should retry and emit error response', (done: DoneFn) => {
    component.fileUploader().uploadCompleted.subscribe(result => {
      expect(result).toBeDefined();
      expect(result.response).toBeUndefined();
      expect(result.error).toBeDefined();
      const errorResponse = result.error as HttpErrorResponse;
      expect(errorResponse.status).toBe(400);
      done();
    });

    component.retries = 3;
    handleFiles(createFileList(['matching.fmwr']));
    triggerUpload();

    for (let i = 0; i < 4; i++) {
      const req = httpMock.expectOne('/api/attachments');
      req.flush({}, { status: 400, statusText: 'FAILED' });
    }
    httpMock.verify();
  });

  it('should be possible to cancel an upload', () => {
    const canceledSpy = spyOn(component, 'uploadCanceled');

    handleFiles(createFileList(['matching.fmwr']));

    triggerUpload();
    fixture.detectChanges();

    cancelButton().click();
    fixture.detectChanges();

    const req = httpMock.expectOne('/api/attachments');
    expect(req.cancelled).toBeTrue();
    expect(canceledSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({ fileName: 'matching.fmwr', size: '4B', status: 'added' })
    );

    // upload button enabled again for re-upload
    expect(getUploadButton().disabled).toBeFalsy();
  });

  it('should be possible to retry a failed upload', fakeAsync(() => {
    component.errorUploadFailed = 'failed';
    handleFiles(createFileList(['matching.fmwr']));

    triggerUpload();
    fixture.detectChanges();

    const req = httpMock.expectOne('/api/attachments');
    req.flush({}, { status: 400, statusText: 'FAILED' });

    tick(100);
    flush();
    fixture.detectChanges();

    expect(element.querySelector('.error.text-danger')!.innerHTML).toContain('failed');
    retryButton().click();

    const reqOk = httpMock.expectOne('/api/attachments');
    reqOk.flush({}, { status: 201, statusText: 'OK' });
    fixture.detectChanges();

    expect(element.querySelector('span[aria-label="Upload completed"]')).toBeDefined();

    flush();
  }));
});
