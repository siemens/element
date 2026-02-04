import { Component, ViewChild } from '@angular/core';
import { SiMapComponent } from '@siemens/maps-ng';

@Component({
  selector: 'app-map',
  standalone: true,
  template: `
    <si-map
      #map
      [center]="center"
      [zoom]="12"
      (onResize)="handleResize()"
    >
    </si-map>
    <button (click)="triggerResize()">Resize</button>
  `
})
export class MapComponent {
  @ViewChild('map') mapComponent!: SiMapComponent;
  center = { lat: 40.7128, lng: -74.0060 };

  triggerResize() {
    // This method call should be removed as it has no effect
    this.mapComponent.onResize();
  }

  handleResize() {
    console.log('Map resized');
  }
}
