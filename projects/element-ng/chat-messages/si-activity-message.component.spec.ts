/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, inputBinding, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiActivityMessageComponent as TestComponent } from './si-activity-message.component';

@Component({
  imports: [TestComponent],
  template: `<si-activity-message heading="Thinking">
    <span data-testid="content">Activity details</span>
  </si-activity-message>`
})
class ProjectedContentHostComponent {}

describe('SiActivityMessageComponent', () => {
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent, {
      bindings: [inputBinding('heading', () => 'Thinking')]
    });
  });

  it('should render the heading and default icon', async () => {
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.activity-heading')).toHaveTextContent('Thinking');
    expect(fixture.nativeElement.querySelector('.activity-icon')).toHaveAttribute(
      'data-icon',
      'elementCircleFilled'
    );
    expect(fixture.nativeElement.querySelector('.activity-icon')).toHaveClass('default-icon');
  });

  it('should render a custom icon', async () => {
    const icon = signal('element-lightbulb');
    fixture = TestBed.createComponent(TestComponent, {
      bindings: [inputBinding('heading', () => 'Thinking'), inputBinding('icon', icon)]
    });
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.activity-icon')).toHaveAttribute(
      'data-icon',
      'element-lightbulb'
    );
    expect(fixture.nativeElement.querySelector('.activity-icon')).not.toHaveClass('default-icon');
  });

  it('should render a spinner when running', async () => {
    fixture = TestBed.createComponent(TestComponent, {
      bindings: [inputBinding('heading', () => 'Thinking'), inputBinding('state', () => 'running')]
    });
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('si-loading-spinner.activity-icon')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('si-icon.activity-icon')).toBeNull();
  });

  it('should render a danger issue icon when failed', async () => {
    fixture = TestBed.createComponent(TestComponent, {
      bindings: [inputBinding('heading', () => 'Thinking'), inputBinding('state', () => 'failed')]
    });
    await fixture.whenStable();

    expect(fixture.nativeElement).toHaveClass('failed');
    expect(fixture.nativeElement.querySelector('.activity-icon')).toHaveAttribute(
      'data-icon',
      'elementIssue'
    );
  });

  it('should expand and collapse projected content', async () => {
    const hostFixture = TestBed.createComponent(ProjectedContentHostComponent);
    await hostFixture.whenStable();
    const toggle: HTMLButtonElement = hostFixture.nativeElement.querySelector('button');

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle.querySelector('.disclosure-icon')).toHaveAttribute('data-icon', 'elementRight2');
    expect(toggle.querySelector('.disclosure-icon')).not.toHaveClass('expanded');
    expect(hostFixture.nativeElement.querySelector('[data-testid="content"]')).toBeNull();

    toggle.click();
    await hostFixture.whenStable();

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(toggle.querySelector('.disclosure-icon')).toHaveAttribute('data-icon', 'elementRight2');
    expect(toggle.querySelector('.disclosure-icon')).toHaveClass('expanded');
    expect(hostFixture.nativeElement.querySelector('[data-testid="content"]')).toHaveTextContent(
      'Activity details'
    );
  });
});
