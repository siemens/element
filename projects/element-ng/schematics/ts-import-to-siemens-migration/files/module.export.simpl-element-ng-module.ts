import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimplElementNgModule } from '@simpl/element-ng';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [CommonModule, TranslateModule, SimplElementNgModule, ReactiveFormsModule],
  exports: [CommonModule, SimplElementNgModule, ReactiveFormsModule]
})
export class MyModule {}
