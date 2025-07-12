/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { SiFileDropzoneComponent, UploadFile } from './index';

@Component({
  imports: [SiFileDropzoneComponent],
  template: `
    <si-file-dropzone
      [maxFileSize]="maxFileSize()"
      [accept]="accept"
      [uploadTextFileSelect]="uploadTextFileSelect"
      [uploadDropText]="uploadDropText"
      [errorTextFileType]="errorTextFileType"
      [errorTextFileMaxSize]="errorTextFileMaxSize"
      [directoryUpload]="directoryUpload"
      (filesAdded)="filesAdded()"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestHostComponent {
  readonly fileDropzone = viewChild.required(SiFileDropzoneComponent);
  readonly maxFileSize = signal<number | undefined>(undefined);
  accept!: string;
  uploadTextFileSelect!: string;
  uploadDropText!: string;
  errorTextFileType!: string;
  errorTextFileMaxSize!: string;
  directoryUpload = false;

  filesAdded = (): void => {};
}
describe('SiFileDropzoneComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;
  let element: HTMLElement;
  let eventSpy: jasmine.Spy<(value?: UploadFile[]) => void>;

  const dropFiles = (dataTransfer: DataTransfer): void => {
    element.querySelector('.drag-and-drop')?.dispatchEvent(new DragEvent('drop', { dataTransfer }));
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    eventSpy = spyOn(component.fileDropzone().filesAdded, 'emit');
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

  const getFiles = (): UploadFile[] => eventSpy.calls.first().args[0]!;

  const createDirectoryItemsWithFiles = (): DataTransferItemList => {
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

  it('should contain set upload text to file selecting', () => {
    component.uploadTextFileSelect = 'browse files';
    component.uploadDropText = 'droppi droppi';
    fixture.detectChanges();
    expect(element.querySelector('.select-file span')!.innerHTML).toContain('browse files');
    expect(element.querySelector('.drag-and-drop-description')!.innerHTML).toContain(
      'droppi droppi'
    );
  });

  it('should highlight the drop area when dragging something over it', () => {
    fixture.detectChanges();

    const dndElement = element.querySelector<HTMLElement>('.drag-and-drop')!;
    expect(dndElement.classList).not.toContain('drag-over');

    dndElement.dispatchEvent(new DragEvent('dragover'));
    fixture.detectChanges();
    expect(dndElement.classList).toContain('drag-over');

    dndElement.dispatchEvent(new DragEvent('dragleave'));
    fixture.detectChanges();
    expect(dndElement.classList).not.toContain('drag-over');
  });

  it('should contain file name and size', () => {
    component.accept = '.png';
    dropFiles(createFileListWithFileSizeOf1200Bytes(['first.png', 'second.PNG']));
    fixture.detectChanges();
    const files = getFiles();
    expect(files.length).toBe(2);
    expect(files[0].fileName).toBe('first.png');
    expect(files[0].size).toBe('1.17KB');
    expect(files[0].status).toBe('added');
    expect(files[1].fileName).toBe('second.PNG');
    expect(files[1].size).toBe('1.17KB');
    expect(files[1].status).toBe('added');
  });

  it('should drop files', () => {
    component.accept = '.png';
    fixture.detectChanges();

    const dndElement = element.querySelector<HTMLElement>('.drag-and-drop')!;
    const dateTransfer = createFileListWithFileSizeOf1200Bytes(['first.png', 'second.PNG']);

    const dataTransfer = new DataTransfer();
    spyOnProperty(dataTransfer, 'files').and.returnValue(dateTransfer.files);
    dndElement.dispatchEvent(new DragEvent('drop', { dataTransfer }));
    fixture.detectChanges();

    const files = getFiles();
    expect(files.length).toBe(2);
    expect(files[0].fileName).toBe('first.png');
    expect(files[0].status).toBe('added');
    expect(files[1].fileName).toBe('second.PNG');
    expect(files[1].status).toBe('added');
  });

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
    fixture.detectChanges();
    dropFiles(createFileList(['notMatching.fmwr']));
    fixture.detectChanges();
    const files = getFiles();
    expect(files[0].status).toBe('invalid');
    expect(files[0].errorText).toContain('Incorrect type');
  });

  it('should allow files that match a file extension', () => {
    component.accept = '.fmwr';
    component.errorTextFileType = 'Incorrect type';
    dropFiles(createFileList(['matching.fmwr']));
    fixture.detectChanges();
    const files = getFiles();
    expect(files[0].status).toBe('added');
  });

  it('should reject files that do not match a file extension', () => {
    component.accept = '.blub';
    component.errorTextFileType = 'Incorrect type';
    fixture.detectChanges();
    dropFiles(createFileList(['wrong.fmwr']));
    fixture.detectChanges();
    const files = getFiles();
    expect(files[0].status).toBe('invalid');
    expect(files[0].errorText).toContain('Incorrect type');
  });

  it('should allow files that match one of the multiple "accept" values', () => {
    component.accept = 'image/*,.fmwr';
    component.errorTextFileType = 'Incorrect type';
    dropFiles(createFileList(['matching.png', 'bla.fmwr'], ['image/png']));
    fixture.detectChanges();
    const files = getFiles();
    expect(files[0].fileName).toBe('bla.fmwr');
    expect(files[0].status).toBe('added');
    expect(files[1].fileName).toBe('matching.png');
    expect(files[1].status).toBe('added');
  });

  it('should allow files that match extension only', () => {
    component.accept = '.blub';
    component.errorTextFileType = 'Incorrect type';
    dropFiles(createFileList(['matching.blub']));
    fixture.detectChanges();
    const files = getFiles();
    expect(files[0].fileName).toBe('matching.blub');
    expect(files[0].status).toBe('added');
  });

  it("should reject files that don't match extension only", () => {
    component.accept = '.blub';
    component.errorTextFileType = 'Incorrect type';
    fixture.detectChanges();
    dropFiles(createFileList(['matching.bla']));
    fixture.detectChanges();
    const files = getFiles();
    expect(files[0].status).toBe('invalid');
    expect(files[0].errorText).toBe('Incorrect type');
  });

  it('should reject files that match none of the multiple "accept" values', () => {
    component.accept = 'image/*,fmwz';
    component.errorTextFileType = 'Incorrect type';
    fixture.detectChanges();
    dropFiles(createFileList(['.notMatching']));
    fixture.detectChanges();
    const files = getFiles();
    expect(files[0].status).toBe('invalid');
    expect(files[0].errorText).toBe('Incorrect type');
  });

  it('should reject files that exceeds "maxFileSize" parameter', () => {
    component.maxFileSize.set(1000);
    component.errorTextFileMaxSize = 'File exceeds allowed maximum size';
    fixture.detectChanges();
    dropFiles(createFileListWithFileSizeOf1200Bytes(['notMatching.fmwr']));
    fixture.detectChanges();
    const files = getFiles();
    expect(files[0].status).toBe('invalid');
    expect(files[0].errorText).toBe('File exceeds allowed maximum size');
  });

  it('should accept files that less than or equal to "maxFileSize" parameter', () => {
    component.maxFileSize.set(50000);
    component.errorTextFileMaxSize = 'File exceeds allowed maximum size';
    dropFiles(createFileListWithFileSizeOf1200Bytes(['matching.fmwr']));
    fixture.detectChanges();
    const files = getFiles();
    expect(files[0].status).toBe('added');
  });

  it('should display max allowed file size with abbreviation', fakeAsync(() => {
    component.maxFileSize.set(1_572_864); // 1.5mb
    fixture.detectChanges();
    expect(element.querySelector('.allowed')!.innerHTML).toContain('1.5MB');

    component.maxFileSize.set(1_572_864 * 1024); // 1.5gb
    fixture.detectChanges();

    expect(element.querySelector('.allowed')!.innerHTML).toContain('1.5GB');
  }));

  it('should allow directory upload when using drag and drop', () => {
    component.directoryUpload = true;
    fixture.detectChanges();

    const dataTransfer = new DataTransfer();
    // cannot assign directly to DataTransfer intereface since some are readonly properties
    Object.defineProperty(dataTransfer, 'items', { value: createDirectoryItemsWithFiles() });

    element.querySelector('.drag-and-drop')?.dispatchEvent(new DragEvent('drop', { dataTransfer }));
    fixture.detectChanges();

    expect(eventSpy).toHaveBeenCalled();
    const files = getFiles();
    expect(files.length).toBe(2);
    expect(files[0].fileName).toBe('file.txt');
    expect(files[1].fileName).toBe('newFile.txt');
  });
});
