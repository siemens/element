import { Component } from '@angular/core';
import { SiWizardModule } from '@siemens/element-ng/wizard';

@Component({
  selector: 'app-sample',
  template:`<si-wizard >
  <si-wizard-step heading="Step 1">
    <h1 class="text-center">Step 1</h1>
  </si-wizard-step>
  <si-wizard-step heading="Step 2">
    <h1 class="text-center">Step 2</h1>
  </si-wizard-step>
</si-wizard>
`,
  imports: [SiWizardModule],
  standalone: true
})
export class SampleComponent {}
