import { Component } from '@angular/core';

@Component({
  selector: 'si-badge-migration',
  template: `
    <span class="badge bg-primary">Primary</span>
    <span class="badge bg-secondary">Secondary</span>
    <span class="badge bg-success">Success</span>
    <span class="badge bg-info">Information</span>
    <span class="badge bg-warning">Warning</span>
    <span class="bg-danger badge">Danger</span>

    <div class="bg-primary">Primary</div>
    <div class="bg-secondary">Secondary</div>
    <div class="bg-success">Success</div>
    <div class="bg-info">Information</div>
    <div class="bg-warning">Warning</div>
    <div class="bg-danger">Danger</div>
  `
})
export class BadgeMigrationComponent {}
