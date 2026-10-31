import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { SharedModule } from '../../shared/shared.module';
import { JasbirProfileComponent } from './jasbir-profile.component';

@NgModule({
  declarations: [JasbirProfileComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
    MatBottomSheetModule,
    MatSnackBarModule,
    SharedModule
  ]
})
export class JasbirModule {
  static entry = JasbirProfileComponent;
}
