/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, inject } from '@angular/core';
import {
  elementAhuPlant,
  elementLightOn,
  elementFireSensor,
  elementElevator,
  elementOptionsVertical
} from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiIconComponent],
  templateUrl: './list-variants.html',
  host: { class: 'p-5' }
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);

  icons = addIcons({
    elementAhuPlant,
    elementLightOn,
    elementFireSensor,
    elementElevator,
    elementOptionsVertical
  });

  readonly items = [
    {
      icon: this.icons.elementAhuPlant,
      title: 'HVAC Zone Controller Lobby'
    },
    {
      icon: this.icons.elementLightOn,
      title: 'Lighting Controller Parking Garage'
    },
    {
      icon: this.icons.elementFireSensor,
      title: 'Fire Alarm Panel East Wing'
    },
    {
      icon: this.icons.elementElevator,
      title: 'Elevator Motor Room Sensor'
    }
  ];
}
