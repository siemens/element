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

  afterEach(() => vi.useRealTimers());

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
    const tableContainer = tableExtension?.querySelector('.markdown-table-container');
    const tableWrapper = tableExtension?.querySelector('.markdown-table-wrapper');
    const table = tableExtension?.querySelector('table');
    const headers = tableExtension?.querySelectorAll('th');
    const cells = tableExtension?.querySelectorAll('td');
    const row = tableExtension?.querySelector('tbody tr');

    expect(tableExtension).not.toBeNull();
    expect(tableContainer).toHaveClass('mb-6');
    expect(tableWrapper).toHaveClass('markdown-table-wrapper');
    expect(table).toHaveClass('markdown-table', 'table', 'mb-0');
    expect(table).toHaveAttribute('data-line', '1');
    expect(headers).toHaveLength(3);
    expect(cells).toHaveLength(3);
    expect(headers?.[0]).toHaveStyle({ textAlign: 'left' });
    expect(headers?.[1]).toHaveStyle({ textAlign: 'center' });
    expect(headers?.[2]).toHaveStyle({ textAlign: 'right' });
    expect(row).toHaveAttribute('data-line', '3');
  });

  it('copies rendered table cells as CSV', async () => {
    vi.useFakeTimers();
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    fixture.componentRef.setInput(
      'markdown',
      `| Name | Status |
| --- | --- |
| "Ada, Inc." | Ready |`
    );
    fixture.detectChanges();
    await vi.runAllTimersAsync();
    await fixture.whenStable();

    const copyButton = element.querySelector<HTMLButtonElement>(
      'button[aria-label="Copy table as CSV"]'
    );
    copyButton?.click();
    await Promise.resolve();
    fixture.detectChanges();

    expect(writeText).toHaveBeenCalledWith('Name,Status\r\n"""Ada, Inc.""",Ready');
    expect(element.querySelector('.copied')).toHaveTextContent('Copied');
  });

  it('downloads rendered table cells as a CSV file', async () => {
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:table');
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL');
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);
    fixture.componentRef.setInput(
      'markdown',
      `| Name | Status |
| --- | --- |
| Ada | Ready |`
    );
    await fixture.whenStable();
    await new Promise(resolve => setTimeout(resolve));
    await fixture.whenStable();

    element.querySelector<HTMLButtonElement>('button[aria-label="Download table as CSV"]')?.click();

    const blob = createObjectURL.mock.calls[0][0] as Blob;
    const link = click.mock.instances[0] as HTMLAnchorElement;

    expect(blob).toHaveProperty('type', 'text/csv;charset=utf-8');
    expect(link.download).toBe('table.csv');
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:table');
  });
});
