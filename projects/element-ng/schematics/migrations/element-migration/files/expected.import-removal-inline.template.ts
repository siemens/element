import { Component } from '@angular/core';

@Component({
  selector: 'app-test',
  template: `<div>Test</div>`,
  standalone: true
})
export class TestComponent {
  trackByIdentity = buildTrackByIdentity<string>();
  trackByIndex = buildTrackByIndex<string>();
}
