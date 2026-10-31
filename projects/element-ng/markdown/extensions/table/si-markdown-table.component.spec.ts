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
    await vi.waitFor(() =>
      expect(element.querySelector('table')).toHaveClass('markdown-table', 'table', 'mb-0')
    );

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
    using writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
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

  it.each([
    ['=1+1', "'=1+1"],
    ['+1+1', "'+1+1"],
    ['-1+1', "'-1+1"],
    ['@SUM(1)', "'@SUM(1)"],
    ['  =1+1', "'=1+1"],
    ['\t=1+1', "'=1+1"],
    ['`=1+1`', "'=1+1"],
    ['&#61;1+1', "'=1+1"],
    ['=SUM(1,2)', '"\'=SUM(1,2)"'],
    ['=HYPERLINK("https://example.com")', '"\'=HYPERLINK(""https://example.com"")"']
  ])('neutralizes formula cells when copying %s as CSV', async (value, expected) => {
    vi.useFakeTimers();
    using writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    fixture.componentRef.setInput(
      'markdown',
      `| ${value} | Status |
| --- | --- |
| ${value} | Ready |`
    );
    fixture.detectChanges();
    await vi.runAllTimersAsync();
    await fixture.whenStable();

    element.querySelector<HTMLButtonElement>('button[aria-label="Copy table as CSV"]')?.click();
    await Promise.resolve();

    expect(writeText).toHaveBeenCalledWith(`${expected},Status\r\n${expected},Ready`);
  });

  it('downloads rendered table cells as a CSV file with formulas neutralized', async () => {
    using createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:table');
    using revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL');
    using click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);
    fixture.componentRef.setInput(
      'markdown',
      ['| =1+1 | Status |', '| --- | --- |', '| =SUM(1,2) | Ready |'].join('\n')
    );
    await fixture.whenStable();
    await expect
      .poll(() => element.querySelector('tbody td:last-child'))
      .toHaveTextContent('Ready');

    element.querySelector<HTMLButtonElement>('button[aria-label="Download table as CSV"]')?.click();

    const blob = createObjectURL.mock.calls[0][0] as Blob;
    const link = click.mock.instances[0] as HTMLAnchorElement;

    expect(blob).toHaveProperty('type', 'text/csv;charset=utf-8');
    expect(await blob.text()).toBe('\'=1+1,Status\r\n"\'=SUM(1,2)",Ready');
    expect(link.download).toBe('table.csv');
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:table');
  });
});
