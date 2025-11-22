import { Component } from '@angular/core';
import { SimplElementNgModule } from '@simpl/element-ng';
import { SomeOtherModule} from '@simpl/element-ng/some-other-module';

@Component({
  selector: 'app-test',
  imports: [SimplElementNgModule, SomeOtherModule],
  template: ''
})
export class MyComponent {}
