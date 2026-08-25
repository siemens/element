import { Component } from '@angular/core';
import { SiMarkdownRendererComponent } from '@siemens/element-ng/markdown-renderer';

@Component({
  selector: 'app-markdown',
  imports: [SiMarkdownRendererComponent],
  template: `<si-markdown-renderer [text]="content" />`
})
export class MarkdownComponent {
  readonly content = 'This is **bold**';
}
