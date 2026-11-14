/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { provideLocationMocks } from '@angular/common/testing';
import { Component, input, inputBinding, model, outputBinding, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, RouterLink, RouterOutlet } from '@angular/router';
import { page, userEvent } from 'vitest/browser';

import { SiActionCardComponent } from './si-action-card.component';

@Component({
  template: '<h1>Details page</h1>'
})
class DestinationComponent {}

@Component({
  imports: [SiActionCardComponent, RouterLink, RouterOutlet],
  template: `
    <a
      si-action-card
      heading="Documentation"
      subHeading="Read the documentation"
      [href]="documentationLink"
      [selectable]="selectable()"
      [(selected)]="selected"
    >
      <div body class="card-body">Documentation overview</div>
    </a>
    <a
      si-action-card
      routerLink="/details"
      heading="Details"
      [selectable]="selectable()"
      [(selected)]="selected"
    >
      <div body class="card-body">View details</div>
    </a>
    <h2 id="action-card-documentation">Documentation content</h2>
    <router-outlet />
  `
})
class AnchorCardHostComponent {
  readonly documentationLink = `${window.location.pathname}${window.location.search}#action-card-documentation`;
  readonly selectable = input(false);
  readonly selected = model(false);
}

describe('SiActionCardComponent', () => {
  describe('button cards', () => {
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

    it('is not selected by default', async () => {
      await expect.element(card).not.toHaveClass('selected');
      await expect.element(card).not.toHaveAttribute('aria-pressed');
    });

    it('ignores selection inputs and clicks when not selectable', async () => {
      selected.set(true);
      await fixture.whenStable();

      await userEvent.click(card);
      await fixture.whenStable();

      await expect.element(card).not.toHaveClass('selected');
      await expect.element(card).not.toHaveAttribute('aria-pressed');
      expect(selectedChange).not.toHaveBeenCalled();
    });

    it('reflects the selected input when selectable', async () => {
      selectable.set(true);
      selected.set(true);
      await fixture.whenStable();

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

      selectable.set(false);
      await fixture.whenStable();
      await userEvent.click(card);
      await fixture.whenStable();

      await expect.element(card).not.toHaveClass('selected');
      await expect.element(card).not.toHaveAttribute('aria-pressed');
      expect(selectedChange).toHaveBeenCalledTimes(1);
    });

    it.each([
      { name: 'Enter', key: '{Enter}' },
      { name: 'Space', key: ' ' }
    ])('selects the card using $name', async ({ key }) => {
      selectable.set(true);
      await fixture.whenStable();

      await userEvent.tab();
      await expect.element(card).toHaveFocus();
      await userEvent.keyboard(key);
      await fixture.whenStable();

      await expect.element(card).toHaveClass('selected');
      await expect.element(card).toHaveAttribute('aria-pressed', 'true');
      expect(selectedChange).toHaveBeenCalledWith(true);
      expect(selectedChange).toHaveBeenCalledTimes(1);
    });

    it('cannot be selected when disabled', async () => {
      selectable.set(true);
      element.disabled = true;
      await fixture.whenStable();
      await expect.element(card).toBeDisabled();

      await userEvent.click(card, { force: true });
      await fixture.whenStable();

      await expect.element(card).not.toHaveClass('selected');
      await expect.element(card).toHaveAttribute('aria-pressed', 'false');
      expect(selectedChange).not.toHaveBeenCalled();
    });

    it('references the heading, subheading, and content for its accessible label', async () => {
      await expect.element(card).toHaveAccessibleName('Test');
      await expect.element(card).toHaveAccessibleDescription('Description');
      const labelledBy = element.getAttribute('aria-labelledby')!;
      const describedBy = element.getAttribute('aria-describedby')!.split(' ');

      expect(element.querySelector(`[id="${labelledBy}"]`)).toHaveTextContent('Test');
      expect(describedBy).toHaveLength(2);
      expect(element.querySelector(`[id="${describedBy[0]}"]`)).toHaveTextContent('Description');
      expect(element.querySelector(`[id="${describedBy[1]}"]`)).toBeInTheDocument();
    });
  });

  describe('anchor cards', () => {
    let fixture: ComponentFixture<AnchorCardHostComponent>;
    let originalUrl: string;
    const selectable = signal(false);
    const selected = signal(false);
    const selectedChange = vi.fn<(value: boolean) => void>();
    const documentation = page.getByRole('link', { name: 'Documentation', exact: true });
    const details = page.getByRole('link', { name: 'Details', exact: true });
    const destination = page.getByRole('heading', { name: 'Details page', level: 1 });

    beforeEach(async () => {
      originalUrl = window.location.href;
      selectable.set(false);
      selected.set(false);
      selectedChange.mockClear();
      TestBed.configureTestingModule({
        providers: [
          provideRouter([{ path: 'details', component: DestinationComponent }]),
          provideLocationMocks()
        ]
      });
      fixture = TestBed.createComponent(AnchorCardHostComponent, {
        bindings: [
          inputBinding('selectable', selectable),
          inputBinding('selected', selected),
          outputBinding('selectedChange', selectedChange)
        ]
      });
      await fixture.whenStable();
    });

    afterEach(() => {
      window.history.replaceState(undefined, '', originalUrl);
    });

    it('describes its destination and content to assistive technologies', async () => {
      await expect
        .element(documentation)
        .toHaveAccessibleDescription('Read the documentation Documentation overview');
    });

    it('can be reached by tabbing through the cards', async () => {
      await userEvent.tab();
      await expect.element(documentation).toHaveFocus();

      await userEvent.tab();
      await expect.element(details).toHaveFocus();
    });

    it('follows its href when the card body is clicked', async () => {
      await userEvent.click(documentation.getByText('Documentation overview'));
      await fixture.whenStable();

      await expect.poll(() => window.location.hash).toBe('#action-card-documentation');
    });

    it('follows its href when Enter is pressed', async () => {
      await userEvent.tab();
      await expect.element(documentation).toHaveFocus();
      await userEvent.keyboard('{Enter}');
      await fixture.whenStable();

      await expect.poll(() => window.location.hash).toBe('#action-card-documentation');
    });

    it('does not activate when Space is pressed', async () => {
      await userEvent.tab();
      await expect.element(documentation).toHaveFocus();
      await userEvent.keyboard(' ');
      await fixture.whenStable();

      expect(window.location.href).toBe(originalUrl);
      expect(selectedChange).not.toHaveBeenCalled();
    });

    it('opens the routed destination when clicked', async () => {
      await userEvent.click(details);
      await fixture.whenStable();

      await expect.element(destination).toBeVisible();
    });

    it('opens the routed destination when Enter is pressed', async () => {
      await userEvent.tab();
      await userEvent.tab();
      await expect.element(details).toHaveFocus();
      await userEvent.keyboard('{Enter}');
      await fixture.whenStable();

      await expect.element(destination).toBeVisible();
    });

    it.each([false, true])(
      'navigates without selecting when selection is enabled and selected is %s',
      async initialSelected => {
        selectable.set(true);
        selected.set(initialSelected);
        await fixture.whenStable();
        await expect.element(documentation).not.toHaveClass('selected');
        await expect.element(documentation).not.toHaveAttribute('aria-pressed');

        await userEvent.click(documentation);
        await fixture.whenStable();

        await expect.poll(() => window.location.hash).toBe('#action-card-documentation');
        await expect.element(documentation).not.toHaveClass('selected');
        await expect.element(documentation).not.toHaveAttribute('aria-pressed');
        expect(selectedChange).not.toHaveBeenCalled();
      }
    );

    it('keeps the card text undecorated when hovered', async () => {
      await userEvent.hover(documentation);

      await expect.element(documentation).toHaveStyle({ textDecorationLine: 'none' });
    });
  });
});
