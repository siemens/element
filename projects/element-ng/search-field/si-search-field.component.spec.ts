/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  debounce,
  disabled,
  form,
  FormField,
  readonly as readonlyField
} from '@angular/forms/signals';
import { page } from 'vitest/browser';

import { SiSearchFieldComponent } from './si-search-field.component';

describe('SiSearchFieldComponent', () => {
  @Component({
    imports: [SiSearchFieldComponent, FormField],
    template: `
      <form (submit)="onSubmit($event)">
        <si-search-field>
          <input
            type="search"
            class="form-control search-bar-input"
            aria-label="Search"
            [formField]="searchField"
          />
        </si-search-field>
      </form>
    `
  })
  class TestHostComponent {
    readonly model = signal('');
    readonly isDisabled = signal(false);
    readonly isReadonly = signal(false);
    readonly onSubmit = vi.fn((event: Event) => event.preventDefault());
    readonly searchField = form(this.model, path => {
      disabled(path, () => this.isDisabled());
      readonlyField(path, () => this.isReadonly());
    });
  }

  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  const search = page.getByRole('searchbox', { name: 'Search' });
  const clear = page.getByRole('button', { name: 'Clear', exact: true });

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('shows the clear button only while the input has a value', async () => {
    await expect.element(clear).not.toBeInTheDocument();

    await search.fill('Products');
    await fixture.whenStable();

    await expect.element(clear).toBeVisible();

    host.model.set('');
    await fixture.whenStable();

    await expect.element(clear).not.toBeInTheDocument();
  });

  it('clears the field and restores input focus without submitting the form', async () => {
    await search.fill('Products');
    await fixture.whenStable();

    await clear.click();
    await fixture.whenStable();

    expect(host.model()).toBe('');
    expect(host.onSubmit).not.toHaveBeenCalled();
    await expect.element(search).toHaveValue('');
    await expect.element(search).toHaveFocus();
    await expect.element(clear).not.toBeInTheDocument();
  });

  it.each(['isDisabled', 'isReadonly'] as const)(
    'hides the clear button while %s is set',
    async state => {
      host.model.set('Products');
      await fixture.whenStable();
      await expect.element(clear).toBeVisible();

      host[state].set(true);
      await fixture.whenStable();

      await expect.element(clear).not.toBeInTheDocument();

      host[state].set(false);
      await fixture.whenStable();

      await expect.element(clear).toBeVisible();
    }
  );
});

describe('SiSearchFieldComponent with debounced signal forms', () => {
  const debounceTime = 300;

  @Component({
    imports: [SiSearchFieldComponent, FormField],
    template: `
      <si-search-field>
        <input
          type="search"
          class="form-control search-bar-input"
          aria-label="Search"
          [formField]="searchField"
        />
      </si-search-field>
    `
  })
  class DebouncedTestHostComponent {
    readonly model = signal('');
    readonly searchField = form(this.model, path => debounce(path, debounceTime));
  }

  let fixture: ComponentFixture<DebouncedTestHostComponent>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(DebouncedTestHostComponent);
    await fixture.whenStable();
  });

  it('clears pending input without restoring it after the debounce delay', async () => {
    const input = page.getByRole('searchbox', { name: 'Search' });
    const clear = page.getByRole('button', { name: 'Clear', exact: true });

    await input.fill('Pending search');
    await fixture.whenStable();
    await expect.element(clear).toBeVisible();
    expect(fixture.componentInstance.model()).toBe('');

    await clear.click();
    await fixture.whenStable();

    await expect.element(input).toHaveValue('');
    await expect.element(clear).not.toBeInTheDocument();

    await new Promise(resolve => setTimeout(resolve, debounceTime + 100));
    await fixture.whenStable();

    expect(fixture.componentInstance.model()).toBe('');
    await expect.element(input).toHaveValue('');
  });
});
