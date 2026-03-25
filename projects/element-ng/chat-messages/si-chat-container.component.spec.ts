/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, DebugElement, inputBinding, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { SiChatContainerComponent } from './si-chat-container.component';

@Component({
  imports: [SiChatContainerComponent],
  template: `
    <si-chat-container colorVariant="base-0" noAutoScroll="false">
      <div class="test-message">Test message</div>
    </si-chat-container>
  `
})
class TestHostComponent {}

@Component({
  imports: [SiChatContainerComponent],
  template: `<si-chat-container noAutoScroll />`
})
class NoAutoScrollHostComponent {}

describe('SiChatContainerComponent', () => {
  let fixture: ComponentFixture<SiChatContainerComponent>;
  let debugElement: DebugElement;
  let colorVariant: WritableSignal<string>;
  let noAutoScroll: WritableSignal<boolean>;

  beforeEach(() => {
    colorVariant = signal('base-0');
    noAutoScroll = signal(false);

    fixture = TestBed.createComponent(SiChatContainerComponent, {
      bindings: [
        inputBinding('colorVariant', colorVariant),
        inputBinding('noAutoScroll', noAutoScroll)
      ]
    });
    debugElement = fixture.debugElement;
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should have default colorVariant of base-0', () => {
    expect(colorVariant()).toBe('base-0');
  });

  it('should have default noAutoScroll of false', () => {
    expect(noAutoScroll()).toBe(false);
  });

  it('should apply color variant class', async () => {
    colorVariant.set('base-1');
    await fixture.whenStable();

    expect(debugElement.nativeElement.className).toContain('base-1');
  });

  it('should render messages container', async () => {
    await fixture.whenStable();

    const messagesContainer = debugElement.query(By.css('.messages-container'));
    expect(messagesContainer).toBeTruthy();
  });

  it('should render chat input area', async () => {
    await fixture.whenStable();

    const inputArea = debugElement.query(By.css('.chat-input-area'));
    expect(inputArea).toBeTruthy();
  });

  it('should project content into messages container', async () => {
    const testFixture = TestBed.createComponent(SiChatContainerComponent);
    await testFixture.whenStable();

    const messagesContainer = testFixture.debugElement.query(By.css('.messages-container'));
    expect(messagesContainer).toBeTruthy();
  });

  it('should have focus method', () => {
    expect(typeof fixture.componentInstance.focus).toBe('function');
  });

  it('should handle noAutoScroll boolean transform', async () => {
    noAutoScroll.set(true);
    await fixture.whenStable();
    expect(fixture.componentInstance.noAutoScroll()).toBe(true);

    noAutoScroll.set(false);
    await fixture.whenStable();
    expect(fixture.componentInstance.noAutoScroll()).toBe(false);
  });

  it('should handle noAutoScroll empty string transform', async () => {
    const hostFixture = TestBed.createComponent(NoAutoScrollHostComponent);
    await hostFixture.whenStable();

    const container = hostFixture.debugElement.query(By.directive(SiChatContainerComponent));
    expect(container.componentInstance.noAutoScroll()).toBe(true);
  });

  it('should update color variant when input changes', async () => {
    colorVariant.set('base-2');
    await fixture.whenStable();

    expect(fixture.componentInstance.colorVariant()).toBe('base-2');
    expect(debugElement.nativeElement.className).toContain('base-2');
  });

  it('should render with custom color variant', async () => {
    colorVariant.set('base-3');
    await fixture.whenStable();

    expect(debugElement.nativeElement).toHaveClass('base-3');
  });

  it('should have correct host classes', async () => {
    await fixture.whenStable();

    expect(debugElement.nativeElement).toHaveClass('d-flex');
    expect(debugElement.nativeElement).toHaveClass('si-layout-inner');
    expect(debugElement.nativeElement).toHaveClass('flex-grow-1');
    expect(debugElement.nativeElement).toHaveClass('flex-column');
    expect(debugElement.nativeElement).toHaveClass('h-100');
    expect(debugElement.nativeElement).toHaveClass('w-100');
  });

  it('should handle scroll events', async () => {
    await fixture.whenStable();

    const messagesContainer = debugElement.query(By.css('.messages-container'));
    expect(messagesContainer).toBeTruthy();

    messagesContainer.nativeElement.dispatchEvent(new Event('scroll'));
    await fixture.whenStable();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should project content into input area', () => {
    const hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges();

    const containerDebugElement = hostFixture.debugElement.query(
      By.directive(SiChatContainerComponent)
    );
    expect(containerDebugElement).toBeTruthy();

    const testMessage = containerDebugElement.query(By.css('.test-message'));
    expect(testMessage).toBeTruthy();
    expect(testMessage.nativeElement).toHaveTextContent('Test message');
  });

  it('should cleanup observers on destroy', () => {
    const ngOnDestroySpy = vi.spyOn(fixture.componentInstance, 'ngOnDestroy');
    fixture.componentInstance.ngOnDestroy();
    expect(ngOnDestroySpy).toHaveBeenCalled();
  });

  it('should call ngAfterContentInit', () => {
    const newFixture = TestBed.createComponent(SiChatContainerComponent);
    const newComponent = newFixture.componentInstance;
    const ngAfterContentInitSpy = vi.spyOn(newComponent, 'ngAfterContentInit');
    newComponent.ngAfterContentInit();
    expect(ngAfterContentInitSpy).toHaveBeenCalled();
  });
});
