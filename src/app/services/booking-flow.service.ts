import { Injectable } from '@angular/core';
import { BookingService } from './booking.service';

export interface AuthState {
  step: 'none' | 'checking' | 'login' | 'register' | 'new-number';
  loading: boolean;
  error: string;
  pendingSessionId: string;
  loggedInToken: string;
  loggedInUserId: string;
  existingUserDetails: { name: string; mobile: string; gender: string } | null;
  pinValue: string;
  confirmPinValue: string;
  pinResetCounter: number;
  confirmPinResetCounter: number;
  registerPinStep: 'create' | 'confirm';
  showForgotPassword: boolean;
  forgotPasswordEmail: string;
  forgotPasswordLoading: boolean;
  forgotPasswordSent: boolean;
  forgotPasswordError: string;
}

export interface ScheduleDay {
  date: string;
  day: string;
  sessions: ScheduleSession[];
}

export interface ScheduleSession {
  sessionId: string;
  slots: any[];
  prioritySlots: any[];
  hits: number;
  startTime: string;
  endTime: string;
  clinic: any;
  geoPoint: string;
  fees: number;
}

export interface BookingConfirmation {
  patientName: string;
  mobile: string;
  gender: string;
  doctorName: string;
  appointmentDate: string;
  slotDay: string;
  slotTime: string;
  sessionTime: string;
  clinicName: string;
  clinicLocation: string;
  reasonForVisit: string;
  pin: string;
  tokenNo: string;
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

@Injectable({ providedIn: 'root' })
export class BookingFlowService {
  auth: AuthState = this.freshAuthState();

  constructor(private bookingService: BookingService) {}

  private freshAuthState(): AuthState {
    return {
      step: 'none',
      loading: false,
      error: '',
      pendingSessionId: '',
      loggedInToken: '',
      loggedInUserId: '',
      existingUserDetails: null,
      pinValue: '',
      confirmPinValue: '',
      pinResetCounter: 0,
      confirmPinResetCounter: 0,
      registerPinStep: 'create',
      showForgotPassword: false,
      forgotPasswordEmail: '',
      forgotPasswordLoading: false,
      forgotPasswordSent: false,
      forgotPasswordError: ''
    };
  }

  // ── Auth flow ─────────────────────────────────────────

  /**
   * Start the auth gate: check if a mobile number is registered,
   * then move to 'login' or 'register' step.
   */
  openAuthStep(sessionId: string, mobile: string, patchForm: (details: { name: string; gender: string }) => void): void {
    this.auth.pendingSessionId = sessionId;
    this.auth.step = 'checking';
    this.auth.error = '';
    this.auth.pinValue = '';
    this.auth.confirmPinValue = '';
    this.auth.pinResetCounter++;
    this.auth.existingUserDetails = null;

    this.bookingService.checkMobileRegistered(mobile).subscribe({
      next: (res: any) => {
        if (res?.hits > 0) {
          const user = res?.results?.[0] || res?.result?.[0] || res;
          const userName = user?.name
            || ((user?.firstName || '') + ' ' + (user?.lastName || '')).trim()
            || '';
          this.auth.existingUserDetails = {
            name: userName,
            mobile: user?.mobileNumber || user?.mobile || mobile,
            gender: user?.gender || ''
          };
          if (this.auth.existingUserDetails.name || this.auth.existingUserDetails.gender) {
            patchForm({
              name: this.auth.existingUserDetails.name,
              gender: this.auth.existingUserDetails.gender?.toLowerCase() || ''
            });
          }
          this.auth.step = 'login';
        } else {
          this.auth.step = 'register';
        }
      },
      error: () => {
        this.auth.step = 'login';
      }
    });
  }

  cancelAuth(): void {
    this.auth.step = 'none';
    this.auth.pendingSessionId = '';
    this.auth.error = '';
    this.auth.pinValue = '';
    this.auth.confirmPinValue = '';
    this.auth.pinResetCounter++;
    this.auth.confirmPinResetCounter++;
    this.auth.registerPinStep = 'create';
    this.auth.existingUserDetails = null;
    this.auth.showForgotPassword = false;
    this.auth.forgotPasswordEmail = '';
    this.auth.forgotPasswordSent = false;
    this.auth.forgotPasswordError = '';
  }

  switchAuthMode(mode: 'login' | 'register'): void {
    this.auth.step = mode;
    this.auth.error = '';
    this.auth.pinValue = '';
    this.auth.confirmPinValue = '';
    this.auth.pinResetCounter++;
    this.auth.confirmPinResetCounter++;
    this.auth.registerPinStep = 'create';
    this.auth.showForgotPassword = false;
    this.auth.forgotPasswordEmail = '';
    this.auth.forgotPasswordSent = false;
    this.auth.forgotPasswordError = '';
  }

  onPinComplete(pin: string): void {
    this.auth.pinValue = pin;
    if (this.auth.step === 'register' && this.auth.registerPinStep === 'create') {
      this.auth.registerPinStep = 'confirm';
      this.auth.confirmPinValue = '';
      this.auth.confirmPinResetCounter++;
    }
  }

  onPinChange(pin: string): void {
    this.auth.pinValue = pin;
    this.auth.error = '';
  }

  onConfirmPinComplete(pin: string): void {
    this.auth.confirmPinValue = pin;
    if (this.auth.step === 'register') {
      return; // component should call submitAuth() after this
    }
  }

  onConfirmPinChange(pin: string): void {
    this.auth.confirmPinValue = pin;
    this.auth.error = '';
  }

  sendForgotPassword(email: string): void {
    if (!email?.trim()) {
      this.auth.forgotPasswordError = 'Please enter your email address.';
      return;
    }
    this.auth.forgotPasswordLoading = true;
    this.auth.forgotPasswordError = '';
    this.bookingService.sendForgotPassword(email.trim()).subscribe({
      next: () => {
        this.auth.forgotPasswordLoading = false;
        this.auth.forgotPasswordSent = true;
      },
      error: (err: any) => {
        this.auth.forgotPasswordLoading = false;
        this.auth.forgotPasswordError = err.error?.message || 'Email not found. Please check and try again.';
      }
    });
  }

  /**
   * Submit login or registration.
   * @param onSuccess called with token+userId after successful auth
   */
  submitAuth(
    mobile: string,
    formData: { name: string; email: string; gender: string; address: string; isQueueUpdateReminder: boolean },
    onSuccess: () => void
  ): void {
    if (this.auth.pinValue.length !== 4) {
      this.auth.error = 'Please enter all 4 digits of your PIN.';
      return;
    }
    const password = this.auth.pinValue;

    if (this.auth.step === 'login') {
      this.auth.loading = true;
      this.auth.error = '';
      this.bookingService.loginUser(mobile, password).subscribe({
        next: (res: any) => {
          this.auth.loading = false;
          this.auth.loggedInToken = res.token;
          this.auth.loggedInUserId = res.userDetails?.userId || '';
          this.auth.step = 'none';
          onSuccess();
        },
        error: (err: any) => {
          this.auth.loading = false;
          if (err.status === 401) {
            this.auth.error = 'Incorrect PIN. Please try again.';
          } else {
            this.auth.error = err.error?.message || 'Login failed. Please try again.';
          }
        }
      });
    } else {
      // Register flow
      if (this.auth.confirmPinValue !== this.auth.pinValue) {
        this.auth.error = 'PINs do not match. Please try again.';
        this.auth.pinValue = '';
        this.auth.confirmPinValue = '';
        this.auth.pinResetCounter++;
        this.auth.confirmPinResetCounter++;
        this.auth.registerPinStep = 'create';
        return;
      }
      const confirmPassword = this.auth.confirmPinValue;
      const name = formData.name;
      const nameParts = name.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || nameParts[0];

      const signupPayload: any = {
        firstName,
        lastName,
        name,
        mobileNumber: mobile,
        password,
        confirmPassword,
        role: 'user',
        userType: 'registered',
        gender: formData.gender || '',
        address: formData.address || '',
        dob: null,
        rights: null,
        isEmailVerified: false,
        emailVerificationOtp: null,
        acceptTerms: true,
        referredBy: '',
        isQueueUpdateReminder: formData.isQueueUpdateReminder
      };
      if (formData.email) { signupPayload.email = formData.email; }

      this.auth.loading = true;
      this.auth.error = '';
      this.bookingService.signupUser(signupPayload).subscribe({
        next: () => {
          this.bookingService.loginUser(mobile, password).subscribe({
            next: (loginRes: any) => {
              this.auth.loading = false;
              this.auth.loggedInToken = loginRes.token;
              this.auth.loggedInUserId = loginRes.userDetails?.userId || '';
              this.auth.step = 'none';
              onSuccess();
            },
            error: () => {
              this.auth.loading = false;
              this.auth.error = 'Account created! Please login to confirm your booking.';
              this.switchAuthMode('login');
            }
          });
        },
        error: (err: any) => {
          this.auth.loading = false;
          if (err.status === 409) {
            this.auth.error = 'This mobile number is already registered. Please login instead.';
            this.switchAuthMode('login');
          } else {
            this.auth.error = err.error?.message || 'Registration failed. Please try again.';
          }
        }
      });
    }
  }

  // ── Schedule ──────────────────────────────────────────

  fetchSchedule(doctorId: string, callback: (days: ScheduleDay[]) => void): void {
    const today = new Date();
    const fmt = (d: Date) =>
      d.getFullYear() + '-' + (d.getMonth() + 1).toString().padStart(2, '0') + '-' + d.getDate().toString().padStart(2, '0');
    const startDate = fmt(today);
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const endDate = fmt(nextWeek);

    const req = {
      pageSize: 10000,
      pageNo: 0,
      search: {
        doctorId: doctorId || 1,
        range: { appointmentDate: { gte: startDate, lte: endDate } }
      },
      sort: [],
      filters: [{
        bool: { must_not: [{ terms: { status: ['sessionCancelled', 'cancelled'] } }] }
      }]
    };

    this.bookingService.getSchedule(req).subscribe(
      (data: any) => {
        const days = this.processSessionData(data.filters[0]['results_by_date'].buckets);
        callback(days);
      },
      () => {}
    );
  }

  private processSessionData(data: any[]): ScheduleDay[] {
    const days: ScheduleDay[] = [];
    data.forEach((dateObj: any) => {
      const day: ScheduleDay = {
        date: dateObj.appointmentDate,
        day: WEEKDAYS[new Date(dateObj.appointmentDate).getDay()],
        sessions: []
      };
      dateObj.sessions.forEach((session: any) => {
        const s: ScheduleSession = {
          sessionId: session.sessionId,
          slots: [],
          prioritySlots: [],
          hits: session.hits,
          startTime: session.documents[0]?._source?.sessionStartTime || '',
          endTime: session.documents[0]?._source?.sessionEndTime || '',
          fees: session.documents[0]?._source?.clinicDetails?.fees || 1,
          clinic: session.documents[0]?._source?.clinicDetails || {},
          geoPoint: this.getGoogleMapsLink(session.documents[0]?._source?.clinicDetails?.geoPoint || '')
        };
        session.documents.forEach((slot: any) => {
          if (slot._source.slotType === 'priority' && slot._source.status === 'notBooked') {
            s.prioritySlots.push(slot);
          } else {
            s.slots.push(slot);
          }
        });
        day.sessions.push(s);
      });
      days.push(day);
    });
    return days;
  }

  // ── Booking execution ─────────────────────────────────

  executeBooking(
    params: {
      doctorId: string;
      doctorName: string;
      slotDetail: any;
      sessionId: string;
      formData: { name: string; mobile: string; gender: string; email: string; reasonForVisit: string };
      isQueueUpdateReminder: boolean;
    },
    onSuccess: (confirmation: BookingConfirmation) => void,
    onLimitReached: () => void,
    onError: () => void
  ): void {
    const today = new Date();
    const appointmentDate = today.getFullYear() + '-' +
      (today.getMonth() + 1).toString().padStart(2, '0') + '-' +
      today.getDate().toString().padStart(2, '0');
    const slotDay = WEEKDAYS[today.getDay()];
    const slot = params.slotDetail;
    const clinic = slot?.clinicDetails || {};

    const req: any = {
      doctorId: params.doctorId,
      doctorName: params.doctorName,
      clinicDetails: {
        clinicId: clinic.clinicId || clinic.id || '',
        clinicName: clinic.clinicName || clinic.name || '',
        geoPoint: clinic.geoPoint || ''
      },
      clinicId: clinic.clinicId || clinic.id || '',
      sessionId: params.sessionId,
      slotId: slot?.slotId || '',
      reasonForVisit: params.formData.reasonForVisit || '',
      slotType: 'normal',
      status: 'booked',
      appointmentType: 'Inperson',
      slotTime: slot?.slotTime || '',
      slotDay,
      userId: this.auth.loggedInUserId,
      userType: 'registered',
      bookingTimeStamp: new Date().toISOString(),
      appointmentDate,
      sessionStartTime: slot?.sessionStartTime || '',
      sessionEndTime: slot?.sessionEndTime || '',
      userName: params.formData.name,
      gender: params.formData.gender,
      pin: Math.floor(Math.random() * 9000) + 1000 + '',
      paymentStatus: 'default',
      mobile: params.formData.mobile,
      predictedSlotTime: slot?.slotTime || '',
      isQueueUpdateReminder: params.isQueueUpdateReminder
    };
    if (params.formData.email?.trim()) { req.email = params.formData.email.trim(); }

    const doBooking = () => {
      this.bookingService.bookRegisteredUser(req, this.auth.loggedInToken).subscribe(
        (res: any) => {
          const confirmation: BookingConfirmation = {
            patientName: req.userName,
            mobile: req.mobile,
            gender: req.gender,
            doctorName: req.doctorName,
            appointmentDate: req.appointmentDate,
            slotDay: req.slotDay,
            slotTime: slot?.slotTime || '',
            sessionTime: (slot?.sessionStartTime || '') + ' - ' + (slot?.sessionEndTime || ''),
            clinicName: slot?.clinicDetails?.clinicName || slot?.clinicDetails?.name || '',
            clinicLocation: slot?.clinicDetails?.clinicLocation || '',
            reasonForVisit: req.reasonForVisit,
            pin: req.pin,
            tokenNo: res?.tokenNo || res?.slotId || ''
          };
          onSuccess(confirmation);
        },
        () => onError()
      );
    };

    this.bookingService.checkUserSessionBookings(params.doctorId, params.sessionId, req.mobile).subscribe({
      next: (checkRes: any) => {
        const bookedCount = typeof checkRes?.hits === 'number'
          ? checkRes.hits
          : (checkRes?.result || []).filter((r: any) => r?.mobile === req.mobile).length;
        if (bookedCount >= 2) {
          onLimitReached();
          return;
        }
        doBooking();
      },
      error: () => doBooking()
    });
  }

  // ── Helpers ───────────────────────────────────────────

  getGoogleMapsLink(inputstring: string): string {
    if (inputstring) {
      const params = inputstring.split(',').map(Number);
      return `https://www.google.com/maps/search/?api=1&query=${params[0]},${params[1]}`;
    }
    return '';
  }
}
