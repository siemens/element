/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { SiEmptyStateComponent } from '@siemens/element-ng/empty-state';
import { SiWizardComponent, SiWizardStepComponent } from '@siemens/element-ng/wizard';
import { LOG_EVENT } from '@siemens/live-preview';
import { BehaviorSubject } from 'rxjs';

interface StepInfo {
  heading: string;
  icon: string;
  title: string;
}

@Component({
  selector: 'app-sample',
  imports: [AsyncPipe, SiWizardComponent, SiWizardStepComponent, SiEmptyStateComponent],
  templateUrl: './si-wizard-dynamical.html',
  host: { class: 'p-5' }
})
export class SampleComponent implements OnInit {
  logEvent = inject(LOG_EVENT);
  steps$ = new BehaviorSubject<StepInfo[]>([]);

  ngOnInit(): void {
    setTimeout(() => {
      this.steps$.next([
        {
          heading: 'Step 1',
          icon: 'element-occupied',
          title: 'Occupied'
        },
        {
          heading: 'Step 2',
          icon: 'element-home',
          title: 'Home'
        },
        {
          heading: 'Step 3',
          icon: 'element-unoccupied',
          title: 'Unoccupied'
        },
        {
          heading: 'Step 4',
          icon: 'element-unoccupied-alt',
          title: 'Unoccupied'
        },
        {
          heading: 'Step 5',
          icon: 'element-meeting',
          title: 'Meeting'
        },
        {
          heading: 'Step 6',
          icon: 'element-security-cam',
          title: 'Big brother'
        },
        {
          heading: 'Step 7',
          icon: 'element-oven-on',
          title: 'Bake a cake'
        },
        {
          heading: 'Step 8',
          icon: 'element-badge',
          title: 'Let me in'
        },
        {
          heading: 'Step 9',
          icon: 'element-power-pole',
          title: 'Power'
        }
      ]);
    }, 0);
  }
}
