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
  selectedClinic = '';

  get clinicNames(): string[] {
    const names = new Set<string>();
    for (const sched of this.scheduleDetails) {
      for (const session of (sched.sessions || [])) {
        const name = session?.clinic?.clinicName || session?.clinic?.name;
        if (name) names.add(name);
      }
    }
    return Array.from(names);
  }

  get isFormFilled(): boolean {
    if (!this.form) return false;
    const name = this.form.get('name')?.value?.trim();
    const mobile = this.form.get('mobile')?.value?.trim();
    const gender = this.form.get('gender')?.value;
    const reason = this.form.get('reasonForVisit')?.value;
    return !!name && !!mobile && !!gender && !!reason;
  }

  getFilteredSessions(sessions: any[]): any[] {
    if (!this.selectedClinic) return sessions;
    return sessions.filter(s => {
      const name = s?.clinic?.clinicName || s?.clinic?.name;
      return name === this.selectedClinic;
    });
  }

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
