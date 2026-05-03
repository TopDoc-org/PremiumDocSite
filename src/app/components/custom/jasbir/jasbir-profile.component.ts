import {
  AfterViewInit, Component, ElementRef, HostListener, Inject, OnDestroy, OnInit,
  Renderer2, TemplateRef, ViewChild
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import * as AOS from 'aos';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { BookingService } from '../../../services/booking.service';
import { DoctorConfigService } from '../../../services/doctor-config.service';
import { TenantService } from '../../../services/tenant.service';

@Component({
  selector: 'app-jasbir-profile',
  templateUrl: './jasbir-profile.component.html',
  styleUrls: ['./jasbir-profile.component.scss']
})
export class JasbirProfileComponent implements OnInit, AfterViewInit, OnDestroy {
  isMobileOrTabView = false;
  isMobileView = false;
  isQueueUpdateReminder = true;
  timelineFetchStatus: 'none' | 'fetching' | 'done' | 'error' = 'none';
  doctorId = '';
  profRes: any;
  private apiDoctorName = '';
  scheduleDetails: any[] = [];
  openBookByDefault = false;
  unregForm!: FormGroup;
  showProcedureDropdown = false;
  showAllOffers = false;
  animationsEnabled = true;
  darkMode = false;
  showLimitModal = false;
  activeSlide = 0;
  showSectionNav = false;
  activeSection = '';
  mobileMenuOpen = false;
  private sectionIds = ['sec-about', 'sec-tech', 'sec-offers', 'sec-services', 'sec-gallery', 'sec-contact'];
  private scrollListener: (() => void) | null = null;
  private jsonLdScriptTags: HTMLScriptElement[] = [];

  get clinicLogo(): string {
    return 'assets/images/jasbir/ClinicLogo.jpeg';
  }
  activeTechSlide = 0;
  showSidhantFull = false;
  showRajdeepFull = false;
  showPoojaFull = false;
  techImages = [
    { src: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&h=500&fit=crop', alt: 'Digital X-Ray Machine' },
    { src: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&h=500&fit=crop', alt: 'Dental Treatment Setup' },
    { src: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&h=500&fit=crop', alt: 'Modern Dental Equipment' },
    { src: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&h=500&fit=crop', alt: 'Advanced Diagnostics' },
    { src: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=800&h=500&fit=crop', alt: 'Intraoral Scanner in Action' }
  ];
  referredBy: string | null = null;
  sessionIdSelected = '';
  selectedSlotId = '';
  slotSelectedDetail: any = {};
  showSessionsinAbha = false;
  selectedService: any = null;
  bookingConfirmation: any = null;
  selectedClinicWidget = '';

  // Auth gate state
  authStep: 'none' | 'checking' | 'login' | 'register' | 'new-number' = 'none';
  authLoading = false;
  authError = '';
  pendingSessionId = '';
  loggedInToken = '';
  loggedInUserId = '';
  existingUserDetails: { name: string; mobile: string; gender: string } | null = null;
  isUnregisteredUpgrade = false; // true when existing user has userType: "unRegistered"

  // PIN auth state
  pinValue = '';
  confirmPinValue = '';
  pinResetCounter = 0;
  confirmPinResetCounter = 0;
  registerPinStep: 'create' | 'confirm' = 'create';

  // New number form state
  newNumberForm!: FormGroup;

  // Forgot password state
  showForgotPassword = false;
  forgotPasswordEmail = '';
  forgotPasswordLoading = false;
  forgotPasswordSent = false;
  forgotPasswordError = '';

  // KnocDoc typewriter
  knocdocPhrases = [
    'Want a site like this for your practice?',
    'Premium websites built for doctors',
    'Online booking & patient management',
    'Complete digital solution for clinics',
    'Grow your practice with KnocDoc',
    'SEO-optimized doctor profiles',
    'Built to get you more patients'
  ];
  knocdocTypewriterText = '';
  private knocdocTypewriterInterval: any;
  private knocdocPhraseIndex = 0;

  @ViewChild('confirmationSheet') ConfirmationSheet!: TemplateRef<any>;
  @ViewChild('knocdocPromoSheet') KnocdocPromoSheet!: TemplateRef<any>;

  services = [
    { name: 'Root Canal Treatment (RCT)', icon: 'https://clovecontent.s3.ap-south-1.amazonaws.com/All/2019/02/RCT.gif', description: 'Painless, modern root canal therapy to save your natural teeth and eliminate infection completely.', details: 'Root canal treatment removes infected pulp from inside your tooth, cleans and disinfects the canal, then fills and seals it. This saves your natural tooth and prevents the need for extraction. At our clinic, we use advanced rotary instruments and apex locators for precise, painless treatment with high success rates.' },
    { name: 'Dental Crowns', icon: 'https://clovecontent.s3.ap-south-1.amazonaws.com/All/2019/02/Crowns.gif', description: 'Custom-made crowns to restore damaged teeth for a natural, complete smile.', details: 'Dental crowns are tooth-shaped caps placed over damaged or weakened teeth to restore their shape, size, strength, and appearance. We offer metal-free ceramic crowns, zirconia crowns, and porcelain-fused-to-metal options customized to match your natural teeth perfectly.' },
   
    { name: 'Clear Aligners / Invisible Braces', icon: 'https://clovecontent.s3.ap-south-1.amazonaws.com/All/2025/06/Invisible-Braces-1.gif', description: 'Virtually invisible aligners that straighten your teeth without the look of traditional braces.', details: 'Clear aligners are custom-made, removable transparent trays that gradually move your teeth into the desired position. They are virtually invisible, comfortable, and allow you to eat and brush normally. We provide Invisalign and other premium aligner systems with 3D treatment planning.' },
    { name: 'Dental Fillings / Teeth Fillings', icon: 'https://clovecontent.s3.ap-south-1.amazonaws.com/All/2019/02/Dental-Fillings-1-1.gif', description: 'Natural-looking composite fillings that blend seamlessly with your teeth for invisible restoration.', details: 'We use tooth-colored composite resin fillings that bond directly to your tooth structure, providing a strong, natural-looking restoration. These mercury-free fillings are safe, durable, and virtually invisible, replacing old silver amalgam fillings.' },
    { name: 'Wisdom Teeth Removal', icon: 'https://clovecontent.s3.ap-south-1.amazonaws.com/All/2019/02/Wisdom-Tooth-1.gif', description: 'Safe and efficient extraction of wisdom teeth to prevent crowding and infection.', details: 'Wisdom teeth often cause problems like impaction, crowding, infection, or cyst formation. Our oral surgeons perform safe, minimally invasive extractions using advanced techniques. We ensure proper anesthesia, clear post-operative instructions, and follow-up care for quick recovery.' },
    { name: 'Dental Braces & Aligners', icon: 'https://clovecontent.s3.ap-south-1.amazonaws.com/All/2017/05/Braces-2.gif', description: 'Traditional metal braces and modern ceramic options for effective teeth straightening.', details: 'We offer a full range of orthodontic braces including traditional metal braces, tooth-colored ceramic braces, self-ligating braces, and lingual (behind-the-teeth) braces. Each treatment plan is customized using digital diagnostics and 3D planning for optimal results.' },
    { name: 'Dental Implants / Teeth Implants', icon: 'https://clovecontent.s3.ap-south-1.amazonaws.com/All/2019/02/Dental-Implants.gif', description: 'Permanent tooth replacement with titanium implants that look and feel like natural teeth.', details: 'Dental implants are titanium posts surgically placed into the jawbone to serve as artificial tooth roots. They provide a permanent, stable foundation for replacement teeth that look, feel, and function like natural teeth. We offer single implants, implant bridges, and full-arch solutions.' },
    { name: 'Dentures', icon: 'https://clovecontent.s3.ap-south-1.amazonaws.com/All/2019/02/Dentures.gif', description: 'Custom-fitted partial and complete dentures for a comfortable, natural-looking replacement.', details: 'Our custom dentures are crafted for a precise, comfortable fit. We offer complete dentures for full arch replacement, partial dentures for multiple missing teeth, flexible dentures for enhanced comfort, and implant-supported dentures for maximum stability.' },
    { name: 'Kids Dentistry', icon: 'https://clovecontent.s3.ap-south-1.amazonaws.com/All/2019/02/Kids-Dentistery.gif', description: 'Gentle orthodontic care to guide your child\'s dental development the right way.', details: 'Our child-friendly environment makes dental visits fun and stress-free. We provide preventive care including fluoride treatments and sealants, early orthodontic intervention, habit-breaking appliances, and gentle cavity treatments. Our team is specially trained to handle pediatric patients with care and patience.' },
    { name: 'Mouth Ulcers', icon: 'https://clovecontent.s3.ap-south-1.amazonaws.com/All/2019/02/Mouth-ulcers-1-2.gif', description: 'Expert diagnosis and treatment of oral ulcers for fast relief and healing.', details: 'Mouth ulcers can be painful and recurring. We provide thorough diagnosis to identify the cause — whether nutritional deficiency, stress, or underlying conditions — and offer effective treatments including medicated gels, laser therapy for instant pain relief, and preventive guidance.' },
    { name: 'Advanced Gum Treatment', icon: 'https://clovecontent.s3.ap-south-1.amazonaws.com/All/2017/05/Gum-Treatment.gif', description: 'Expert periodontal care including deep cleaning, scaling, and advanced treatments.', details: 'Gum disease affects the tissues supporting your teeth and can lead to tooth loss if untreated. We offer scaling and root planing (deep cleaning), flap surgery, gum grafting, and laser-assisted gum treatment. Early treatment preserves your natural teeth and prevents bone loss.' },
     { name: 'Laser Dentistry', icon: 'https://clovecontent.s3.ap-south-1.amazonaws.com/All/2022/09/Laser-Treatment-1.gif', description: 'Cutting-edge laser treatments for gum disease and soft tissue procedures with minimal discomfort.', details: 'Our advanced diode laser technology enables minimally invasive treatments for gum disease, cavity preparation, teeth whitening, and soft tissue procedures. Laser dentistry means less pain, reduced bleeding, faster healing, and often no need for anesthesia.' },
  ];

  @ViewChild('templateBottomSheet') TemplateBottomSheet!: TemplateRef<any>;
  @ViewChild('serviceDetailSheet') ServiceDetailSheet!: TemplateRef<any>;
  @ViewChild('confettiCanvas') confettiCanvas!: ElementRef<HTMLCanvasElement>;

  private offersObserver: IntersectionObserver | null = null;
  private confettiInstance: any = null;
  private confettiAnimId: number | null = null;
  private carouselInterval: any = null;
  private techCarouselInterval: any = null;
  private counterObserver: IntersectionObserver | null = null;
  private mediaQuery!: MediaQueryList;
  private mobileQuery!: MediaQueryList;

  weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  placeholderEducation = [
    { degree: 'PhD', studyField: 'Dental Science', institution: 'Kalinga Institute of Dental Science (KIDS), BBSR, Odisha', startDate: '', endDate: '', description: 'Doctoral research in dental science at one of the premier dental institutes in Eastern India.' },
    { degree: 'MDS', studyField: 'Orthodontics & Dentofacial Orthopedics', institution: 'Kothiwal Dental College & Research Center, Moradabad, UP', startDate: '', endDate: '', description: 'Specialized training in advanced orthodontic techniques, clear aligners, and dentofacial orthopedics.' },
    { degree: 'BDS', studyField: 'Dental Surgery', institution: 'Utkal University', startDate: '', endDate: '', description: 'Comprehensive dental education covering all aspects of oral healthcare and dental surgery.' }
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
    private doctorConfigService: DoctorConfigService,
    private tenantService: TenantService,
    private titleService: Title,
    private meta: Meta,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    // Force-clear any stale animation preference — animations must be on by default
    localStorage.removeItem('premiumAnimations');

    this.unregForm = this.fb.group({
      name: ['', [Validators.required]],
      mobile: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      email: ['', [Validators.email]],
      gender: ['male', [Validators.required]],
      reasonForVisit: ['', [Validators.required]],
      address: ['']
    });

    this.newNumberForm = this.fb.group({
      name: ['', [Validators.required]],
      mobile: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      email: ['', [Validators.email]],
      gender: ['male', [Validators.required]]
    });

    // Restore dark mode preference
    const savedDark = localStorage.getItem('jasbirDarkMode');
    this.darkMode = savedDark === 'true';

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
      this.doctorId = queryMap.get('doctorId') || queryMap.get('id')
        || this.tenantService.doctorId
        || '0e828c42-82da-4c56-bf35-a3e205161b92';
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
    this.techCarouselInterval = setInterval(() => {
      this.activeTechSlide = (this.activeTechSlide + 1) % this.techImages.length;
    }, 3500);

    // Section nav scroll listener
    const onScroll = () => {
      const scrollY = window.scrollY;
      this.showSectionNav = scrollY > 500;

      // Determine active section
      let current = '';
      for (const id of this.sectionIds) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 120) {
          current = id;
        }
      }
      this.activeSection = current;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    this.scrollListener = () => window.removeEventListener('scroll', onScroll);
  }

  ngOnDestroy(): void {
    if (this.counterObserver) this.counterObserver.disconnect();
    if (this.offersObserver) this.offersObserver.disconnect();
    this.stopConfetti();
    if (this.carouselInterval) clearInterval(this.carouselInterval);
    if (this.techCarouselInterval) clearInterval(this.techCarouselInterval);
    this.stopKnocdocTypewriter();
    if (this.scrollListener) this.scrollListener();

    // Clean up SEO meta tags
    this.titleService.setTitle('Doctor Sites');
    this.meta.removeTag('name="description"');
    this.meta.removeTag('name="keywords"');
    this.meta.removeTag('name="robots"');
    this.meta.removeTag('name="geo.region"');
    this.meta.removeTag('name="geo.placename"');
    this.meta.removeTag('name="geo.position"');
    this.meta.removeTag('name="ICBM"');
    this.meta.removeTag('property="og:title"');
    this.meta.removeTag('property="og:description"');
    this.meta.removeTag('property="og:type"');
    this.meta.removeTag('property="og:url"');
    this.meta.removeTag('property="og:image"');
    this.meta.removeTag('property="og:locale"');
    this.meta.removeTag('property="og:site_name"');
    this.meta.removeTag('name="twitter:card"');
    this.meta.removeTag('name="twitter:title"');
    this.meta.removeTag('name="twitter:description"');
    this.meta.removeTag('name="twitter:image"');

    const canonical = this.document.querySelector('link[rel="canonical"]');
    if (canonical) {
      this.renderer.removeChild(this.document.head, canonical);
    }

    // Restore default favicon
    const favicon = this.document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (favicon) {
      this.renderer.setAttribute(favicon, 'type', 'image/x-icon');
      this.renderer.setAttribute(favicon, 'href', 'favicon.ico');
    }

    this.jsonLdScriptTags.forEach(script => {
      if (script.parentNode) {
        this.renderer.removeChild(this.document.head, script);
      }
    });
    this.jsonLdScriptTags = [];
  }

  scrollToSection(id: string): void {
    const el = document.getElementById(id);
    if (el) {
      const offset = this.isMobileOrTabView ? 100 : 60;
      const targetTop = el.getBoundingClientRect().top + window.scrollY - offset;
      const startTop = window.scrollY;
      const distance = targetTop - startTop;
      const duration = Math.min(1800, Math.max(800, Math.abs(distance) * 0.8));
      let startTime: number | null = null;

      const easeInOutCubic = (t: number) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        window.scrollTo(0, startTop + distance * easeInOutCubic(progress));
        if (progress < 1) requestAnimationFrame(step);
      };

      requestAnimationFrame(step);
    }
  }

  private fetchProfileData(): void {
    this.bookingService.fetchDoctorProfile(this.doctorId).subscribe(
      (data: any) => {
        this.profRes = data?.results?.[0] || this.getDefaultProfile();
        this.apiDoctorName = this.profRes.name || '';
        if (this.profRes.name) {
          // Strip any existing prefixes (Dr., Prof., Prof. Dr., etc.) then add canonical prefix
          const cleanName = this.profRes.name.replace(/^(Prof\.\s*)?Dr\.\s*/i, '').replace(/^Prof\.\s*/i, '');
          this.profRes.name = 'Prof. Dr. ' + cleanName;
        }
        if (this.profRes.reviewTags) {
          const sortMap = Object.fromEntries(
            Object.entries(this.profRes.reviewTags).sort((a: any, b: any) => a[1] - b[1])
          );
          this.profRes.reviewList = Object.keys(sortMap);
        }
        const savedPref = localStorage.getItem('premiumAnimations');
        this.animationsEnabled = true; // Always on — premium profile always has animations
        this.timelineFetchStatus = 'done';
        this.setMetaTags();
        this.injectStructuredData();
        this.initAOS();
        this.initCounterAnimations();
        setTimeout(() => this.setupOffersConfettiObserver(), 300);
        this.startCarouselAutoplay();
        this.startKnocdocTypewriter();
        this.fetchClinicDetails();
        this.getSchedule();
      },
      () => {
        // If API fails, use default profile data so page still renders
        this.profRes = this.getDefaultProfile();
        this.animationsEnabled = true;
        this.timelineFetchStatus = 'done';
        this.setMetaTags();
        this.injectStructuredData();
        this.initAOS();
        this.initCounterAnimations();
        setTimeout(() => this.setupOffersConfettiObserver(), 300);
        this.startCarouselAutoplay();
        this.startKnocdocTypewriter();
        this.getSchedule();
      }
    );
  }

  private getDefaultProfile(): any {
    return {
      name: 'Prof. Dr. Jasbir Meher',
      city: 'Balangir',
      state: 'Odisha',
      specialization: 'Dentist',
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

  private setMetaTags(): void {
    const name = this.profRes?.name || 'Prof. Dr. Jasbir Meher';
    const specialization = this.profRes?.specialization || 'Dentist';
    const city = this.profRes?.city || 'Balangir';
    const state = this.profRes?.state || 'Odisha';
    const experience = this.profRes?.yearsOfExperience || '13';
    const rating = this.profRes?.averageRating || 4.9;
    const imageUrl = this.profRes?.profImageUrl?.src
      ? (this.profRes.profImageUrl.src.startsWith('http')
          ? this.profRes.profImageUrl.src
          : `${window.location.origin}/${this.profRes.profImageUrl.src}`)
      : `${window.location.origin}/assets/images/jasbir/profile.jpg`;
    const canonicalUrl = window.location.origin + window.location.pathname;

    const title = `${name} | Best ${specialization} & Orthodontist in ${city}, ${state}`;
    this.titleService.setTitle(title);

    const description = `${name} - Best ${specialization} & Orthodontist in ${city}, ${state}. BDS, MDS, PhD with ${experience}+ years experience. Invisalign provider, laser dentistry, braces & dental implants. Rated ${rating}/5. Book appointment online today.`;
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'keywords', content: [
      `best dentist in ${city}`, `dentist in ${city}`, `orthodontist in ${city}`,
      `best orthodontist in ${city}`, `dental clinic in ${city}`, `${city} dentist`,
      `best dental clinic ${city}`, `teeth braces ${city}`, `invisalign ${city}`,
      `clear aligners ${city}`, `root canal treatment ${city}`, `dental implants ${city}`,
      `laser dentistry ${city}`, `kids dentist ${city}`, `tooth extraction ${city}`,
      `dental crowns ${city}`, `teeth whitening ${city}`, `gum treatment ${city}`,
      name, `dentist ${state}`, `orthodontist ${state}`, `dental clinic ${state}`,
      `best dentist in ${state}`, 'orthodontic center balangir', 'dental surgeon balangir'
    ].join(', ') });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });

    // Geo meta tags for local SEO ("dentist near me" searches)
    this.meta.updateTag({ name: 'geo.region', content: 'IN-OR' }); // ISO 3166-2 for Odisha
    this.meta.updateTag({ name: 'geo.placename', content: `${city}, ${state}` });
    this.meta.updateTag({ name: 'geo.position', content: '20.6989;83.4636' }); // Balangir coordinates
    this.meta.updateTag({ name: 'ICBM', content: '20.6989, 83.4636' });

    // Set clinic logo as favicon
    this.setFavicon(`${window.location.origin}/assets/images/jasbir/ClinicLogo.jpeg`);

    // Open Graph
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });
    this.meta.updateTag({ property: 'og:image', content: imageUrl });
    this.meta.updateTag({ property: 'og:locale', content: 'en_IN' });
    this.meta.updateTag({ property: 'og:site_name', content: `${name} - Orthodontic Center & Dental Clinic` });

    // Twitter Card
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: imageUrl });

    this.setCanonicalUrl(canonicalUrl);
  }

  private setFavicon(url: string): void {
    let link: HTMLLinkElement | null = this.document.querySelector('link[rel="icon"]');
    if (!link) {
      link = this.renderer.createElement('link');
      this.renderer.setAttribute(link, 'rel', 'icon');
      this.renderer.appendChild(this.document.head, link);
    }
    this.renderer.setAttribute(link, 'type', 'image/jpeg');
    this.renderer.setAttribute(link, 'href', url);
  }

  private setCanonicalUrl(url: string): void {
    let link: HTMLLinkElement | null = this.document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = this.renderer.createElement('link');
      this.renderer.setAttribute(link, 'rel', 'canonical');
      this.renderer.appendChild(this.document.head, link);
    }
    this.renderer.setAttribute(link, 'href', url);
  }

  private injectStructuredData(): void {
    const name = this.profRes?.name || 'Prof. Dr. Jasbir Meher';
    const city = this.profRes?.city || 'Balangir';
    const state = this.profRes?.state || 'Odisha';
    const experience = this.profRes?.yearsOfExperience || '13';
    const rating = this.profRes?.averageRating || 4.9;
    const reviewCount = this.profRes?.noOfReviews || 127;
    const imageUrl = this.profRes?.profImageUrl?.src
      ? (this.profRes.profImageUrl.src.startsWith('http')
          ? this.profRes.profImageUrl.src
          : `${window.location.origin}/${this.profRes.profImageUrl.src}`)
      : `${window.location.origin}/assets/images/jasbir/profile.jpg`;
    const canonicalUrl = window.location.origin + window.location.pathname;

    // Schema 1: Dentist (LocalBusiness)
    const localBusiness = {
      '@context': 'https://schema.org',
      '@type': 'Dentist',
      'name': "Dr. Meher's Orthodontic Center & Dental Clinic",
      'image': imageUrl,
      'url': canonicalUrl,
      'telephone': '+91-9437975834',
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': 'Hotel Sai Palace, Kacheri Chowk, In front of Priyadarshani Cinema Hall',
        'addressLocality': city,
        'addressRegion': state,
        'addressCountry': 'IN'
      },
      'openingHoursSpecification': {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        'opens': '09:00',
        'closes': '20:00'
      },
      'priceRange': '$$',
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': rating,
        'bestRating': 5,
        'worstRating': 1,
        'ratingCount': reviewCount
      },
      'medicalSpecialty': 'Orthodontics',
      'availableService': this.services.map(s => ({
        '@type': 'MedicalProcedure',
        'name': s.name,
        'description': s.description
      }))
    };

    // Schema 2: Person (Doctor)
    const doctor = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      'name': name,
      'image': imageUrl,
      'url': canonicalUrl,
      'jobTitle': 'Orthodontist & Dental Surgeon',
      'description': `${name} is an experienced orthodontist and dental surgeon with ${experience}+ years of practice in ${city}, ${state}.`,
      'medicalSpecialty': 'Orthodontics',
      'alumniOf': this.placeholderEducation.map(edu => ({
        '@type': 'EducationalOrganization',
        'name': edu.institution
      })),
      'knowsAbout': this.services.map(s => s.name),
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': city,
        'addressRegion': state,
        'addressCountry': 'IN'
      }
    };

    // Schema 3: BreadcrumbList
    const breadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': window.location.origin },
        { '@type': 'ListItem', 'position': 2, 'name': name, 'item': canonicalUrl }
      ]
    };

    [localBusiness, doctor, breadcrumb].forEach(schema => {
      const script = this.renderer.createElement('script');
      this.renderer.setAttribute(script, 'type', 'application/ld+json');
      script.text = JSON.stringify(schema);
      this.renderer.appendChild(this.document.head, script);
      this.jsonLdScriptTags.push(script);
    });
  }

  private fetchClinicDetails(): void {
    if (!this.doctorId) return;
    this.bookingService.getOrgContracts(this.doctorId).subscribe(
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
    this.bookingService.getOrgDetails(idList).subscribe(
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

  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
    localStorage.setItem('jasbirDarkMode', String(this.darkMode));
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleAnimations(): void {
    this.animationsEnabled = !this.animationsEnabled;
    // Only persist 'true' so a reload always re-enables animations
    if (this.animationsEnabled) {
      localStorage.removeItem('premiumAnimations');
      window.location.reload();
    } else {
      AOS.refreshHard();
    }
  }

  initAOS(): void {
    if (this.animationsEnabled) {
      const isMobile = window.innerWidth < 768;
      // Delay long enough for Angular change detection to flush [attr.data-aos] bindings into the DOM
      setTimeout(() => {
        AOS.init({
          duration: isMobile ? 500 : 800,
          easing: 'ease-out',
          once: true,
          offset: isMobile ? 20 : 80,
          delay: isMobile ? 0 : undefined
        });
        AOS.refresh();
      }, 200);
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
    const duration = 2800;
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
    this.activeSlide = (this.activeSlide + 1) % 6;
    this.resetCarouselAutoplay();
  }

  prevSlide(): void {
    this.activeSlide = (this.activeSlide - 1 + 6) % 6;
    this.resetCarouselAutoplay();
  }

  goToSlide(index: number): void {
    this.activeSlide = index;
    this.resetCarouselAutoplay();
  }

  private startCarouselAutoplay(): void {
    if (!this.animationsEnabled) return;
    this.carouselInterval = setInterval(() => {
      this.activeSlide = (this.activeSlide + 1) % 6;
    }, 4000);
  }

  private resetCarouselAutoplay(): void {
    if (this.carouselInterval) clearInterval(this.carouselInterval);
    this.startCarouselAutoplay();
  }

  startKnocdocTypewriter(): void {
    this.knocdocPhraseIndex = 0;
    this.typePhrase();
  }

  private typePhrase(): void {
    const phrase = this.knocdocPhrases[this.knocdocPhraseIndex];
    let charIndex = 0;
    this.knocdocTypewriterText = '';

    // Type in
    this.knocdocTypewriterInterval = setInterval(() => {
      if (charIndex < phrase.length) {
        this.knocdocTypewriterText = phrase.substring(0, charIndex + 1);
        charIndex++;
      } else {
        clearInterval(this.knocdocTypewriterInterval);
        // Pause, then erase
        this.knocdocTypewriterInterval = setTimeout(() => {
          this.erasePhrase(phrase);
        }, 2000);
      }
    }, 50);
  }

  private erasePhrase(phrase: string): void {
    let charIndex = phrase.length;
    this.knocdocTypewriterInterval = setInterval(() => {
      if (charIndex > 0) {
        charIndex--;
        this.knocdocTypewriterText = phrase.substring(0, charIndex);
      } else {
        clearInterval(this.knocdocTypewriterInterval);
        this.knocdocPhraseIndex = (this.knocdocPhraseIndex + 1) % this.knocdocPhrases.length;
        // Small pause before next phrase
        this.knocdocTypewriterInterval = setTimeout(() => {
          this.typePhrase();
        }, 400);
      }
    }, 30);
  }

  private stopKnocdocTypewriter(): void {
    if (this.knocdocTypewriterInterval) {
      clearInterval(this.knocdocTypewriterInterval);
      clearTimeout(this.knocdocTypewriterInterval);
    }
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

  get clinicNamesWidget(): string[] {
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

  getClinicIdByName(name: string): string {
    for (const sched of this.scheduleDetails) {
      for (const session of (sched.sessions || [])) {
        const n = session?.clinic?.clinicName || session?.clinic?.name || session?.clinic?.clinicId || session?.clinic?.id || '';
        if (n === name) return session?.clinic?.clinicId || session?.clinic?.id || '';
      }
    }
    return '';
  }

  get effectiveClinicWidget(): string {
    const names = this.clinicNamesWidget;
    if (names.length === 1) return names[0];
    return this.selectedClinicWidget;
  }

  get isSheetFormFilled(): boolean {
    if (!this.unregForm) return false;
    const name = this.unregForm.get('name')?.value?.trim();
    const mobile = this.unregForm.get('mobile')?.value?.trim();
    const email = this.unregForm.get('email')?.value?.trim();
    const gender = this.unregForm.get('gender')?.value;
    const reason = this.unregForm.get('reasonForVisit')?.value;
    const clinicOk = this.clinicNamesWidget.length === 0 || !!this.effectiveClinicWidget;
    const mobileValid = /^\d{10}$/.test(mobile || '');
    const emailValid = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    return !!name && mobileValid && emailValid && !!gender && !!reason && clinicOk;
  }

  openTemplateSheetMenu(procedure: string = ''): void {
    this.unregForm.patchValue({ reasonForVisit: procedure });
    const names = this.clinicNamesWidget;
    this.selectedClinicWidget = names[0] || '';
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
    if (!sessionId || !this.isSheetFormFilled) return;
    this.openAuthStep(sessionId);
  }

  selectProcedure(value: string): void {
    this.unregForm.get('reasonForVisit')?.setValue(value);
    this.unregForm.get('reasonForVisit')?.markAsTouched();
    this.showProcedureDropdown = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.procedure-dropdown')) {
      this.showProcedureDropdown = false;
    }
  }

  openAuthStep(sessionId: string): void {
    this.pendingSessionId = sessionId;
    this.authStep = 'checking';
    this.authError = '';
    this.pinValue = '';
    this.confirmPinValue = '';
    this.pinResetCounter++;
    this.confirmPinResetCounter++;
    this.registerPinStep = 'create';
    this.isUnregisteredUpgrade = false;
    this.existingUserDetails = null;

    const mobile = this.unregForm.get('mobile')?.value?.trim() || '';
    this.bookingService.checkMobileRegistered(mobile).subscribe({
      next: (res: any) => {
        if (res?.hits > 0) {
          const user = res?.results?.[0] || res?.result?.[0] || res;
          const userType = user?.userType || '';

          const userName = user?.name
            || ((user?.firstName || '') + ' ' + (user?.lastName || '')).trim()
            || '';
          this.existingUserDetails = {
            name: userName,
            mobile: user?.mobileNumber || user?.mobile || mobile,
            gender: user?.gender || ''
          };
          if (this.existingUserDetails.name) {
            this.unregForm.patchValue({ name: this.existingUserDetails.name });
          }
          if (this.existingUserDetails.gender) {
            this.unregForm.patchValue({ gender: this.existingUserDetails.gender.toLowerCase() });
          }

          if (userType === 'unRegistered') {
            // User exists but never set a PIN — treat as new registration
            this.isUnregisteredUpgrade = true;
            this.authStep = 'register';
          } else {
            this.authStep = 'login';
          }
        } else {
          this.authStep = 'register';
        }
      },
      error: () => {
        this.authStep = 'login';
      }
    });
  }

  cancelAuth(): void {
    this.authStep = 'none';
    this.pendingSessionId = '';
    this.authError = '';
    this.pinValue = '';
    this.confirmPinValue = '';
    this.pinResetCounter++;
    this.confirmPinResetCounter++;
    this.registerPinStep = 'create';
    this.isUnregisteredUpgrade = false;
    this.existingUserDetails = null;
    this.showForgotPassword = false;
    this.forgotPasswordEmail = '';
    this.forgotPasswordSent = false;
    this.forgotPasswordError = '';
  }

  switchAuthMode(mode: 'login' | 'register'): void {
    this.authStep = mode;
    this.authError = '';
    this.pinValue = '';
    this.confirmPinValue = '';
    this.pinResetCounter++;
    this.confirmPinResetCounter++;
    this.registerPinStep = 'create';
    this.isUnregisteredUpgrade = false;
    this.showForgotPassword = false;
    this.forgotPasswordEmail = '';
    this.forgotPasswordSent = false;
    this.forgotPasswordError = '';
  }

  openNewNumberForm(): void {
    this.authStep = 'new-number';
    this.authError = '';
    this.pinValue = '';
    this.confirmPinValue = '';
    this.pinResetCounter++;
    this.confirmPinResetCounter++;
    this.registerPinStep = 'create';
    this.newNumberForm.reset({
      name: this.unregForm.get('name')?.value?.trim() || '',
      mobile: '',
      email: this.unregForm.get('email')?.value?.trim() || '',
      gender: this.unregForm.get('gender')?.value || 'male'
    });
  }

  submitNewNumber(): void {
    this.newNumberForm.markAllAsTouched();
    if (this.newNumberForm.invalid) return;

    const mobile = this.newNumberForm.get('mobile')?.value?.trim();
    this.unregForm.patchValue({
      name: this.newNumberForm.get('name')?.value?.trim(),
      mobile,
      email: this.newNumberForm.get('email')?.value?.trim(),
      gender: this.newNumberForm.get('gender')?.value
    });

    this.authStep = 'checking';
    this.authError = '';
    this.existingUserDetails = null;
    this.bookingService.checkMobileRegistered(mobile).subscribe({
      next: (res: any) => {
        if (res?.hits > 0) {
          const user = res?.results?.[0] || res?.result?.[0] || res;
          const userName = user?.name
            || ((user?.firstName || '') + ' ' + (user?.lastName || '')).trim()
            || '';
          this.existingUserDetails = {
            name: userName,
            mobile: user?.mobileNumber || user?.mobile || mobile,
            gender: user?.gender || ''
          };
          if (this.existingUserDetails.name) {
            this.unregForm.patchValue({ name: this.existingUserDetails.name });
          }
          if (this.existingUserDetails.gender) {
            this.unregForm.patchValue({ gender: this.existingUserDetails.gender.toLowerCase() });
          }
          this.authStep = 'login';
        } else {
          this.authStep = 'register';
        }
      },
      error: () => {
        this.authStep = 'login';
      }
    });
  }

  sendForgotPassword(): void {
    if (!this.forgotPasswordEmail?.trim()) {
      this.forgotPasswordError = 'Please enter your email address.';
      return;
    }
    this.forgotPasswordLoading = true;
    this.forgotPasswordError = '';
    this.bookingService.sendForgotPassword(this.forgotPasswordEmail.trim()).subscribe({
      next: () => {
        this.forgotPasswordLoading = false;
        this.forgotPasswordSent = true;
      },
      error: (err: any) => {
        this.forgotPasswordLoading = false;
        this.forgotPasswordError = err.error?.message || 'Email not found. Please check and try again.';
      }
    });
  }

  onPinComplete(pin: string): void {
    this.pinValue = pin;
    if (this.authStep === 'register' && this.registerPinStep === 'create') {
      this.registerPinStep = 'confirm';
      this.confirmPinValue = '';
      this.confirmPinResetCounter++;
    }
  }

  onPinChange(pin: string): void {
    this.pinValue = pin;
    this.authError = '';
  }

  onConfirmPinComplete(pin: string): void {
    this.confirmPinValue = pin;
    if (this.authStep === 'register') {
      this.submitAuth();
    }
  }

  onConfirmPinChange(pin: string): void {
    this.confirmPinValue = pin;
    this.authError = '';
  }

  submitAuth(): void {
    const mobile = this.unregForm.get('mobile')?.value;

    if (this.pinValue.length !== 4) {
      this.authError = 'Please enter all 4 digits of your PIN.';
      return;
    }
    const password = this.pinValue;

    if (this.authStep === 'login') {
      this.authLoading = true;
      this.authError = '';
      this.bookingService.loginUser(mobile, password).subscribe({
        next: (res: any) => {
          this.authLoading = false;
          this.loggedInToken = res.token;
          this.loggedInUserId = res.userDetails?.userId || '';
          this.authStep = 'none';
          this.executeBooking(this.pendingSessionId);
        },
        error: (err: any) => {
          this.authLoading = false;
          if (err.status === 401) {
            this.authError = 'Incorrect PIN. Please try again.';
          } else {
            this.authError = err.error?.message || 'Login failed. Please try again.';
          }
        }
      });
    } else {
      if (this.confirmPinValue !== this.pinValue) {
        this.authError = 'PINs do not match. Please try again.';
        this.pinValue = '';
        this.confirmPinValue = '';
        this.pinResetCounter++;
        this.confirmPinResetCounter++;
        this.registerPinStep = 'create';
        return;
      }
      const confirmPassword = this.confirmPinValue;

      const name = this.unregForm.get('name')?.value?.trim() || '';
      const nameParts = name.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || nameParts[0];
      const signupEmail = this.unregForm.get('email')?.value?.trim();

      this.authLoading = true;
      this.authError = '';

      if (this.isUnregisteredUpgrade) {
        // User already exists with userType: "unRegistered" — set their PIN and upgrade
        const setPinPayload: any = {
          mobile,
          pin: password,
          name,
          first_name: firstName,
          last_name: lastName,
          gender: this.unregForm.get('gender')?.value || '',
          address: this.unregForm.get('address')?.value || '',
          dob: null,
          acceptTerms: true,
        };
        if (signupEmail) { setPinPayload.email = signupEmail; }

        this.bookingService.setUserPin(setPinPayload).subscribe({
          next: () => {
            this.bookingService.loginUser(mobile, password).subscribe({
              next: (loginRes: any) => {
                this.authLoading = false;
                this.loggedInToken = loginRes.token;
                this.loggedInUserId = loginRes.userDetails?.userId || '';
                this.isUnregisteredUpgrade = false;
                this.authStep = 'none';
                this.executeBooking(this.pendingSessionId);
              },
              error: () => {
                this.authLoading = false;
                this.authError = 'PIN set! Please login to confirm your booking.';
                this.isUnregisteredUpgrade = false;
                this.switchAuthMode('login');
              }
            });
          },
          error: (err: any) => {
            this.authLoading = false;
            if (err.status === 409) {
              // Already fully registered — switch to login
              this.isUnregisteredUpgrade = false;
              this.authError = 'This number is already registered. Please login.';
              this.switchAuthMode('login');
            } else {
              this.authError = err.error?.message || 'Failed to set PIN. Please try again.';
            }
          }
        });
      } else {
        const signupPayload: any = {
          firstName,
          lastName,
          name,
          mobileNumber: mobile,
          password,
          confirmPassword,
          role: 'user',
          userType: 'registered',
          gender: this.unregForm.get('gender')?.value || '',
          address: this.unregForm.get('address')?.value || '',
          dob: null,
          rights: null,
          isEmailVerified: false,
          emailVerificationOtp: null,
          acceptTerms: true,
          referredBy: '',
          isQueueUpdateReminder: this.isQueueUpdateReminder
        };
        if (signupEmail) { signupPayload.email = signupEmail; }

        this.bookingService.signupUser(signupPayload).subscribe({
          next: () => {
            this.bookingService.loginUser(mobile, password).subscribe({
              next: (loginRes: any) => {
                this.authLoading = false;
                this.loggedInToken = loginRes.token;
                this.loggedInUserId = loginRes.userDetails?.userId || '';
                this.authStep = 'none';
                this.executeBooking(this.pendingSessionId);
              },
              error: () => {
                this.authLoading = false;
                this.authError = 'Account created! Please login to confirm your booking.';
                this.switchAuthMode('login');
              }
            });
          },
          error: (err: any) => {
            this.authLoading = false;
            if (err.status === 409) {
              this.authError = 'This mobile number is already registered. Please login instead.';
              this.switchAuthMode('login');
            } else {
              this.authError = err.error?.message || 'Registration failed. Please try again.';
            }
          }
        });
      }
    }
  }

  private executeBooking(sessionId: string): void {
    if (!sessionId) return;
    const today = new Date();
    const appointmentDate = today.getFullYear() + '-' +
      (today.getMonth() + 1).toString().padStart(2, '0') + '-' +
      today.getDate().toString().padStart(2, '0');
    const slotDay = this.weekdays[today.getDay()];
    const slot = this.slotSelectedDetail;
    const clinic = slot?.clinicDetails || {};

    const req: any = {
      doctorId: this.doctorId,
      doctorName: this.apiDoctorName || this.profRes?.name || '',
      clinicDetails: {
        clinicId: clinic.clinicId || clinic.id || '',
        clinicName: clinic.clinicName || clinic.name || '',
        geoPoint: clinic.geoPoint || ''
      },
      clinicId: clinic.clinicId || clinic.id || '',
      sessionId,
      slotId: slot?.slotId || '',
      reasonForVisit: this.unregForm.value.reasonForVisit || '',
      slotType: 'normal',
      status: 'booked',
      appointmentType: 'Inperson',
      slotTime: slot?.slotTime || '',
      slotDay,
      userId: this.loggedInUserId,
      userType: 'registered',
      bookingTimeStamp: new Date().toISOString(),
      appointmentDate,
      sessionStartTime: slot?.sessionStartTime || '',
      sessionEndTime: slot?.sessionEndTime || '',
      userName: this.unregForm.value.name,
      gender: this.unregForm.value.gender,
      pin: Math.floor(Math.random() * 9000) + 1000 + '',
      paymentStatus: 'default',
      mobile: this.unregForm.value.mobile,
      predictedSlotTime: slot?.slotTime || '',
      isQueueUpdateReminder: this.isQueueUpdateReminder
    };
    const bookingEmail = this.unregForm.value.email?.trim();
    if (bookingEmail) { req.email = bookingEmail; }
    const doBooking = () => {
      this.bookingService.bookRegisteredUser(req, this.loggedInToken).subscribe(
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
    };

    this.bookingService.checkUserSessionBookings(this.doctorId, sessionId, req.mobile).subscribe({
      next: (checkRes: any) => {
        // API returns { hits: <number>, result: [...] }
        // Use top-level hits count (already filtered); fall back to counting result[] by mobile
        const bookedCount = typeof checkRes?.hits === 'number'
          ? checkRes.hits
          : (checkRes?.result || []).filter((r: any) => r?.mobile === req.mobile).length;
        if (bookedCount >= 2) {
          this.showLimitModal = true;
          return;
        }
        doBooking();
      },
      error: () => doBooking()
    });
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
    const procedure = this.selectedService?.name || '';
    this.bottomSheet.dismiss();
    setTimeout(() => {
      this.openTemplateSheetMenu(procedure);
    }, 300);
  }

  shareProfile(): void {
    const shareData = {
      title: this.profRes?.name || 'Prof. Dr. Jasbir Meher',
      text: `Book an appointment with ${this.profRes?.name || 'Prof. Dr. Jasbir Meher'} - ${this.profRes?.specialization || 'Dentist'}`,
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
