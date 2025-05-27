/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, waitForAsync } from '@angular/core/testing';
import { SiTranslateModule } from '@siemens/element-translate-ng/translate';

import { SiFormItemComponent } from './si-form-item.component';

@Component({
  template: `
    <si-form-item [label]="label()">
      <input type="text" id="name" class="form-control" />
    </si-form-item>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SiTranslateModule, SiFormItemComponent]
})
export class TestHostComponent {
  readonly formItem = viewChild.required(SiFormItemComponent);
  readonly label = signal<string | null | undefined>(null);
}

describe('SiFormItemComponent', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  const getLabel = (): HTMLElement | null => {
    return fixture.nativeElement.querySelector('label');
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SiTranslateModule, TestHostComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', fakeAsync(() => {
    expect(component).toBeDefined();
    expect(getLabel()).toBeDefined();
  }));

  it('should display the bound label value', () => {
    component.label.set('Testlabel');
    fixture.detectChanges();
    expect(getLabel()?.textContent).toContain(component.formItem().label());
  });

  it('should not display label colon with no label set', () => {
    fixture.detectChanges();
    expect(getLabel()).toBeFalsy();
  });

  it('should not display label colon with empty label set', () => {
    component.label.set('');
    fixture.detectChanges();
    expect(getLabel()).toBeFalsy();
  });

  it('should not display label colon with undefined label set', () => {
    component.label.set(undefined);
    fixture.detectChanges();
    expect(getLabel()).toBeFalsy();
  });

  it('should not display label colon with null label set', () => {
    component.label.set(null);
    fixture.detectChanges();
    expect(getLabel()).toBeFalsy();
  });
});
