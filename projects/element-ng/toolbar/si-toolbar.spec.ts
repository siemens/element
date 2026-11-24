/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ToolbarWidget } from '@angular/aria/toolbar';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Locator, page, userEvent } from 'vitest/browser';

import {
  SiToolbarAlignment,
  SiToolbarComponent,
  SiToolbarGroupComponent,
  SiToolbarPlacement,
  SiToolbarVariant
} from './index';

@Component({
  imports: [SiToolbarComponent, SiToolbarGroupComponent, ToolbarWidget],
  template: `
    <button type="button">Before</button>
    <si-toolbar
      aria-label="Editor"
      [orientation]="orientation()"
      [variant]="variant()"
      [placement]="placement()"
      [alignment]="alignment()"
    >
      <si-toolbar-group aria-label="Tools">
        <button type="button" ngToolbarWidget value="pen" (click)="actions.push('pen')">Pen</button>
        <button type="button" ngToolbarWidget value="text" (click)="actions.push('text')">
          Text
        </button>
      </si-toolbar-group>
      <si-toolbar-group aria-label="History">
        <button
          type="button"
          ngToolbarWidget
          value="undo"
          [disabled]="undoDisabled()"
          (click)="actions.push('undo')"
        >
          Undo
        </button>
      </si-toolbar-group>
    </si-toolbar>
  `
})
class TestHostComponent {
  readonly orientation = signal<'horizontal' | 'vertical'>('horizontal');
  readonly variant = signal<SiToolbarVariant>('floating');
  readonly placement = signal<SiToolbarPlacement | undefined>(undefined);
  readonly alignment = signal<SiToolbarAlignment>('center');
  readonly undoDisabled = signal(false);
  readonly actions: string[] = [];
}

describe('SiToolbarComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let toolbar: Locator;

  const item = (name: string): Locator => toolbar.getByRole('button', { name, exact: true });

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    await fixture.whenStable();
    toolbar = page.elementLocator(fixture.nativeElement).getByRole('toolbar', { name: 'Editor' });
  });

  it('should only add one item to the tab sequence', async () => {
    await userEvent.click(page.getByRole('button', { name: 'Before' }));
    await userEvent.tab();
    await expect.element(item('Pen')).toHaveFocus();

    await userEvent.tab();
    await expect.element(item('Text')).not.toHaveFocus();
    await expect.element(item('Undo')).not.toHaveFocus();
  });

  it('should move the focus across groups and activate items with Enter and Space', async () => {
    await userEvent.click(item('Pen'));
    await userEvent.keyboard('{ArrowRight}');
    await expect.element(item('Text')).toHaveFocus();
    await userEvent.keyboard(' ');

    await userEvent.keyboard('{ArrowRight}');
    await expect.element(item('Undo')).toHaveFocus();
    await userEvent.keyboard('{Enter}');

    expect(host.actions).toEqual(['pen', 'text', 'undo']);
  });

  it('should navigate with up and down arrow keys in vertical orientation', async () => {
    host.orientation.set('vertical');
    await fixture.whenStable();

    await expect.element(toolbar).toHaveAttribute('aria-orientation', 'vertical');
    await userEvent.click(item('Pen'));
    await userEvent.keyboard('{ArrowDown}');
    await expect.element(item('Text')).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    await expect.element(item('Pen')).toHaveFocus();
  });

  it('should keep disabled items focusable without triggering their action', async () => {
    host.undoDisabled.set(true);
    await fixture.whenStable();

    await userEvent.click(item('Text'));
    await userEvent.keyboard('{ArrowRight}');
    await expect.element(item('Undo')).toHaveFocus();
    await expect.element(item('Undo')).toHaveAttribute('aria-disabled', 'true');

    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(host.actions).toEqual(['text']);
  });

  it('should apply alignment only to floating toolbars with a placement', async () => {
    await expect.element(toolbar).not.toHaveClass('si-toolbar-align-center');

    host.placement.set('bottom');
    await fixture.whenStable();
    await expect.element(toolbar).toHaveClass('si-toolbar-placement-bottom');
    await expect.element(toolbar).toHaveClass('si-toolbar-align-center');

    host.alignment.set('start');
    await fixture.whenStable();
    await expect.element(toolbar).toHaveClass('si-toolbar-align-start');
    await expect.element(toolbar).not.toHaveClass('si-toolbar-align-center');

    host.alignment.set('end');
    await fixture.whenStable();
    await expect.element(toolbar).toHaveClass('si-toolbar-align-end');

    host.variant.set('docked');
    await fixture.whenStable();
    await expect.element(toolbar).toHaveClass('si-toolbar-docked');
    await expect.element(toolbar).toHaveClass('si-toolbar-placement-bottom');
    await expect.element(toolbar).not.toHaveClass('si-toolbar-align-end');
  });
});
