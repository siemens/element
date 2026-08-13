/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiMarkdownComponent } from '../../si-markdown.component';

describe('SiMarkdownTableComponent', () => {
  let fixture: ComponentFixture<SiMarkdownComponent>;
  let element: HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(SiMarkdownComponent);
    element = fixture.nativeElement;
  });

  it('renders a table with cell alignment and source-line attributes', async () => {
    fixture.componentRef.setInput(
      'markdown',
      `| Left | Center | Right |
| :--- | :----: | ---: |
| One | Two | Three |`
    );
    await fixture.whenStable();
    await new Promise(resolve => setTimeout(resolve));
    await fixture.whenStable();

    const tableExtension = element.querySelector('si-markdown-table');
    const tableWrapper = tableExtension?.querySelector('div');
    const table = tableExtension?.querySelector('table');
    const headers = tableExtension?.querySelectorAll('th');
    const cells = tableExtension?.querySelectorAll('td');
    const row = tableExtension?.querySelector('tbody tr');

    expect(tableExtension).not.toBeNull();
    expect(tableWrapper).toHaveClass('markdown-table-wrapper', 'mb-6');
    expect(table).toHaveClass('markdown-table', 'table', 'mb-0');
    expect(table).toHaveAttribute('data-line', '1');
    expect(headers).toHaveLength(3);
    expect(cells).toHaveLength(3);
    expect(headers?.[0]).toHaveStyle({ textAlign: 'left' });
    expect(headers?.[1]).toHaveStyle({ textAlign: 'center' });
    expect(headers?.[2]).toHaveStyle({ textAlign: 'right' });
    expect(row).toHaveAttribute('data-line', '3');
  });
});
