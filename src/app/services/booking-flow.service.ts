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
  // PIN Reset via WhatsApp OTP
  showResetFlow: boolean;
  resetStep: 'phone' | 'otp' | 'pin' | 'success';
  resetPhone: string;
  resetOtpId: string;
  resetOtp: string;
  resetResendTimer: number;
  resetLoading: boolean;
  resetError: string;
  resetPinValue: string;
  resetConfirmPinValue: string;
  resetPinSubStep: 'create' | 'confirm';
  resetPinResetCounter: number;
  resetConfirmPinResetCounter: number;
  resetOtpResetCounter: number;
  resetAutoLoginInProgress: boolean;
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
  queueStatus: string;
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
  private resetTimerRef: any = null;

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
      showResetFlow: false,
      resetStep: 'phone',
      resetPhone: '',
      resetOtpId: '',
      resetOtp: '',
      resetResendTimer: 0,
      resetLoading: false,
      resetError: '',
      resetPinValue: '',
      resetConfirmPinValue: '',
      resetPinSubStep: 'create',
      resetPinResetCounter: 0,
      resetConfirmPinResetCounter: 0,
      resetOtpResetCounter: 0,
      resetAutoLoginInProgress: false
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
    this.closeResetFlow();
  }

  switchAuthMode(mode: 'login' | 'register'): void {
    this.auth.step = mode;
    this.auth.error = '';
    this.auth.pinValue = '';
    this.auth.confirmPinValue = '';
    this.auth.pinResetCounter++;
    this.auth.confirmPinResetCounter++;
    this.auth.registerPinStep = 'create';
    this.closeResetFlow();
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

  // ── PIN Reset (WhatsApp OTP) ──────────────────────────

  openResetFlow(prefillPhone: string): void {
    this.auth.showResetFlow = true;
    this.auth.resetStep = 'phone';
    this.auth.resetPhone = prefillPhone || '';
    this.auth.resetError = '';
    this.auth.resetLoading = false;
    this.auth.resetOtpId = '';
    this.auth.resetOtp = '';
    this.auth.resetPinValue = '';
    this.auth.resetConfirmPinValue = '';
    this.auth.resetPinSubStep = 'create';
    this.auth.resetPinResetCounter++;
    this.auth.resetConfirmPinResetCounter++;
    this.auth.resetOtpResetCounter++;
    this.auth.resetAutoLoginInProgress = false;
  }

  closeResetFlow(): void {
    this.auth.showResetFlow = false;
    this.auth.resetStep = 'phone';
    this.auth.resetError = '';
    this.auth.resetLoading = false;
    this.auth.resetAutoLoginInProgress = false;
    this.destroyResetTimer();
  }

  sendResetOtp(): void {
    const phone = this.auth.resetPhone?.trim();
    if (!phone || !/^\d{10}$/.test(phone)) {
      this.auth.resetError = 'Please enter a valid 10-digit mobile number.';
      return;
    }
    this.auth.resetLoading = true;
    this.auth.resetError = '';

    this.bookingService.sendWhatsappOtp(phone).subscribe({
      next: (res: any) => {
        this.auth.resetLoading = false;
        if (res.success) {
          this.auth.resetOtpId = res.otpId || '';
          this.auth.resetStep = 'otp';
          this.auth.resetOtp = '';
          this.auth.resetOtpResetCounter++;
          this.startResendTimer();
        } else {
          this.auth.resetError = res.message || 'Failed to send OTP.';
        }
      },
      error: (err: any) => {
        this.auth.resetLoading = false;
        this.auth.resetError = err.error?.message || 'Failed to send OTP. Please try again.';
      }
    });
  }

  resendResetOtp(): void {
    if (this.auth.resetResendTimer > 0 || this.auth.resetLoading) return;
    this.auth.resetOtp = '';
    this.auth.resetOtpResetCounter++;
    this.auth.resetError = '';
    this.sendResetOtp();
  }

  verifyResetOtp(): void {
    const otp = this.auth.resetOtp?.trim();
    if (!otp || otp.length !== 6) {
      this.auth.resetError = 'Please enter the complete 6-digit OTP.';
      return;
    }
    this.auth.resetLoading = true;
    this.auth.resetError = '';

    const req: any = { phoneNumber: this.auth.resetPhone, otp };
    if (this.auth.resetOtpId) req.otpId = this.auth.resetOtpId;

    this.bookingService.verifyWhatsappOtp(req).subscribe({
      next: (res: any) => {
        this.auth.resetLoading = false;
        if (res.verified) {
          this.auth.resetStep = 'pin';
          this.auth.resetPinSubStep = 'create';
          this.auth.resetPinValue = '';
          this.auth.resetConfirmPinValue = '';
          this.auth.resetPinResetCounter++;
          this.auth.resetConfirmPinResetCounter++;
          this.destroyResetTimer();
        } else {
          this.auth.resetError = res.message || 'Verification failed.';
        }
      },
      error: (err: any) => {
        this.auth.resetLoading = false;
        const msg = err.error?.message || '';
        if (msg.includes('expired')) {
          this.auth.resetError = 'OTP expired. Please request a new one.';
        } else if (msg.includes('already used')) {
          this.auth.resetError = 'OTP already used. Please request a new one.';
        } else if (msg.toLowerCase().includes('invalid')) {
          this.auth.resetError = 'Invalid OTP. Please try again.';
        } else {
          this.auth.resetError = msg || 'Verification failed.';
        }
      }
    });
  }

  onResetNewPinComplete(pin: string): void {
    this.auth.resetPinValue = pin;
    setTimeout(() => {
      this.auth.resetPinSubStep = 'confirm';
      this.auth.resetConfirmPinValue = '';
      this.auth.resetConfirmPinResetCounter++;
      this.auth.resetError = '';
    }, 200);
  }

  onResetNewPinChange(pin: string): void {
    this.auth.resetPinValue = pin;
    this.auth.resetError = '';
  }

  onResetConfirmPinComplete(pin: string, onBookingSuccess: () => void): void {
    this.auth.resetConfirmPinValue = pin;
    if (this.auth.resetPinValue === this.auth.resetConfirmPinValue) {
      setTimeout(() => this.submitResetPin(onBookingSuccess), 200);
    } else {
      this.auth.resetError = 'PINs don\'t match. Please try again.';
    }
  }

  onResetConfirmPinChange(pin: string): void {
    this.auth.resetConfirmPinValue = pin;
    this.auth.resetError = '';
  }

  goResetBackToCreatePin(): void {
    this.auth.resetConfirmPinValue = '';
    this.auth.resetPinSubStep = 'create';
    this.auth.resetError = '';
  }

  submitResetPin(onBookingSuccess: () => void): void {
    if (this.auth.resetPinValue.length !== 4 || this.auth.resetConfirmPinValue.length !== 4) return;
    if (this.auth.resetPinValue !== this.auth.resetConfirmPinValue) {
      this.auth.resetError = 'PINs don\'t match. Please try again.';
      this.auth.resetPinValue = '';
      this.auth.resetConfirmPinValue = '';
      this.auth.resetPinResetCounter++;
      this.auth.resetConfirmPinResetCounter++;
      this.auth.resetPinSubStep = 'create';
      return;
    }
    this.auth.resetLoading = true;
    this.auth.resetError = '';

    this.bookingService.resetPinAfterOtp(this.auth.resetPhone, this.auth.resetPinValue).subscribe({
      next: (res: any) => {
        this.auth.resetLoading = false;
        if (res.statuscode === 200 || res.success || res.message?.toLowerCase().includes('success')) {
          this.auth.resetStep = 'success';
          // Auto-login after a brief success display
          setTimeout(() => this.autoLoginAfterReset(onBookingSuccess), 1500);
        } else {
          this.auth.resetError = res.message || 'Failed to reset PIN.';
        }
      },
      error: (err: any) => {
        this.auth.resetLoading = false;
        if (err.status === 403) {
          this.auth.resetError = 'OTP verification expired. Please start over.';
        } else if (err.status === 404) {
          this.auth.resetError = 'No account found for this number.';
        } else {
          this.auth.resetError = err.error?.message || 'Failed to reset PIN.';
        }
      }
    });
  }

  private autoLoginAfterReset(onBookingSuccess: () => void): void {
    this.auth.resetAutoLoginInProgress = true;
    this.bookingService.loginUser(this.auth.resetPhone, this.auth.resetPinValue).subscribe({
      next: (res: any) => {
        this.auth.loggedInToken = res.token;
        this.auth.loggedInUserId = res.userDetails?.userId || '';
        this.auth.step = 'none';
        this.closeResetFlow();
        onBookingSuccess();
      },
      error: () => {
        // Login failed after reset — fall back to manual login
        this.auth.resetAutoLoginInProgress = false;
        this.auth.pinValue = '';
        this.auth.pinResetCounter++;
        this.auth.error = '';
        this.auth.showResetFlow = false;
        this.auth.resetStep = 'phone';
        this.destroyResetTimer();
      }
    });
  }

  destroyResetTimerPublic(): void {
    this.destroyResetTimer();
  }

  private startResendTimer(): void {
    this.destroyResetTimer();
    this.auth.resetResendTimer = 60;
    this.resetTimerRef = setInterval(() => {
      this.auth.resetResendTimer--;
      if (this.auth.resetResendTimer <= 0) {
        this.destroyResetTimer();
      }
    }, 1000);
  }

  private destroyResetTimer(): void {
    if (this.resetTimerRef) {
      clearInterval(this.resetTimerRef);
      this.resetTimerRef = null;
    }
    this.auth.resetResendTimer = 0;
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
          geoPoint: this.getGoogleMapsLink(session.documents[0]?._source?.clinicDetails?.geoPoint || ''),
          queueStatus: session.documents.find((d: any) => d._source?.queueStatus)?._source?.queueStatus || ''
        };
        session.documents.forEach((slot: any) => {
          if (slot._source.slotType === 'priority' && slot._source.status === 'notBooked') {
            s.prioritySlots.push(slot);
          } else if (slot._source.slotTime) {
            s.slots.push(slot);
          }
        });
        // The API returns booked slots out of order
        s.slots.sort((a, b) => a._source.slotTime.localeCompare(b._source.slotTime));
        day.sessions.push(s);
      });
      day.sessions.sort((a, b) => a.startTime.localeCompare(b.startTime));
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
        const bookedCount = (checkRes?.result || []).filter((r: any) =>
          r?.mobile === req.mobile && r?.sessionId === params.sessionId
        ).length;
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
