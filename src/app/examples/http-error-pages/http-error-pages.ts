/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { NgOptimizedImage } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiFormItemComponent } from '@siemens/element-ng/form';
import { SiInfoPageComponent } from '@siemens/element-ng/info-page';
import { SiTranslatePipe } from '@siemens/element-translate-ng/translate';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [
    SiInfoPageComponent,
    SiFormItemComponent,
    FormsModule,
    NgOptimizedImage,
    SiTranslatePipe
  ],
  templateUrl: './http-error-pages.html'
})
export class SampleComponent {
  protected readonly logEvent = inject(LOG_EVENT);

  protected readonly httpErrorPages = [
    {
      id: '404',
      heading: 'SI_HTTP_ERRORS.NOT_FOUND.HEADING',
      description: 'SI_HTTP_ERRORS.NOT_FOUND.DESCRIPTION',
      illustration: {
        alt: 'SI_HTTP_ERRORS.NOT_FOUND.ALT',
        src: './assets/images/magnifier.svg'
      },
      actions: [
        {
          title: 'Search app',
          action: () => this.logEvent('Search app clicked')
        },
        {
          title: 'Go back',
          action: () => this.logEvent('Go back clicked')
        }
      ]
    },
    {
      id: '504',
      heading: 'SI_HTTP_ERRORS.GATEWAY_TIMEOUT.HEADING',
      description: 'SI_HTTP_ERRORS.GATEWAY_TIMEOUT.DESCRIPTION',
      illustration: {
        alt: 'SI_HTTP_ERRORS.GATEWAY_TIMEOUT.ALT',
        src: './assets/images/hourglass.svg'
      },
      actions: [
        {
          title: 'Go back',
          action: () => this.logEvent('Go back clicked')
        },
        {
          title: 'Open homepage',
          action: () => this.logEvent('Open homepage clicked')
        }
      ]
    },
    {
      id: '401',
      heading: 'SI_HTTP_ERRORS.UNAUTHORIZED.HEADING',
      description: 'SI_HTTP_ERRORS.UNAUTHORIZED.DESCRIPTION',
      illustration: {
        alt: 'SI_HTTP_ERRORS.UNAUTHORIZED.ALT',
        src: './assets/images/lock.svg'
      },
      actions: [
        {
          title: 'Go back',
          action: () => this.logEvent('Go back clicked')
        },
        {
          title: 'Login',
          action: () => this.logEvent('Login clicked')
        }
      ]
    },
    {
      id: '500',
      heading: 'SI_HTTP_ERRORS.INTERNAL_SERVER_ERROR.HEADING',
      description: 'SI_HTTP_ERRORS.INTERNAL_SERVER_ERROR.DESCRIPTION',
      illustration: {
        alt: 'SI_HTTP_ERRORS.INTERNAL_SERVER_ERROR.ALT',
        src: './assets/images/plug.svg'
      },
      actions: [
        {
          title: 'Go back',
          action: () => this.logEvent('Go back clicked')
        },
        {
          title: 'Open homepage',
          action: () => this.logEvent('Open homepage clicked')
        }
      ]
    },
    {
      id: '400',
      heading: 'SI_HTTP_ERRORS.BAD_REQUEST.HEADING',
      description: 'SI_HTTP_ERRORS.BAD_REQUEST.DESCRIPTION',
      illustration: {
        alt: 'SI_HTTP_ERRORS.BAD_REQUEST.ALT',
        src: './assets/images/document.svg'
      },
      actions: [
        {
          title: 'Go back',
          action: () => this.logEvent('Go back clicked')
        },
        {
          title: 'Open homepage',
          action: () => this.logEvent('Open homepage clicked')
        }
      ]
    },
    {
      id: '418',
      heading: 'SI_HTTP_ERRORS.TEAPOT.HEADING',
      description: 'SI_HTTP_ERRORS.TEAPOT.DESCRIPTION',
      illustration: {
        alt: 'SI_HTTP_ERRORS.TEAPOT.ALT',
        src: './assets/images/teapot.svg'
      }
    }
  ];

  protected readonly selectedId = signal(this.httpErrorPages[0].id);
  protected readonly selectedPage = computed(() =>
    this.httpErrorPages.find(page => page.id === this.selectedId())!
  );
}
