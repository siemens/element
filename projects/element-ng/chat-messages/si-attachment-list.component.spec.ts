/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { DebugElement, provideZonelessChangeDetection, TemplateRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SiModalService } from '@siemens/element-ng/modal';

import {
  SiAttachmentListComponent as TestComponent,
  Attachment
} from './si-attachment-list.component';

describe('SiAttachmentListComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let debugElement: DebugElement;

  beforeEach(async () => {
    const modalServiceSpy = jasmine.createSpyObj('SiModalService', ['open']);

    await TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [
        { provide: SiModalService, useValue: modalServiceSpy },
        provideZonelessChangeDetection()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    debugElement = fixture.debugElement;
  });

  it('should render empty list when no attachments provided', () => {
    fixture.componentRef.setInput('attachments', []);
    fixture.detectChanges();

    const attachmentElements = debugElement.queryAll(By.css('.attachment-item'));
    expect(attachmentElements.length).toBe(0);
  });

  it('should render attachment items', () => {
    const attachments: Attachment[] = [{ name: 'file1.txt' }, { name: 'file2.pdf' }];

    fixture.componentRef.setInput('attachments', attachments);
    fixture.detectChanges();

    const attachmentElements = debugElement.queryAll(By.css('.attachment-item'));
    expect(attachmentElements.length).toBe(2);
  });

  it('should display attachment names', () => {
    const attachments: Attachment[] = [{ name: 'document.pdf' }, { name: 'image.png' }];

    fixture.componentRef.setInput('attachments', attachments);
    fixture.detectChanges();

    const attachmentElements = debugElement.queryAll(By.css('.attachment-item'));
    expect(attachmentElements[0].nativeElement.textContent).toContain('document.pdf');
    expect(attachmentElements[1].nativeElement.textContent).toContain('image.png');
  });

  it('should align attachments to start by default', () => {
    const attachments: Attachment[] = [{ name: 'file.txt' }];

    fixture.componentRef.setInput('attachments', attachments);
    fixture.detectChanges();

    const container = debugElement.query(By.css('.d-flex'));
    expect(container.nativeElement.classList.contains('justify-content-end')).toBe(false);
  });

  it('should align attachments to end when specified', () => {
    const attachments: Attachment[] = [{ name: 'file.txt' }];

    fixture.componentRef.setInput('attachments', attachments);
    fixture.componentRef.setInput('alignment', 'end');
    fixture.detectChanges();

    const container = debugElement.query(By.css('.d-flex'));
    expect(container.nativeElement.classList.contains('justify-content-end')).toBe(true);
  });

  it('should not show remove buttons by default', () => {
    const attachments: Attachment[] = [{ name: 'file.txt' }];

    fixture.componentRef.setInput('attachments', attachments);
    fixture.detectChanges();

    const removeButtons = debugElement.queryAll(By.css('.btn-circle'));
    expect(removeButtons.length).toBe(0);
  });

  it('should show remove buttons when removable is true', () => {
    const attachments: Attachment[] = [{ name: 'file1.txt' }, { name: 'file2.txt' }];

    fixture.componentRef.setInput('attachments', attachments);
    fixture.componentRef.setInput('removable', true);
    fixture.detectChanges();

    const removeButtons = debugElement.queryAll(By.css('.btn-circle'));
    expect(removeButtons.length).toBe(2);
  });

  it('should emit remove event when remove button is clicked', () => {
    const attachments: Attachment[] = [{ name: 'file.txt' }];

    let emittedName: string | undefined;
    fixture.componentInstance.remove.subscribe(attachment => {
      emittedName = attachment.name;
    });

    fixture.componentRef.setInput('attachments', attachments);
    fixture.componentRef.setInput('removable', true);
    fixture.detectChanges();

    const removeButton = debugElement.query(By.css('.btn-circle'));
    removeButton.nativeElement.click();

    expect(emittedName).toBe('file.txt');
  });

  it('should handle attachments with preview templates', () => {
    const mockTemplate = {} as TemplateRef<any>;
    const attachments: Attachment[] = [{ name: 'file.txt', previewTemplate: mockTemplate }];

    fixture.componentRef.setInput('attachments', attachments);
    fixture.detectChanges();

    const attachmentButton = debugElement.query(By.css('.attachment-item'));
    expect(attachmentButton).toBeTruthy();
  });

  it('should handle attachments with preview template functions', () => {
    const mockTemplate = {} as TemplateRef<any>;
    const attachments: Attachment[] = [{ name: 'file.txt', previewTemplate: () => mockTemplate }];

    fixture.componentRef.setInput('attachments', attachments);
    fixture.detectChanges();

    const attachmentButton = debugElement.query(By.css('.attachment-item'));
    expect(attachmentButton).toBeTruthy();
  });
});
