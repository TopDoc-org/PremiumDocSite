import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { MultiDoctorComponent } from './multi-doctor.component';

@NgModule({
  declarations: [MultiDoctorComponent],
  imports: [
    CommonModule,
    MatIconModule
  ]
})
export class ClinicModule {
  static entry = MultiDoctorComponent;
}
