/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, inputBinding } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiActivityMessagePartComponent as TestComponent } from './si-activity-message-part.component';

@Component({
  imports: [TestComponent],
  template: `<si-activity-message-part heading="Sources" [collapsible]="collapsible">
    <span data-testid="content">Part content</span>
  </si-activity-message-part>`
})
class TestHostComponent {
  collapsible = false;
}

describe('SiActivityMessagePartComponent', () => {
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent, {
      bindings: [inputBinding('heading', () => 'Sources')]
    });
  });

  it('should render its heading and content without a toggle by default', async () => {
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.section-heading')).toHaveTextContent('Sources');
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
    expect(fixture.nativeElement.querySelector('.default-icon')).toHaveAttribute(
      'data-icon',
      'elementCircleFilled'
    );
    expect(fixture.nativeElement.querySelector('.section-content')).toBeTruthy();
  });

  it('should collapse and expand when collapsible', async () => {
    const hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.componentInstance.collapsible = true;
    await hostFixture.whenStable();
    const toggle: HTMLButtonElement = hostFixture.nativeElement.querySelector('button');

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(toggle.firstElementChild).toMatchObject({ tagName: 'SI-ICON' });
    expect(toggle.firstElementChild).toHaveAttribute('data-icon', 'elementRight2');
    expect(toggle.firstElementChild).toHaveClass('expanded');
    toggle.click();
    await hostFixture.whenStable();

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle.firstElementChild).toHaveAttribute('data-icon', 'elementRight2');
    expect(toggle.firstElementChild).not.toHaveClass('expanded');
    expect(hostFixture.nativeElement.querySelector('[data-testid="content"]')).toBeNull();
  });
});
