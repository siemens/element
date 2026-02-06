import { Component, inject } from '@angular/core';
import { SI_DASHBOARD_CONFIGURATION } from '@siemens/dashboards-ng';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `<div>Dashboard</div>`
})
export class DashboardComponent {
  private config = inject(SI_DASHBOARD_CONFIGURATION);

  loadConfig() {
    const token = SI_DASHBOARD_CONFIGURATION;
    return { provide: SI_DASHBOARD_CONFIGURATION, useValue: this.config };
  }
}

// Inline provider
export const DASHBOARD_PROVIDERS = [
  { provide: SI_DASHBOARD_CONFIGURATION, useValue: { mode: 'production' } }
];
