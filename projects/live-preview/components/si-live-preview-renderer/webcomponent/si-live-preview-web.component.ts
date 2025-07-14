/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  viewChild
} from '@angular/core';

import { SiLivePreviewConfig } from '../../../interfaces/live-preview-config';

@Component({
  selector: 'si-live-preview-webcomponent',
  template: '<div #root id="app"></div>'
})
export class SiLivePreviewWebComponent implements OnChanges {
  readonly root = viewChild.required('root', { read: ElementRef });
  @Input() loadReact = false;
  @Input() loadVue = false;
  @Input() loadJs = false;
  @Input() webcomponentTemplateCode = '';
  @Input() exampleUrl!: string;
  @Input() config!: SiLivePreviewConfig;
  @Output() readonly inProgress = new EventEmitter<boolean>();

  @HostBinding('class.live-preview-done') renderingDone = false;

  private reactRoot: any;
  private vueRoot: any;

  ngOnChanges(changes: SimpleChanges): void {
    this.reactRoot?.unmount();
    this.vueRoot?.unmount();
    if (
      changes.loadReact?.currentValue &&
      changes.loadReact?.currentValue !== changes.loadReact?.previousValue
    ) {
      this.loadReactFromCodeTemplate(this.webcomponentTemplateCode);
    }
    if (
      changes.loadVue?.currentValue &&
      changes.loadVue?.currentValue !== changes.loadVue?.previousValue
    ) {
      this.loadVueFromCodeTemplate(this.webcomponentTemplateCode);
    }
    if (
      changes.loadJs?.currentValue &&
      changes.loadJs?.currentValue !== changes.loadJs?.previousValue
    ) {
      this.loadHTMLFromCodeTemplate(this.webcomponentTemplateCode);
    }
  }

  loadReactFromCodeTemplate(code: string): void {
    this.setInProgress(true);
    import('react-dom/client').then(reactDom => {
      this.reactRoot = this.getDefault(reactDom).createRoot(this.root().nativeElement);
      const moduleInput = code;
      import('@babel/standalone').then(babel => {
        const output: any = this.getDefault(babel).transform(moduleInput, {
          presets: [
            // `modules: false` creates a module that can be imported
            ['env', { modules: false }],
            'react',
            ['typescript', { isTSX: true, allExtensions: true }]
          ],
          filename: 'example.ts'
        }).code;

        import('react').then(react => {
          window.React = this.getDefault(react);
          const dataUrl = 'data:text/javascript;base64,' + btoa(output);

          import(/* webpackIgnore: true  */ /* @vite-ignore */ dataUrl).then(module => {
            this.reactRoot.render(this.getDefault(react).createElement(module.default));
            setTimeout(() => this.setInProgress(false));
          });
        });
      });
    });
  }

  loadVueFromCodeTemplate(code: string): void {
    this.setInProgress(true);

    import('vue/dist/vue.esm-bundler.js' as any).then(vue => {
      (globalThis as any).__VUE_OPTIONS_API__ = true;
      (globalThis as any).__VUE_PROD_DEVTOOLS__ = false;
      (globalThis as any).Vue = vue;

      import('vue3-sfc-loader' as any).then(sfcLoader => {
        const options = {
          moduleCache: {
            vue
          },
          getFile: (url: any) => {
            return url === '/example.vue' ? Promise.resolve(code) : undefined;
          },
          addStyle: () => {
            /* unused here */
          }
        };
        const { loadModule } = this.getDefault(sfcLoader);
        this.vueRoot?.unmount();
        this.vueRoot = vue.createApp(
          vue.defineAsyncComponent(() => loadModule('/example.vue', options))
        );

        const root = this.root();
        if (document.body.contains(root.nativeElement)) {
          const div = document.createElement('div');
          div.id = 'vue_app';
          root.nativeElement.replaceChildren(div);
          this.vueRoot.mount('#vue_app');
        }

        setTimeout(() => this.setInProgress(false));
      });
    });
  }

  loadHTMLFromCodeTemplate(code: string): void {
    this.setInProgress(true);
    const scriptEl = document.createRange().createContextualFragment(code);
    this.root().nativeElement.append(scriptEl);
    this.setInProgress(false);
  }

  private setInProgress(inProgress: boolean): void {
    this.renderingDone = !inProgress;
    this.inProgress.emit(inProgress);
  }

  private getDefault<T extends Record<string, any>>(module: T): T {
    if ('default' in module) {
      return module.default as T;
    }
    return module;
  }
}
