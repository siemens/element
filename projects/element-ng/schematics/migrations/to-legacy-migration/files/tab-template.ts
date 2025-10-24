import { Component } from '@angular/core';
import { SiTabComponent, SiTabsetComponent } from '@siemens/element-ng/tabs';

@Component({
  selector: 'si-migration',
  imports: [SiTabComponent, SiTabsetComponent],
  templateUrl: './tab-template.html'
})
export class TemplateComponent {
  readonly selectedTabIndex = 0;
}
