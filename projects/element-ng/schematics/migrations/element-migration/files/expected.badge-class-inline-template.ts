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

    <div class="background-accent">Primary</div>
    <div class="background-neutral">Secondary</div>
    <div class="background-success">Success</div>
    <div class="background-information">Information</div>
    <div class="background-warning">Warning</div>
    <div class="background-danger">Danger</div>
  `
})
export class BadgeMigrationComponent {}
