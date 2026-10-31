import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { SachinProfileComponent } from './sachin-profile.component';

@NgModule({
  declarations: [SachinProfileComponent],
  imports: [
    CommonModule,
    MatIconModule
  ]
})
export class SachinModule {
  static entry = SachinProfileComponent;
}
