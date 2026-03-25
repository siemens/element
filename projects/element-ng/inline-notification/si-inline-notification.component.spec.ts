/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusType } from '@siemens/element-ng/common';
import { Link } from '@siemens/element-ng/link';
import { SiTranslateService } from '@siemens/element-ng/translate';
import { provideMockTranslateServiceBuilder } from '@siemens/element-translate-ng/translate';
import { of } from 'rxjs';

import { SiInlineNotificationComponent } from './index';

describe('SiInlineNotificationComponent', () => {
  let fixture: ComponentFixture<SiInlineNotificationComponent>;
  let element: HTMLElement;
  let severity: WritableSignal<StatusType>;
  let heading: WritableSignal<string>;
  let message: WritableSignal<string>;
  let action: WritableSignal<Link | undefined>;
  let translationParams: WritableSignal<{ [key: string]: any } | undefined>;

  beforeEach(() =>
    TestBed.configureTestingModule({
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
    severity = signal('info');
    heading = signal('');
    message = signal('');
    action = signal(undefined);
    translationParams = signal(undefined);
    fixture = TestBed.createComponent(SiInlineNotificationComponent, {
      bindings: [
        inputBinding('severity', severity),
        inputBinding('heading', heading),
        inputBinding('message', message),
        inputBinding('action', action),
        inputBinding('translationParams', translationParams)
      ]
    });
    element = fixture.nativeElement;
  });

  it('should display the correct data', () => {
    severity.set('danger');
    heading.set('MSG.HEADING');
    message.set('MSG.MESSAGE');
    action.set({ title: 'MSG.ACTION' });
    translationParams.set({ param: 'something' });
    fixture.detectChanges();

    expect(element.querySelector<HTMLElement>('.alert strong')!).toHaveTextContent(
      'translated=>MSG.HEADING-{"param":"something"}'
    );
    expect(element.querySelector<HTMLElement>('div > span:not(.icon)')!).toHaveTextContent(
      'translated=>MSG.MESSAGE-{"param":"something"}'
    );
    expect(element.querySelector<HTMLElement>('a')!).toHaveTextContent(
      'translated=>MSG.ACTION-{"param":"something"}'
    );
    expect(element.querySelector('.alert.alert-danger')!.innerHTML).toBeDefined();
  });

  it('should display empty title', () => {
    severity.set('info');
    message.set('There is no Title');
    fixture.detectChanges();
    expect(element.querySelector('.alert strong')).not.toBeInTheDocument();
  });
});
