/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ActionBarItem } from './si-action-bar.component';
import { AttachmentItem } from './si-attachment-list.component';
import { SiUserMessageComponent as TestComponent } from './si-user-message.component';

describe('SiUserMessageComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let debugElement: DebugElement;
  let component: TestComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    debugElement = fixture.debugElement;
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default empty content', () => {
    fixture.detectChanges();
    expect(component.content()).toBe('');
  });

  it('should have default empty actions array', () => {
    fixture.detectChanges();
    expect(component.actions()).toEqual([]);
  });

  it('should have default empty secondary actions array', () => {
    fixture.detectChanges();
    expect(component.secondaryActions()).toEqual([]);
  });

  it('should have default empty attachments array', () => {
    fixture.detectChanges();
    expect(component.attachments()).toEqual([]);
  });

  it('should render markdown content', () => {
    const content = 'This is my **message**';
    fixture.componentRef.setInput('content', content);
    fixture.detectChanges();

    const markdownContent = debugElement.query(By.css('si-markdown-content'));
    expect(markdownContent).toBeTruthy();
    expect(markdownContent.componentInstance.content()).toBe(content);
  });

  it('should use end alignment for chat message', () => {
    fixture.detectChanges();

    const chatMessage = debugElement.query(By.css('si-chat-message'));
    expect(chatMessage.componentInstance.alignment()).toBe('end');
  });

  it('should render action bar when actions are provided', () => {
    const actions: ActionBarItem[] = [
      {
        id: 'edit',
        label: 'Edit',
        icon: 'element-edit',
        action: () => {}
      }
    ];

    fixture.componentRef.setInput('actions', actions);
    fixture.detectChanges();

    const actionBar = debugElement.query(By.css('si-action-bar'));
    expect(actionBar).toBeTruthy();
  });

  it('should not render action bar when no actions and no secondary actions', () => {
    fixture.componentRef.setInput('actions', []);
    fixture.componentRef.setInput('secondaryActions', []);
    fixture.detectChanges();

    const actionBar = debugElement.query(By.css('si-action-bar'));
    expect(actionBar).toBeFalsy();
  });

  it('should render action bar with secondary actions', () => {
    const secondaryActions = [
      {
        type: 'action' as const,
        id: 'delete',
        label: 'Delete',
        action: () => {}
      }
    ];

    fixture.componentRef.setInput('secondaryActions', secondaryActions);
    fixture.detectChanges();

    const actionBar = debugElement.query(By.css('si-action-bar'));
    expect(actionBar).toBeTruthy();
  });

  it('should pass actions to action bar', () => {
    const actions: ActionBarItem[] = [
      {
        id: 'edit',
        label: 'Edit',
        icon: 'element-edit',
        action: () => {}
      }
    ];

    fixture.componentRef.setInput('actions', actions);
    fixture.detectChanges();

    const actionBar = debugElement.query(By.css('si-action-bar'));
    expect(actionBar.componentInstance.actions()).toEqual(actions);
  });

  it('should pass secondary actions to action bar as dropdownActions', () => {
    const secondaryActions = [
      {
        type: 'action' as const,
        id: 'delete',
        label: 'Delete',
        action: () => {}
      }
    ];

    fixture.componentRef.setInput('secondaryActions', secondaryActions);
    fixture.detectChanges();

    const actionBar = debugElement.query(By.css('si-action-bar'));
    expect(actionBar.componentInstance.dropdownActions()).toEqual(secondaryActions);
  });

  it('should pass actionParam to action bar', () => {
    const actions: ActionBarItem[] = [
      {
        id: 'edit',
        label: 'Edit',
        icon: 'element-edit',
        action: () => {}
      }
    ];

    fixture.componentRef.setInput('actions', actions);
    fixture.componentRef.setInput('actionParam', 'test-param');
    fixture.detectChanges();

    const actionBar = debugElement.query(By.css('si-action-bar'));
    expect(actionBar.componentInstance.actionParam()).toBe('test-param');
  });

  it('should use custom secondaryActionsLabel', () => {
    const customLabel = 'Custom More Actions';
    const actions: ActionBarItem[] = [
      {
        id: 'edit',
        label: 'Edit',
        icon: 'element-edit',
        action: () => {}
      }
    ];

    fixture.componentRef.setInput('actions', actions);
    fixture.componentRef.setInput('secondaryActions', [
      {
        type: 'action' as const,
        id: 'delete',
        label: 'Delete',
        action: () => {}
      }
    ]);
    fixture.componentRef.setInput('secondaryActionsLabel', customLabel);
    fixture.detectChanges();

    const actionBar = debugElement.query(By.css('si-action-bar'));
    expect(actionBar.componentInstance.secondaryActionsLabel()).toBe(customLabel);
  });

  it('should not render attachment list when no attachments', () => {
    fixture.componentRef.setInput('attachments', []);
    fixture.detectChanges();

    const attachmentList = debugElement.query(By.css('si-attachment-list'));
    expect(attachmentList).toBeFalsy();
  });

  it('should render attachment list when attachments are provided', () => {
    const attachments: AttachmentItem[] = [
      { id: '1', name: 'file1.txt' },
      { id: '2', name: 'file2.pdf' }
    ];

    fixture.componentRef.setInput('attachments', attachments);
    fixture.detectChanges();

    const attachmentList = debugElement.query(By.css('si-attachment-list'));
    expect(attachmentList).toBeTruthy();
  });

  it('should pass attachments to attachment list', () => {
    const attachments: AttachmentItem[] = [
      { id: '1', name: 'document.pdf' },
      { id: '2', name: 'image.png' }
    ];

    fixture.componentRef.setInput('attachments', attachments);
    fixture.detectChanges();

    const attachmentList = debugElement.query(By.css('si-attachment-list'));
    expect(attachmentList.componentInstance.attachments()).toEqual(attachments);
  });

  it('should align attachment list to end', () => {
    const attachments: AttachmentItem[] = [{ id: '1', name: 'file.txt' }];

    fixture.componentRef.setInput('attachments', attachments);
    fixture.detectChanges();

    const attachmentList = debugElement.query(By.css('si-attachment-list'));
    expect(attachmentList.componentInstance.alignment()).toBe('end');
  });
});
