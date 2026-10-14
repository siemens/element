/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, inputBinding, outputBinding, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { disabled, form, FormField, readonly } from '@angular/forms/signals';
import { DataTableColumnDirective, NgxDatatableModule } from '@siemens/ngx-datatable';
import { userEvent } from 'vitest/browser';

import { SiTableSearchTextComponent } from './si-table-search-text.component';

describe('SiTableSearchTextComponent', () => {
  let fixture: ComponentFixture<SiTableSearchTextComponent>;
  let overlay: HTMLElement;
  let trigger: HTMLButtonElement;
  let value: WritableSignal<string>;
  let isDisabled: WritableSignal<boolean>;
  let isReadonly: WritableSignal<boolean>;
  let columnName: WritableSignal<string>;
  let onTouch = vi.fn<() => void>();

  const getInput = (): HTMLInputElement => overlay.querySelector('input')!;
  const open = async (): Promise<void> => {
    await userEvent.click(trigger);
    await fixture.whenStable();
  };

  beforeEach(async () => {
    value = signal('');
    isDisabled = signal(false);
    isReadonly = signal(false);
    onTouch = vi.fn();
    columnName = signal('Name');
    TestBed.configureTestingModule({
      providers: [{ provide: DataTableColumnDirective, useValue: { name: columnName } }]
    });
    fixture = TestBed.createComponent(SiTableSearchTextComponent, {
      bindings: [
        inputBinding('debounceTime', () => 0),
        inputBinding('value', value),
        inputBinding('disabled', isDisabled),
        inputBinding('readonly', isReadonly),
        outputBinding<string>('valueChange', newValue => value.set(newValue)),
        outputBinding<void>('touch', onTouch)
      ]
    });
    overlay = TestBed.inject(OverlayContainer).getContainerElement();
    trigger = fixture.nativeElement.querySelector('button');
    await fixture.whenStable();
  });

  it('opens a named dialog without a visible title and focuses its search input', async () => {
    await expect.element(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
    await open();

    const dialog = overlay.querySelector<HTMLElement>('[role="dialog"]')!;
    await expect.element(trigger).toHaveAccessibleName('Filter Name');
    await expect.element(dialog).toHaveAccessibleName('Filter Name');
    await expect.element(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog.querySelector('h1, h2, h3, h4, h5, h6')).toBeNull();
    await expect.element(trigger).toHaveAttribute('aria-controls', dialog.id);
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect.element(getInput()).toHaveAttribute('placeholder', 'Filter Name...');
    await expect.element(getInput()).toHaveFocus();
    expect(onTouch).not.toHaveBeenCalled();
  });

  it('updates the accessible names and placeholder when the column name changes', async () => {
    await open();
    columnName.set('Company');
    await fixture.whenStable();

    await expect.element(trigger).toHaveAccessibleName('Filter Company');
    await expect
      .element(overlay.querySelector<HTMLElement>('[role="dialog"]')!)
      .toHaveAccessibleName('Filter Company');
    await expect.element(getInput()).toHaveAttribute('placeholder', 'Filter Company...');
  });

  it('supports custom label and placeholder inputs with the column name', async () => {
    fixture.destroy();
    fixture = TestBed.createComponent(SiTableSearchTextComponent, {
      bindings: [
        inputBinding('label', () => 'Search {{columnName}}'),
        inputBinding('placeholder', () => 'Search in {{columnName}}...')
      ]
    });
    trigger = fixture.nativeElement.querySelector('button');
    await fixture.whenStable();
    await open();

    await expect.element(trigger).toHaveAccessibleName('Search Name');
    await expect
      .element(overlay.querySelector<HTMLElement>('[role="dialog"]')!)
      .toHaveAccessibleName('Search Name');
    await expect.element(getInput()).toHaveAttribute('placeholder', 'Search in Name...');
  });

  it('updates the value and active indicator when searching and clearing', async () => {
    await open();
    await userEvent.fill(getInput(), 'Alice');
    await fixture.whenStable();

    expect(value()).toBe('Alice');
    expect(trigger.querySelector('.badge-dot')).not.toBeNull();

    await userEvent.click(overlay.querySelector<HTMLButtonElement>('button')!);
    await fixture.whenStable();

    expect(value()).toBe('');
    expect(trigger.querySelector('.badge-dot')).toBeNull();
    await expect.element(trigger).not.toHaveAttribute('aria-describedby');
    expect(fixture.nativeElement.querySelector('.visually-hidden')).toBeNull();
    await expect.element(getInput()).toHaveFocus();
  });

  it('describes the active filter without changing the button or dialog names', async () => {
    await expect.element(trigger).not.toHaveAttribute('aria-describedby');
    value.set('Alice');
    await fixture.whenStable();

    const description = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(
      '.visually-hidden'
    )!;
    await expect.element(trigger).toHaveAccessibleName('Filter Name');
    await expect.element(trigger).toHaveAttribute('aria-describedby', description.id);
    await expect.element(trigger).toHaveAccessibleDescription('Active filter: Alice');

    await open();
    await expect
      .element(overlay.querySelector<HTMLElement>('[role="dialog"]')!)
      .toHaveAccessibleName('Filter Name');
  });

  it('updates the description when the filter value changes', async () => {
    value.set('Alice');
    await fixture.whenStable();
    await expect.element(trigger).toHaveAccessibleDescription('Active filter: Alice');

    value.set('Bob');
    await fixture.whenStable();
    await expect.element(trigger).toHaveAccessibleDescription('Active filter: Bob');
  });

  it('supports a custom active filter description with the current value', async () => {
    fixture.destroy();
    fixture = TestBed.createComponent(SiTableSearchTextComponent, {
      bindings: [
        inputBinding('value', value),
        inputBinding('activeFilterDescription', () => 'Filtering for {{value}}')
      ]
    });
    trigger = fixture.nativeElement.querySelector('button');
    value.set('Alice');
    await fixture.whenStable();

    await expect.element(trigger).toHaveAccessibleDescription('Filtering for Alice');
  });

  it('reflects external value changes in the dialog', async () => {
    value.set('Alice');
    await open();
    await expect.element(getInput()).toHaveValue('Alice');

    value.set('Bob');
    await fixture.whenStable();
    await expect.element(getInput()).toHaveValue('Bob');
  });

  it('closes on Escape, marks touched, and restores focus to the trigger', async () => {
    await open();
    await userEvent.keyboard('{Escape}');
    await fixture.whenStable();

    expect(overlay.querySelector('[role="dialog"]')).toBeNull();
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect.element(trigger).toHaveFocus();
    expect(onTouch).toHaveBeenCalledTimes(1);
  });

  it('closes on backdrop click and restores focus', async () => {
    await open();
    await userEvent.click(overlay.querySelector<HTMLElement>('.cdk-overlay-backdrop')!);
    await fixture.whenStable();

    expect(overlay.querySelector('[role="dialog"]')).toBeNull();
    await expect.element(trigger).toHaveFocus();
    expect(onTouch).toHaveBeenCalledTimes(1);
  });

  it('traps keyboard focus within the dialog', async () => {
    value.set('Alice');
    await open();
    await userEvent.tab();
    await expect.element(overlay.querySelector<HTMLButtonElement>('button')!).toHaveFocus();
    await userEvent.tab();
    await expect.element(getInput()).toHaveFocus();
    await userEvent.tab({ shift: true });
    await expect.element(overlay.querySelector<HTMLButtonElement>('button')!).toHaveFocus();
    expect(onTouch).not.toHaveBeenCalled();
  });

  it('disables the trigger and closes an already open dialog', async () => {
    await open();
    isDisabled.set(true);
    await fixture.whenStable();

    await expect.element(trigger).toBeDisabled();
    expect(overlay.querySelector('[role="dialog"]')).toBeNull();
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('allows viewing a readonly filter but not editing or clearing it', async () => {
    value.set('Alice');
    isReadonly.set(true);
    await open();

    await expect.element(getInput()).toHaveAttribute('readonly');
    await expect.element(getInput()).toHaveValue('Alice');
    await expect.element(overlay.querySelector<HTMLButtonElement>('button')!).toBeDisabled();
  });

  it('marks touched when the closed trigger loses focus', async () => {
    fixture.componentInstance.focus();
    trigger.blur();
    await fixture.whenStable();

    expect(onTouch).toHaveBeenCalledTimes(1);
  });

  describe('Signal Forms integration', () => {
    @Component({
      imports: [FormField, SiTableSearchTextComponent, NgxDatatableModule],
      template: `<ngx-datatable [rows]="[]">
        <ngx-datatable-column name="Name" prop="name">
          <ng-template ngx-datatable-header-actions>
            <si-table-search-text [formField]="filter" [debounceTime]="0" />
          </ng-template>
        </ngx-datatable-column>
      </ngx-datatable>`
    })
    class TestFormComponent {
      readonly value = signal('Alice');
      readonly isDisabled = signal(false);
      readonly isReadonly = signal(false);
      readonly filter = form(this.value, path => {
        disabled(path, () => this.isDisabled());
        readonly(path, () => this.isReadonly());
      });
    }

    let formFixture: ComponentFixture<TestFormComponent>;
    let component: TestFormComponent;
    let formTrigger: HTMLButtonElement;

    beforeEach(async () => {
      fixture.destroy();
      formFixture = TestBed.createComponent(TestFormComponent);
      component = formFixture.componentInstance;
      await formFixture.whenStable();
      formTrigger = formFixture.nativeElement.querySelector('si-table-search-text button');
    });

    it('synchronizes the form value and marks the field dirty when searching', async () => {
      await expect.element(formTrigger).toHaveAccessibleName('Filter Name');
      await userEvent.click(formTrigger);
      await formFixture.whenStable();
      await expect.element(getInput()).toHaveAttribute('placeholder', 'Filter Name...');
      await expect.element(getInput()).toHaveValue('Alice');

      await userEvent.fill(getInput(), 'Bob');
      await formFixture.whenStable();
      expect(component.value()).toBe('Bob');
      expect(component.filter().dirty()).toBe(true);
      expect(component.filter().touched()).toBe(false);
    });

    it('marks the field touched when the dialog closes', async () => {
      await userEvent.click(formTrigger);
      await formFixture.whenStable();
      expect(component.filter().touched()).toBe(false);

      await userEvent.keyboard('{Escape}');
      await formFixture.whenStable();
      expect(component.filter().touched()).toBe(true);
    });

    it('receives the readonly state from the form', async () => {
      component.isReadonly.set(true);
      await formFixture.whenStable();
      await userEvent.click(formTrigger);
      await formFixture.whenStable();
      await expect.element(getInput()).toHaveAttribute('readonly');
    });

    it('receives the disabled state from the form', async () => {
      component.isDisabled.set(true);
      await formFixture.whenStable();
      await expect.element(formTrigger).toBeDisabled();
    });
  });
});
