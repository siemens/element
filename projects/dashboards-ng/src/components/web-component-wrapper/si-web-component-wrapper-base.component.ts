/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  Input,
  Renderer2,
  ViewChild
} from '@angular/core';

import { WidgetConfig } from '../../model/widgets.model';

@Component({
  template: ''
})
export class SiWebComponentWrapperBaseComponent implements AfterViewInit {
  private _config!: WidgetConfig;
  get config(): WidgetConfig {
    return this._config;
  }

  @Input() set config(config: WidgetConfig) {
    this._config = config;
    if (this.webComponentHost.nativeElement.children.length > 0) {
      this.webComponentHost.nativeElement.children[0].config = config;
    }
  }

  @Input() elementTagName!: string;
  @Input() url!: string;
  @ViewChild('webComponentHost', { static: true, read: ElementRef })
  protected webComponentHost!: ElementRef;
  protected webComponent?: HTMLElement;

  private renderer2 = inject(Renderer2);
  private document = inject(DOCUMENT);

  ngAfterViewInit(): void {
    if (!this.isScriptLoaded(this.url)) {
      const script = this.renderer2.createElement('script');
      script.src = this.url;
      this.renderer2.appendChild(this.document.body, script);
    }

    this.webComponent = this.renderer2.createElement(this.elementTagName);
    (this.webComponent as any).config = this.config;
  }

  private isScriptLoaded(url: string): boolean {
    const script = document.querySelector(`script[src='${url}']`);
    return script ? true : false;
  }
}
