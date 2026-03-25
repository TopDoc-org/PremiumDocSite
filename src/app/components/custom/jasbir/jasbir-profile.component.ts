import {
  AfterViewInit, Component, ElementRef, OnDestroy, OnInit,
  TemplateRef, ViewChild
} from '@angular/core';
import * as AOS from 'aos';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { BookingService } from '../../../services/booking.service';
import { DoctorConfigService } from '../../../services/doctor-config.service';

@Component({
  selector: 'app-jasbir-profile',
  templateUrl: './jasbir-profile.component.html',
  styleUrls: ['./jasbir-profile.component.scss']
})
export class JasbirProfileComponent implements OnInit, AfterViewInit, OnDestroy {
  isMobileOrTabView = false;
  isMobileView = false;
  timelineFetchStatus: 'none' | 'fetching' | 'done' | 'error' = 'none';
  doctorId = '';
  profRes: any;
  scheduleDetails: any[] = [];
  openBookByDefault = false;
  unregForm!: FormGroup;
  showAllOffers = false;
  animationsEnabled = false;
  activeSlide = 0;
  referredBy: string | null = null;
  sessionIdSelected = '';
  selectedSlotId = '';
  slotSelectedDetail: any = {};
  showSessionsinAbha = false;

  @ViewChild('templateBottomSheet') TemplateBottomSheet!: TemplateRef<any>;
  @ViewChild('confettiCanvas') confettiCanvas!: ElementRef<HTMLCanvasElement>;

  private offersObserver: IntersectionObserver | null = null;
  private confettiInstance: any = null;
  private confettiAnimId: number | null = null;
  private carouselInterval: any = null;
  private counterObserver: IntersectionObserver | null = null;
  private mediaQuery!: MediaQueryList;
  private mobileQuery!: MediaQueryList;

  weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  placeholderEducation = [
    { degree: 'MDS', studyField: 'Orthodontics & Dentofacial Orthopedics', institution: 'SCB Dental College & Hospital, Cuttack', startDate: '2012', endDate: '2015', description: 'Specialized training in advanced orthodontic techniques, clear aligners, and dentofacial orthopedics.' },
    { degree: 'BDS', studyField: 'Dental Surgery', institution: 'MKCG Medical College, Berhampur', startDate: '2007', endDate: '2012', description: 'Comprehensive dental education covering all aspects of oral healthcare and dental surgery.' }
  ];
  placeholderExperience = [
    { title: 'Founder & Chief Orthodontist', comapanyName: "Dr. Meher's Orthodontic Center & Dental Clinic, Balangir", startDate: '2015', endDate: '', description: 'Established a state-of-the-art orthodontic and dental clinic serving the Balangir region with advanced treatments including Invisalign, laser dentistry, and cosmetic procedures.' },
    { title: 'Senior Dental Surgeon', comapanyName: 'District Headquarters Hospital, Balangir', startDate: '2015', endDate: '2017', description: 'Provided comprehensive dental care and orthodontic consultations in a government hospital setting.' },
    { title: 'Resident Doctor (MDS)', comapanyName: 'SCB Dental College & Hospital, Cuttack', startDate: '2012', endDate: '2015', description: 'Clinical residency in orthodontics with focus on complex malocclusion cases and surgical orthodontics.' }
  ];
  placeholderAwards = [
    { awardName: 'Best Orthodontist Award', place: 'Odisha Dental Association', date: '2023' },
    { awardName: 'Excellence in Dental Care', place: 'Indian Dental Conference, Bhubaneswar', date: '2021' },
    { awardName: 'Young Dentist of the Year', place: 'Western Odisha Dental Society', date: '2019' },
    { awardName: 'Best Research Paper - Orthodontics', place: 'National PG Convention, New Delhi', date: '2014' }
  ];

  constructor(
    private elRef: ElementRef,
    private bottomSheet: MatBottomSheet,
    private _snackBar: MatSnackBar,
    private fb: FormBuilder,
    private activated: ActivatedRoute,
    private bookingService: BookingService,
    private doctorConfigService: DoctorConfigService
  ) {}

  ngOnInit(): void {
    this.unregForm = this.fb.group({
      name: ['', [Validators.required]],
      mobile: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      gender: ['', [Validators.required]]
    });

    // Responsive detection
    this.mediaQuery = window.matchMedia('(max-width: 1024px)');
    this.mobileQuery = window.matchMedia('(max-width: 600px)');
    this.isMobileOrTabView = this.mediaQuery.matches;
    this.isMobileView = this.mobileQuery.matches;
    const mediaHandler = (e: MediaQueryListEvent) => { this.isMobileOrTabView = e.matches; };
    const mobileHandler = (e: MediaQueryListEvent) => { this.isMobileView = e.matches; };
    this.mediaQuery.addEventListener('change', mediaHandler);
    this.mobileQuery.addEventListener('change', mobileHandler);

    // Get doctorId from query params or use default
    this.activated.queryParamMap.subscribe(queryMap => {
      this.doctorId = queryMap.get('doctorId') || queryMap.get('id') || 'jasbir';
      this.referredBy = queryMap.get('referredBy') || null;
      if (queryMap.has('book')) {
        this.openBookByDefault = true;
      }

      this.timelineFetchStatus = 'fetching';
      this.fetchProfileData();
    });
  }

  ngAfterViewInit(): void {
    if (this.openBookByDefault) {
      this.openTemplateSheetMenu();
    }
  }

  ngOnDestroy(): void {
    if (this.counterObserver) this.counterObserver.disconnect();
    if (this.offersObserver) this.offersObserver.disconnect();
    this.stopConfetti();
    if (this.carouselInterval) clearInterval(this.carouselInterval);
  }

  private fetchProfileData(): void {
    this.bookingService.fetchDoctorProfile(this.doctorId).subscribe(
      (data: any) => {
        this.profRes = data?.results?.[0] || this.getDefaultProfile();
        if (this.profRes.reviewTags) {
          const sortMap = Object.fromEntries(
            Object.entries(this.profRes.reviewTags).sort((a: any, b: any) => a[1] - b[1])
          );
          this.profRes.reviewList = Object.keys(sortMap);
        }
        const savedPref = localStorage.getItem('premiumAnimations');
        this.animationsEnabled = savedPref !== null ? savedPref === 'true' : !!this.profRes.premiumAnimations;
        this.timelineFetchStatus = 'done';
        this.initAOS();
        this.initCounterAnimations();
        setTimeout(() => this.setupOffersConfettiObserver(), 300);
        this.startCarouselAutoplay();
        this.fetchClinicDetails();
        this.getSchedule();
      },
      () => {
        // If API fails, use default profile data so page still renders
        this.profRes = this.getDefaultProfile();
        this.animationsEnabled = true;
        this.timelineFetchStatus = 'done';
        this.initAOS();
        this.initCounterAnimations();
        setTimeout(() => this.setupOffersConfettiObserver(), 300);
        this.startCarouselAutoplay();
        this.getSchedule();
      }
    );
  }

  private getDefaultProfile(): any {
    return {
      name: 'Jasbir Meher',
      city: 'Balangir',
      state: 'Odisha',
      specialization: 'Orthodontist & Dental Surgeon',
      yearsOfExperience: '13',
      languages: ['English', 'Hindi', 'Odia'],
      averageRating: 4.9,
      noOfReviews: 0,
      premiumAnimations: true,
      education: this.placeholderEducation,
      experience: this.placeholderExperience,
      awardsAndPublications: this.placeholderAwards,
      associatedClinics: [],
      profImageUrl: { src: 'assets/images/jasbir/profile.jpg' }
    };
  }

  private fetchClinicDetails(): void {
    if (!this.doctorId) return;
    const req = {
      role: 'orgcontract',
      pageNo: 0,
      pageSize: 100,
      id: this.doctorId,
      filter: [{ type: 'doctor' }, { status: 'active' }],
      sortBy: []
    };
    this.bookingService.searchMulti(req).subscribe(
      (data: any) => {
        const orgIds = data.results?.map((doc: any) => doc.organisationId) || [];
        if (orgIds.length > 0) {
          this.fetchOrgDetails(orgIds);
        }
      },
      () => {}
    );
  }

  private fetchOrgDetails(idList: string[]): void {
    // Use searchMulti to get org details
    const req = { id: idList, role: 'organisation', fields: ['all'] };
    this.bookingService.searchMulti(req).subscribe(
      (data: any) => {
        (data.results || []).forEach((org: any) => {
          const clinicObj = {
            clinicName: org.name,
            clinicId: org.id,
            fees: 1,
            geoPoint: org.geoPoint,
            isActive: true,
            clinicLocation: org.clinicLocation,
            clinicRating: org.clinicRating,
            district: org.district,
            tagReceived: org.tagReceived,
            state: org.state,
            clinicSchedule: org.clinicSchedule,
            clinicImageUrl: org.clinicImageUrl
          };
          if (this.profRes.associatedClinics) {
            this.profRes.associatedClinics.push(clinicObj);
          } else {
            this.profRes.associatedClinics = [clinicObj];
          }
        });
      },
      () => {}
    );
  }

  toggleAnimations(): void {
    this.animationsEnabled = !this.animationsEnabled;
    localStorage.setItem('premiumAnimations', String(this.animationsEnabled));
    if (this.animationsEnabled) {
      window.location.reload();
    } else {
      AOS.refreshHard();
    }
  }

  initAOS(): void {
    if (this.animationsEnabled) {
      const isMobile = window.innerWidth < 768;
      setTimeout(() => {
        AOS.init({
          duration: isMobile ? 500 : 800,
          easing: 'ease-out',
          once: true,
          offset: isMobile ? 20 : 80,
          delay: isMobile ? 0 : undefined
        });
      });
    }
  }

  initCounterAnimations(): void {
    if (!this.animationsEnabled) return;
    setTimeout(() => {
      const counterEls = this.elRef.nativeElement.querySelectorAll('[data-count-to]');
      if (!counterEls.length) return;
      this.counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animateCounter(entry.target as HTMLElement);
            this.counterObserver?.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      counterEls.forEach((el: Element) => this.counterObserver!.observe(el));
    });
  }

  animateCounter(el: HTMLElement): void {
    const raw = el.getAttribute('data-count-to') || '0';
    const suffix = el.getAttribute('data-count-suffix') || '';
    const prefix = el.getAttribute('data-count-prefix') || '';
    const isDecimal = raw.includes('.');
    const isPlain = el.hasAttribute('data-count-plain');
    const target = parseFloat(raw);
    const duration = 1600;
    const startTime = performance.now();
    const formatNum = (n: number) => {
      if (isDecimal) return n.toFixed(1);
      const rounded = Math.round(n);
      return isPlain ? String(rounded) : rounded.toLocaleString();
    };
    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;
      el.textContent = prefix + formatNum(current) + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = prefix + formatNum(target) + suffix;
      }
    };
    requestAnimationFrame(step);
  }

  nextSlide(): void {
    this.activeSlide = (this.activeSlide + 1) % 4;
    this.resetCarouselAutoplay();
  }

  prevSlide(): void {
    this.activeSlide = (this.activeSlide - 1 + 4) % 4;
    this.resetCarouselAutoplay();
  }

  goToSlide(index: number): void {
    this.activeSlide = index;
    this.resetCarouselAutoplay();
  }

  private startCarouselAutoplay(): void {
    if (!this.animationsEnabled) return;
    this.carouselInterval = setInterval(() => {
      this.activeSlide = (this.activeSlide + 1) % 4;
    }, 4000);
  }

  private resetCarouselAutoplay(): void {
    if (this.carouselInterval) clearInterval(this.carouselInterval);
    this.startCarouselAutoplay();
  }

  private setupOffersConfettiObserver(): void {
    if (!this.animationsEnabled) return;
    const heroCard = this.elRef.nativeElement.querySelector('.offer-hero');
    if (!heroCard) return;
    this.offersObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.startConfetti();
        } else {
          this.stopConfetti();
        }
      });
    }, { threshold: 0.3 });
    this.offersObserver.observe(heroCard);
  }

  private startConfetti(): void {
    if (this.confettiAnimId) return;
    const initAndRun = (confetti: any) => {
      if (!this.confettiInstance && this.confettiCanvas) {
        const canvas = this.confettiCanvas.nativeElement;
        this.confettiInstance = confetti.create(canvas, { resize: true });
      }
      if (!this.confettiInstance) return;
      const colors = ['#ffffff', '#FFE566', '#FF6B8A', '#7DFFB3', '#FFB347', '#FF4D6A'];
      const fire = this.confettiInstance;
      const frame = () => {
        fire({ particleCount: 3, angle: 60, spread: 55, startVelocity: 45, origin: { x: 0, y: 0.5 }, colors, scalar: 1.2, ticks: 150 });
        fire({ particleCount: 3, angle: 120, spread: 55, startVelocity: 45, origin: { x: 1, y: 0.5 }, colors, scalar: 1.2, ticks: 150 });
        this.confettiAnimId = requestAnimationFrame(frame);
      };
      this.confettiAnimId = requestAnimationFrame(frame);
    };
    if (this.confettiInstance) {
      initAndRun(null);
    } else {
      import('canvas-confetti').then((mod: any) => {
        const confetti = mod.default || mod;
        initAndRun(confetti);
      });
    }
  }

  private stopConfetti(): void {
    if (this.confettiAnimId) {
      cancelAnimationFrame(this.confettiAnimId);
      this.confettiAnimId = null;
    }
    if (this.confettiInstance) {
      this.confettiInstance.reset();
    }
  }

  getGoogleMapsLink(inputstring: string): string {
    if (inputstring) {
      const params = inputstring.split(',').map(Number);
      return `https://www.google.com/maps/search/?api=1&query=${params[0]},${params[1]}`;
    }
    return '';
  }

  openTemplateSheetMenu(): void {
    this.bottomSheet.open(this.TemplateBottomSheet, {
      panelClass: 'custom-bottom-sheet-content'
    });
  }

  closeTemplateSheetMenu(): void {
    this.bottomSheet.dismiss();
  }

  // Booking methods
  getSchedule(): void {
    const today = new Date();
    const startDate = today.getFullYear() + '-' + (today.getMonth() + 1).toString().padStart(2, '0') + '-' + today.getDate().toString().padStart(2, '0');
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const endDate = nextWeek.getFullYear() + '-' + (nextWeek.getMonth() + 1).toString().padStart(2, '0') + '-' + nextWeek.getDate().toString().padStart(2, '0');

    const req = {
      pageSize: 10000,
      pageNo: 0,
      search: {
        doctorId: this.doctorId || 1,
        range: {
          appointmentDate: { gte: startDate, lte: endDate }
        }
      },
      sort: [],
      filters: [{
        bool: {
          must_not: [{ terms: { status: ['sessionCancelled', 'cancelled'] } }]
        }
      }]
    };

    this.bookingService.getSchedule(req).subscribe(
      (data: any) => {
        this.processSessionData(data.filters[0]['results_by_date'].buckets);
      },
      () => {}
    );
  }

  processSessionData(data: any): void {
    data.forEach((dateObj: any) => {
      const sessObj: any = {
        date: dateObj.appointmentDate,
        day: this.getWeekDay(dateObj.appointmentDate),
        sessions: []
      };
      dateObj.sessions.forEach((session: any) => {
        const sessionDet: any = {
          sessionId: '',
          slots: [],
          prioritySlots: [],
          hits: 0,
          startTime: '',
          endTime: '',
          clinic: {},
          geoPoint: '',
          fees: 0
        };
        sessionDet.slots = session.documents.filter((slot: any) => {
          if (slot._source.slotType === 'priority' && slot._source.status === 'notBooked') {
            sessionDet.prioritySlots.push(slot);
          } else {
            return slot;
          }
        });
        sessionDet.sessionId = session.sessionId;
        sessionDet.hits = session.hits;
        sessionDet.fees = session.documents[0]?._source?.clinicDetails?.fees || 1;
        sessionDet.clinic = session.documents[0]?._source?.clinicDetails || {};
        sessionDet.startTime = session.documents[0]?._source?.sessionStartTime;
        sessionDet.endTime = session.documents[0]?._source?.sessionEndTime;
        sessionDet.geoPoint = this.getGoogleMapsLink(session.documents[0]?._source?.clinicDetails?.geoPoint || '');
        sessObj.sessions.push(sessionDet);
      });
      this.scheduleDetails.push(sessObj);
    });
  }

  setSelectedSlot(slot: any, session: any): void {
    this.selectedSlotId = slot._source?.slotId || '';
    this.slotSelectedDetail = slot._source || {};
    this.sessionIdSelected = session.sessionId;
  }

  onSpotFreeBook(sessionId: string): void {
    if (!sessionId || this.unregForm.invalid) return;
    const today = new Date();
    const appointmentDate = today.getFullYear() + '-' +
      (today.getMonth() + 1).toString().padStart(2, '0') + '-' +
      today.getDate().toString().padStart(2, '0');
    const slotDay = this.weekdays[today.getDay()];

    const req = {
      sessionId,
      reasonForVisit: '',
      slotType: 'normal',
      pin: Math.floor(Math.random() * 9000) + 1000 + '',
      email: '',
      paymentStatus: 'Default',
      appointmentType: 'Inperson',
      slotDay,
      userType: 'unRegistered',
      doctorName: this.profRes?.name || 'Jasbir Meher',
      bookingTimeStamp: new Date().toISOString(),
      appointmentDate,
      userName: this.unregForm.value.name,
      gender: this.unregForm.value.gender,
      mobile: this.unregForm.value.mobile,
      status: 'booked',
      isQueueUpdateReminder: false
    };
    this.bookingService.bookUnregisteredUser(req).subscribe(
      () => {
        this._snackBar.open('Appointment booked successfully!', '', { duration: 3000 });
        this.selectedSlotId = '';
        this.slotSelectedDetail = {};
        this.closeTemplateSheetMenu();
      },
      () => {
        this._snackBar.open('Error booking appointment. Please try again.', '', { duration: 3000 });
      }
    );
  }

  onSubmit(form: any): void {
    // placeholder for form submission
  }

  getWeekDay(datestring: string): string {
    const date = new Date(datestring);
    return this.weekdays[date.getDay()];
  }
}
