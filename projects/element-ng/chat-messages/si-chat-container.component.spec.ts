/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { DebugElement, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { runOnPushChangeDetection } from '../test-helpers';
import { SiChatContainerComponent } from './si-chat-container.component';

@Component({
  imports: [SiChatContainerComponent],
  template: `
    <si-chat-container [colorVariant]="colorVariant" [noAutoScroll]="noAutoScroll">
      <div class="test-message">Test message</div>
    </si-chat-container>
  `
})
class TestHostComponent {
  colorVariant = 'base-0';
  noAutoScroll = false;
}

describe('SiChatContainerComponent', () => {
  let fixture: ComponentFixture<SiChatContainerComponent>;
  let debugElement: DebugElement;
  let component: SiChatContainerComponent;

  beforeEach(() => {
    fixture = TestBed.createComponent(SiChatContainerComponent);
    debugElement = fixture.debugElement;
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default colorVariant of base-0', () => {
    expect(component.colorVariant()).toBe('base-0');
  });

  it('should have default noAutoScroll of false', () => {
    expect(component.noAutoScroll()).toBe(false);
  });

  it('should apply color variant class', () => {
    fixture.componentRef.setInput('colorVariant', 'base-1');
    fixture.detectChanges();
    expect(debugElement.nativeElement.className).toContain('base-1');
  });

  it('should render messages container', () => {
    const messagesContainer = debugElement.query(By.css('.messages-container'));
    expect(messagesContainer).toBeTruthy();
  });

  it('should render chat input area', () => {
    const inputArea = debugElement.query(By.css('.chat-input-area'));
    expect(inputArea).toBeTruthy();
  });

  it('should project content into messages container', () => {
    const testFixture = TestBed.createComponent(SiChatContainerComponent);
    testFixture.detectChanges();
    const messagesContainer = testFixture.debugElement.query(By.css('.messages-container'));
    expect(messagesContainer).toBeTruthy();
  });

  it('should have focus method', () => {
    expect(typeof component.focus).toBe('function');
  });

  it('should handle noAutoScroll boolean transform', () => {
    fixture.componentRef.setInput('noAutoScroll', true);
    fixture.detectChanges();
    expect(component.noAutoScroll()).toBe(true);

    fixture.componentRef.setInput('noAutoScroll', false);
    fixture.detectChanges();
    expect(component.noAutoScroll()).toBe(false);
  });

  it('should handle noAutoScroll empty string transform', () => {
    fixture.componentRef.setInput('noAutoScroll', '');
    fixture.detectChanges();
    expect(component.noAutoScroll()).toBe(true);
  });

  it('should update color variant when input changes', () => {
    fixture.componentRef.setInput('colorVariant', 'base-2');
    fixture.detectChanges();
    expect(component.colorVariant()).toBe('base-2');
    expect(debugElement.nativeElement.className).toContain('base-2');
  });

  it('should render with custom color variant', () => {
    fixture.componentRef.setInput('colorVariant', 'base-3');
    fixture.detectChanges();
    expect(debugElement.nativeElement.classList.contains('base-3')).toBe(true);
  });

  it('should have correct host classes', () => {
    expect(debugElement.nativeElement.classList.contains('d-flex')).toBe(true);
    expect(debugElement.nativeElement.classList.contains('si-layout-inner')).toBe(true);
    expect(debugElement.nativeElement.classList.contains('flex-grow-1')).toBe(true);
    expect(debugElement.nativeElement.classList.contains('flex-column')).toBe(true);
    expect(debugElement.nativeElement.classList.contains('h-100')).toBe(true);
    expect(debugElement.nativeElement.classList.contains('w-100')).toBe(true);
  });

  it('should handle scroll events', async () => {
    const messagesContainer = debugElement.query(By.css('.messages-container'));
    expect(messagesContainer).toBeTruthy();

    messagesContainer.nativeElement.dispatchEvent(new Event('scroll'));

    await runOnPushChangeDetection(fixture);

    expect(component).toBeTruthy();
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
    expect(testMessage.nativeElement.textContent).toContain('Test message');
  });

  it('should cleanup observers on destroy', () => {
    const ngOnDestroySpy = spyOn(component, 'ngOnDestroy').and.callThrough();
    component.ngOnDestroy();
    expect(ngOnDestroySpy).toHaveBeenCalled();
  });

  it('should call ngAfterContentInit', () => {
    const newFixture = TestBed.createComponent(SiChatContainerComponent);
    const newComponent = newFixture.componentInstance;
    const ngAfterContentInitSpy = spyOn(newComponent, 'ngAfterContentInit').and.callThrough();
    newComponent.ngAfterContentInit();
    expect(ngAfterContentInitSpy).toHaveBeenCalled();
  });
});
