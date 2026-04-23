/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  DebugElement,
  inputBinding,
  outputBinding,
  signal,
  TemplateRef,
  WritableSignal
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SiModalService } from '@siemens/element-ng/modal';

import { Attachment } from './chat-message.model';
import { SiAttachmentListComponent as TestComponent } from './si-attachment-list.component';

describe('SiAttachmentListComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let debugElement: DebugElement;
  let attachments: WritableSignal<Attachment[]>;
  let alignment: WritableSignal<'start' | 'end'>;
  let removable: WritableSignal<boolean>;
  let removeSpy = vi.fn();

  beforeEach(async () => {
    const modalServiceSpy = {
      open: vi.fn()
    };

    await TestBed.configureTestingModule({
      providers: [{ provide: SiModalService, useValue: modalServiceSpy }]
    }).compileComponents();

    attachments = signal<Attachment[]>([]);
    alignment = signal<'start' | 'end'>('start');
    removable = signal(false);
    removeSpy = vi.fn();

    fixture = TestBed.createComponent(TestComponent, {
      bindings: [
        inputBinding('attachments', attachments),
        inputBinding('alignment', alignment),
        inputBinding('removable', removable),
        outputBinding<Attachment>('remove', removeSpy)
      ]
    });
    debugElement = fixture.debugElement;
  });

  it('should render empty list when no attachments provided', async () => {
    await fixture.whenStable();

    const attachmentElements = debugElement.queryAll(By.css('.attachment-item'));
    expect(attachmentElements.length).toBe(0);
  });

  it('should render attachment items', async () => {
    attachments.set([{ name: 'file1.txt' }, { name: 'file2.pdf' }]);
    await fixture.whenStable();

    const attachmentElements = debugElement.queryAll(By.css('.attachment-item'));
    expect(attachmentElements.length).toBe(2);
  });

  it('should display attachment names', async () => {
    attachments.set([{ name: 'document.pdf' }, { name: 'image.png' }]);
    await fixture.whenStable();

    const attachmentElements = debugElement.queryAll(By.css('.attachment-item'));
    expect(attachmentElements[0].nativeElement).toHaveTextContent('document.pdf');
    expect(attachmentElements[1].nativeElement).toHaveTextContent('image.png');
  });

  it('should align attachments to start by default', async () => {
    attachments.set([{ name: 'file.txt' }]);
    await fixture.whenStable();

    const container = debugElement.query(By.css('.d-flex'));
    expect(container.nativeElement).not.toHaveClass('justify-content-end');
  });

  it('should align attachments to end when specified', async () => {
    attachments.set([{ name: 'file.txt' }]);
    alignment.set('end');
    await fixture.whenStable();

    const container = debugElement.query(By.css('.d-flex'));
    expect(container.nativeElement).toHaveClass('justify-content-end');
  });

  it('should not show remove buttons by default', async () => {
    attachments.set([{ name: 'file.txt' }]);
    await fixture.whenStable();

    const removeButtons = debugElement.queryAll(By.css('.btn-icon'));
    expect(removeButtons.length).toBe(0);
  });

  it('should show remove buttons when removable is true', async () => {
    attachments.set([{ name: 'file1.txt' }, { name: 'file2.txt' }]);
    removable.set(true);
    await fixture.whenStable();

    const removeButtons = debugElement.queryAll(By.css('.btn-icon'));
    expect(removeButtons.length).toBe(2);
  });

  it('should emit remove event when remove button is clicked', async () => {
    attachments.set([{ name: 'file.txt' }]);
    removable.set(true);
    await fixture.whenStable();

    const removeButton = debugElement.query(By.css('.btn-icon'));
    removeButton.nativeElement.click();

    expect(removeSpy).toHaveBeenCalledWith({ name: 'file.txt' });
  });

  it('should handle attachments with preview templates', async () => {
    const mockTemplate = {} as TemplateRef<any>;
    attachments.set([{ name: 'file.txt', previewTemplate: mockTemplate }]);
    await fixture.whenStable();

    const attachmentButton = debugElement.query(By.css('.attachment-item'));
    expect(attachmentButton).toBeTruthy();
  });

  it('should handle attachments with preview template functions', async () => {
    const mockTemplate = {} as TemplateRef<any>;
    attachments.set([{ name: 'file.txt', previewTemplate: () => mockTemplate }]);
    await fixture.whenStable();

    const attachmentButton = debugElement.query(By.css('.attachment-item'));
    expect(attachmentButton).toBeTruthy();
  });
});
