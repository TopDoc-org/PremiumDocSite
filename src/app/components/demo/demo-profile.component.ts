import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as AOS from 'aos';

interface FontPair {
  name: string;
  heading: string;
  body: string;
  url: string;
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
  primaryColor: string;
  fontPair: string;
}

interface MockSlot {
  time: string;
  status: 'available' | 'booked';
}

interface MockSession {
  label: string;
  clinic: string;
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
    primaryColor: '#2563eb',
    fontPair: 'outfit-dm'
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

  services = [
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
  ];

  testimonials = [
    { name: 'Priya Mohanty', initials: 'PM', text: 'Got my braces done here and the results are incredible. The doctor was so patient and explained everything clearly.', treatment: 'Braces & Alignment', color: 'linear-gradient(135deg, #ec4899, #be185d)' },
    { name: 'Amit Patel', initials: 'AP', text: 'Best dental experience I\'ve ever had. The root canal was completely painless. Highly recommend this clinic!', treatment: 'Root Canal Treatment', color: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' },
    { name: 'Sunita Das', initials: 'SD', text: 'My kids love visiting this clinic. The staff is so friendly and caring. Finally found a dentist they aren\'t afraid of!', treatment: 'Kids Dentistry', color: 'linear-gradient(135deg, #10b981, #059669)' }
  ];

  placeholderEducation = [
    { degree: 'MDS', studyField: 'Orthodontics & Dentofacial Orthopedics', institution: 'SCB Medical College, Cuttack', startDate: '2008', endDate: '2011', description: '' },
    { degree: 'BDS', studyField: 'Bachelor of Dental Surgery', institution: 'KIMS Dental College, Bhubaneswar', startDate: '2003', endDate: '2008', description: '' }
  ];

  placeholderExperience = [
    { title: 'Chief Dental Surgeon & Founder', startDate: '2015', endDate: '', description: 'Leading the practice with focus on orthodontics, implantology, and cosmetic dentistry.' },
    { title: 'Senior Dental Consultant', startDate: '2011', endDate: '2015', description: 'Provided advanced orthodontic care and trained junior dental surgeons.' }
  ];

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
  bookingStep: 'form' | 'slots' | 'confirmed' = 'form';
  selectedDayIndex = 0;
  selectedSlotTime = '';
  selectedClinic = '';
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
            clinic: this.config.clinicName,
            timeRange: '9:00 AM - 12:00 PM',
            slots: morningTimes.map((time, idx) => ({
              time,
              status: pattern.am.includes(idx) ? 'booked' as const : 'available' as const
            }))
          },
          {
            label: 'Session 2',
            clinic: this.config.clinicName,
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

  get clinicNames(): string[] {
    const names = new Set<string>();
    for (const day of this.mockDays) {
      for (const session of day.sessions) {
        if (session.clinic) names.add(session.clinic);
      }
    }
    return Array.from(names);
  }

  openBooking(): void {
    this.bookingOpen = true;
    this.bookingStep = 'form';
    this.selectedSlotTime = '';
    this.mobileTouched = false;
    const names = this.clinicNames;
    this.selectedClinic = names.length === 1 ? names[0] : '';
    this.mockPatient = { name: '', mobile: '', gender: '', reason: '', email: '' };
    this.bookingConfirmation = null;
  }

  closeBooking(): void {
    this.bookingOpen = false;
  }

  proceedToSlots(): void {
    this.bookingStep = 'slots';
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

  onProfileImageUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.config.profileImage = e.target?.result as string;
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
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
      if (params.get('profileImg')) this.config.profileImage = params.get('profileImg')!;
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
    return `Meet Dr. ${this.config.doctorName} (${this.config.degree}) \u2014 ${this.config.specialization} with ${this.config.experience}+ years of experience crafting beautiful, healthy smiles at ${this.config.clinicName}, ${this.config.city}.`;
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
    const p = new URLSearchParams();
    p.set('name', this.config.doctorName);
    p.set('degree', this.config.degree);
    p.set('spec', this.config.specialization);
    p.set('clinic', this.config.clinicName);
    p.set('city', this.config.city);
    p.set('state', this.config.state);
    p.set('exp', this.config.experience);
    p.set('phone', this.config.phone);
    p.set('tagline', this.config.tagline);
    p.set('rating', this.config.rating);
    if (this.config.profileImage && this.config.profileImage.startsWith('http')) {
      p.set('profileImg', this.config.profileImage);
    }
    if (this.config.primaryColor !== '#2563eb') {
      p.set('color', this.config.primaryColor.replace('#', ''));
    }
    if (this.config.fontPair !== 'Outfit + DM Sans') {
      p.set('font', this.config.fontPair);
    }
    const url = `${window.location.origin}/demo?${p.toString()}`;
    navigator.clipboard.writeText(url).then(() => {
      this.shareTooltip = 'Link copied!';
      setTimeout(() => this.shareTooltip = '', 2000);
    });
  }
}
