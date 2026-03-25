/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, outputBinding, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslatableString } from '@siemens/element-translate-ng/translate';

import { SiFileDropzoneComponent, UploadFile } from './index';

describe('SiFileDropzoneComponent', () => {
  let fixture: ComponentFixture<SiFileDropzoneComponent>;
  let element: HTMLElement;
  let maxFileSize: WritableSignal<number | undefined>;
  let accept: WritableSignal<string | undefined>;
  let uploadTextFileSelect: WritableSignal<TranslatableString>;
  let uploadDropText: WritableSignal<TranslatableString>;
  let errorTextFileType: WritableSignal<TranslatableString>;
  let errorTextFileMaxSize: WritableSignal<TranslatableString>;
  let directoryUpload: WritableSignal<boolean>;
  let filesAddedSpy: (event: UploadFile[]) => void;

  const dropFiles = (dataTransfer: DataTransfer): void => {
    element.querySelector('.drag-and-drop')?.dispatchEvent(new DragEvent('drop', { dataTransfer }));
  };

  beforeEach(() => {
    maxFileSize = signal<number | undefined>(undefined);
    accept = signal<string | undefined>(undefined);
    uploadTextFileSelect = signal<TranslatableString>('click to upload');
    uploadDropText = signal<TranslatableString>('Drop files here or');
    errorTextFileType = signal<TranslatableString>('Incorrect file type selected');
    errorTextFileMaxSize = signal<TranslatableString>('File exceeds allowed maximum size');
    directoryUpload = signal(false);
    filesAddedSpy = vi.fn();

    fixture = TestBed.createComponent(SiFileDropzoneComponent, {
      bindings: [
        inputBinding('maxFileSize', maxFileSize),
        inputBinding('accept', accept),
        inputBinding('uploadTextFileSelect', uploadTextFileSelect),
        inputBinding('uploadDropText', uploadDropText),
        inputBinding('errorTextFileType', errorTextFileType),
        inputBinding('errorTextFileMaxSize', errorTextFileMaxSize),
        inputBinding('directoryUpload', directoryUpload),
        outputBinding('filesAdded', filesAddedSpy)
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

  const getFiles = (): UploadFile[] => vi.mocked(filesAddedSpy).mock.calls[0][0]!;

  const createDirectoryItemsWithFiles = (): Partial<DataTransferItemList> => {
    return {
      length: 2,
      // sample file
      [0]: {
        kind: 'file',
        type: 'text/plain',
        getAsFile: () => new File(['content'], 'file.txt'),
        getAsString: (callback: (data: string) => void) => callback('content'),
        webkitGetAsEntry: () => ({
          isFile: true,
          isDirectory: false,
          file: (callback: (file: File) => void) => callback(new File(['content'], 'file.txt')),
          filesystem: null as any,
          fullPath: '/file.txt',
          name: 'file.txt',
          getParent: () => {}
        })
      },
      // sample nested directory
      [1]: {
        kind: 'file',
        type: '',
        getAsFile: () => null,
        getAsString: (callback: (data: string) => void) => callback(''),
        webkitGetAsEntry: () => ({
          isFile: false,
          isDirectory: true,
          filesystem: null as any,
          fullPath: '/directory',
          name: 'directory',
          getParent: () => {},
          createReader: () => ({
            readEntries: (
              successCallback: (entries: any[]) => void,
              errorCallback: (error: any) => void
            ) => {
              successCallback([
                {
                  isFile: true,
                  isDirectory: false,
                  file: (callback: (file: File) => void) =>
                    callback(new File(['content'], 'newFile.txt')),
                  filesystem: null as any,
                  fullPath: '/newFile.txt',
                  name: 'newFile.txt',
                  getParent: () => {}
                }
              ]);
            }
          })
        })
      },
      add: () => null,
      clear: () => {},
      remove: () => false
    };
  };

  it('should contain set upload text to file selecting', async () => {
    uploadTextFileSelect.set('browse files');
    uploadDropText.set('droppi droppi');
    await fixture.whenStable();
    expect(element.querySelector('.select-file span')!).toHaveTextContent('browse files');
    expect(element.querySelector('.drag-and-drop-description')!).toHaveTextContent('droppi droppi');
  });

  it('should highlight the drop area when dragging something over it', async () => {
    await fixture.whenStable();

    const dndElement = element.querySelector<HTMLElement>('.drag-and-drop')!;
    expect(dndElement).not.toHaveClass('drag-over');

    dndElement.dispatchEvent(new DragEvent('dragover'));
    await fixture.whenStable();
    expect(dndElement).toHaveClass('drag-over');

    dndElement.dispatchEvent(new DragEvent('dragleave'));
    await fixture.whenStable();
    expect(dndElement).not.toHaveClass('drag-over');
  });

  it('should contain file name and size', async () => {
    accept.set('.png');
    dropFiles(createFileListWithFileSizeOf1200Bytes(['first.png', 'second.PNG']));
    await fixture.whenStable();
    const files = getFiles();
    expect(files.length).toBe(2);
    expect(files[0].fileName).toBe('first.png');
    expect(files[0].size).toBe('1.17KB');
    expect(files[0].status).toBe('added');
    expect(files[1].fileName).toBe('second.PNG');
    expect(files[1].size).toBe('1.17KB');
    expect(files[1].status).toBe('added');
  });

  it('should drop files', async () => {
    accept.set('.png');
    await fixture.whenStable();

    dropFiles(createFileListWithFileSizeOf1200Bytes(['first.png', 'second.PNG']));
    await fixture.whenStable();

    const files = getFiles();
    expect(files.length).toBe(2);
    expect(files[0].fileName).toBe('first.png');
    expect(files[0].status).toBe('added');
    expect(files[1].fileName).toBe('second.PNG');
    expect(files[1].status).toBe('added');
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
    await fixture.whenStable();
    dropFiles(createFileList(['notMatching.fmwr']));
    await fixture.whenStable();
    const files = getFiles();
    expect(files[0].status).toBe('invalid');
    expect(files[0].errorText).toContain('Incorrect type');
  });

  it('should allow files that match a file extension', async () => {
    accept.set('.fmwr');
    errorTextFileType.set('Incorrect type');
    dropFiles(createFileList(['matching.fmwr']));
    await fixture.whenStable();
    const files = getFiles();
    expect(files[0].status).toBe('added');
  });

  it('should reject files that do not match a file extension', async () => {
    accept.set('.blub');
    errorTextFileType.set('Incorrect type');
    await fixture.whenStable();
    dropFiles(createFileList(['wrong.fmwr']));
    await fixture.whenStable();
    const files = getFiles();
    expect(files[0].status).toBe('invalid');
    expect(files[0].errorText).toContain('Incorrect type');
  });

  it('should allow files that match one of the multiple "accept" values', async () => {
    accept.set('image/*,.fmwr');
    errorTextFileType.set('Incorrect type');
    dropFiles(createFileList(['matching.png', 'bla.fmwr'], ['image/png']));
    await fixture.whenStable();
    const files = getFiles();
    expect(files[0].fileName).toBe('bla.fmwr');
    expect(files[0].status).toBe('added');
    expect(files[1].fileName).toBe('matching.png');
    expect(files[1].status).toBe('added');
  });

  it('should allow files that match extension only', async () => {
    accept.set('.blub');
    errorTextFileType.set('Incorrect type');
    dropFiles(createFileList(['matching.blub']));
    await fixture.whenStable();
    const files = getFiles();
    expect(files[0].fileName).toBe('matching.blub');
    expect(files[0].status).toBe('added');
  });

  it("should reject files that don't match extension only", async () => {
    accept.set('.blub');
    errorTextFileType.set('Incorrect type');
    await fixture.whenStable();
    dropFiles(createFileList(['matching.bla']));
    await fixture.whenStable();
    const files = getFiles();
    expect(files[0].status).toBe('invalid');
    expect(files[0].errorText).toBe('Incorrect type');
  });

  it('should reject files that match none of the multiple "accept" values', async () => {
    accept.set('image/*,fmwz');
    errorTextFileType.set('Incorrect type');
    await fixture.whenStable();
    dropFiles(createFileList(['.notMatching']));
    await fixture.whenStable();
    const files = getFiles();
    expect(files[0].status).toBe('invalid');
    expect(files[0].errorText).toBe('Incorrect type');
  });

  it('should reject files that exceeds "maxFileSize" parameter', async () => {
    maxFileSize.set(1000);
    errorTextFileMaxSize.set('File exceeds allowed maximum size');
    await fixture.whenStable();
    dropFiles(createFileListWithFileSizeOf1200Bytes(['notMatching.fmwr']));
    await fixture.whenStable();
    const files = getFiles();
    expect(files[0].status).toBe('invalid');
    expect(files[0].errorText).toBe('File exceeds allowed maximum size');
  });

  it('should accept files that less than or equal to "maxFileSize" parameter', async () => {
    maxFileSize.set(50000);
    errorTextFileMaxSize.set('File exceeds allowed maximum size');
    dropFiles(createFileListWithFileSizeOf1200Bytes(['matching.fmwr']));
    await fixture.whenStable();
    const files = getFiles();
    expect(files[0].status).toBe('added');
  });

  it('should display max allowed file size with abbreviation', async () => {
    maxFileSize.set(1_572_864); // 1.5mb
    await fixture.whenStable();
    expect(element.querySelector('.allowed')!).toHaveTextContent('1.5MB');

    maxFileSize.set(1_572_864 * 1024); // 1.5gb
    await fixture.whenStable();

    expect(element.querySelector('.allowed')!).toHaveTextContent('1.5GB');
  });

  it('should allow directory upload when using drag and drop', async () => {
    directoryUpload.set(true);
    await fixture.whenStable();

    const dataTransfer = new DataTransfer();
    // cannot assign directly to DataTransfer interface since some are readonly properties
    Object.defineProperty(dataTransfer, 'items', { value: createDirectoryItemsWithFiles() });

    element.querySelector('.drag-and-drop')?.dispatchEvent(new DragEvent('drop', { dataTransfer }));
    await fixture.whenStable();

    expect(filesAddedSpy).toHaveBeenCalled();
    const files = getFiles();
    expect(files.length).toBe(2);
    expect(files[0].fileName).toBe('file.txt');
    expect(files[1].fileName).toBe('newFile.txt');
  });
});
