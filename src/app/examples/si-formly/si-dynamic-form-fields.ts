/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormRecord } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { DatepickerInputConfig } from '@siemens/element-ng/datepicker';
import { SiFormModule } from '@siemens/element-ng/form';
import { SiFormlyModule } from '@siemens/element-ng/formly';

@Component({
  selector: 'app-sample',
  templateUrl: './si-dynamic-form-fields.html',
  imports: [CommonModule, SiFormModule, SiFormlyModule]
})
export class SampleComponent {
  form = new FormRecord({});
  dateConfig: DatepickerInputConfig = {
    minDate: new Date('8.5.2021'),
    showTime: true,
    showSeconds: true,
    mandatoryTime: true
  };
  model = {
    text: 'lorem ipsum',
    textIcon: 'Input with icon for additional information tooltip',
    numberInput: 5.5,
    password: 'dolor',
    email: 'john.doe@example.org',
    textarea: 'lorem\nipsum\ndolor',
    checkbox: true,
    multiCheckbox: {
      '#1': true,
      '#2': false,
      '#3': true,
      '#4': false
    },
    numberNew: 20,
    radio: '#3',
    customSelectMultiSelect: ['good', 'poor'],
    select: 'reykjavik',
    date: new Date(),
    datetime: '2021-08-12T05:22:54Z',
    time: new Date('2021-08-12T05:22:54'),
    textdisplay: 'Read only text',
    daterange: {
      start: new Date('2021-08-12T05:22:54Z'),
      end: new Date(new Date('2021-08-12T05:22:54Z').setFullYear(new Date().getFullYear() + 1))
    },
    customSelect: undefined,
    ipV4Address: '192.168.0.1',
    ipV4AddressCIDR: '192.168.0.1/24',
    ipV6Address: '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
    ipV6CIDRAddress: '2001:0db8:85a3:0000:0000:8a2e:0370:7334/64',
    card_text: 'sample card body value'
  };
  tmpFields: FormlyFieldConfig[] = [
    {
      key: 'textdisplay',
      type: 'textdisplay',
      wrappers: ['form-field'],
      props: {
        label: 'Display only text'
      }
    },
    {
      key: 'text',
      type: 'input',
      props: {
        required: true,
        label: 'Text input'
      },
      validation: {
        show: true,
        messages: {
          required: (error, field: FormlyFieldConfig) => {
            return `Please enter some text`;
          }
        }
      }
    },
    {
      key: 'textIcon',
      type: 'input',
      wrappers: ['form-field', 'icon-wrapper'],
      props: {
        label: 'Icon input',
        icon: 'element-link',
        iconSize: 24, // defaults to 24px
        iconTooltip: 'Translatable Text like "foo.bar.SOME_KEY"'
      }
    },
    {
      key: 'numberInput',
      type: 'input',
      props: {
        type: 'number',
        label: 'Number input',
        min: 0,
        max: 100,
        step: 0.1
      }
    },
    {
      key: 'password',
      type: 'password',
      props: {
        type: 'password',
        required: true,
        label: 'Password input'
      },
      validation: {
        show: true,
        messages: {
          required: (error, field: FormlyFieldConfig) => {
            return `Please enter a password`;
          },
          siPasswordStrength: (error, field: FormlyFieldConfig) => {
            return `Please enter a stronger password`;
          }
        }
      }
    },
    {
      key: 'email',
      type: 'input',
      props: {
        type: 'email',
        label: 'Email input'
      }
    },
    {
      key: 'numberNew',
      type: 'number',
      props: {
        type: 'number',
        label: 'Number Input',
        numberStep: 0.2,
        showButtons: true
      }
    },
    {
      template: '<hr>'
    },
    {
      template: `
        <p>The date and datetime component is derived from <code>SiDatePickerComponent</code>
        and supports same configurations as <code>SiDatePickerInputConfig</code></p>
        <p>The fields are displaying their model value in local time zone</p>
      `
    },
    {
      key: 'date',
      type: 'date',
      props: {
        label: 'Date',
        dateFormat: 'date'
      }
    },
    {
      key: 'datetime',
      type: 'datetime',
      props: {
        label: 'Datetime',
        placeholder: 'Enter a date',
        dateConfig: this.dateConfig,
        required: true
      },
      validation: {
        show: true,
        messages: {
          required: (error, field: FormlyFieldConfig) => {
            return `Please enter a date`;
          },
          invalidMinDate: (error, field: FormlyFieldConfig) => {
            return `Please enter a date after ${error.min}`;
          }
        }
      }
    },
    {
      key: 'daterange',
      type: 'date-range',
      props: {
        label: 'Daterange',
        startPlaceholder: 'Enter start date',
        endPlaceholder: 'Enter end date',
        autoClose: true,
        siDatepickerConfig: {
          enableTwoMonthDateRange: true,
          showTime: true,
          showSeconds: false,
          showMilliseconds: false,
          disabledTime: true,
          mandatoryTime: false
        }
      }
    },
    {
      template: `
        <p>The time component is derived from <code>SiTimepickerComponent</code>
        <p>The fields are displaying their model value in local time zone</p>
      `
    },
    {
      key: 'time',
      type: 'time',
      props: {
        label: 'Time',
        timeConfig: {
          showSeconds: true,
          showMilliseconds: true,
          showMeridian: undefined
        }
      }
    },
    {
      template: '<hr>'
    },
    {
      key: 'textarea',
      type: 'textarea',
      props: {
        autoGrow: true,
        resizable: true,
        maxHeight: '100px',
        label: 'Textarea'
      }
    },
    {
      key: 'checkbox',
      type: 'checkbox',
      props: {
        label: 'Checkbox'
      }
    },
    {
      key: 'checkbox_left',
      type: 'checkbox',
      props: {
        label: 'Checkbox #2',
        labelWidth: 1
      }
    },
    {
      template: '<hr>'
    },
    {
      key: 'multiCheckbox',
      type: 'multicheckbox',
      props: {
        label: 'Multi-Checkbox',
        options: [
          { label: 'Option #1', value: '#1' },
          { label: 'Option #2', value: '#2' },
          { label: 'Option #3', value: '#3' },
          { label: 'Option #4', value: '#4' }
        ]
      }
    },
    {
      template: '<hr>'
    },
    {
      key: 'radio',
      type: 'radio',
      props: {
        label: 'Radio',
        options: [
          { label: 'Option #1', value: '#1' },
          { label: 'Option #2', value: '#2' },
          { label: 'Option #3', value: '#3' },
          { label: 'Option #4', value: '#4' }
        ]
      }
    },
    {
      template: '<hr>'
    },
    {
      key: 'customSelect',
      type: 'si-select',
      props: {
        type: 'si-select',
        required: true,
        label: 'si-select',
        optionsList: [
          { id: 'good', icon: 'element-face-happy', color: 'status-success', title: 'Good' },
          {
            id: 'average',
            icon: 'element-face-neutral',
            color: 'status-warning',
            title: 'Average'
          },
          { id: 'poor', icon: 'element-face-unhappy', color: 'status-danger', title: 'Poor' },
          {
            id: 'unhealthy',
            icon: 'element-face-very-unhappy',
            color: 'status-critical',
            title: 'Unhealthy',
            disabled: true
          }
        ]
      },
      validation: {
        show: true,
        messages: {
          required: (error, field: FormlyFieldConfig) => {
            return `Please choose an option`;
          }
        }
      }
    },
    {
      key: 'customSelectMultiSelect',
      type: 'si-select',
      props: {
        type: 'si-select',
        label: 'si-select multi',
        multi: true,
        hasFilter: true,
        optionsList: [
          { id: 'good', icon: 'element-face-happy', color: 'status-success', title: 'Good' },
          {
            id: 'average',
            icon: 'element-face-neutral',
            color: 'status-warning',
            title: 'Average'
          },
          { id: 'poor', icon: 'element-face-unhappy', color: 'status-danger', title: 'Poor' },
          {
            id: 'unhealthy',
            icon: 'element-face-very-unhappy',
            color: 'status-critical',
            title: 'Unhealthy',
            disabled: true
          }
        ]
      }
    },
    {
      key: 'select',
      type: 'select',
      props: {
        label: 'Select',
        options: [
          { label: 'Rome', value: 'rome' },
          { label: 'Berlin', value: 'berlin' },
          { label: 'Reykjavík', value: 'reykjavik' },
          { label: 'Helsinki', value: 'helsinki' }
        ]
      }
    },
    {
      template: '<hr>'
    },
    {
      key: 'ipV4Address',
      type: 'ipv4',
      props: {
        label: 'IPv4 Address',
        placeholder: 'Enter a IPv4 address',
        required: true
      },
      validation: {
        show: true,
        messages: {
          required: (error, field: FormlyFieldConfig) => {
            return `Please enter a IPv4 address`;
          },
          ipv4Address: (error, field: FormlyFieldConfig) => {
            return `Invalid IPv4 address`;
          }
        }
      }
    },
    {
      key: 'ipV4AddressCIDR',
      type: 'ipv4',
      props: {
        cidr: true,
        label: 'IPv4 Address with CIDR',
        placeholder: 'Enter a IPv4 address with subnet mask',
        required: true
      },
      validation: {
        show: true,
        messages: {
          required: (error, field: FormlyFieldConfig) => {
            return `Please enter a IPv4 address`;
          },
          ipv4Address: (error, field: FormlyFieldConfig) => {
            return `Invalid IPv4 CIDR address`;
          }
        }
      }
    },
    {
      key: 'ipV6Address',
      type: 'ipv6',
      props: {
        label: 'IPv6 Address',
        placeholder: 'Enter a IPv6 address',
        required: true
      },
      validation: {
        show: true,
        messages: {
          required: (error, field: FormlyFieldConfig) => {
            return `Please enter a IPv6 address`;
          },
          ipv6Address: (error, field: FormlyFieldConfig) => {
            return `Invalid IPv6 address`;
          }
        }
      }
    },
    {
      key: 'ipV6CIDRAddress',
      type: 'ipv6',
      props: {
        label: 'IPv6 CIDR Address',
        cidr: true,
        placeholder: 'Enter a IPv6 address',
        required: true
      },
      validation: {
        show: true,
        messages: {
          required: (error, field: FormlyFieldConfig) => {
            return `Please enter a IPv6 address`;
          },
          ipv6Address: (error, field: FormlyFieldConfig) => {
            return `Invalid IPv6 address`;
          }
        }
      }
    },
    {
      template: '<hr><h2>Buttons</h2>'
    },
    {
      key: 'btn_func',
      type: 'button',
      wrappers: ['form-field'],
      props: {
        hideLabel: true, // Hide wrapper label
        label: 'Button function handler',
        clickListener: (a: string, b: string) => {
          alert(
            `Button with function as listener receiving configurable Params a: "${a}" and b: "${b}"`
          );
        },
        clickArgs: ['stringParam', 42]
      }
    },
    {
      key: 'btn_exp',
      type: 'button',
      wrappers: ['form-field'],
      props: {
        hideLabel: true, // Hide wrapper label
        label: 'Button expression handler',
        clickListener: 'formState.btnClicked',
        clickArgs: ['1st', 23]
      }
    },
    {
      key: 'btn_prim',
      type: 'button',
      wrappers: ['form-field'],
      props: {
        hideLabel: true, // Hide wrapper label
        label: 'Primary',
        clickListener: 'formState.btnClicked',
        clickArgs: ['primary', 23],
        btnType: 'primary'
      }
    },
    {
      key: 'btn_sec',
      type: 'button',
      wrappers: ['form-field'],
      props: {
        hideLabel: true, // Hide wrapper label
        label: 'Secondary (Default)',
        clickListener: 'formState.btnClicked',
        clickArgs: ['secondary', 23],
        btnType: 'secondary'
      }
    },
    {
      key: 'btn_tert',
      type: 'button',
      wrappers: ['form-field'],
      props: {
        hideLabel: true, // Hide wrapper label
        label: 'Tertiary',
        clickListener: 'formState.btnClicked',
        clickArgs: ['tertiary', 23],
        btnType: 'tertiary'
      }
    },
    {
      key: 'btn_warn',
      type: 'button',
      wrappers: ['form-field'],
      props: {
        hideLabel: true, // Hide wrapper label
        label: 'Warning',
        clickListener: 'formState.btnClicked',
        clickArgs: ['warning', 23],
        btnType: 'warning'
      }
    },
    {
      key: 'btn_danger',
      type: 'button',
      wrappers: ['form-field'],
      props: {
        hideLabel: true, // Hide wrapper label
        label: 'Danger',
        clickListener: 'formState.btnClicked',
        clickArgs: ['danger', 23],
        btnType: 'danger'
      }
    },
    {
      template: '<hr><h2>Custom Wrapper</h2>'
    },
    {
      key: 'card_text',
      type: 'textdisplay',
      wrappers: ['custom-wrapper'],
      props: {
        heading: 'Sample card header'
      }
    }
  ];
  fieldsTmpl = JSON.parse(JSON.stringify(this.tmpFields));
  fields = this.tmpFields;
  options: FormlyFormOptions = {
    formState: {
      btnClicked: (a: string, b: string) => {
        alert(
          `Button with expression listener receiving configurable Params a: "${a}" and b: "${b}"`
        );
      }
    }
  };
}
