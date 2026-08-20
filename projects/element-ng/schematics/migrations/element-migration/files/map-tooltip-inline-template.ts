import { Component } from '@angular/core';

@Component({
  selector: 'app-test',
  template: `
    <si-map [moreText]="moreText"></si-map>

    <si-map [moreText]="'and {{length}} more'">
      <si-map-tooltip></si-map-tooltip>
    </si-map>

    <si-map [moreText]="parentMoreText">
      <si-map-tooltip [moreText]="tooltipMoreText"></si-map-tooltip>
    </si-map>
  `
})
export class TestComponent {
  moreText = 'More locations';
  parentMoreText = 'Parent text';
  tooltipMoreText = 'Tooltip text';
}