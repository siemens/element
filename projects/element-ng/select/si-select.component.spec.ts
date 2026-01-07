/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { HarnessLoader, TestKey } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { CommonModule } from '@angular/common';
import { Component, provideZonelessChangeDetection, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SiSelectHarness } from '@siemens/element-ng/select/testing';

import { SelectOption, SelectItem, SiSelectComponent, SiSelectModule } from './index';
import { SiSelectSelectionStrategy } from './selection/si-select-selection-strategy';

const OPTIONS_LIST: readonly SelectOption<string>[] = [
  { type: 'option', value: 'good', icon: 'element-face-happy', label: 'Good' },
  { type: 'option', value: 'average', icon: 'element-face-neutral', label: 'Average' },
  { type: 'option', value: 'poor', icon: 'element-face-unhappy', label: 'Poor' }
];

const OPTIONS_LIST_NEXT: readonly SelectOption<number>[] = [
  { type: 'option', value: 0, icon: 'element-face-happy', label: 'Good' },
  { type: 'option', value: 1, icon: 'element-face-neutral', label: 'Average' },
  { type: 'option', value: 2, icon: 'element-face-unhappy', label: 'Poor' }
];

@Component({
  imports: [FormsModule, ReactiveFormsModule, SiSelectModule],
  template: `
    <form [formGroup]="form">
      <si-select #select formControlName="input" [options]="options" [readonly]="readonly" />
    </form>
  `
})
class FormHostComponent {
  readonly form = new FormGroup({
    input: new FormControl('average', { updateOn: 'blur' })
  });
  readonly select = viewChild.required<SiSelectComponent<string>>('select');
  readonly valueDirective = viewChild.required(SiSelectSelectionStrategy);
  options = OPTIONS_LIST;
  readonly = false;
}

@Component({
  imports: [SiSelectModule],
  template: `
    <si-select
      inputId="test-select"
      [options]="options"
      [disabled]="disabled"
      [readonly]="readonly"
      [hasFilter]="hasFilter"
      [(value)]="value"
    />
  `
})
class TestHostComponent {
  readonly selectComponent = viewChild.required(SiSelectComponent);
  readonly selectionStrategy = viewChild.required(SiSelectSelectionStrategy);

  value?: string;
  options?: readonly SelectOption<string>[] = OPTIONS_LIST;
  disabled = false;
  readonly = false;
  hasFilter = false;
}

@Component({
  imports: [SiSelectModule],
  template: `
    <si-select
      inputId="test-select"
      [options]="options"
      [disabled]="disabled"
      [readonly]="readonly"
      [hasFilter]="hasFilter"
      [(value)]="value"
    />
  `
})
class TestHostNumberComponent {
  readonly selectComponent = viewChild.required(SiSelectComponent);
  readonly selectionStrategy = viewChild.required(SiSelectSelectionStrategy);

  value?: number;
  options? = OPTIONS_LIST_NEXT;
  disabled = false;
  readonly = false;
  hasFilter = false;
}

@Component({
  imports: [SiSelectModule],
  template: `
    <si-select
      multi
      inputId="test-select"
      placeholder="Select an option"
      [options]="options"
      [optionEqualCheckFn]="optionEqualCheckFn"
      [disabled]="disabled"
      [readonly]="readonly"
      [hasFilter]="hasFilter"
      [(value)]="values"
      (valueChange)="selectionChanged($event)"
    />
  `
})
class TestHostMultiComponent {
  readonly selectComponent = viewChild.required(SiSelectComponent);

  values?: string[];
  options?: readonly SelectItem<string>[] = [
    { type: 'option', value: 'good', label: 'Good' },
    { type: 'option', value: 'average', label: 'Average' },
    { type: 'option', value: 'poor', label: 'Poor' }
  ];
  disabled = false;
  readonly = false;
  hasFilter = false;

  selectionChanged: ($event: any[]) => void = () => {};
  optionEqualCheckFn = (a: string, b: string): boolean => a.toLowerCase() === b.toLowerCase();
}

@Component({
  imports: [SiSelectModule],
  template: `
    <si-select inputId="test-select" [options]="options">
      <ng-template siSelectActions>
        <button siSelectAction type="button" class="btn btn-link" (click)="actionClick()">
          nothing
        </button>
        <button
          siSelectAction
          type="button"
          class="btn btn-link"
          [selectActionAutoClose]="true"
          (click)="actionClick()"
        >
          close
        </button>
      </ng-template>
    </si-select>
  `
})
class TestHostCustomActionComponent {
  options?: readonly SelectOption<string>[] = OPTIONS_LIST;
  actionClick(): void {}
}

describe('SiSelectComponent', () => {
  let fixture: ComponentFixture<unknown>;
  let loader: HarnessLoader;
  let selectHarness: SiSelectHarness;

  describe('direct usage', () => {
    let hostComponent: TestHostComponent;

    beforeEach(async () => {
      TestBed.configureTestingModule({
        imports: [SiSelectModule, TestHostComponent],
        providers: [provideZonelessChangeDetection()]
      });

      const typedFixture = TestBed.createComponent(TestHostComponent);
      fixture = typedFixture;
      hostComponent = typedFixture.componentInstance;
      hostComponent.value = 'average';
      loader = TestbedHarnessEnvironment.loader(fixture);
      fixture.detectChanges();
      selectHarness = await loader.getHarness(SiSelectHarness);
    });

    it('should display active selection', async () => {
      const [item] = await selectHarness.getSelectedItems();

      expect(await item.getIcon()).toBe('element-face-neutral');
      expect(await item.getText()).toContain('Average');
    });

    it('should open dropdown on click', async () => {
      await selectHarness.open('click');
      expect(await selectHarness.getList()).not.toBeNull();
    });

    it('should open dropdown on enter', async () => {
      await selectHarness.open('enter');
      expect(await selectHarness.getList()).not.toBeNull();
    });

    it('should not open dropdown on enter when disabled', async () => {
      hostComponent.disabled = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      await selectHarness.open('enter');
      expect(await selectHarness.getList()).toBeNull();
    });

    it('should not open dropdown on click (while disabled)', async () => {
      hostComponent.disabled = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      await selectHarness.open('enter');
      expect(await selectHarness.getList()).toBeNull();
    });

    it('should not allow focus (while disabled)', async () => {
      hostComponent.disabled = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(await selectHarness.getTabindex()).toBe('-1');
    });

    it('should not open dropdown on enter when readonly', async () => {
      hostComponent.readonly = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expect(await selectHarness.getTabindex()).toBe('0');

      await selectHarness.open('enter');
      expect(await selectHarness.getList()).toBeNull();
    });

    it('should not open dropdown on click (while readonly)', async () => {
      hostComponent.readonly = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      await selectHarness.open('click');
      expect(await selectHarness.getList()).toBeNull();
    });

    it('should not open dropdown on space (while readonly)', async () => {
      hostComponent.readonly = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      await selectHarness.open('space');
      expect(await selectHarness.getList()).toBeNull();
    });

    it('should contain specified options', async () => {
      await selectHarness.open();
      const items = await selectHarness.getList().then(list => list!.getAllItems());

      expect(await items[0].getText()).toContain('Good');
      expect(await items[1].getText()).toContain('Average');
      expect(await items[2].getText()).toContain('Poor');
    });

    it('should select item and emit', async () => {
      await selectHarness.clickItemsByText('Poor');

      expect(await selectHarness.getSelectedTexts()).toEqual(['Poor']);
      expect(hostComponent.value).toBe('poor');
      // Ensure placeholder text is not visible when items are selected
      expect(await selectHarness.getPlaceholder()).toBeUndefined();
    });

    it('should close after selecting the same icon', async () => {
      await selectHarness.clickItemsByText('Average');

      expect(await selectHarness.getList()).toBeFalsy();
      expect(hostComponent.value).toBe('average');
    });

    it('should allow focus', async () => {
      expect(await selectHarness.getTabindex()).toBe('0');
    });

    it('should focus selected item when pressing key down', async () => {
      const [selectedOption] = await selectHarness.getSelectedTexts();

      await selectHarness.open();
      const list = (await selectHarness.getList())!;
      await list.moveCursorDown();

      expect(await selectHarness.getSelectedTexts()).toEqual([selectedOption]);
    });

    it('should focus selected item when pressing key up', async () => {
      const [selectedOption] = await selectHarness.getSelectedTexts();

      await selectHarness.open();
      const list = (await selectHarness.getList())!;
      await list.moveCursorUp();

      expect(await selectHarness.getSelectedTexts()).toEqual([selectedOption]);
    });

    it('should allow undefined options', async () => {
      hostComponent.options = undefined;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      await selectHarness.open();
      const list = await selectHarness.getList()!;
      expect(list).toBeTruthy();
      const items = await list?.getAllItems();
      expect(items).toEqual([]);
    });

    describe('with filter', () => {
      beforeEach(async () => {
        hostComponent.hasFilter = true;
        hostComponent.options = [
          { type: 'option', value: 'a', label: 'a' },
          { type: 'option', value: 'b', label: 'b' },
          { type: 'option', value: 'c', label: 'c' },
          { type: 'option', value: 'ab', label: 'ab' }
        ];
        hostComponent.value = 'a';
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();
        selectHarness = await TestbedHarnessEnvironment.loader(fixture).getHarness(SiSelectHarness);
      });

      it('should navigate list with keys', async () => {
        expect(await selectHarness.getSelectedTexts()).toEqual(['a']);
        await selectHarness.open();
        await selectHarness
          .getList()
          .then(list => list!.sendKeys('b', TestKey.DOWN_ARROW, TestKey.ENTER));
        expect(await selectHarness.getSelectedTexts()).toEqual(['b']);
        expect(hostComponent.value).toBe('b');
      });

      it('should select by click', async () => {
        expect(await selectHarness.getSelectedTexts()).toEqual(['a']);
        await selectHarness.open();
        await selectHarness.getList().then(list => list!.sendKeys('a'));
        await selectHarness
          .getList()
          .then(list => list!.getItem(1))
          .then(item => item.click());
        expect(await selectHarness.getSelectedTexts()).toEqual(['ab']);
        expect(hostComponent.value).toBe('ab');
      });

      it('should focus first selected element', async () => {
        hostComponent.value = 'c';
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();
        await selectHarness.open();
        const item = await selectHarness.getList().then(list => list!.getItemByText('c'));
        expect(await item.isActive()).toBeTrue();
      });

      it('should apply current filter when options are applied', async () => {
        await selectHarness.open();
        await selectHarness.getList().then(list => list!.sendKeys('c'));
        hostComponent.options = [
          ...hostComponent.options!,
          { type: 'option', value: 'aaa', label: 'aaa' }
        ];
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();
        const items = await selectHarness.getList().then(list => list!.getAllItemTexts());
        expect(items).not.toContain('a');
        expect(items).not.toContain('b');
        expect(items).not.toContain('ab');
        expect(items).not.toContain('aaa');
        expect(items).toContain('c');
      });
    });
  });

  describe('direct usage with new interface and number value', () => {
    let hostComponent: TestHostNumberComponent;

    beforeEach(async () => {
      TestBed.configureTestingModule({
        imports: [SiSelectModule, TestHostNumberComponent],
        providers: [provideZonelessChangeDetection()]
      });

      const typedFixture = TestBed.createComponent(TestHostNumberComponent);
      fixture = typedFixture;
      hostComponent = typedFixture.componentInstance;
      hostComponent.value = 0;
      loader = TestbedHarnessEnvironment.loader(fixture);
      fixture.detectChanges();
      selectHarness = await loader.getHarness(SiSelectHarness);
    });

    it('should display active selection', async () => {
      hostComponent.value = 0;
      const [item] = await selectHarness.getSelectedItems();

      expect(await item.getIcon()).toBe('element-face-happy');
      expect(await item.getText()).toContain('Good');
    });

    it('should open dropdown on click', async () => {
      await selectHarness.open('click');
      expect(await selectHarness.getList()).not.toBeNull();
    });

    it('should open dropdown on enter', async () => {
      await selectHarness.open('enter');
      expect(await selectHarness.getList()).not.toBeNull();
    });

    it('should contain specified options', async () => {
      await selectHarness.open();
      const items = await selectHarness.getList().then(list => list!.getAllItems());

      expect(await items[0].getText()).toContain('Good');
      expect(await items[1].getText()).toContain('Average');
      expect(await items[2].getText()).toContain('Poor');
    });

    it('should select item and emit', async () => {
      await selectHarness.clickItemsByText('Poor');

      expect(await selectHarness.getSelectedTexts()).toEqual(['Poor']);
      expect(hostComponent.value).toBe(2);
      // Ensure placeholder text is not visible when items are selected
      expect(await selectHarness.getPlaceholder()).toBeUndefined();
    });
  });

  describe('as form control', () => {
    let component: FormHostComponent;

    beforeEach(async () => {
      TestBed.configureTestingModule({
        imports: [
          CommonModule,
          FormsModule,
          ReactiveFormsModule,
          SiSelectModule,
          FormHostComponent
        ],
        providers: [provideZonelessChangeDetection()]
      });

      const typedFixture = TestBed.createComponent(FormHostComponent);
      fixture = typedFixture;
      loader = TestbedHarnessEnvironment.loader(fixture);
      selectHarness = await loader.getHarness(SiSelectHarness);
      component = typedFixture.componentInstance;
    });

    it('should set the initial value', async () => {
      expect(await selectHarness.getSelectedTexts()).toEqual(['Average']);
    });

    it('updates the value in the form', async () => {
      await selectHarness.clickItemsByText('Poor');
      expect(component.form.controls.input.value).toBe('average'); // form will update after blur

      await selectHarness.blur();
      expect(component.form.controls.input.value).toEqual('poor');
    });

    it('shall be able to update the selected value via formControl', async () => {
      component.form.controls.input.setValue('poor');

      expect(await selectHarness.getSelectedTexts()).toEqual(['Poor']);
    });

    it('sets the disabled state', async () => {
      component.form.disable();
      expect(component.valueDirective().disabled()).toBeTrue();
      expect(await selectHarness.getTabindex()).toBe('-1');
    });
  });

  describe('multi select usage', () => {
    let hostComponent: TestHostMultiComponent;

    beforeEach(async () => {
      TestBed.configureTestingModule({
        imports: [SiSelectModule, TestHostMultiComponent],
        providers: [provideZonelessChangeDetection()]
      });

      const typedFixture = TestBed.createComponent(TestHostMultiComponent);
      fixture = typedFixture;
      hostComponent = typedFixture.componentInstance;
      hostComponent.values = ['average'];
      fixture.detectChanges();
      loader = TestbedHarnessEnvironment.loader(fixture);
      selectHarness = await loader.getHarness(SiSelectHarness);
    });

    it('should list all selected items', async () => {
      await selectHarness.clickItemsByText('Poor');
      await selectHarness.blur();

      expect(await selectHarness.getSelectedTexts()).toEqual(['Average', 'Poor']);
      expect(hostComponent.values).toEqual(['average', 'poor']);
      // Ensure placeholder text is not visible when items are selected
      expect(await selectHarness.getPlaceholder()).toBeUndefined();
    });

    it('should display placeholder text when no options are selected/provided', async () => {
      hostComponent.options = undefined;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      await selectHarness.open();
      const list = await selectHarness.getList()!;
      expect(list).toBeTruthy();
      const items = await list?.getAllItems();
      expect(items).toEqual([]);
      expect(await selectHarness.getPlaceholder()).toEqual('Select an option');
    });

    it('should show overflow item list', async () => {
      (fixture.debugElement.nativeElement as HTMLElement).style.width = '200px';
      const initialSelection = Object.assign([], hostComponent.values);
      await selectHarness.clickItemsByText(
        OPTIONS_LIST.filter(i => !initialSelection?.includes(i.value)).map(i => i.label ?? '')
      );
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      await fixture.whenStable();

      // cannot use jasmine.clock here
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(await selectHarness.getOverflowCount()).toBe(3);
    });

    it('should filter in grouped options', async () => {
      hostComponent.hasFilter = true;
      hostComponent.options = [
        {
          type: 'group',
          key: 'x',
          label: 'x',
          options: [
            { type: 'option', value: 'a', label: 'A' },
            { type: 'option', value: 'b', label: 'B' },
            { type: 'option', value: 'c', label: 'C' },
            { type: 'option', value: 'y', label: 'Y' }
          ]
        },
        {
          type: 'group',
          key: 'xy',
          label: 'xy',
          options: [
            { type: 'option', value: 'd', label: 'D' },
            { type: 'option', value: 'ab', label: 'Ab' }
          ]
        }
      ];
      hostComponent.values = ['a', 'ab'];

      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      await selectHarness.open('click');
      await selectHarness.getList().then(list => list!.sendKeys('y'));
      expect(await selectHarness.getList().then(list => list!.getAllItemTexts())).toEqual([
        'Y',
        'D',
        'Ab'
      ]);
      await selectHarness.clickItemsByText('D');
      expect(await selectHarness.getSelectedTexts()).toEqual(['A', 'D', 'Ab']);
    });

    it('should allow undefined options', async () => {
      hostComponent.options = undefined;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      await selectHarness.open();
      const list = await selectHarness.getList()!;
      expect(list).toBeTruthy();
      const items = await list?.getAllItems();
      expect(items).toEqual([]);
    });

    it('should update user selected value on option changes', async () => {
      await selectHarness.open();
      await selectHarness.clickItemsByText('Good');
      expect(await selectHarness.getSelectedTexts()).toEqual(['Good', 'Average']);
      hostComponent.options = [
        { type: 'option', value: 'GOOD', label: 'GOOD' },
        { type: 'option', value: 'aveRAGE', label: 'AveRAGE' },
        { type: 'option', value: 'poor', label: 'poor' }
      ];
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(await selectHarness.getSelectedTexts()).toEqual(['GOOD', 'AveRAGE']);
      // Options were changed after the selection, so si-select does not emit any changes.
      // It should only emit if the user changes something.
      expect(hostComponent.values).toEqual(['good', 'average']);
    });
  });

  describe('with custom actions', () => {
    let component: TestHostCustomActionComponent;

    beforeEach(async () => {
      TestBed.configureTestingModule({
        providers: [provideZonelessChangeDetection()]
      }).compileComponents();
      const typedFixture = TestBed.createComponent(TestHostCustomActionComponent);
      fixture = typedFixture;
      loader = TestbedHarnessEnvironment.loader(fixture);
      selectHarness = await loader.getHarness(SiSelectHarness);
      component = typedFixture.componentInstance;
    });

    it('should close drop down on custom action click', async () => {
      spyOn(component, 'actionClick');

      await selectHarness.clickActionByText({ text: 'close' });
      expect(await selectHarness.getList()).toBeNull();
      expect(component.actionClick).toHaveBeenCalled();
    });

    it("shouldn't close drop down on custom action click", async () => {
      spyOn(component, 'actionClick');
      await selectHarness.clickActionByText({ text: 'nothing' });
      expect(await selectHarness.getList()).toBeTruthy();
      expect(component.actionClick).toHaveBeenCalled();
    });
  });
});
