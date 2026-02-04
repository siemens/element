import { Component, inject } from '@angular/core';
import { CONFIG_TOKEN } from '@siemens/dashboards-ng';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `<div>Dashboard</div>`
})
export class DashboardComponent {
  private config = inject(CONFIG_TOKEN);

  loadConfig() {
    const token = CONFIG_TOKEN;
    return { provide: CONFIG_TOKEN, useValue: this.config };
  }
}

// Inline provider
export const DASHBOARD_PROVIDERS = [
  { provide: CONFIG_TOKEN, useValue: { mode: 'production' } }
];
