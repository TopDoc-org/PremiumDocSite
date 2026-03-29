import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-inline-booking',
  templateUrl: './inline-booking.component.html',
  styleUrls: ['./inline-booking.component.scss']
})
export class InlineBookingComponent implements OnChanges {
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
  mobileTouched = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['scheduleDetails']) {
      const names = this.clinicNames;
      if (names.length === 1) this.selectedClinic = names[0];
    }
  }

  get mobileError(): string {
    const ctrl = this.form?.get('mobile');
    if (!ctrl || !ctrl.touched) return '';
    if (ctrl.errors?.['required']) return 'Mobile number is required';
    if (ctrl.errors?.['pattern']) return 'Enter a valid 10-digit mobile number';
    return '';
  }

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

  // When there is exactly 1 clinic, use it automatically — no reliance on selectedClinic state
  get effectiveClinic(): string {
    const names = this.clinicNames;
    if (names.length === 1) return names[0];
    return this.selectedClinic;
  }

  get isFormFilled(): boolean {
    if (!this.form) return false;
    const name = this.form.get('name')?.value?.trim();
    const mobile = this.form.get('mobile')?.value?.trim();
    const gender = this.form.get('gender')?.value;
    const reason = this.form.get('reasonForVisit')?.value;
    const clinicOk = this.clinicNames.length === 0 || !!this.effectiveClinic;
    const mobileValid = /^\d{10}$/.test(mobile || '');
    return !!name && mobileValid && !!gender && !!reason && clinicOk;
  }

  getFilteredSessions(sessions: any[]): any[] {
    const clinic = this.effectiveClinic;
    if (!clinic) return sessions;
    return sessions.filter(s => {
      const name = s?.clinic?.clinicName || s?.clinic?.name;
      return name === clinic;
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
