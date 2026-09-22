/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Link } from '@siemens/element-ng/link';
import { page, userEvent } from 'vitest/browser';

import { SiLinkWidgetComponent } from './si-link-widget.component';

describe('SiLinkWidgetComponent', () => {
  let fixture: ComponentFixture<SiLinkWidgetComponent>;
  let element: HTMLElement;
  let value: WritableSignal<Link[] | undefined>;
  let numberOfLinks: WritableSignal<number>;
  let showLinkIcons: WritableSignal<boolean>;

  beforeEach(() => {
    value = signal(undefined);
    numberOfLinks = signal(3);
    showLinkIcons = signal(false);

    TestBed.configureTestingModule({
      providers: [provideRouter([])]
    });

    fixture = TestBed.createComponent(SiLinkWidgetComponent, {
      bindings: [
        inputBinding('value', value),
        inputBinding('numberOfLinks', numberOfLinks),
        inputBinding('showLinkIcons', showLinkIcons)
      ]
    });
    element = fixture.nativeElement;
  });

  it('should show three skeletons by default without a value', async () => {
    await fixture.whenStable();

    expect(element.querySelectorAll('.si-link-widget-skeleton')).toHaveLength(3);
  });

  it('should support configuring the number of skeletons', async () => {
    numberOfLinks.set(5);
    await fixture.whenStable();

    expect(element.querySelectorAll('.si-link-widget-skeleton')).toHaveLength(5);
  });

  it('should render links and actions', async () => {
    const action = vi.fn();
    value.set([
      { title: 'Documentation', href: '/docs' },
      { title: 'Refresh', action }
    ]);
    await fixture.whenStable();

    const link = page.getByRole('link', { name: 'Documentation' });
    const button = page.getByRole('button', { name: 'Refresh' });
    expect(element.querySelectorAll('.si-link-widget-skeleton')).toHaveLength(0);
    await expect.element(link).toHaveAttribute('href', '/docs');
    await expect.element(button).toHaveAttribute('type', 'button');

    await userEvent.click(button);

    expect(action).toHaveBeenCalledOnce();
  });

  it('should show link icons when enabled', async () => {
    value.set([{ title: 'Documentation', href: '/docs' }]);
    await fixture.whenStable();
    expect(element.querySelector('si-icon')).toBeNull();

    showLinkIcons.set(true);
    await fixture.whenStable();

    expect(element.querySelector('a si-icon.link-icon')).not.toBeNull();
  });
});
