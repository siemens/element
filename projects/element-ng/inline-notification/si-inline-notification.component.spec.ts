/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusType } from '@spike-rabbit/element-ng/common';
import { Link } from '@spike-rabbit/element-ng/link';
import { SiTranslateService } from '@spike-rabbit/element-ng/translate';
import { provideMockTranslateServiceBuilder } from '@spike-rabbit/element-translate-ng/translate';
import { of } from 'rxjs';

import { SiInlineNotificationComponent } from './index';

@Component({
  imports: [SiInlineNotificationComponent],
  template: `
    <si-inline-notification
      [severity]="severity"
      [heading]="heading"
      [message]="message"
      [action]="action"
      [translationParams]="translationParams"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestHostComponent {
  severity!: StatusType;
  heading = '';
  message = '';
  action!: Link;
  translationParams!: { [key: string]: any };
}

describe('SiInlineNotificationComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;
  let element: HTMLElement;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        provideMockTranslateServiceBuilder(
          () =>
            ({
              translate: (key: string, params: Record<string, any>) =>
                `translated=>${key}-${JSON.stringify(params)}`,
              translateAsync: (key: string, params: Record<string, any>) =>
                of(`translated=>${key}-${JSON.stringify(params)}`)
            }) as SiTranslateService
        )
      ]
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
  });

  it('should display the correct data', () => {
    component.severity = 'danger';
    component.heading = 'MSG.HEADING';
    component.message = 'MSG.MESSAGE';
    component.action = { title: 'MSG.ACTION' };
    component.translationParams = { param: 'something' };
    fixture.detectChanges();

    expect(element.querySelector<HTMLElement>('.alert strong')!.innerText).toBe(
      'translated=>MSG.HEADING-{"param":"something"}:'
    );
    expect(element.querySelector<HTMLElement>('div > span:not(.icon)')!.innerText).toBe(
      'translated=>MSG.MESSAGE-{"param":"something"}'
    );
    expect(element.querySelector<HTMLElement>('a')!.innerText).toBe(
      'translated=>MSG.ACTION-{"param":"something"}'
    );
    expect(element.querySelector('.alert.alert-danger')!.innerHTML).toBeDefined();
  });

  it('should display empty title', () => {
    component.severity = 'info';
    component.message = 'There is no Title';
    fixture.detectChanges();
    expect(element.querySelector('.alert strong')!).toBeNull();
  });
});
