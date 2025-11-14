/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  Input,
  Renderer2,
  ViewChild,
  DOCUMENT
} from '@angular/core';

import { WidgetConfig, WidgetInstance, WidgetInstanceEditor } from '../../model/widgets.model';

@Component({
  template: ''
})
export class SiWebComponentWrapperBaseComponent<T extends WidgetInstance | WidgetInstanceEditor>
  implements AfterViewInit
{
  private _config!: WidgetConfig;
  get config(): WidgetConfig {
    return this._config;
  }

  @Input() set config(config: WidgetConfig) {
    this._config = config;
    if (this.webComponent) {
      this.webComponent.config = config;
    }
  }

  @Input() elementTagName!: string;
  @Input() url!: string;
  @ViewChild('webComponentHost', { static: true, read: ElementRef })
  protected webComponentHost!: ElementRef;
  protected webComponent?: HTMLElement & T;

  private renderer2 = inject(Renderer2);
  private document = inject(DOCUMENT);

  ngAfterViewInit(): void {
    if (!this.isScriptLoaded(this.url)) {
      const script = this.renderer2.createElement('script');
      script.src = this.url;
      this.renderer2.appendChild(this.document.body, script);
    }

    this.webComponent = this.renderer2.createElement(this.elementTagName);
    if (this.webComponent) {
      this.webComponent.config = this.config;
    }
  }

  private isScriptLoaded(url: string): boolean {
    const script = document.querySelector(`script[src='${url}']`);
    return script ? true : false;
  }
}
