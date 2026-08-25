import { Component } from '@angular/core';
import { SiMarkdownRendererComponent } from '@siemens/element-ng/markdown-renderer';

@Component({
  selector: 'app-markdown',
  imports: [SiMarkdownRendererComponent],
  templateUrl: './test.component.html'
})
export class MarkdownComponent {}
