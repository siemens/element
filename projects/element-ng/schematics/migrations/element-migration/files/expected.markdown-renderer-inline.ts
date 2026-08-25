import { Component } from '@angular/core';
import { SiMarkdownComponent } from '@siemens/element-ng/markdown';

@Component({
  selector: 'app-markdown',
  imports: [SiMarkdownComponent],
  template: `<si-markdown [markdown]="content" />`
})
export class MarkdownComponent {
  readonly content = 'This is **bold**';
}
