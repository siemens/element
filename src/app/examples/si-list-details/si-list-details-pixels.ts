/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, signal } from '@angular/core';
import {
  SiDetailsPaneBodyComponent,
  SiDetailsPaneComponent,
  SiDetailsPaneHeaderComponent,
  SiListDetailsComponent,
  SiListPaneBodyComponent,
  SiListPaneComponent,
  SiListPaneHeaderComponent
} from '@siemens/element-ng/list-details';

interface Equipment {
  id: string;
  name: string;
  location: string;
  status: string;
}

@Component({
  selector: 'app-sample',
  imports: [
    SiListDetailsComponent,
    SiListPaneComponent,
    SiListPaneHeaderComponent,
    SiListPaneBodyComponent,
    SiDetailsPaneComponent,
    SiDetailsPaneHeaderComponent,
    SiDetailsPaneBodyComponent
  ],
  templateUrl: './si-list-details-pixels.html',
  host: {
    class: 'si-layout-fixed-height'
  }
})
export class SampleComponent {
  readonly equipment: Equipment[] = [
    {
      id: 'AHU-01',
      name: 'Air handling unit',
      location: 'Roof, Building A',
      status: 'Running'
    },
    {
      id: 'RC-02',
      name: 'Room controller',
      location: 'Room 204, Building A',
      status: 'Connected'
    },
    {
      id: 'HP-03',
      name: 'Heat pump',
      location: 'Plant room, Building B',
      status: 'Standby'
    }
  ];
  readonly selectedEquipment = signal(this.equipment[0]!);
  readonly detailsActive = signal(false);

  selectEquipment(equipment: Equipment): void {
    this.selectedEquipment.set(equipment);
    this.detailsActive.set(true);
  }
}
