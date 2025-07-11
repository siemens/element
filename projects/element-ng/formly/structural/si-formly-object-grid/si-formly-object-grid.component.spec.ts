/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormRecord, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormlyFieldConfig, FormlyFormOptions, FormlyModule } from '@ngx-formly/core';
import { SiFormModule } from '@siemens/element-ng/form';

import { SiFormlyObjectGridComponent } from './si-formly-object-grid.component';

@Component({
  selector: 'si-formly-test',
  imports: [ReactiveFormsModule, SiFormModule, FormlyModule],
  template: ` <formly-form [form]="form" [fields]="fields" [model]="model" [options]="options" /> `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class FormlyTestComponent {
  form = new FormRecord({});
  fields!: FormlyFieldConfig[];
  model: any;
  options!: FormlyFormOptions;
}

describe('formly grid  type', () => {
  let fixture: ComponentFixture<FormlyTestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        ReactiveFormsModule,
        SiFormModule,
        SiFormlyObjectGridComponent,
        FormlyModule.forRoot({
          types: [
            {
              name: 'grid',
              component: SiFormlyObjectGridComponent
            }
          ]
        }),
        FormlyTestComponent
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormlyTestComponent);
  });

  it('should have create a grid', () => {
    const componentInstance = fixture.componentInstance;
    componentInstance.fields = [
      {
        key: 'grid',
        type: 'grid',
        props: {
          gridConfig: [
            {
              columns: [{ fieldCount: 2 }, { fieldCount: 1 }]
            },
            {
              columns: [{ fieldCount: -1 }]
            }
          ]
        },
        fieldGroup: [
          { template: '<h1>r1c1a</h1>' },
          { template: '<h1>r1c1b</h1>' },
          { template: '<h1>r1c2</h1>' },
          { template: '<h1>r2c1a</h1>' },
          { template: '<h1>r2c1b</h1>' },
          { template: '<h1>r2c1c</h1>' }
        ]
      }
    ];
    fixture.detectChanges();

    /*
    Expecting following structure:
      container
        - row
          - col
            - formly-field
            - formly-field
          - col
            - formly-field
        - row
          - col
            - formly-field
            - formly-field
            - formly-field
    */
    const container = fixture.debugElement.query(By.css('.container'));
    expect(container).toBeTruthy();
    const rows = container.queryAll(By.css('.row'));
    expect(rows).toBeTruthy();
    expect(rows.length).toEqual(2);
    let row = rows[0];
    let cols = row.queryAll(By.css('.col'));
    expect(cols).toBeTruthy();
    expect(cols.length).toEqual(2);
    let fields = cols[0].queryAll(By.css('formly-field'));
    expect(fields).toBeTruthy();
    expect(fields.length).toEqual(2);
    let f: HTMLElement = fields[0].query(By.css('h1')).nativeElement;
    expect(f.innerHTML).toEqual('r1c1a');
    f = fields[1].query(By.css('h1')).nativeElement;
    expect(f.innerHTML).toEqual('r1c1b');

    fields = cols[1].queryAll(By.css('formly-field'));
    expect(fields).toBeTruthy();
    expect(fields.length).toEqual(1);
    f = fields[0].query(By.css('h1')).nativeElement;
    expect(f.innerHTML).toEqual('r1c2');

    row = rows[1];
    cols = row.queryAll(By.css('.col'));
    expect(cols).toBeTruthy();
    expect(cols.length).toEqual(1);
    fields = cols[0].queryAll(By.css('formly-field'));
    expect(fields).toBeTruthy();
    expect(fields.length).toEqual(3);
    expect(fields[0].query(By.css('h1')).nativeElement.innerHTML).toEqual('r2c1a');
    expect(fields[1].query(By.css('h1')).nativeElement.innerHTML).toEqual('r2c1b');
    expect(fields[2].query(By.css('h1')).nativeElement.innerHTML).toEqual('r2c1c');
  });

  it('should have create a grid using custom classes', () => {
    const componentInstance = fixture.componentInstance;
    componentInstance.fields = [
      {
        key: 'grid',
        type: 'grid',
        props: {
          containerClass: ['alt-container'],
          gridConfig: [
            {
              classes: ['alt-row'],
              columns: [
                { fieldCount: 2, classes: ['alt-col'] },
                { fieldCount: 1, classes: ['alt-col'] }
              ]
            },
            {
              classes: ['alt-row'],
              columns: [{ fieldCount: -1 }]
            }
          ]
        },
        fieldGroup: [
          { template: '<h1>r1c1a</h1>' },
          { template: '<h1>r1c1b</h1>' },
          { template: '<h1>r1c2</h1>' },
          { template: '<h1>r2c1a</h1>' },
          { template: '<h1>r2c1b</h1>' },
          { template: '<h1>r2c1c</h1>' }
        ]
      }
    ];
    fixture.detectChanges();

    /*
    Expecting following structure:
      alt-container
        - alt-row
          - alt-col
            - formly-field
            - formly-field
          - alt-col
            - formly-field
        - alt-row
          - col
            - formly-field
            - formly-field
            - formly-field
    */
    const container = fixture.debugElement.query(By.css('.alt-container'));
    expect(container).toBeTruthy();
    const rows = container.queryAll(By.css('.alt-row'));
    expect(rows).toBeTruthy();
    expect(rows.length).toEqual(2);
    let row = rows[0];
    let cols = row.queryAll(By.css('.alt-col'));
    expect(cols).toBeTruthy();
    expect(cols.length).toEqual(2);
    let fields = cols[0].queryAll(By.css('formly-field'));
    expect(fields).toBeTruthy();
    expect(fields.length).toEqual(2);
    let f: HTMLElement = fields[0].query(By.css('h1')).nativeElement;
    expect(f.innerHTML).toEqual('r1c1a');
    f = fields[1].query(By.css('h1')).nativeElement;
    expect(f.innerHTML).toEqual('r1c1b');

    fields = cols[1].queryAll(By.css('formly-field'));
    expect(fields).toBeTruthy();
    expect(fields.length).toEqual(1);
    f = fields[0].query(By.css('h1')).nativeElement;
    expect(f.innerHTML).toEqual('r1c2');

    row = rows[1];
    cols = row.queryAll(By.css('.col'));
    expect(cols).toBeTruthy();
    expect(cols.length).toEqual(1);
    fields = cols[0].queryAll(By.css('formly-field'));
    expect(fields).toBeTruthy();
    expect(fields.length).toEqual(3);
    expect(fields[0].query(By.css('h1')).nativeElement.innerHTML).toEqual('r2c1a');
    expect(fields[1].query(By.css('h1')).nativeElement.innerHTML).toEqual('r2c1b');
    expect(fields[2].query(By.css('h1')).nativeElement.innerHTML).toEqual('r2c1c');
  });
});
