import { Component } from '@angular/core';

@Component({
  selector: 'si-select-class-migration',
  template: `
    <si-select class="btn btn-ghost" />
    <si-select class="custom-select btn btn-ghost" />
    <si-select class="btn btn-tertiary-ghost" />
    <si-select class="form-control" />
    <si-select class="btn btn-ghost" />
    <si-select class="form-control custom-select" />
    <button class="custom-select">Unrelated element</button>
  `
})
export class SelectClassMigrationComponent {}
