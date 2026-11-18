/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  Component,
  inputBinding,
  outputBinding,
  signal,
  TrackByFunction,
  WritableSignal
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { type Mock } from 'vitest';

import { SiTreeViewComponent } from '../si-tree-view.component';
import { TreeItem } from '../si-tree-view.model';
import { SiTreeViewItemComponent } from './si-tree-view-item.component';
import { SiTreeViewItemDirective } from './si-tree-view-item.directive';

@Component({
  imports: [SiTreeViewComponent, SiTreeViewItemComponent, SiTreeViewItemDirective],
  template: `
    <si-tree-view
      ariaLabel="Projected tree"
      [items]="items()"
      [trackBy]="trackBy"
      [isVirtualized]="false"
    >
      <ng-template let-index="index" let-item="treeItem" siTreeViewItem>
        <si-tree-view-item>
          <span class="projected-item">{{ index }}: {{ item.label }}</span>
        </si-tree-view-item>
      </ng-template>
    </si-tree-view>
  `
})
class ProjectedTreeComponent {
  readonly items = signal<TreeItem[]>([]);
  readonly trackBy: TrackByFunction<TreeItem> = (_index, item) => item.customData;
}

describe('SiTreeViewItemDirective', () => {
  const trackBy: TrackByFunction<TreeItem> = (_index, item) => item.customData ?? item;
  let items: WritableSignal<TreeItem[]>;
  let fixture: ComponentFixture<SiTreeViewComponent>;
  let element: HTMLElement;
  let itemClicked: Mock<(item: TreeItem) => void>;

  beforeEach(async () => {
    items = signal<TreeItem[]>([]);
    itemClicked = vi.fn();
    fixture = TestBed.createComponent(SiTreeViewComponent, {
      bindings: [
        inputBinding('items', items),
        inputBinding('trackBy', () => trackBy),
        inputBinding('isVirtualized', () => false),
        inputBinding('enableSelection', () => true),
        inputBinding('ariaLabel', () => 'Test tree'),
        outputBinding<TreeItem>('treeItemClicked', itemClicked)
      ]
    });
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  const renderedItems = (container: HTMLElement): HTMLElement[] =>
    Array.from(container.querySelectorAll<HTMLElement>('si-tree-view-item'));

  it.each(['inserting', 'replacing'])(
    'should check row labels a bounded number of times when %s a batch',
    async operation => {
      const count = 60;
      if (operation === 'replacing') {
        items.set(
          Array.from({ length: count }, (_, index) => ({
            label: `Original ${index}`,
            customData: index,
            state: 'leaf'
          }))
        );
        await fixture.whenStable();
      }

      const readLabel = vi.fn((index: number) => `Updated ${index}`);
      items.set(
        Array.from({ length: count }, (_, index) => ({
          get label() {
            return readLabel(index);
          },
          customData: index,
          state: 'leaf'
        }))
      );
      await fixture.whenStable();

      const rows = renderedItems(element);
      expect(rows).toHaveLength(count);
      expect(rows.map(row => row.textContent?.trim())).toEqual(
        Array.from({ length: count }, (_, index) => `Updated ${index}`)
      );
      expect(readLabel.mock.calls.length).toBeLessThanOrEqual(count * 4);
    }
  );

  it('should retain keyed rows and update their content and click outputs in a mixed batch', async () => {
    items.set([
      { label: 'First', customData: 1 },
      { label: 'Second', customData: 2 },
      { label: 'Third', customData: 3 }
    ]);
    await fixture.whenStable();
    const originalRows = renderedItems(element);

    const updatedItems: TreeItem[] = [
      { label: 'Updated third', customData: 3 },
      { label: 'Updated first', customData: 1 },
      { label: 'New fourth', customData: 4 }
    ];
    items.set(updatedItems);
    await fixture.whenStable();

    const rows = renderedItems(element);
    expect(rows).toHaveLength(3);
    expect(rows[0]).toBe(originalRows[2]);
    expect(rows[1]).toBe(originalRows[0]);
    expect(rows).not.toContain(originalRows[1]);
    expect(rows.map(row => row.textContent?.trim())).toEqual([
      'Updated third',
      'Updated first',
      'New fourth'
    ]);

    rows[0].querySelector<HTMLElement>('.si-tree-view-item-object-data')!.click();
    await fixture.whenStable();

    expect(itemClicked).toHaveBeenCalledExactlyOnceWith(updatedItems[0]);
    expect(rows[0].getAttribute('aria-selected')).toBe('true');
  });

  it('should update sibling positions and sizes after adding, removing and moving children', async () => {
    const children: TreeItem[] = [{ label: 'First' }, { label: 'Second' }, { label: 'Third' }];
    items.set([{ label: 'Root', state: 'expanded', children }]);
    await fixture.whenStable();
    const originalRows = renderedItems(element);
    expect(originalRows.map(row => row.getAttribute('aria-posinset'))).toEqual([
      '1',
      '1',
      '2',
      '3'
    ]);

    children.splice(0, 3, children[2], children[0]);
    fixture.componentInstance.addChildItems([{ label: 'Fourth' }, { label: 'Fifth' }], items()[0]);
    await fixture.whenStable();

    const rows = renderedItems(element);
    expect(rows).toHaveLength(5);
    expect(rows[1]).toBe(originalRows[3]);
    expect(rows[2]).toBe(originalRows[1]);
    expect(rows.map(row => row.getAttribute('aria-posinset'))).toEqual(['1', '1', '2', '3', '4']);
    expect(rows.slice(1).map(row => row.getAttribute('aria-setsize'))).toEqual([
      '4',
      '4',
      '4',
      '4'
    ]);
  });

  it('should update projected template items and indices after a mixed batch', async () => {
    const projectedFixture = TestBed.createComponent(ProjectedTreeComponent);
    const projectedElement: HTMLElement = projectedFixture.nativeElement;
    projectedFixture.componentInstance.items.set([
      { label: 'First', customData: 1 },
      { label: 'Second', customData: 2 },
      { label: 'Third', customData: 3 }
    ]);
    await projectedFixture.whenStable();
    const originalRows = renderedItems(projectedElement);

    projectedFixture.componentInstance.items.set([
      { label: 'Updated third', customData: 3 },
      { label: 'Updated first', customData: 1 },
      { label: 'New fourth', customData: 4 }
    ]);
    await projectedFixture.whenStable();

    const rows = renderedItems(projectedElement);
    expect(rows[0]).toBe(originalRows[2]);
    expect(rows[1]).toBe(originalRows[0]);
    expect(
      Array.from(projectedElement.querySelectorAll('.projected-item'), item =>
        item.textContent?.trim()
      )
    ).toEqual(['0: Updated third', '1: Updated first', '2: New fourth']);
  });
});
