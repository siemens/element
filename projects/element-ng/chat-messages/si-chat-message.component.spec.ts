/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { SiChatMessageComponent as TestComponent } from './si-chat-message.component';

describe('SiChatMessageComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let debugElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    debugElement = fixture.debugElement;
  });

  it('should apply end alignment class', () => {
    fixture.componentRef.setInput('alignment', 'end');
    fixture.detectChanges();

    const container = debugElement.query(By.css('.chat-message-container'));
    expect(container.nativeElement.classList.contains('start')).toBe(false);
  });

  it('should apply side actions position class', () => {
    fixture.componentRef.setInput('actionsPosition', 'side');
    fixture.detectChanges();

    const wrapper = debugElement.query(By.css('.message-wrapper'));
    expect(wrapper).toBeTruthy();
  });

  it('should apply bottom actions position class', () => {
    fixture.componentRef.setInput('actionsPosition', 'bottom');
    fixture.detectChanges();

    const wrapper = debugElement.query(By.css('.message-wrapper'));
    expect(wrapper.nativeElement.classList.contains('flex-column')).toBe(true);
  });

  it('should show loading skeleton when loading is true', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const skeleton = debugElement.query(By.css('.si-skeleton'));
    expect(skeleton).toBeTruthy();
  });

  it('should not show loading skeleton when loading is false', () => {
    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();

    const skeleton = debugElement.query(By.css('.si-skeleton'));
    expect(skeleton).toBeFalsy();
  });

  it('should project content when not loading', () => {
    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();

    const messageBubble = debugElement.query(By.css('.message-bubble'));
    expect(messageBubble).toBeTruthy();
  });

  it('should update alignment dynamically', () => {
    fixture.componentRef.setInput('alignment', 'start');
    fixture.detectChanges();
    let container = debugElement.query(By.css('.chat-message-container'));
    expect(container.nativeElement.classList.contains('start')).toBe(true);

    fixture.componentRef.setInput('alignment', 'end');
    fixture.detectChanges();
    container = debugElement.query(By.css('.chat-message-container'));
    expect(container.nativeElement.classList.contains('start')).toBe(false);
  });

  it('should update actionsPosition dynamically', () => {
    fixture.componentRef.setInput('actionsPosition', 'side');
    fixture.detectChanges();
    let wrapper = debugElement.query(By.css('.message-wrapper'));
    expect(wrapper.nativeElement.classList.contains('flex-column')).toBe(false);

    fixture.componentRef.setInput('actionsPosition', 'bottom');
    fixture.detectChanges();
    wrapper = debugElement.query(By.css('.message-wrapper'));
    expect(wrapper.nativeElement.classList.contains('flex-column')).toBe(true);
  });

  it('should update loading state dynamically', () => {
    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();
    let skeleton = debugElement.query(By.css('.si-skeleton'));
    expect(skeleton).toBeFalsy();

    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    skeleton = debugElement.query(By.css('.si-skeleton'));
    expect(skeleton).toBeTruthy();
  });
});
