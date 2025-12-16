import { Component } from '@angular/core';
import { buildTrackByIdentity, buildTrackByIndex } from '@siemens/element-ng/common';

@Component({
  selector: 'app-test',
  template: `<div>Test</div>`,
  standalone: true
})
export class TestComponent {
  trackByIdentity = buildTrackByIdentity<string>();
  trackByIndex = buildTrackByIndex<string>();
}
