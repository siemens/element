/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { page, userEvent } from 'vitest/browser';

import { SiSkipLinkTargetDirective } from './si-skip-link-target.directive';

@Component({
  imports: [SiSkipLinkTargetDirective],
  template: `
    <button siSkipLinkTarget="T1" type="button">Target 1</button>
    <button siSkipLinkTarget="T2" type="button">Target 2</button>
    <section siSkipLinkTarget="T3" tabindex="-1" aria-label="Target 3">
      <button type="button">Nested control</button>
    </section>
    <nav siSkipLinkTarget="T4">
      <button type="button" hidden>Hidden</button>
      <div style="display: none"><button type="button">Hidden by parent</button></div>
      <button type="button" style="visibility: hidden">Invisible</button>
      <button type="button" disabled>Disabled</button>
      <button type="button" tabindex="-1">Not tabbable</button>
      <a>Link without href</a>
      <input type="hidden" />
      <div><button type="button" aria-expanded="false">Expand</button></div>
      <a href="#home">Home</a>
    </nav>
    <section siSkipLinkTarget="T5">
      <button type="button" disabled>No usable control</button>
    </section>
  `
})
class TestHostComponent {}

describe('SkipLinksComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestHostComponent);
    await fixture.whenStable();
  });

  it('should jump to target', async () => {
    page.getByRole('link', { name: 'Jump to T2', exact: true }).element().focus();
    await userEvent.keyboard('{Enter}');
    await fixture.whenStable();

    expect(page.getByRole('button', { name: 'Target 2', exact: true }).element()).toHaveFocus();
  });

  it('should focus a focusable target even when it has tabbable descendants', async () => {
    const target = page.getByRole('region', { name: 'Target 3' });
    const scroll = vi.spyOn(target.element(), 'scrollIntoView');

    page.getByRole('link', { name: 'Jump to T3', exact: true }).element().focus();
    await userEvent.keyboard('{Enter}');
    await fixture.whenStable();

    expect(target.element()).toHaveFocus();
    expect(scroll).toHaveBeenCalledWith({ block: 'nearest', inline: 'nearest' });
  });

  it('should skip unusable controls and focus the first tabbable descendant in DOM order', async () => {
    const target = page.getByRole('navigation');
    const scroll = vi.spyOn(target.element(), 'scrollIntoView');

    page.getByRole('link', { name: 'Jump to T4', exact: true }).element().focus();
    await userEvent.keyboard('{Enter}');
    await fixture.whenStable();

    const toggle = target.getByRole('button', { name: 'Expand', exact: true });
    expect(toggle.element()).toHaveFocus();
    expect(toggle.element()).toHaveAttribute('aria-expanded', 'false');
    expect(scroll).toHaveBeenCalledWith({ block: 'nearest', inline: 'nearest' });
  });

  it('should leave focus on the skip link when neither the target nor a descendant is usable', async () => {
    const skipLink = page.getByRole('link', { name: 'Jump to T5', exact: true });

    skipLink.element().focus();
    await userEvent.keyboard('{Enter}');
    await fixture.whenStable();

    expect(skipLink.element()).toHaveFocus();
  });

  it('should not redirect focus when the target is focused directly', () => {
    const target = page.getByRole('region', { name: 'Target 3' });

    target.element().focus();

    expect(target.element()).toHaveFocus();
  });
});
