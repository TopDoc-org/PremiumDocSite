import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-inline-booking',
  templateUrl: './inline-booking.component.html',
  styleUrls: ['./inline-booking.component.scss']
})
export class InlineBookingComponent {
  // Doctor info
  @Input() doctorName = '';
  @Input() specialisation = '';

  // Form
  @Input() form!: FormGroup;
  @Input() services: any[] = [];

  // Schedule data
  @Input() scheduleDetails: any[] = [];
  @Input() selectedSlotId = '';

  // Accent color (defaults to orange)
  @Input() accentColor = '#e8793a';

  // Events
  @Output() slotSelected = new EventEmitter<{ slot: any; session: any }>();
  @Output() bookClicked = new EventEmitter<string>();

  sessionIdSelected = '';

  onSlotSelect(slot: any, session: any): void {
    if (slot._source?.status !== 'notBooked') return;
    this.selectedSlotId = slot._source?.slotId || '';
    this.sessionIdSelected = session.sessionId;
    this.slotSelected.emit({ slot, session });
  }

  onBook(): void {
    if (!this.sessionIdSelected || this.form?.invalid) return;
    this.bookClicked.emit(this.sessionIdSelected);
  }
}
