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
      if (names.length >= 1) this.selectedClinic = names[0];
    }
  }

  get mobileError(): string {
    const ctrl = this.form?.get('mobile');
    if (!ctrl || !ctrl.touched) return '';
    if (ctrl.errors?.['required']) return 'Mobile number is required';
    if (ctrl.errors?.['pattern']) return 'Enter a valid 10-digit mobile number';
    return '';
  }

  get emailError(): string {
    const ctrl = this.form?.get('email');
    if (!ctrl || !ctrl.touched) return '';
    if (ctrl.errors?.['required']) return 'Email is required';
    if (ctrl.errors?.['email']) return 'Enter a valid email address';
    return '';
  }

  get clinicNames(): string[] {
    const seen = new Set<string>();
    const names: string[] = [];
    for (const sched of this.scheduleDetails) {
      for (const session of (sched.sessions || [])) {
        const clinicObj = session?.clinic || {};
        const displayName = clinicObj.clinicName || clinicObj.name || '';
        const dedupKey = clinicObj.clinicId || clinicObj.id || displayName;
        if (dedupKey && !seen.has(dedupKey)) {
          seen.add(dedupKey);
          names.push(displayName || dedupKey);
        }
      }
    }
    return names;
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
    const email = this.form.get('email')?.value?.trim();
    const gender = this.form.get('gender')?.value;
    const reason = this.form.get('reasonForVisit')?.value;
    const clinicOk = this.clinicNames.length === 0 || !!this.effectiveClinic;
    const mobileValid = /^\d{10}$/.test(mobile || '');
    const emailValid = !!email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    return !!name && mobileValid && emailValid && !!gender && !!reason && clinicOk;
  }

  getFilteredSessions(sessions: any[]): any[] {
    const clinic = this.effectiveClinic;
    if (!clinic) return sessions;
    return sessions.filter(s => {
      const clinicObj = s?.clinic || {};
      const displayName = clinicObj.clinicName || clinicObj.name || '';
      const dedupKey = clinicObj.clinicId || clinicObj.id || displayName;
      return displayName === clinic || dedupKey === clinic;
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
