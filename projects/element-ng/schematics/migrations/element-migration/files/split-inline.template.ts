import { Component } from '@angular/core';
import { SiSplitModule } from '@siemens/element-ng/split';

@Component({
  selector: 'app-sample',
  template: `<si-split class="si-layout-fixed-height" [orientation]="'horizontal'" [sizes]="[20, 60, 20]">
    <si-split-part
      heading="Filters"
      collapseDirection="start"
      class="bg-base-1"
      [minSize]="100" [headerStatusColor]="'success'" [headerStatusIconClass]="'si-icon-users'">
      <p class="p-4 text-secondary">Split Part #1</p>
    </si-split-part>
    <si-split-part heading="Employees" collapseDirection="start" class="bg-base-1" [headerStatusColor]="'success'" [headerStatusIconClass]="'si-icon-users'" [minSize]="200">
      <div class="si-layout-fixed-height justify-content-center bg-secondary">
        <p class="text-center text-inverse">Split Part with resizable content!</p>
      </div>
    </si-split-part>
  </si-split>`,
  imports: [SiSplitModule],
  standalone: true
})
export class SampleComponent {}
