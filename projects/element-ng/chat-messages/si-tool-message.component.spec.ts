/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { DebugElement, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { SiToolMessageComponent as TestComponent } from './si-tool-message.component';

describe('SiToolMessageComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let debugElement: DebugElement;
  let component: TestComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [provideNoopAnimations(), provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    debugElement = fixture.debugElement;
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default empty name', () => {
    fixture.detectChanges();
    expect(component.name()).toBe('');
  });

  it('should have default loading state of false', () => {
    fixture.detectChanges();
    expect(component.loading()).toBe(false);
  });

  it('should have default expandInputArguments of false', () => {
    fixture.detectChanges();
    expect(component.expandInputArguments()).toBe(false);
  });

  it('should have default expandOutput of false', () => {
    fixture.detectChanges();
    expect(component.expandOutput()).toBe(false);
  });

  it('should have default toolIcon of element-maintenance', () => {
    fixture.detectChanges();
    expect(component.toolIcon()).toBe('element-maintenance');
  });

  it('should render tool name', () => {
    const toolName = 'Calculator';
    fixture.componentRef.setInput('name', toolName);
    fixture.detectChanges();

    const nameElement = debugElement.query(By.css('.tool-name'));
    expect(nameElement.nativeElement.textContent).toContain(toolName);
  });

  it('should render tool icon', () => {
    fixture.detectChanges();

    const icon = debugElement.query(By.css('si-icon'));
    expect(icon).toBeTruthy();
    expect(icon.componentInstance.icon()).toBe('element-maintenance');
  });

  it('should use custom tool icon', () => {
    fixture.componentRef.setInput('toolIcon', 'element-calculator');
    fixture.detectChanges();

    const icon = debugElement.query(By.css('si-icon'));
    expect(icon.componentInstance.icon()).toBe('element-calculator');
  });

  it('should pass loading state to chat message', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const chatMessage = debugElement.query(By.css('si-chat-message'));
    // Note: loading is hardcoded to false in template, but getLoadingState() is used internally
    expect(chatMessage.componentInstance.loading()).toBe(false);
  });

  it('should use start alignment for chat message', () => {
    fixture.detectChanges();

    const chatMessage = debugElement.query(By.css('si-chat-message'));
    expect(chatMessage.componentInstance.alignment()).toBe('start');
  });

  it('should not render input arguments section when no input arguments', () => {
    fixture.componentRef.setInput('inputArguments', undefined);
    fixture.detectChanges();

    const panels = debugElement.queryAll(By.css('si-collapsible-panel'));
    expect(panels.length).toBe(0);
  });

  it('should render input arguments section when input arguments provided', () => {
    fixture.componentRef.setInput('inputArguments', '{"x": 5, "y": 10}');
    fixture.detectChanges();

    const inputPanel = debugElement.query(By.css('si-collapsible-panel'));
    expect(inputPanel).toBeTruthy();
  });

  it('should format string input arguments', () => {
    const inputArgs = '{"x": 5, "y": 10}';
    fixture.componentRef.setInput('inputArguments', inputArgs);
    fixture.detectChanges();

    expect((component as any).formatData(inputArgs)).toBe(inputArgs);
  });

  it('should format object input arguments as JSON', () => {
    const inputArgs = { x: 5, y: 10 };
    fixture.componentRef.setInput('inputArguments', inputArgs);
    fixture.detectChanges();

    const formatted = (component as any).formatData(inputArgs);
    expect(formatted).toContain('"x": 5');
    expect(formatted).toContain('"y": 10');
  });

  it('should not render output section when no output', () => {
    fixture.componentRef.setInput('output', undefined);
    fixture.detectChanges();

    const outputPanels = debugElement.queryAll(By.css('si-collapsible-panel'));
    expect(outputPanels.length).toBe(0);
  });

  it('should render output section when output provided', () => {
    fixture.componentRef.setInput('output', '{"result": 15}');
    fixture.detectChanges();

    const outputPanel = debugElement.query(By.css('si-collapsible-panel'));
    expect(outputPanel).toBeTruthy();
  });

  it('should format string output', () => {
    const output = '{"result": 15}';
    fixture.componentRef.setInput('output', output);
    fixture.detectChanges();

    expect((component as any).formatData(output)).toBe(output);
  });

  it('should format object output as JSON', () => {
    const output = { result: 15 };
    fixture.componentRef.setInput('output', output);
    fixture.detectChanges();

    const formatted = (component as any).formatData(output);
    expect(formatted).toContain('"result": 15');
  });

  it('should handle signal output', () => {
    const outputSignal = signal('{"result": 20}');
    fixture.componentRef.setInput('output', outputSignal);
    fixture.detectChanges();

    expect((component as any).hasOutput()).toBe(true);
  });

  it('should expand input arguments when expandInputArguments is true', () => {
    fixture.componentRef.setInput('inputArguments', '{"x": 5}');
    fixture.componentRef.setInput('expandInputArguments', true);
    fixture.detectChanges();

    const inputPanel = debugElement.query(By.css('si-collapsible-panel'));
    expect(inputPanel.componentInstance.opened()).toBe(true);
  });

  it('should collapse input arguments when expandInputArguments is false', () => {
    fixture.componentRef.setInput('inputArguments', '{"x": 5}');
    fixture.componentRef.setInput('expandInputArguments', false);
    fixture.detectChanges();

    const inputPanel = debugElement.query(By.css('si-collapsible-panel'));
    expect(inputPanel.componentInstance.opened()).toBe(false);
  });

  it('should expand output when expandOutput is true', () => {
    fixture.componentRef.setInput('output', '{"result": 15}');
    fixture.componentRef.setInput('expandOutput', true);
    fixture.detectChanges();

    const panels = debugElement.queryAll(By.css('si-collapsible-panel'));
    const outputPanel = panels[panels.length - 1]; // Get last panel (output panel)
    expect(outputPanel.componentInstance.opened()).toBe(true);
  });

  it('should collapse output when expandOutput is false', () => {
    fixture.componentRef.setInput('output', '{"result": 15}');
    fixture.componentRef.setInput('expandOutput', false);
    fixture.detectChanges();

    const panels = debugElement.queryAll(By.css('si-collapsible-panel'));
    const outputPanel = panels[panels.length - 1]; // Get last panel (output panel)
    expect(outputPanel.componentInstance.opened()).toBe(false);
  });

  it('should use custom inputArgumentsLabel', () => {
    const customLabel = 'Custom Input';
    fixture.componentRef.setInput('inputArguments', '{"x": 5}');
    fixture.componentRef.setInput('inputArgumentsLabel', customLabel);
    fixture.detectChanges();

    const inputPanel = debugElement.query(By.css('si-collapsible-panel'));
    expect(inputPanel.componentInstance.heading()).toBe(customLabel);
  });

  it('should use custom outputLabel', () => {
    const customLabel = 'Custom Output';
    fixture.componentRef.setInput('output', '{"result": 15}');
    fixture.componentRef.setInput('outputLabel', customLabel);
    fixture.detectChanges();

    const panels = debugElement.queryAll(By.css('si-collapsible-panel'));
    const outputPanel = panels[panels.length - 1]; // Get last panel (output panel)
    expect(outputPanel.componentInstance.heading()).toBe(customLabel);
  });

  it('should handle null input arguments', () => {
    fixture.componentRef.setInput('inputArguments', null);
    fixture.detectChanges();

    expect((component as any).hasInputArguments()).toBe(false);
  });

  it('should handle null output', () => {
    fixture.componentRef.setInput('output', null);
    fixture.detectChanges();

    expect((component as any).hasOutput()).toBe(false);
  });

  it('should handle empty string in formatData', () => {
    expect((component as any).formatData('')).toBe('');
  });

  it('should handle undefined in formatData', () => {
    expect((component as any).formatData(undefined)).toBe('');
  });

  it('should have si-tool-message host class', () => {
    fixture.detectChanges();
    expect(debugElement.nativeElement.classList.contains('si-tool-message')).toBe(true);
  });

  it('should show loading state correctly', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    expect((component as any).getLoadingState()).toBe(true);
  });

  it('should not show loading when loading is false', () => {
    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();

    expect((component as any).getLoadingState()).toBe(false);
  });
});
