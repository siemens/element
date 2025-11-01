/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { SiToolMessageComponent } from '@siemens/element-ng/chat-messages';

@Component({
  selector: 'app-sample',
  imports: [SiToolMessageComponent],
  templateUrl: './si-tool-message.html'
})
export class SampleComponent {
  toolName = 'fetch_weather_data';

  inputArguments = {
    location: 'San Francisco, CA',
    units: 'metric'
  };

  output = {
    temperature: 18,
    condition: 'partly_cloudy',
    humidity: 65
  };
}
