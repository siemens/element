/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiFormItemComponent } from '@siemens/element-ng/form';
import { SiInfoPageComponent } from '@siemens/element-ng/info-page';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiInfoPageComponent, SiFormItemComponent, FormsModule],
  templateUrl: './http-error-pages.html',
  host: { class: 'p-5 pb-6' }
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);

  httpErrorPages = [
    {
      title: '404 Not Found',
      instructions: 'We’re not able to find that page. It may have been deleted or moved.',
      illustration: {
        alt: 'Not Found',
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
      title: '504 Gateway Timeout',
      instructions:
        'The server is taking too long to respond. Try again or change your timeout settings.',
      illustration: {
        alt: 'Gateway Timeout',
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
      title: '401 Unauthorized',
      instructions:
        'Authorization is required to access this page. Check your credentials and try again.',
      illustration: {
        alt: 'Unauthorized',
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
      title: '500 Internal Server Error',
      instructions:
        'This page is not available right now. Try refreshing the page or try again later.',
      illustration: {
        alt: 'Internal Server Error',
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
      title: '400 Bad Request',
      instructions: 'Failed to process the request. Check your request and try again.',
      illustration: {
        alt: 'Bad Request',
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
      title: "I'm teapot",
      instructions: 'The server refuses to brew coffee because, well...is a teapot.',
      illustration: {
        alt: "I'm teapot",
        src: './assets/images/teapot.svg'
      }
    }
  ];

  protected readonly selectedTitle = signal(this.httpErrorPages[0].title);
  protected readonly selectedPage = computed(() =>
    this.httpErrorPages.find(page => page.title === this.selectedTitle())!
  );
}
