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
  selectedService: any = null;
  bookingConfirmation: any = null;

  @ViewChild('confirmationSheet') ConfirmationSheet!: TemplateRef<any>;
  @ViewChild('knocdocPromoSheet') KnocdocPromoSheet!: TemplateRef<any>;

  services = [
    { name: 'Root Canal Treatment (RCT)', icon: 'https://clovecontent.s3.ap-south-1.amazonaws.com/All/2019/02/RCT.gif', description: 'Painless, modern root canal therapy to save your natural teeth and eliminate infection completely.', details: 'Root canal treatment removes infected pulp from inside your tooth, cleans and disinfects the canal, then fills and seals it. This saves your natural tooth and prevents the need for extraction. At our clinic, we use advanced rotary instruments and apex locators for precise, painless treatment with high success rates.' },
    { name: 'Dental Crowns', icon: 'https://clovecontent.s3.ap-south-1.amazonaws.com/All/2019/02/Crowns.gif', description: 'Custom-made crowns to restore damaged teeth for a natural, complete smile.', details: 'Dental crowns are tooth-shaped caps placed over damaged or weakened teeth to restore their shape, size, strength, and appearance. We offer metal-free ceramic crowns, zirconia crowns, and porcelain-fused-to-metal options customized to match your natural teeth perfectly.' },
    { name: 'Laser Dentistry', icon: 'https://clovecontent.s3.ap-south-1.amazonaws.com/All/2022/09/Laser-Treatment-1.gif', description: 'Cutting-edge laser treatments for gum disease and soft tissue procedures with minimal discomfort.', details: 'Our advanced diode laser technology enables minimally invasive treatments for gum disease, cavity preparation, teeth whitening, and soft tissue procedures. Laser dentistry means less pain, reduced bleeding, faster healing, and often no need for anesthesia.' },
    { name: 'Clear Aligners / Invisible Braces', icon: 'https://clovecontent.s3.ap-south-1.amazonaws.com/All/2025/06/Invisible-Braces-1.gif', description: 'Virtually invisible aligners that straighten your teeth without the look of traditional braces.', details: 'Clear aligners are custom-made, removable transparent trays that gradually move your teeth into the desired position. They are virtually invisible, comfortable, and allow you to eat and brush normally. We provide Invisalign and other premium aligner systems with 3D treatment planning.' },
    { name: 'Dental Fillings / Teeth Fillings', icon: 'https://clovecontent.s3.ap-south-1.amazonaws.com/All/2019/02/Dental-Fillings-1-1.gif', description: 'Natural-looking composite fillings that blend seamlessly with your teeth for invisible restoration.', details: 'We use tooth-colored composite resin fillings that bond directly to your tooth structure, providing a strong, natural-looking restoration. These mercury-free fillings are safe, durable, and virtually invisible, replacing old silver amalgam fillings.' },
    { name: 'Wisdom Teeth Removal', icon: 'https://clovecontent.s3.ap-south-1.amazonaws.com/All/2019/02/Wisdom-Tooth-1.gif', description: 'Safe and efficient extraction of wisdom teeth to prevent crowding and infection.', details: 'Wisdom teeth often cause problems like impaction, crowding, infection, or cyst formation. Our oral surgeons perform safe, minimally invasive extractions using advanced techniques. We ensure proper anesthesia, clear post-operative instructions, and follow-up care for quick recovery.' },
    { name: 'Dental Braces & Aligners', icon: 'https://clovecontent.s3.ap-south-1.amazonaws.com/All/2017/05/Braces-2.gif', description: 'Traditional metal braces and modern ceramic options for effective teeth straightening.', details: 'We offer a full range of orthodontic braces including traditional metal braces, tooth-colored ceramic braces, self-ligating braces, and lingual (behind-the-teeth) braces. Each treatment plan is customized using digital diagnostics and 3D planning for optimal results.' },
    { name: 'Dental Implants / Teeth Implants', icon: 'https://clovecontent.s3.ap-south-1.amazonaws.com/All/2019/02/Dental-Implants.gif', description: 'Permanent tooth replacement with titanium implants that look and feel like natural teeth.', details: 'Dental implants are titanium posts surgically placed into the jawbone to serve as artificial tooth roots. They provide a permanent, stable foundation for replacement teeth that look, feel, and function like natural teeth. We offer single implants, implant bridges, and full-arch solutions.' },
    { name: 'Dentures', icon: 'https://clovecontent.s3.ap-south-1.amazonaws.com/All/2019/02/Dentures.gif', description: 'Custom-fitted partial and complete dentures for a comfortable, natural-looking replacement.', details: 'Our custom dentures are crafted for a precise, comfortable fit. We offer complete dentures for full arch replacement, partial dentures for multiple missing teeth, flexible dentures for enhanced comfort, and implant-supported dentures for maximum stability.' },
    { name: 'Kids Dentistry', icon: 'https://clovecontent.s3.ap-south-1.amazonaws.com/All/2019/02/Kids-Dentistery.gif', description: 'Gentle orthodontic care to guide your child\'s dental development the right way.', details: 'Our child-friendly environment makes dental visits fun and stress-free. We provide preventive care including fluoride treatments and sealants, early orthodontic intervention, habit-breaking appliances, and gentle cavity treatments. Our team is specially trained to handle pediatric patients with care and patience.' },
    { name: 'Mouth Ulcers', icon: 'https://clovecontent.s3.ap-south-1.amazonaws.com/All/2019/02/Mouth-ulcers-1-2.gif', description: 'Expert diagnosis and treatment of oral ulcers for fast relief and healing.', details: 'Mouth ulcers can be painful and recurring. We provide thorough diagnosis to identify the cause — whether nutritional deficiency, stress, or underlying conditions — and offer effective treatments including medicated gels, laser therapy for instant pain relief, and preventive guidance.' },
    { name: 'Advanced Gum Treatment', icon: 'https://clovecontent.s3.ap-south-1.amazonaws.com/All/2017/05/Gum-Treatment.gif', description: 'Expert periodontal care including deep cleaning, scaling, and advanced treatments.', details: 'Gum disease affects the tissues supporting your teeth and can lead to tooth loss if untreated. We offer scaling and root planing (deep cleaning), flap surgery, gum grafting, and laser-assisted gum treatment. Early treatment preserves your natural teeth and prevents bone loss.' }
  ];

  @ViewChild('templateBottomSheet') TemplateBottomSheet!: TemplateRef<any>;
  @ViewChild('serviceDetailSheet') ServiceDetailSheet!: TemplateRef<any>;
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
      gender: ['', [Validators.required]],
      reasonForVisit: ['']
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
      reasonForVisit: this.unregForm.value.reasonForVisit || '',
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
      (res: any) => {
        this.bookingConfirmation = {
          patientName: req.userName,
          mobile: req.mobile,
          gender: req.gender,
          doctorName: req.doctorName,
          appointmentDate: req.appointmentDate,
          slotDay: req.slotDay,
          slotTime: this.slotSelectedDetail?.slotTime || '',
          sessionTime: (this.slotSelectedDetail?.sessionStartTime || '') + ' - ' + (this.slotSelectedDetail?.sessionEndTime || ''),
          clinicName: this.slotSelectedDetail?.clinicDetails?.clinicName || this.slotSelectedDetail?.clinicDetails?.name || '',
          clinicLocation: this.slotSelectedDetail?.clinicDetails?.clinicLocation || '',
          reasonForVisit: req.reasonForVisit,
          pin: req.pin,
          tokenNo: res?.tokenNo || res?.slotId || ''
        };
        this.selectedSlotId = '';
        this.slotSelectedDetail = {};
        this.closeTemplateSheetMenu();
        setTimeout(() => {
          this.bottomSheet.open(this.ConfirmationSheet, {
            panelClass: 'confirmation-sheet',
            disableClose: true
          });
        }, 400);
      },
      () => {
        this._snackBar.open('Error booking appointment. Please try again.', '', { duration: 3000 });
      }
    );
  }

  downloadConfirmation(): void {
    const el = document.getElementById('confirmation-card');
    if (!el) return;
    // Clone the card into body so html2canvas can access it outside the CDK overlay
    const clone = el.cloneNode(true) as HTMLElement;
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    clone.style.top = '0';
    clone.style.width = el.offsetWidth + 'px';
    document.body.appendChild(clone);
    // @ts-ignore
    import(/* webpackChunkName: "html2canvas" */ 'html2canvas').then((mod: any) => {
      const html2canvas = mod.default || mod;
      html2canvas(clone, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
        logging: false,
        imageTimeout: 5000
      }).then((canvas: HTMLCanvasElement) => {
        document.body.removeChild(clone);
        const link = document.createElement('a');
        link.download = `appointment-${this.bookingConfirmation?.appointmentDate || 'confirmation'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }).catch((err: any) => {
        document.body.removeChild(clone);
        console.error('html2canvas error:', err);
      });
    });
  }

  closeConfirmation(): void {
    this.bottomSheet.dismiss();
    setTimeout(() => {
      this.bottomSheet.open(this.KnocdocPromoSheet, {
        panelClass: 'knocdoc-promo-sheet'
      });
    }, 300);
  }

  closeKnocdocPromo(): void {
    this.bottomSheet.dismiss();
    this.bookingConfirmation = null;
  }

  openServiceDetail(service: any): void {
    this.selectedService = service;
    this.bottomSheet.open(this.ServiceDetailSheet, {
      panelClass: 'service-detail-sheet'
    });
  }

  bookFromService(): void {
    if (this.selectedService) {
      this.unregForm.patchValue({ reasonForVisit: this.selectedService.name });
    }
    this.bottomSheet.dismiss();
    setTimeout(() => {
      this.openTemplateSheetMenu();
    }, 300);
  }

  shareProfile(): void {
    const shareData = {
      title: this.profRes?.name || 'Dr. Jasbir Meher',
      text: `Book an appointment with ${this.profRes?.name || 'Dr. Jasbir Meher'} - ${this.profRes?.specialization || 'Orthodontist & Dental Surgeon'}`,
      url: window.location.href
    };
    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        this._snackBar.open('Profile link copied to clipboard!', '', { duration: 3000 });
      });
    }
  }

  onSubmit(form: any): void {
    // placeholder for form submission
  }

  getWeekDay(datestring: string): string {
    const date = new Date(datestring);
    return this.weekdays[date.getDay()];
  }
}
