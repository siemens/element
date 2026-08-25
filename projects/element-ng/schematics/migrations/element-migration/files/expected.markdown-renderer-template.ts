import { Component } from '@angular/core';
import { SiMarkdownComponent } from '@siemens/element-ng/markdown';

@Component({
  selector: 'app-markdown',
  imports: [SiMarkdownComponent],
  templateUrl: './test.component.html'
})
export class MarkdownComponent {}
