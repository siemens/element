/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, signal, twoWayBinding, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  ActivityMessageState,
  SiActivityMessageComponent as TestComponent
} from './si-activity-message.component';

describe('SiActivityMessageComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let element: HTMLElement;
  let label: WritableSignal<string>;
  let state: WritableSignal<ActivityMessageState>;
  let expanded: WritableSignal<boolean>;

  beforeEach(() => {
    label = signal('Searched the knowledge base');
    state = signal<ActivityMessageState>('completed');
    expanded = signal(false);

    fixture = TestBed.createComponent(TestComponent, {
      bindings: [
        inputBinding('label', label),
        inputBinding('state', state),
        twoWayBinding('expanded', expanded)
      ]
    });
    element = fixture.nativeElement;
  });

  it('renders the activity label and completed state', async () => {
    await fixture.whenStable();

    expect(element.querySelector('.activity-label')).toHaveTextContent(
      'Searched the knowledge base'
    );
    expect(element.querySelector('.visually-hidden')).toHaveTextContent('Completed');
    expect(element).toHaveClass('activity-completed');
    const marker = fixture.debugElement.query(debugElement =>
      debugElement.nativeElement.matches?.('si-icon.state-marker')
    );
    expect(marker.componentInstance.icon()).toBe('element-record-filled');
  });

  it('renders a loading spinner for a running activity', async () => {
    state.set('running');
    await fixture.whenStable();

    expect(element).toHaveClass('activity-running');
    expect(element.querySelector('.visually-hidden')).toHaveTextContent('Running');
    expect(element.querySelector('si-loading-spinner.state-marker')).toBeTruthy();
    expect(element.querySelector('si-icon.state-marker')).toBeFalsy();
  });

  it('renders the failure marker for a failed activity', async () => {
    state.set('failed');
    await fixture.whenStable();

    const marker = fixture.debugElement.query(debugElement =>
      debugElement.nativeElement.matches?.('si-icon.state-marker')
    );

    expect(element).toHaveClass('activity-failed');
    expect(element.querySelector('.visually-hidden')).toHaveTextContent('Failed');
    expect(marker.componentInstance.icon()).toBe('elementValidationIssue');
  });

  it('uses the configured icon for the completed marker', async () => {
    const customIcon = signal('elementSearch');
    const customFixture = TestBed.createComponent(TestComponent, {
      bindings: [inputBinding('label', label), inputBinding('icon', customIcon)]
    });
    await customFixture.whenStable();

    const marker = customFixture.debugElement.query(debugElement =>
      debugElement.nativeElement.matches?.('si-icon.state-marker')
    );

    expect(marker.componentInstance.icon()).toBe('elementSearch');
  });

  it('toggles the details and exposes their accessible relationship', async () => {
    await fixture.whenStable();

    const button = element.querySelector<HTMLButtonElement>('.activity-header')!;
    const region = element.querySelector<HTMLElement>('.activity-content')!;

    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveAttribute('aria-controls', region.id);
    expect(region).toHaveAttribute('aria-labelledby', button.id);
    expect(element.querySelector('.content-motion')).toBeFalsy();

    button.click();
    await fixture.whenStable();

    expect(expanded()).toBe(true);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(element.querySelector('.content-motion')).toBeTruthy();
  });
});
