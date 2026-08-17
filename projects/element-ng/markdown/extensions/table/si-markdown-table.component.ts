/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  Component,
  computed,
  ElementRef,
  input,
  OnDestroy,
  signal,
  viewChild
} from '@angular/core';
import { elementCopy, elementDownload, elementOk } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';
import { type Node, type Parent, type Table } from 'mdast';

import { SiMarkdownFragmentComponent } from '../../si-markdown-fragment.component';
import { SiMarkdownExtensionComponent } from '../../si-markdown.types';

@Component({
  selector: 'si-markdown-table',
  imports: [SiIconComponent, SiMarkdownFragmentComponent, SiTranslatePipe],
  templateUrl: './si-markdown-table.component.html',
  styleUrl: './si-markdown-table.component.scss'
})
export class SiMarkdownTableComponent implements SiMarkdownExtensionComponent, OnDestroy {
  readonly node = input.required<Node>();
  readonly parent = input.required<Parent>();
  readonly options = input<any>();

  protected readonly icons = addIcons({ elementCopy, elementDownload, elementOk });
  protected labelCopy = t(() => $localize`:@@SI_MARKDOWN.COPY_TABLE_AS_CSV:Copy table as CSV`);
  protected labelCopied = t(() => $localize`:@@SI_MARKDOWN.COPIED_CODE:Copied`);
  protected labelDownload = t(
    () => $localize`:@@SI_MARKDOWN.DOWNLOAD_TABLE_AS_CSV:Download table as CSV`
  );
  protected readonly table = computed(() => this.node() as Table);
  protected readonly copied = signal(false);
  private readonly tableElement = viewChild.required<ElementRef<HTMLTableElement>>('renderedTable');
  private copyTimeout?: ReturnType<typeof setTimeout>;

  ngOnDestroy(): void {
    clearTimeout(this.copyTimeout);
  }

  protected async copy(): Promise<void> {
    await navigator.clipboard.writeText(this.csv());
    this.copied.set(true);
    this.copyTimeout = setTimeout(() => this.copied.set(false), 1500);
  }

  protected download(): void {
    const blob = new Blob([this.csv()], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'table.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  private csv(): string {
    return Array.from(this.tableElement().nativeElement.rows, row =>
      Array.from(row.cells, cell => this.escapeCsvField(cell.innerText.trim())).join(',')
    ).join('\r\n');
  }

  private escapeCsvField(value: string): string {
    return /[",\r\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
  }
}
