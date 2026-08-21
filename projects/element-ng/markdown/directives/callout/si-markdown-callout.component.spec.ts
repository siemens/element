/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiMarkdownComponent } from '../../si-markdown.component';

describe('SiMarkdownCalloutComponent', () => {
  let fixture: ComponentFixture<SiMarkdownComponent>;
  let element: HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(SiMarkdownComponent);
    element = fixture.nativeElement;
  });

  it('renders note, tip, and warning callouts', async () => {
    fixture.componentRef.setInput(
      'markdown',
      `:::callout{type=note}
Note content.
:::

:::callout{type=tip}
Tip content.
:::

:::callout{type=warning}
Warning content.
:::`
    );
    await fixture.whenStable();
    await new Promise(resolve => setTimeout(resolve));
    await fixture.whenStable();

    const callouts = element.querySelectorAll('si-markdown-callout');

    expect(callouts).toHaveLength(3);
    expect(callouts[0]).toHaveTextContent('Note content.');
    expect(callouts[0].querySelector('.card')).toHaveClass('accent-info');
    expect(callouts[0].querySelector('si-status-icon')).toBeInTheDocument();
    expect(callouts[1].querySelector('.card')).toHaveClass('accent-success');
    expect(callouts[2].querySelector('.card')).toHaveClass('accent-warning');
  });
});
