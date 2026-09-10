/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, inputBinding } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiActivityMessageComponent } from './si-activity-message.component';
import { SiActivityTraceComponent as TestComponent } from './si-activity-trace.component';

@Component({
  imports: [TestComponent, SiActivityMessageComponent],
  template: `<si-activity-trace heading="Analysis trace">
    <si-activity-message heading="Input" />
    <si-activity-message heading="Output" />
  </si-activity-trace>`
})
class ProjectedContentHostComponent {}

describe('SiActivityTraceComponent', () => {
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent, {
      bindings: [inputBinding('heading', () => 'Analysis trace')]
    });
  });

  it('should render its heading', async () => {
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.trace-heading')).toHaveTextContent(
      'Analysis trace'
    );
    expect(fixture.nativeElement.querySelector('.disclosure-icon')).toHaveAttribute(
      'data-icon',
      'elementRight2'
    );
    expect(fixture.nativeElement.querySelector('.trace-icon')).toBeNull();
  });

  it('should expand and collapse projected activity messages', async () => {
    const hostFixture = TestBed.createComponent(ProjectedContentHostComponent);
    await hostFixture.whenStable();
    const toggle: HTMLButtonElement = hostFixture.nativeElement.querySelector('button');

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(hostFixture.nativeElement.querySelectorAll('si-activity-message')).toHaveLength(0);

    toggle.click();
    await hostFixture.whenStable();

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(toggle.querySelector('.disclosure-icon')).toHaveClass('expanded');
    expect(hostFixture.nativeElement.querySelectorAll('si-activity-message')).toHaveLength(2);
  });
});
