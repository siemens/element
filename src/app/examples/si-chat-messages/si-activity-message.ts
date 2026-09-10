/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import {
  elementAi,
  elementChecked,
  elementDocument,
  elementFunction,
  elementGenerate,
  elementMaintenance,
  elementSearch,
  elementSelfLearning,
  elementSettings
} from '@siemens/element-icons';
import {
  SiActivityMessageComponent,
  SiActivityMessagePartComponent,
  SiActivityTraceComponent
} from '@siemens/element-ng/chat-messages';
import { addIcons } from '@siemens/element-ng/icon';
import { SiMarkdownComponent } from '@siemens/element-ng/markdown';

@Component({
  selector: 'app-sample',
  imports: [
    SiActivityMessageComponent,
    SiActivityMessagePartComponent,
    SiActivityTraceComponent,
    SiMarkdownComponent
  ],
  templateUrl: './si-activity-message.html'
})
export class SampleComponent {
  protected readonly icons = addIcons({
    elementAi,
    elementChecked,
    elementDocument,
    elementFunction,
    elementGenerate,
    elementMaintenance,
    elementSearch,
    elementSelfLearning,
    elementSettings
  });

  protected readonly summary = `I reviewed the available information and identified the main points:

- The request is focused on recent operational data
- Three relevant sources are available
- The final response should include a concise recommendation`;
}
