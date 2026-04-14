import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

import { InlineBookingComponent } from './inline-booking/inline-booking.component';
import { PinInputComponent } from './pin-input/pin-input.component';

@NgModule({
  declarations: [
    InlineBookingComponent,
    PinInputComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
    MatTabsModule
  ],
  exports: [
    InlineBookingComponent,
    PinInputComponent
  ]
})
export class SharedModule {}
