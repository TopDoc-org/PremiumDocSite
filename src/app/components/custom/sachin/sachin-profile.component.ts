import { Component, OnInit, OnDestroy, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { MatIconModule } from "@angular/material/icon";
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface Specialization {
  icon: string;
  title: string;
  description: string;
  tag?: string;
}

interface Testimonial {
  quote: string;
  name: string;
  age: number;
  treatment: string;
  rating: number;
}

interface TimelineItem {
  year: string;
  title: string;
  institution: string;
  type: 'education' | 'experience';
}

interface StatItem {
  value: number;
  suffix: string;
  label: string;
  current: number;
}

@Component({
  selector: 'app-sachin-profile',
  templateUrl: './sachin-profile.component.html',

  styleUrls: ['./sachin-profile.component.scss']
})
export class SachinProfileComponent implements OnInit, OnDestroy {
  @ViewChildren('animatedCounter') counterElements!: QueryList<ElementRef>;

  doctorName = 'Dr. Sachin Shukla';
  degree = 'MBBS, MS (Ortho), Fellowship in Joint Replacement';
  specialization = 'Orthopedic Surgeon & Joint Replacement Specialist';
  experience = '12+';
  city = 'Raipur';
  state = 'Chhattisgarh';
  clinicName = 'Shukla Ortho & Joint Care Center';
  phone = '+91-9876543210';
  rating = 4.9;
  reviewCount = 800;
  languages = ['Hindi', 'English', 'Chhattisgarhi'];

  aboutQuote = '"Every joint tells a story. My job is to give it a happy ending."';
  aboutText = `Dr. Sachin Shukla is one of Central India's most trusted orthopedic surgeons, renowned for his expertise in total joint replacement and minimally invasive surgical techniques. With over a decade of hands-on experience and strength of purpose that defines his practice, he has restored mobility and hope to thousands of patients across Chhattisgarh and beyond.`;
  aboutText2 = `Trained at premier institutions and armed with international fellowship experience, Dr. Shukla combines cutting-edge surgical precision with a deeply compassionate approach to patient care. His philosophy is simple: treat every patient like family.`;

  specializations: Specialization[] = [
    {
      icon: 'accessibility_new',
      title: 'Total Joint Replacement',
      description: 'Hip, knee, and shoulder replacements using latest implant technology and computer-assisted navigation.',
      tag: 'Signature'
    },
    {
      icon: 'directions_run',
      title: 'Sports Injury',
      description: 'Comprehensive sports medicine including ligament reconstruction, meniscus repair, and rehabilitation.',
      tag: 'Popular'
    },
    {
      icon: 'healing',
      title: 'Fracture Management',
      description: 'Advanced fracture fixation with minimally invasive techniques for faster recovery and better outcomes.'
    },
    {
      icon: 'airline_seat_recline_extra',
      title: 'Spine Surgery',
      description: 'Disc replacement, spinal fusion, and decompression procedures for chronic back and neck conditions.'
    },
    {
      icon: 'biotech',
      title: 'Arthroscopy',
      description: 'Keyhole surgery for joint diagnosis and treatment — minimal scarring, maximum precision.',
      tag: 'Advanced'
    },
    {
      icon: 'child_care',
      title: 'Pediatric Orthopedics',
      description: 'Specialized care for growing bones — clubfoot correction, limb deformities, and growth plate injuries.'
    }
  ];

  stats: StatItem[] = [
    { value: 5000, suffix: '+', label: 'Successful Surgeries', current: 0 },
    { value: 12, suffix: '+', label: 'Years of Excellence', current: 0 },
    { value: 98, suffix: '%', label: 'Success Rate', current: 0 },
    { value: 800, suffix: '+', label: 'Patient Reviews', current: 0 }
  ];

  testimonials: Testimonial[] = [
    {
      quote: 'After my knee replacement, I walked without pain for the first time in years. Dr. Shukla gave me my life back.',
      name: 'Ramesh Agrawal',
      age: 62,
      treatment: 'Total Knee Replacement',
      rating: 5
    },
    {
      quote: 'My ACL surgery was seamless. The recovery plan was clear and I was back on the cricket field in 6 months.',
      name: 'Vikram Tiwari',
      age: 28,
      treatment: 'ACL Reconstruction',
      rating: 5
    },
    {
      quote: 'Dr. Shukla treated my mother\'s hip fracture with such expertise and warmth. We are forever grateful.',
      name: 'Priya Sahu',
      age: 35,
      treatment: 'Hip Fracture Surgery',
      rating: 5
    },
    {
      quote: 'My son\'s clubfoot was corrected beautifully. Dr. Shukla\'s pediatric expertise is unmatched in the region.',
      name: 'Anita Verma',
      age: 30,
      treatment: 'Clubfoot Correction',
      rating: 5
    },
    {
      quote: 'The arthroscopic procedure was quick and the recovery was remarkably fast. Highly recommended.',
      name: 'Sunil Pandey',
      age: 45,
      treatment: 'Knee Arthroscopy',
      rating: 5
    }
  ];

  timeline: TimelineItem[] = [
    { year: '2008', title: 'MBBS', institution: 'Pt. J.N.M. Medical College, Raipur', type: 'education' },
    { year: '2012', title: 'MS (Orthopedics)', institution: 'AIIMS, New Delhi', type: 'education' },
    { year: '2013', title: 'Fellowship — Joint Replacement', institution: 'Wrightington Hospital, UK', type: 'education' },
    { year: '2014', title: 'Senior Consultant', institution: 'Ramkrishna CARE Hospital, Raipur', type: 'experience' },
    { year: '2018', title: 'Founded Shukla Ortho & Joint Care', institution: 'Raipur, Chhattisgarh', type: 'experience' },
  ];

  workingHours = 'Mon – Sat, 9:00 AM – 7:00 PM';
  address = 'Shukla Ortho & Joint Care Center, Opposite City Mall, VIP Road, Raipur, Chhattisgarh 492001';
  safeMapUrl: SafeResourceUrl;

  private observers: IntersectionObserver[] = [];
  private counterAnimated = false;

  constructor(private sanitizer: DomSanitizer) {
    this.safeMapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://maps.google.com/maps?q=Raipur,+Chhattisgarh,+India&t=&z=13&ie=UTF8&iwloc=&output=embed'
    );
  }

  ngOnInit(): void {
    this.setupScrollAnimations();
    this.setupCounterObserver();
  }

  ngOnDestroy(): void {
    this.observers.forEach(obs => obs.disconnect());
  }

  private setupScrollAnimations(): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    requestAnimationFrame(() => {
      document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
    });
    this.observers.push(observer);
  }

  private setupCounterObserver(): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.counterAnimated) {
          this.counterAnimated = true;
          this.animateCounters();
        }
      });
    }, { threshold: 0.3 });

    requestAnimationFrame(() => {
      const statsSection = document.querySelector('.stats-section');
      if (statsSection) observer.observe(statsSection);
    });
    this.observers.push(observer);
  }

  private animateCounters(): void {
    const duration = 2000;
    const start = performance.now();

    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      this.stats = this.stats.map(s => ({
        ...s,
        current: Math.round(eased * s.value)
      }));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }

  getStars(rating: number): number[] {
    return Array(rating).fill(0);
  }

  scrollTestimonials(direction: 'left' | 'right'): void {
    const container = document.querySelector('.testimonials-track') as HTMLElement;
    if (container) {
      const scrollAmount = 380;
      container.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  }
}
