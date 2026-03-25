/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { DebugElement, inputBinding, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { SiChatMessageComponent as TestComponent } from './si-chat-message.component';

describe('SiChatMessageComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let debugElement: DebugElement;
  let alignment: WritableSignal<'start' | 'end'>;
  let actionsPosition: WritableSignal<'side' | 'bottom'>;
  let loading: WritableSignal<boolean>;

  beforeEach(() => {
    alignment = signal<'start' | 'end'>('start');
    actionsPosition = signal<'side' | 'bottom'>('side');
    loading = signal(false);

    fixture = TestBed.createComponent(TestComponent, {
      bindings: [
        inputBinding('alignment', alignment),
        inputBinding('actionsPosition', actionsPosition),
        inputBinding('loading', loading)
      ]
    });
    debugElement = fixture.debugElement;
  });

  it('should apply end alignment class', async () => {
    alignment.set('end');
    await fixture.whenStable();

    const container = debugElement.query(By.css('.chat-message-container'));
    expect(container.nativeElement).not.toHaveClass('start');
  });

  it('should apply side actions position class', async () => {
    actionsPosition.set('side');
    await fixture.whenStable();

    const wrapper = debugElement.query(By.css('.message-wrapper'));
    expect(wrapper).toBeTruthy();
  });

  it('should apply bottom actions position class', async () => {
    actionsPosition.set('bottom');
    await fixture.whenStable();

    const wrapper = debugElement.query(By.css('.message-wrapper'));
    expect(wrapper.nativeElement).toHaveClass('flex-column');
  });

  it('should show loading skeleton when loading is true', async () => {
    loading.set(true);
    await fixture.whenStable();

    const skeleton = debugElement.query(By.css('.si-skeleton'));
    expect(skeleton).toBeTruthy();
  });

  it('should not show loading skeleton when loading is false', async () => {
    loading.set(false);
    await fixture.whenStable();

    const skeleton = debugElement.query(By.css('.si-skeleton'));
    expect(skeleton).toBeFalsy();
  });

  it('should project content when not loading', async () => {
    loading.set(false);
    await fixture.whenStable();

    const messageBubble = debugElement.query(By.css('.message-bubble'));
    expect(messageBubble).toBeTruthy();
  });

  it('should update alignment dynamically', async () => {
    alignment.set('start');
    await fixture.whenStable();
    let container = debugElement.query(By.css('.chat-message-container'));
    expect(container.nativeElement).toHaveClass('start');

    alignment.set('end');
    await fixture.whenStable();
    container = debugElement.query(By.css('.chat-message-container'));
    expect(container.nativeElement).not.toHaveClass('start');
  });

  it('should update actionsPosition dynamically', async () => {
    actionsPosition.set('side');
    await fixture.whenStable();
    let wrapper = debugElement.query(By.css('.message-wrapper'));
    expect(wrapper.nativeElement).not.toHaveClass('flex-column');

    actionsPosition.set('bottom');
    await fixture.whenStable();
    wrapper = debugElement.query(By.css('.message-wrapper'));
    expect(wrapper.nativeElement).toHaveClass('flex-column');
  });

  it('should update loading state dynamically', async () => {
    loading.set(false);
    await fixture.whenStable();
    let skeleton = debugElement.query(By.css('.si-skeleton'));
    expect(skeleton).toBeFalsy();

    loading.set(true);
    await fixture.whenStable();
    skeleton = debugElement.query(By.css('.si-skeleton'));
    expect(skeleton).toBeTruthy();
  });
});
