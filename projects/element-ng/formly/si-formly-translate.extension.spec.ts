/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { TestBed } from '@angular/core/testing';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { SiTranslateService } from '@siemens/element-ng/translate';
import { provideMockTranslateServiceBuilder } from '@siemens/element-translate-ng/translate';
import { of } from 'rxjs';

import { SiFormlyTranslateExtension } from './si-formly-translate.extension';

describe('Formly translations', () => {
  let extension: SiFormlyTranslateExtension;
  let mockTranslationService: jasmine.SpyObj<SiTranslateService>;

  beforeEach(() => {
    mockTranslationService = jasmine.createSpyObj<SiTranslateService>(['translateAsync']);
    mockTranslationService.translateAsync.and.returnValue(of('translated'));
    TestBed.configureTestingModule({
      providers: [provideMockTranslateServiceBuilder(() => mockTranslationService)]
    });
    extension = TestBed.runInInjectionContext(() => new SiFormlyTranslateExtension());
  });

  it('should not be called if translate is prohibited', () => {
    const cfg = {
      props: {
        label: 'foo',
        description: 'bar',
        translate: false
      }
    };
    extension.prePopulate(cfg);
    expect(mockTranslationService.translateAsync).not.toHaveBeenCalled();
  });

  it('should not be called if translate is already done', () => {
    const cfg = {
      props: {
        label: 'foo',
        description: 'bar',
        _translated: true
      }
    };
    extension.prePopulate(cfg);
    expect(mockTranslationService.translateAsync).not.toHaveBeenCalled();
  });

  it('should translate the label and description', () => {
    const cfg: FormlyFieldConfig = {
      props: {
        label: 'foo',
        description: 'bar'
      }
    };
    extension.prePopulate(cfg);
    expect(mockTranslationService.translateAsync.calls.argsFor(0)).toEqual(['foo']);
    expect(mockTranslationService.translateAsync.calls.argsFor(1)).toEqual(['bar']);

    expect(cfg.expressions).toBeTruthy();
    expect(cfg.expressions?.['props.label']).toBeTruthy();
    expect(cfg.expressions?.['props.description']).toBeTruthy();
  });

  it('should set the translated property', () => {
    const cfg = {
      props: {
        label: 'foo',
        description: 'bar',
        _translated: false
      }
    };
    extension.prePopulate(cfg);
    expect(cfg.props?.['_translated']).toBeTrue(); //eslint-disable-line @typescript-eslint/dot-notation
  });

  it('should translate a label', () => {
    const cfg: FormlyFieldConfig = {
      props: {
        label: 'lbltxt'
      }
    };
    extension.prePopulate(cfg);
    expect(mockTranslationService.translateAsync).toHaveBeenCalledWith('lbltxt');
    expect(cfg.expressions).toBeTruthy();
    expect(cfg.expressions?.['props.label']).toBeTruthy();
  });

  it('should translate a label', () => {
    const cfg: FormlyFieldConfig = {
      props: {
        description: 'descriptiontxt'
      }
    };
    extension.prePopulate(cfg);
    expect(mockTranslationService.translateAsync).toHaveBeenCalledWith('descriptiontxt');
    expect(cfg.expressions).toBeTruthy();
    expect(cfg.expressions?.['props.description']).toBeTruthy();
  });

  it('should translate a placeholder', () => {
    const cfg: FormlyFieldConfig = {
      props: {
        placeholder: 'phtxt'
      }
    };
    extension.prePopulate(cfg);
    expect(mockTranslationService.translateAsync).toHaveBeenCalledWith('phtxt');
    expect(cfg.expressions).toBeTruthy();
    expect(cfg.expressions?.['props.placeholder']).toBeTruthy();
  });

  it('should translate options', () => {
    const cfg: FormlyFieldConfig = {
      props: {
        options: [
          { label: 'l1', value: '1' },
          { label: 'l2', value: '1' },
          { label: 'l3', value: '1' },
          { label: 'l4', value: '1' }
        ]
      }
    };
    extension.prePopulate(cfg);
    expect(mockTranslationService.translateAsync.calls.argsFor(0)).toEqual(['l1']);
    expect(mockTranslationService.translateAsync.calls.argsFor(1)).toEqual(['l2']);
    expect(mockTranslationService.translateAsync.calls.argsFor(2)).toEqual(['l3']);
    expect(mockTranslationService.translateAsync.calls.argsFor(3)).toEqual(['l4']);

    expect(cfg.expressions?.['props.options.0.label']).toBeTruthy();
    expect(cfg.expressions?.['props.options.1.label']).toBeTruthy();
    expect(cfg.expressions?.['props.options.2.label']).toBeTruthy();
    expect(cfg.expressions?.['props.options.3.label']).toBeTruthy();
  });

  it('should translate validation messages', () => {
    const cfg: FormlyFieldConfig = {
      validation: {
        messages: {
          'required': 'reqMsg'
        }
      }
    };
    extension.prePopulate(cfg);
    expect(mockTranslationService.translateAsync).toHaveBeenCalledWith('reqMsg');
    expect(cfg.expressions).toBeTruthy();
    expect(cfg.expressions?.['validation.messages.required']).toBeTruthy();
  });
});
