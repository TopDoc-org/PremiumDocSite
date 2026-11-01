import { Component, OnInit, AfterViewInit, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import * as AOS from 'aos';
import { environment } from '../../../environments/environment';

interface FontPair {
  name: string;
  heading: string;
  body: string;
  url: string;
}

// Non-destructive crop: focal point (%) + zoom, so it works for pasted URLs
// (which can't be re-encoded because of CORS) and fits in a share link.
interface PhotoCrop {
  x: number;
  y: number;
  zoom: number;
  // Show the whole photo inside the frame instead of filling it
  fit: boolean;
}

type PracticeType = 'dental' | 'general';

interface PracticeService {
  name: string;
  // Practices without photos fall back to an icon tile
  image?: string;
  matIcon: string;
  description: string;
}

interface PracticeContent {
  label: string;
  careType: string;
  heroOutcome: string;
  aboutTraining: string;
  aboutOutcome: string;
  checks: string[];
  statLabel: string;
  ctaBadge: string;
  ctaTitle: string;
  ctaBody: string;
  sampleProcedure: string;
  showGallery: boolean;
  services: PracticeService[];
  testimonials: { name: string; initials: string; text: string; treatment: string; color: string }[];
  education: { degree: string; studyField: string; institution: string; startDate: string; endDate: string; description: string }[];
  experience: { title: string; startDate: string; endDate: string; description: string }[];
}

interface DemoConfig {
  doctorName: string;
  degree: string;
  specialization: string;
  clinicName: string;
  clinicTagline: string;
  city: string;
  state: string;
  experience: string;
  rating: string;
  tagline: string;
  phone: string;
  profileImage: string;
  photoCrop: PhotoCrop;
  primaryColor: string;
  fontPair: string;
  practice: PracticeType;
}

interface MockSlot {
  time: string;
  status: 'available' | 'booked';
}

interface MockSession {
  label: string;
  timeRange: string;
  slots: MockSlot[];
}

interface MockDay {
  day: string;
  date: string;
  sessions: MockSession[];
}

@Component({
  selector: 'app-demo-profile',
  templateUrl: './demo-profile.component.html',
  styleUrls: [
    '../custom/jasbir/jasbir-profile.component.scss',
    './demo-profile.component.scss'
  ]
})
export class DemoProfileComponent implements OnInit, AfterViewInit {
  animationsEnabled = true;
  editPanelOpen = false;
  featuresOpen = false;
  shareTooltip = '';

  config: DemoConfig = {
    doctorName: 'Rajesh Sharma',
    degree: 'BDS, MDS',
    specialization: 'Orthodontist & Implantologist',
    clinicName: 'Smile Perfect Dental Clinic',
    clinicTagline: '& Advanced Dental Care Center',
    city: 'Bhubaneswar',
    state: 'Odisha',
    experience: '12',
    rating: '4.9',
    tagline: 'Your smile is our priority.',
    phone: '9876543210',
    profileImage: '',
    photoCrop: { x: 50, y: 25, zoom: 1, fit: false },
    primaryColor: '#2563eb',
    fontPair: 'Outfit + DM Sans',
    practice: 'dental'
  };

  showAllFonts = false;
  initialFontCount = 4;

  fontPairs: FontPair[] = [
    // Featured (shown by default)
    { name: 'Outfit + DM Sans', heading: "'Outfit'", body: "'DM Sans'", url: 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap' },
    { name: 'Playfair + DM Sans', heading: "'Playfair Display'", body: "'DM Sans'", url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=DM+Sans:wght@400;500;600;700&display=swap' },
    { name: 'Poppins + Inter', heading: "'Poppins'", body: "'Inter'", url: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap' },
    { name: 'Sora + Source Sans 3', heading: "'Sora'", body: "'Source Sans 3'", url: 'https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Source+Sans+3:wght@400;500;600;700&display=swap' },
    // More options (shown on expand)
    { name: 'Libre Baskerville + Karla', heading: "'Libre Baskerville'", body: "'Karla'", url: 'https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Karla:wght@400;500;600;700&display=swap' },
    { name: 'Space Grotesk + Work Sans', heading: "'Space Grotesk'", body: "'Work Sans'", url: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Work+Sans:wght@400;500;600;700&display=swap' },
    { name: 'Lora + Nunito', heading: "'Lora'", body: "'Nunito'", url: 'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Nunito:wght@400;500;600;700&display=swap' },
    { name: 'Merriweather + Open Sans', heading: "'Merriweather'", body: "'Open Sans'", url: 'https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,400;0,700;0,900;1,400&family=Open+Sans:wght@400;500;600;700&display=swap' },
    { name: 'Raleway + Lato', heading: "'Raleway'", body: "'Lato'", url: 'https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700;800&family=Lato:wght@400;700&display=swap' },
    { name: 'Cormorant + Mulish', heading: "'Cormorant Garamond'", body: "'Mulish'", url: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Mulish:wght@400;500;600;700&display=swap' },
    { name: 'Josefin Sans + Quicksand', heading: "'Josefin Sans'", body: "'Quicksand'", url: 'https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@400;500;600;700&family=Quicksand:wght@400;500;600;700&display=swap' },
    { name: 'Crimson Pro + Manrope', heading: "'Crimson Pro'", body: "'Manrope'", url: 'https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Manrope:wght@400;500;600;700&display=swap' },
  ];

  get visibleFontPairs(): FontPair[] {
    return this.showAllFonts ? this.fontPairs : this.fontPairs.slice(0, this.initialFontCount);
  }

  private loadedFontUrls = new Set<string>();

  colorPresets = [
    { name: 'Blue', color: '#2563eb' },
    { name: 'Teal', color: '#0d9488' },
    { name: 'Purple', color: '#7c3aed' },
    { name: 'Rose', color: '#e11d48' },
    { name: 'Orange', color: '#ea580c' },
    { name: 'Green', color: '#16a34a' },
    { name: 'Indigo', color: '#4f46e5' },
    { name: 'Slate', color: '#475569' }
  ];

  practices: Record<PracticeType, PracticeContent> = {
    dental: {
      label: 'Dental',
      careType: 'dental care',
      heroOutcome: 'crafting beautiful, healthy smiles',
      aboutTraining: 'advanced training in restorative, laser, and cosmetic dentistry',
      aboutOutcome: 'create beautiful, healthy smiles',
      checks: ['Comprehensive Restorative, Cosmetic & Implant Dentistry', 'Advanced Laser Dentistry & Pain-Free Treatments'],
      statLabel: 'Smiles Created',
      ctaBadge: 'Your Smile Matters',
      ctaTitle: 'Perfect Smile?',
      ctaBody: 'Take the first step towards a healthier, brighter smile.',
      sampleProcedure: 'Dental Implants',
      showGallery: true,
      services: [
        { name: 'Root Canal Treatment (RCT)', image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=400&h=300&fit=crop', matIcon: 'healing', description: 'Painless, modern root canal therapy to save your natural teeth and eliminate infection completely.' },
        { name: 'Dental Crowns', image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=400&h=300&fit=crop', matIcon: 'star_border', description: 'Custom-made crowns to restore damaged teeth for a natural, complete smile.' },
        { name: 'Laser Dentistry', image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=300&fit=crop', matIcon: 'flash_on', description: 'Cutting-edge laser treatments for gum disease and soft tissue with minimal discomfort.' },
        { name: 'Clear Aligners / Invisible Braces', image: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=400&h=300&fit=crop', matIcon: 'visibility', description: 'Virtually invisible aligners that straighten your teeth without traditional braces.' },
        { name: 'Dental Fillings', image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400&h=300&fit=crop', matIcon: 'build', description: 'Tooth-colored composite fillings that blend seamlessly with your natural teeth.' },
        { name: 'Wisdom Teeth Removal', image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=400&h=300&fit=crop', matIcon: 'content_cut', description: 'Safe, expert removal of impacted wisdom teeth with minimal recovery time.' },
        { name: 'Dental Braces & Aligners', image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=400&h=300&fit=crop', matIcon: 'straighten', description: 'Metal, ceramic, and self-ligating braces for precise teeth alignment.' },
        { name: 'Dental Implants', image: 'https://images.unsplash.com/photo-1629909615184-74f495363b67?w=400&h=300&fit=crop', matIcon: 'settings', description: 'Permanent titanium implants that look and function like natural teeth.' },
        { name: 'Dentures', image: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=400&h=300&fit=crop', matIcon: 'sentiment_satisfied_alt', description: 'Custom removable or fixed dentures for a confident, comfortable smile.' },
        { name: 'Teeth Whitening', image: 'https://images.unsplash.com/photo-1606265752439-1f18756aa5fc?w=400&h=300&fit=crop', matIcon: 'wb_sunny', description: 'Professional whitening treatments for a brighter, more confident smile.' }
      ],
      testimonials: [
        { name: 'Priya Mohanty', initials: 'PM', text: 'Got my braces done here and the results are incredible. The doctor was so patient and explained everything clearly.', treatment: 'Braces & Alignment', color: 'linear-gradient(135deg, #ec4899, #be185d)' },
        { name: 'Amit Patel', initials: 'AP', text: 'Best dental experience I\'ve ever had. The root canal was completely painless. Highly recommend this clinic!', treatment: 'Root Canal Treatment', color: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' },
        { name: 'Sunita Das', initials: 'SD', text: 'My kids love visiting this clinic. The staff is so friendly and caring. Finally found a dentist they aren\'t afraid of!', treatment: 'Kids Dentistry', color: 'linear-gradient(135deg, #10b981, #059669)' }
      ],
      education: [
        { degree: 'MDS', studyField: 'Master of Dental Surgery', institution: 'SCB Medical College, Cuttack', startDate: '2008', endDate: '2011', description: '' },
        { degree: 'BDS', studyField: 'Bachelor of Dental Surgery', institution: 'KIMS Dental College, Bhubaneswar', startDate: '2003', endDate: '2008', description: '' }
      ],
      experience: [
        { title: 'Chief Dental Surgeon & Founder', startDate: '2015', endDate: '', description: 'Leading the practice with a focus on advanced, patient-first dental care.' },
        { title: 'Senior Dental Consultant', startDate: '2011', endDate: '2015', description: 'Provided specialist dental care and trained junior dental surgeons.' }
      ]
    },
    general: {
      label: 'General Medicine',
      careType: 'medical care',
      heroOutcome: 'delivering attentive, evidence-based care',
      aboutTraining: 'advanced training in preventive and internal medicine',
      aboutOutcome: 'help families stay healthy',
      checks: ['Comprehensive Diagnosis & Long-Term Disease Management', 'Preventive Care, Screening & Health Counselling'],
      statLabel: 'Patients Treated',
      ctaBadge: 'Your Health Matters',
      ctaTitle: 'Healthier You?',
      ctaBody: 'Take the first step towards better health.',
      sampleProcedure: 'General Consultation',
      showGallery: false,
      services: [
        { name: 'General Consultation', matIcon: 'medical_services', description: 'Thorough, unhurried consultations for everyday illnesses and health concerns.' },
        { name: 'Diabetes Care', matIcon: 'bloodtype', description: 'Ongoing monitoring and personalised plans to keep blood sugar under control.' },
        { name: 'Blood Pressure Management', matIcon: 'monitor_heart', description: 'Accurate assessment and long-term management of hypertension.' },
        { name: 'Preventive Health Checkups', matIcon: 'health_and_safety', description: 'Age-appropriate screening packages that catch problems early.' },
        { name: 'Fever & Infections', matIcon: 'thermostat', description: 'Prompt diagnosis and treatment of fever, viral, and bacterial infections.' },
        { name: 'Thyroid Disorders', matIcon: 'biotech', description: 'Testing and treatment plans for overactive and underactive thyroid.' },
        { name: 'Vaccinations', matIcon: 'vaccines', description: 'Adult and travel vaccinations with clear guidance on schedules.' },
        { name: 'Lifestyle & Nutrition', matIcon: 'restaurant', description: 'Practical guidance on diet, weight, sleep, and activity.' },
        { name: 'Elderly Care', matIcon: 'elderly', description: 'Compassionate care for seniors, including chronic condition reviews.' }
      ],
      testimonials: [
        { name: 'Priya Mohanty', initials: 'PM', text: 'The doctor took time to listen and explained everything clearly. I finally understand how to manage my condition.', treatment: 'Thyroid Care', color: 'linear-gradient(135deg, #ec4899, #be185d)' },
        { name: 'Amit Patel', initials: 'AP', text: 'My blood sugar has been steady for the first time in years. Highly recommend this clinic!', treatment: 'Diabetes Care', color: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' },
        { name: 'Sunita Das', initials: 'SD', text: 'Our whole family comes here now. The staff is friendly and the care is always thorough.', treatment: 'Family Medicine', color: 'linear-gradient(135deg, #10b981, #059669)' }
      ],
      education: [
        { degree: 'MD', studyField: 'Doctor of Medicine', institution: 'SCB Medical College, Cuttack', startDate: '2008', endDate: '2011', description: '' },
        { degree: 'MBBS', studyField: 'Bachelor of Medicine & Surgery', institution: 'SCB Medical College, Cuttack', startDate: '2002', endDate: '2008', description: '' }
      ],
      experience: [
        { title: 'Senior Consultant & Founder', startDate: '2015', endDate: '', description: 'Leading the practice with a focus on preventive, patient-first care.' },
        { title: 'Consultant Physician', startDate: '2011', endDate: '2015', description: 'Provided outpatient and inpatient care and mentored junior doctors.' }
      ]
    }
  };

  practiceTypes: PracticeType[] = ['dental', 'general'];

  get practice(): PracticeContent {
    return this.practices[this.config.practice];
  }

  features = [
    'Premium animated doctor profile',
    'Online appointment booking with live slots',
    'Service showcase with detail popups',
    'Patient reviews & testimonials',
    'Downloadable booking confirmation',
    'Social media integration',
    'Fully responsive — mobile, tablet & desktop',
    'SEO optimized & fast loading',
    'WhatsApp & call integration',
    'Custom branding & colors'
  ];

  // Inline showcase state
  showcaseDayIndex = 0;
  showcaseSelectedSlot = '';

  // Booking showcase state
  bookingOpen = false;
  bookingStep: 'slots' | 'form' | 'confirmed' = 'slots';
  selectedDayIndex = 0;
  selectedSlotTime = '';
  mobileTouched = false;
  mockPatient = { name: '', mobile: '', gender: '', reason: '', email: '' };

  get mobileErrorDemo(): string {
    if (!this.mobileTouched) return '';
    const v = this.mockPatient.mobile;
    if (!v) return 'Mobile number is required';
    if (!/^\d{10}$/.test(v)) return 'Enter a valid 10-digit mobile number (digits only)';
    return '';
  }

  mockDays: MockDay[] = this.generateMockDays();

  bookingConfirmation: any = null;

  private generateMockDays(): MockDay[] {
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const now = new Date();

    // Fixed booked-slot patterns per day (indices of booked slots in morning/evening)
    const bookedPatterns = [
      { am: [0, 1, 2, 5, 8, 10], pm: [0, 1, 4, 7] },       // Today: early slots booked
      { am: [3, 6, 9], pm: [2, 5] },                          // Tomorrow: scattered
      { am: [0, 4, 7, 11], pm: [1, 3, 8] },                  // Day 3
      { am: [1, 2], pm: [0] },                                // Day 4: mostly free
      { am: [0, 1, 2, 3, 4, 5, 6, 7, 8], pm: [0, 1, 2, 3] } // Day 5: busy day
    ];

    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      const pattern = bookedPatterns[i];

      const morningTimes = [
        '9:00 AM', '9:15 AM', '9:30 AM', '9:45 AM',
        '10:00 AM', '10:15 AM', '10:30 AM', '10:45 AM',
        '11:00 AM', '11:15 AM', '11:30 AM', '11:45 AM', '12:00 PM'
      ];
      const eveningTimes = [
        '4:00 PM', '4:15 PM', '4:30 PM', '4:45 PM',
        '5:00 PM', '5:15 PM', '5:30 PM', '5:45 PM',
        '6:00 PM', '6:15 PM', '6:30 PM', '6:45 PM', '7:00 PM'
      ];

      return {
        day: dayNames[d.getDay()],
        date: `${d.getDate()} ${d.toLocaleString('en', { month: 'short' })}`,
        sessions: [
          {
            label: 'Session 1',
            timeRange: '9:00 AM - 12:00 PM',
            slots: morningTimes.map((time, idx) => ({
              time,
              status: pattern.am.includes(idx) ? 'booked' as const : 'available' as const
            }))
          },
          {
            label: 'Session 2',
            timeRange: '4:00 PM - 7:00 PM',
            slots: eveningTimes.map((time, idx) => ({
              time,
              status: pattern.pm.includes(idx) ? 'booked' as const : 'available' as const
            }))
          }
        ]
      };
    });
  }

  openBooking(): void {
    this.bookingOpen = true;
    this.bookingStep = 'slots';
    this.selectedSlotTime = '';
    this.mobileTouched = false;
    this.mockPatient = { name: '', mobile: '', gender: '', reason: '', email: '' };
    this.bookingConfirmation = null;
  }

  closeBooking(): void {
    this.bookingOpen = false;
  }

  proceedToDetails(): void {
    this.bookingStep = 'form';
  }

  // The summary and confirmation read the date from selectedDayIndex,
  // so a slot picked on another day must not carry over
  selectDay(index: number): void {
    if (index === this.selectedDayIndex) return;
    this.selectedDayIndex = index;
    this.selectedSlotTime = '';
  }

  selectSlot(slot: MockSlot): void {
    if (slot.status === 'booked') return;
    this.selectedSlotTime = slot.time;
  }

  confirmBooking(): void {
    const day = this.mockDays[this.selectedDayIndex];
    this.bookingConfirmation = {
      patientName: this.mockPatient.name || 'Demo Patient',
      mobile: this.mockPatient.mobile || '9876543210',
      doctorName: this.config.doctorName,
      date: `${day.day}, ${day.date}`,
      time: this.selectedSlotTime,
      reason: this.mockPatient.reason || 'General Checkup',
      clinic: this.config.clinicName,
      pin: Math.floor(1000 + Math.random() * 9000).toString()
    };
    this.bookingStep = 'confirmed';
  }

  // Neutral inline placeholders so a failed Unsplash fetch (offline / throttled
  // during a live pitch) degrades gracefully instead of a broken-image icon.
  readonly imgFallbackWide = this.placeholderSvg(1200, 675);
  readonly imgFallbackPortrait = this.placeholderSvg(600, 800);

  private placeholderSvg(w: number, h: number): string {
    const svg =
      `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'>` +
      `<rect width='100%' height='100%' fill='#e8edf2'/>` +
      `<g fill='#b6c2cf' transform='translate(${w / 2} ${h / 2})'>` +
      `<circle cx='0' cy='-18' r='26'/>` +
      `<path d='M-46 54 a46 40 0 0 1 92 0 z'/>` +
      `</g></svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  onImgError(event: Event, fallback: string): void {
    const el = event.target as HTMLImageElement;
    if (el && el.src !== fallback) el.src = fallback;
  }

  // ─── PROFILE PHOTO ────────────────────────
  readonly defaultPhoto = 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&q=80';
  private readonly maxPhotoFileBytes = 20 * 1024 * 1024;
  private readonly maxPhotoEdge = 1200;
  private readonly defaultCrop: PhotoCrop = { x: 50, y: 25, zoom: 1, fit: false };
  // Width / height of the crop window and of every doctor photo slot
  private readonly cropAspect = 4 / 5;
  private readonly maxCropZoom = 3;

  photoUrlDraft = '';
  photoStatus: 'idle' | 'processing' | 'uploading' | 'saved' | 'failed' = 'idle';
  photoError = '';
  // Bumped on every new photo so a slow upload/probe can't overwrite a newer pick.
  private photoRequest = 0;

  cropOpen = false;
  cropDraft: PhotoCrop = { ...this.defaultCrop };
  private cropNatural = { width: 0, height: 0 };
  private cropPointers = new Map<number, { x: number; y: number }>();
  private cropWindow = { width: 0, height: 0 };
  private cropPinchDistance = 0;

  get displayPhoto(): string {
    return this.config.profileImage || this.defaultPhoto;
  }

  get isPhotoBusy(): boolean {
    return this.photoStatus === 'processing' || this.photoStatus === 'uploading';
  }

  photoFocus(crop: PhotoCrop): string {
    return `${crop.x}% ${crop.y}%`;
  }

  photoScale(crop: PhotoCrop): string {
    return `scale(${crop.zoom})`;
  }

  photoFit(crop: PhotoCrop): string {
    return crop.fit ? 'contain' : 'cover';
  }

  onProfileImageUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    // Reset so picking the same file again still fires (change).
    input.value = '';
    if (!file) return;

    this.photoError = '';
    if (file.size > this.maxPhotoFileBytes) {
      this.photoStatus = 'idle';
      this.photoError = 'That file is over 20 MB. Please choose a smaller photo.';
      return;
    }

    const request = ++this.photoRequest;
    this.photoStatus = 'processing';
    this.resizePhoto(file).then(dataUrl => {
      if (request !== this.photoRequest) return;
      this.setPhoto(dataUrl);
      this.photoUrlDraft = '';
      this.uploadPhoto(dataUrl);
    }).catch(() => {
      if (request !== this.photoRequest) return;
      this.photoStatus = 'idle';
      this.photoError = 'This file can\'t be read as an image. Please use a JPG or PNG.';
    });
  }

  private resizePhoto(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const scale = Math.min(1, this.maxPhotoEdge / Math.max(img.naturalWidth, img.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.naturalWidth * scale);
        canvas.height = Math.round(img.naturalHeight * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(); return; }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject();
      };
      img.src = objectUrl;
    });
  }

  private uploadPhoto(dataUrl: string): void {
    const request = ++this.photoRequest;
    this.photoStatus = 'uploading';
    const body = new FormData();
    body.append('file', dataUrl);
    body.append('upload_preset', environment.cloudinaryUploadPreset);
    this.http.post<{ secure_url: string }>(environment.cloudinaryUploadUrl, body).subscribe({
      next: res => {
        if (request !== this.photoRequest) return;
        this.config.profileImage = res.secure_url;
        this.photoStatus = 'saved';
      },
      error: () => {
        if (request !== this.photoRequest) return;
        this.photoStatus = 'failed';
      }
    });
  }

  retryPhotoUpload(): void {
    if (this.config.profileImage.startsWith('data:')) this.uploadPhoto(this.config.profileImage);
  }

  applyPhotoUrl(): void {
    const url = this.photoUrlDraft.trim();
    if (!url) return;

    this.photoError = '';
    if (!/^https?:\/\//i.test(url)) {
      this.photoError = 'Enter a full link starting with https://';
      return;
    }

    const request = ++this.photoRequest;
    this.photoStatus = 'processing';
    const probe = new Image();
    probe.onload = () => {
      if (request !== this.photoRequest) return;
      this.photoStatus = 'idle';
      this.setPhoto(url);
    };
    probe.onerror = () => {
      if (request !== this.photoRequest) return;
      this.photoStatus = 'idle';
      this.photoError = 'That link isn\'t a direct image. Use "Copy image address" on the photo.';
    };
    probe.src = url;
  }

  removePhoto(): void {
    this.photoRequest++;
    this.config.profileImage = '';
    this.config.photoCrop = { ...this.defaultCrop };
    this.photoUrlDraft = '';
    this.photoError = '';
    this.photoStatus = 'idle';
  }

  private setPhoto(src: string): void {
    this.config.profileImage = src;
    this.config.photoCrop = { ...this.defaultCrop };
    this.openCrop();
  }

  openCrop(): void {
    this.cropDraft = { ...this.config.photoCrop };
    this.cropNatural = { width: 0, height: 0 };
    this.cropOpen = true;
  }

  saveCrop(): void {
    this.config.photoCrop = { ...this.cropDraft };
    this.cropOpen = false;
  }

  @HostListener('document:keydown.escape')
  closeCrop(): void {
    this.cropOpen = false;
    this.cropPointers.clear();
    this.cropPinchDistance = 0;
  }

  resetCrop(): void {
    this.cropDraft = { ...this.defaultCrop };
  }

  onCropImageLoad(event: Event): void {
    const img = event.target as HTMLImageElement;
    this.cropNatural = { width: img.naturalWidth, height: img.naturalHeight };
  }

  toggleCropFit(): void {
    const fit = !this.cropDraft.fit;
    this.cropDraft = { x: 50, y: fit ? 50 : this.defaultCrop.y, zoom: 1, fit };
  }

  // Image size as a fraction of the crop window, matching what object-fit gives
  // the saved photo at the same crop.
  private get cropImageSize(): { width: number; height: number } {
    const { zoom, fit } = this.cropDraft;
    const ratio = this.cropNatural.width / this.cropNatural.height / this.cropAspect;
    const fillsWidth = fit ? ratio > 1 : ratio <= 1;
    return fillsWidth ? { width: zoom, height: zoom / ratio } : { width: zoom * ratio, height: zoom };
  }

  // Percentages, so the image keeps its place if the window resizes. Offsets follow
  // the saved render: object-position plus a scale about the same point puts the
  // image edge at (window - image) * focal fraction.
  get cropImageStyle(): Record<string, string> {
    if (!this.cropNatural.width) return { visibility: 'hidden' };
    const { width, height } = this.cropImageSize;
    return {
      width: `${width * 100}%`,
      height: `${height * 100}%`,
      left: `${(1 - width) * this.cropDraft.x}%`,
      top: `${(1 - height) * this.cropDraft.y}%`
    };
  }

  onCropPointerDown(event: PointerEvent): void {
    const stage = event.currentTarget as HTMLElement;
    stage.setPointerCapture(event.pointerId);
    const rect = stage.querySelector('.demo-crop-window')!.getBoundingClientRect();
    this.cropWindow = { width: rect.width, height: rect.height };
    this.cropPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    this.cropPinchDistance = 0;
  }

  onCropPointerMove(event: PointerEvent): void {
    const last = this.cropPointers.get(event.pointerId);
    if (!last || !this.cropNatural.width) return;
    const dx = event.clientX - last.x;
    const dy = event.clientY - last.y;
    last.x = event.clientX;
    last.y = event.clientY;

    if (this.cropPointers.size > 1) {
      const [a, b] = Array.from(this.cropPointers.values());
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (this.cropPinchDistance) this.setCropZoom(this.cropDraft.zoom * distance / this.cropPinchDistance);
      this.cropPinchDistance = distance;
      return;
    }

    const { width, height } = this.cropImageSize;
    const rangeX = this.cropWindow.width * (1 - width);
    const rangeY = this.cropWindow.height * (1 - height);
    if (Math.abs(rangeX) > 1) this.cropDraft.x = this.clamp(this.cropDraft.x + dx / rangeX * 100, 0, 100);
    if (Math.abs(rangeY) > 1) this.cropDraft.y = this.clamp(this.cropDraft.y + dy / rangeY * 100, 0, 100);
  }

  onCropPointerUp(event: PointerEvent): void {
    this.cropPointers.delete(event.pointerId);
    this.cropPinchDistance = 0;
  }

  onCropWheel(event: WheelEvent): void {
    event.preventDefault();
    this.setCropZoom(this.cropDraft.zoom * Math.exp(-event.deltaY * 0.002));
  }

  private setCropZoom(zoom: number): void {
    this.cropDraft.zoom = this.clamp(zoom, 1, this.maxCropZoom);
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }

  private parseCrop(x: string | null, y: string | null, zoom: string | null, fit: string | null): PhotoCrop {
    const read = (raw: string | null, fallback: number) => {
      const value = raw === null ? NaN : Number(raw);
      return Number.isFinite(value) ? value : fallback;
    };
    return {
      x: this.clamp(read(x, this.defaultCrop.x), 0, 100),
      y: this.clamp(read(y, this.defaultCrop.y), 0, 100),
      zoom: this.clamp(read(zoom, this.defaultCrop.zoom), 1, this.maxCropZoom),
      fit: fit === '1'
    };
  }

  // Memoised: a new SafeResourceUrl each change detection would reload the iframe.
  private mapQuery = '';
  private mapSafeUrl: SafeResourceUrl | null = null;

  get mapUrl(): SafeResourceUrl {
    const query = `${this.config.city}, ${this.config.state}, India`;
    if (!this.mapSafeUrl || query !== this.mapQuery) {
      this.mapQuery = query;
      this.mapSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=14&ie=UTF8&iwloc=&output=embed`
      );
    }
    return this.mapSafeUrl;
  }

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    // Ensure the default font is actually injected on first paint
    // (otherwise headings fall back to system sans until a preset is picked).
    this.loadFont(this.activeFontPair.url);

    this.route.queryParamMap.subscribe(params => {
      if (params.get('name')) this.config.doctorName = params.get('name')!;
      if (params.get('degree')) this.config.degree = params.get('degree')!;
      if (params.get('spec')) this.config.specialization = params.get('spec')!;
      if (params.get('clinic')) this.config.clinicName = params.get('clinic')!;
      if (params.get('tagline2')) this.config.clinicTagline = params.get('tagline2')!;
      if (params.get('city')) this.config.city = params.get('city')!;
      if (params.get('state')) this.config.state = params.get('state')!;
      if (params.get('exp')) this.config.experience = params.get('exp')!;
      if (params.get('phone')) this.config.phone = params.get('phone')!;
      if (params.get('tagline')) this.config.tagline = params.get('tagline')!;
      if (params.get('rating')) this.config.rating = params.get('rating')!;
      if (params.get('profileImg')) {
        this.config.profileImage = params.get('profileImg')!;
        this.photoUrlDraft = this.config.profileImage;
      }
      this.config.photoCrop = this.parseCrop(params.get('fx'), params.get('fy'), params.get('z'), params.get('fit'));
      const practice = params.get('practice');
      if (practice === 'dental' || practice === 'general') this.config.practice = practice;
      if (params.get('color')) this.config.primaryColor = '#' + params.get('color')!;
      if (params.get('font')) {
        this.config.fontPair = params.get('font')!;
        const pair = this.fontPairs.find(f => f.name === this.config.fontPair);
        if (pair) this.loadFont(pair.url);
      }
    });
  }

  ngAfterViewInit(): void {
    this.initAOS();
  }

  initAOS(): void {
    if (this.animationsEnabled) {
      const isMobile = window.innerWidth < 768;
      setTimeout(() => {
        AOS.init({
          duration: isMobile ? 500 : 800,
          easing: 'ease-out',
          once: true,
          offset: isMobile ? 20 : 80
        });
      });
    }
  }

  get heroSubtitle(): string {
    return `Meet Dr. ${this.config.doctorName} (${this.config.degree}) \u2014 ${this.config.specialization} with ${this.config.experience}+ years of experience ${this.practice.heroOutcome} at ${this.config.clinicName}, ${this.config.city}.`;
  }

  toggleAnimations(): void {
    this.animationsEnabled = !this.animationsEnabled;
    if (this.animationsEnabled) {
      this.initAOS();
    } else {
      AOS.refreshHard();
    }
  }

  get activeFontPair(): FontPair {
    return this.fontPairs.find(f => f.name === this.config.fontPair) || this.fontPairs[0];
  }

  selectFont(pair: FontPair): void {
    this.config.fontPair = pair.name;
    this.loadFont(pair.url);
  }

  private loadFont(url: string): void {
    if (this.loadedFontUrls.has(url)) return;
    this.loadedFontUrls.add(url);
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);
  }

  copyShareLink(): void {
    if (this.isPhotoBusy) return;

    const p = new URLSearchParams();
    p.set('name', this.config.doctorName);
    p.set('degree', this.config.degree);
    p.set('spec', this.config.specialization);
    p.set('clinic', this.config.clinicName);
    p.set('tagline2', this.config.clinicTagline);
    p.set('city', this.config.city);
    p.set('state', this.config.state);
    p.set('exp', this.config.experience);
    p.set('phone', this.config.phone);
    p.set('tagline', this.config.tagline);
    p.set('rating', this.config.rating);
    if (this.config.profileImage && this.config.profileImage.startsWith('http')) {
      p.set('profileImg', this.config.profileImage);
    }
    const crop = this.config.photoCrop;
    if (crop.x !== this.defaultCrop.x) p.set('fx', crop.x.toFixed(1));
    if (crop.y !== this.defaultCrop.y) p.set('fy', crop.y.toFixed(1));
    if (crop.zoom !== this.defaultCrop.zoom) p.set('z', crop.zoom.toFixed(2));
    if (crop.fit) p.set('fit', '1');
    if (this.config.practice !== 'dental') p.set('practice', this.config.practice);
    if (this.config.primaryColor !== '#2563eb') {
      p.set('color', this.config.primaryColor.replace('#', ''));
    }
    if (this.config.fontPair !== 'Outfit + DM Sans') {
      p.set('font', this.config.fontPair);
    }
    const url = `${window.location.origin}/demo?${p.toString()}`;
    const photoMissing = this.config.profileImage.startsWith('data:');
    navigator.clipboard.writeText(url).then(() => {
      this.showShareMessage(photoMissing ? 'Link copied, but without your photo' : 'Link copied!', photoMissing ? 4000 : 2000);
    }).catch(() => {
      this.showShareMessage('Couldn\'t copy the link', 4000);
    });
  }

  private showShareMessage(message: string, duration: number): void {
    this.shareTooltip = message;
    setTimeout(() => this.shareTooltip = '', duration);
  }
}
