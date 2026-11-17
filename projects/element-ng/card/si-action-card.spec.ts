/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, outputBinding, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { page, userEvent } from 'vitest/browser';

import { SiActionCardComponent } from './si-action-card.component';

describe('SiActionCardComponent', () => {
  let fixture: ComponentFixture<SiActionCardComponent>;
  let element: HTMLButtonElement;
  const selectable = signal(false);
  const selected = signal(false);
  const selectedChange = vi.fn<(value: boolean) => void>();
  const card = page.getByRole('button', { name: 'Test', exact: true });

  beforeEach(async () => {
    selectable.set(false);
    selected.set(false);
    selectedChange.mockClear();
    fixture = TestBed.createComponent(SiActionCardComponent, {
      inferTagName: true,
      bindings: [
        inputBinding('heading', () => 'Test'),
        inputBinding('subHeading', () => 'Description'),
        inputBinding('selectable', selectable),
        inputBinding('selected', selected),
        outputBinding('selectedChange', selectedChange)
      ]
    });
    element = fixture.nativeElement;
    element.type = 'button';
    await fixture.whenStable();
  });

  it('should not be selected by default', async () => {
    await expect.element(card).not.toHaveClass('selected');
    await expect.element(card).not.toHaveAttribute('aria-pressed');
  });

  it('should be selectable when enabled', async () => {
    selectable.set(true);

    await fixture.whenStable();
    await userEvent.click(card);

    await expect.element(card).toHaveClass('selected');
    await expect.element(card).toHaveAttribute('aria-pressed', 'true');
  });

  it('toggles selection and emits changes on click', async () => {
    selectable.set(true);
    await fixture.whenStable();
    await expect.element(card).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(card);
    await fixture.whenStable();

    await expect.element(card).toHaveClass('selected');
    await expect.element(card).toHaveAttribute('aria-pressed', 'true');
    expect(selectedChange).toHaveBeenNthCalledWith(1, true);

    await userEvent.click(card);
    await fixture.whenStable();

    await expect.element(card).not.toHaveClass('selected');
    await expect.element(card).toHaveAttribute('aria-pressed', 'false');
    expect(selectedChange).toHaveBeenNthCalledWith(2, false);
    expect(selectedChange).toHaveBeenCalledTimes(2);
  });

  it('stops selecting when selectable is turned off', async () => {
    selectable.set(true);
    await fixture.whenStable();
    await userEvent.click(card);
    await fixture.whenStable();
    expect(selectedChange).toHaveBeenNthCalledWith(1, true);

    selectable.set(false);
    await fixture.whenStable();
    await userEvent.click(card);
    await fixture.whenStable();

    await expect.element(card).not.toHaveClass('selected');
    await expect.element(card).not.toHaveAttribute('aria-pressed');
    expect(selectedChange).toHaveBeenCalledTimes(1);
  });

  it('should have accessible card name and description', async () => {
    await expect.element(card).toHaveAccessibleName('Test');
    await expect.element(card).toHaveAccessibleDescription('Description');
  });
});
