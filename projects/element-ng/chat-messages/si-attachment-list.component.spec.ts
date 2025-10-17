/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { DebugElement, TemplateRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SiModalService } from '@siemens/element-ng/modal';

import {
  SiAttachmentListComponent as TestComponent,
  AttachmentItem
} from './si-attachment-list.component';

describe('SiAttachmentListComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let debugElement: DebugElement;
  let component: TestComponent;

  beforeEach(async () => {
    const modalServiceSpy = jasmine.createSpyObj('SiModalService', ['open']);

    await TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [{ provide: SiModalService, useValue: modalServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    debugElement = fixture.debugElement;
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render empty list when no attachments provided', () => {
    fixture.componentRef.setInput('attachments', []);
    fixture.detectChanges();

    const attachmentElements = debugElement.queryAll(By.css('.attachment-item'));
    expect(attachmentElements.length).toBe(0);
  });

  it('should render attachment items', () => {
    const attachments: AttachmentItem[] = [
      { id: '1', name: 'file1.txt' },
      { id: '2', name: 'file2.pdf' }
    ];

    fixture.componentRef.setInput('attachments', attachments);
    fixture.detectChanges();

    const attachmentElements = debugElement.queryAll(By.css('.attachment-item'));
    expect(attachmentElements.length).toBe(2);
  });

  it('should display attachment names', () => {
    const attachments: AttachmentItem[] = [
      { id: '1', name: 'document.pdf' },
      { id: '2', name: 'image.png' }
    ];

    fixture.componentRef.setInput('attachments', attachments);
    fixture.detectChanges();

    const attachmentElements = debugElement.queryAll(By.css('.attachment-item'));
    expect(attachmentElements[0].nativeElement.textContent).toContain('document.pdf');
    expect(attachmentElements[1].nativeElement.textContent).toContain('image.png');
  });

  it('should use correct icon for image files', () => {
    const attachments: AttachmentItem[] = [{ id: '1', name: 'photo.jpg' }];

    fixture.componentRef.setInput('attachments', attachments);
    fixture.detectChanges();

    const icon = debugElement.query(By.css('si-icon'));
    expect(icon.componentInstance.icon()).toBe('element-image');
  });

  it('should use correct icon for video files', () => {
    const attachments: AttachmentItem[] = [{ id: '1', name: 'movie.mp4' }];

    fixture.componentRef.setInput('attachments', attachments);
    fixture.detectChanges();

    const icon = debugElement.query(By.css('si-icon'));
    expect(icon.componentInstance.icon()).toBe('element-video');
  });

  it('should use correct icon for audio files', () => {
    const attachments: AttachmentItem[] = [{ id: '1', name: 'song.mp3' }];

    fixture.componentRef.setInput('attachments', attachments);
    fixture.detectChanges();

    const icon = debugElement.query(By.css('si-icon'));
    expect(icon.componentInstance.icon()).toBe('element-audio');
  });

  it('should use correct icon for PDF files', () => {
    const attachments: AttachmentItem[] = [{ id: '1', name: 'document.pdf' }];

    fixture.componentRef.setInput('attachments', attachments);
    fixture.detectChanges();

    const icon = debugElement.query(By.css('si-icon'));
    expect(icon.componentInstance.icon()).toBe('element-document-pdf');
  });

  it('should use correct icon for zip files', () => {
    const attachments: AttachmentItem[] = [{ id: '1', name: 'archive.zip' }];

    fixture.componentRef.setInput('attachments', attachments);
    fixture.detectChanges();

    const icon = debugElement.query(By.css('si-icon'));
    expect(icon.componentInstance.icon()).toBe('element-document-zip');
  });

  it('should use default icon for unknown file types', () => {
    const attachments: AttachmentItem[] = [{ id: '1', name: 'file.unknown' }];

    fixture.componentRef.setInput('attachments', attachments);
    fixture.detectChanges();

    const icon = debugElement.query(By.css('si-icon'));
    expect(icon.componentInstance.icon()).toBe('element-document');
  });

  it('should align attachments to start by default', () => {
    const attachments: AttachmentItem[] = [{ id: '1', name: 'file.txt' }];

    fixture.componentRef.setInput('attachments', attachments);
    fixture.detectChanges();

    const container = debugElement.query(By.css('.d-flex'));
    expect(container.nativeElement.classList.contains('justify-content-end')).toBe(false);
  });

  it('should align attachments to end when specified', () => {
    const attachments: AttachmentItem[] = [{ id: '1', name: 'file.txt' }];

    fixture.componentRef.setInput('attachments', attachments);
    fixture.componentRef.setInput('alignment', 'end');
    fixture.detectChanges();

    const container = debugElement.query(By.css('.d-flex'));
    expect(container.nativeElement.classList.contains('justify-content-end')).toBe(true);
  });

  it('should not show remove buttons by default', () => {
    const attachments: AttachmentItem[] = [{ id: '1', name: 'file.txt' }];

    fixture.componentRef.setInput('attachments', attachments);
    fixture.detectChanges();

    const removeButtons = debugElement.queryAll(By.css('.btn-circle'));
    expect(removeButtons.length).toBe(0);
  });

  it('should show remove buttons when removable is true', () => {
    const attachments: AttachmentItem[] = [
      { id: '1', name: 'file1.txt' },
      { id: '2', name: 'file2.txt' }
    ];

    fixture.componentRef.setInput('attachments', attachments);
    fixture.componentRef.setInput('removable', true);
    fixture.detectChanges();

    const removeButtons = debugElement.queryAll(By.css('.btn-circle'));
    expect(removeButtons.length).toBe(2);
  });

  it('should emit remove event when remove button is clicked', () => {
    const attachments: AttachmentItem[] = [{ id: '1', name: 'file.txt' }];

    let emittedId: string | undefined;
    fixture.componentInstance.remove.subscribe((id: string) => {
      emittedId = id;
    });

    fixture.componentRef.setInput('attachments', attachments);
    fixture.componentRef.setInput('removable', true);
    fixture.detectChanges();

    const removeButton = debugElement.query(By.css('.btn-circle'));
    removeButton.nativeElement.click();

    expect(emittedId).toBe('1');
  });

  it('should use custom remove label', () => {
    const attachments: AttachmentItem[] = [{ id: '1', name: 'file.txt' }];
    const customLabel = 'Custom Remove';

    fixture.componentRef.setInput('attachments', attachments);
    fixture.componentRef.setInput('removable', true);
    fixture.componentRef.setInput('removeLabel', customLabel);
    fixture.detectChanges();

    const removeButton = debugElement.query(By.css('.btn-circle'));
    expect(removeButton.nativeElement.getAttribute('aria-label')).toContain(customLabel);
  });

  it('should handle attachments with preview templates', () => {
    const mockTemplate = {} as TemplateRef<any>;
    const attachments: AttachmentItem[] = [
      { id: '1', name: 'file.txt', previewTemplate: mockTemplate }
    ];

    fixture.componentRef.setInput('attachments', attachments);
    fixture.detectChanges();

    const attachmentButton = debugElement.query(By.css('.attachment-item'));
    expect(attachmentButton).toBeTruthy();
  });

  it('should handle attachments with preview template functions', () => {
    const mockTemplate = {} as TemplateRef<any>;
    const attachments: AttachmentItem[] = [
      { id: '1', name: 'file.txt', previewTemplate: () => mockTemplate }
    ];

    fixture.componentRef.setInput('attachments', attachments);
    fixture.detectChanges();

    const attachmentButton = debugElement.query(By.css('.attachment-item'));
    expect(attachmentButton).toBeTruthy();
  });
});
