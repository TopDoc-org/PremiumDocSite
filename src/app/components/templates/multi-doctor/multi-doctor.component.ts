import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import * as AOS from 'aos';

interface Doctor {
  id: string;
  name: string;
  photo: string;
  degree: string;
  specialty: string;
  department: string;
  experience: number;
  rating: number;
  reviews: number;
  bio: string;
  availableToday: boolean;
  nextSlot: string;
  languages: string[];
}

interface Department {
  id: string;
  name: string;
  icon: string;
  description: string;
  doctorCount: number;
  color: string;
  gradient: string;
}

interface Testimonial {
  name: string;
  initials: string;
  text: string;
  doctor: string;
  department: string;
  rating: number;
  gradient: string;
  date: string;
}

interface ClinicLocation {
  name: string;
  address: string;
  phone: string;
  hours: string;
  mapUrl: string;
  image: string;
  isMain: boolean;
}

interface GalleryImage {
  src: string;
  alt: string;
  span?: 'wide' | 'tall' | 'normal';
}

@Component({
  selector: 'app-multi-doctor',
  templateUrl: './multi-doctor.component.html',
  styleUrls: ['./multi-doctor.component.scss']
})
export class MultiDoctorComponent implements OnInit, AfterViewInit, OnDestroy {

  clinicName = 'Apex Dental & Orthodontic Center';
  clinicTagline = 'Where Every Smile Tells a Story of Excellence';
  clinicSubtext = 'A state-of-the-art multi-specialty dental institute with 6 specialist doctors, advanced technology, and a decade of transforming smiles across 50,000+ happy patients.';

  stats = [
    { value: 12, suffix: '+', label: 'Years of Excellence', icon: 'emoji_events' },
    { value: 50, suffix: 'K+', label: 'Happy Patients', icon: 'favorite' },
    { value: 6, suffix: '', label: 'Specialist Doctors', icon: 'groups' },
    { value: 15, suffix: '+', label: 'Treatments Offered', icon: 'medical_services' },
  ];
  animatedStats: number[] = [0, 0, 0, 0];

  trustBadges = [
    'ISO 9001:2015 Certified',
    'NABH Accredited',
    'Advanced 3D Imaging',
    'Infection Control Protocol'
  ];

  departments: Department[] = [
    { id: 'ortho', name: 'Orthodontics', icon: 'straighten', description: 'Braces, clear aligners, and smile correction for all ages.', doctorCount: 2, color: '#2563eb', gradient: 'linear-gradient(135deg, #2563eb, #1d4ed8)' },
    { id: 'implant', name: 'Implantology', icon: 'build_circle', description: 'Permanent tooth replacement with titanium implants and full-arch solutions.', doctorCount: 1, color: '#0d9488', gradient: 'linear-gradient(135deg, #0d9488, #0f766e)' },
    { id: 'cosmetic', name: 'Cosmetic Dentistry', icon: 'auto_awesome', description: 'Veneers, whitening, smile makeovers, and aesthetic enhancements.', doctorCount: 1, color: '#7c3aed', gradient: 'linear-gradient(135deg, #7c3aed, #6d28d9)' },
    { id: 'pediatric', name: 'Pediatric Dentistry', icon: 'child_care', description: 'Gentle dental care designed for children in a fun, stress-free environment.', doctorCount: 1, color: '#ea580c', gradient: 'linear-gradient(135deg, #ea580c, #dc2626)' },
    { id: 'endo', name: 'Endodontics', icon: 'healing', description: 'Advanced root canal therapy and pulp treatment with microscopic precision.', doctorCount: 1, color: '#e11d48', gradient: 'linear-gradient(135deg, #e11d48, #be123c)' },
    { id: 'perio', name: 'Periodontics', icon: 'spa', description: 'Gum disease treatment, surgery, and regenerative procedures.', doctorCount: 1, color: '#16a34a', gradient: 'linear-gradient(135deg, #16a34a, #15803d)' },
  ];

  doctors: Doctor[] = [
    {
      id: 'dr-mehta', name: 'Dr. Arjun Mehta', photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80',
      degree: 'MDS, FCPS', specialty: 'Chief Orthodontist', department: 'Orthodontics',
      experience: 15, rating: 4.9, reviews: 320, bio: 'Pioneer in lingual braces and Invisalign with over 3,000 successful smile transformations.',
      availableToday: true, nextSlot: '10:30 AM', languages: ['English', 'Hindi', 'Odia']
    },
    {
      id: 'dr-patel', name: 'Dr. Sneha Patel', photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80',
      degree: 'MDS, FICD', specialty: 'Implantologist', department: 'Implantology',
      experience: 12, rating: 4.8, reviews: 245, bio: 'Expert in immediate implants and full-arch rehabilitation with digital planning.',
      availableToday: true, nextSlot: '11:00 AM', languages: ['English', 'Hindi', 'Gujarati']
    },
    {
      id: 'dr-kumar', name: 'Dr. Vikram Kumar', photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80',
      degree: 'BDS, MDS', specialty: 'Cosmetic Dentist', department: 'Cosmetic Dentistry',
      experience: 10, rating: 4.9, reviews: 198, bio: 'Smile design specialist with expertise in porcelain veneers and laser whitening.',
      availableToday: false, nextSlot: 'Tomorrow 9:00 AM', languages: ['English', 'Hindi']
    },
    {
      id: 'dr-das', name: 'Dr. Priya Das', photo: 'https://images.unsplash.com/photo-1594824476967-48c8b964f137?w=400&q=80',
      degree: 'BDS, MDS', specialty: 'Pediatric Dentist', department: 'Pediatric Dentistry',
      experience: 8, rating: 4.9, reviews: 410, bio: 'Children love her! Specialized in early orthodontic intervention and preventive care.',
      availableToday: true, nextSlot: '2:00 PM', languages: ['English', 'Hindi', 'Bengali']
    },
    {
      id: 'dr-sharma', name: 'Dr. Rohan Sharma', photo: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&q=80',
      degree: 'MDS', specialty: 'Endodontist', department: 'Endodontics',
      experience: 11, rating: 4.7, reviews: 180, bio: 'Microscope-assisted root canal specialist with a 98% success rate.',
      availableToday: true, nextSlot: '3:30 PM', languages: ['English', 'Hindi']
    },
    {
      id: 'dr-mishra', name: 'Dr. Ananya Mishra', photo: 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=400&q=80',
      degree: 'BDS, MDS', specialty: 'Periodontist & Orthodontist', department: 'Periodontics',
      experience: 9, rating: 4.8, reviews: 156, bio: 'Dual-trained in gum surgery and orthodontics for comprehensive treatment planning.',
      availableToday: false, nextSlot: 'Tomorrow 10:00 AM', languages: ['English', 'Hindi', 'Odia']
    },
  ];

  testimonials: Testimonial[] = [
    { name: 'Rajesh Mohanty', initials: 'RM', text: 'Got my braces done by Dr. Mehta and the results are beyond what I imagined. The entire team is so professional and caring. Best dental experience ever!', doctor: 'Dr. Arjun Mehta', department: 'Orthodontics', rating: 5, gradient: 'linear-gradient(135deg, #2563eb, #1d4ed8)', date: 'Feb 2026' },
    { name: 'Sunita Agarwal', initials: 'SA', text: 'My 5-year-old actually looks forward to dental visits now! Dr. Priya is incredible with kids. She makes every visit fun and painless.', doctor: 'Dr. Priya Das', department: 'Pediatric', rating: 5, gradient: 'linear-gradient(135deg, #ea580c, #dc2626)', date: 'Jan 2026' },
    { name: 'Amit Patel', initials: 'AP', text: 'Had a full mouth rehabilitation with implants. Dr. Sneha and the team gave me my confidence back. The 3D planning was fascinating to see.', doctor: 'Dr. Sneha Patel', department: 'Implants', rating: 5, gradient: 'linear-gradient(135deg, #0d9488, #0f766e)', date: 'Mar 2026' },
    { name: 'Kavita Singh', initials: 'KS', text: 'The smile makeover transformed my entire look. Dr. Vikram is a true artist. People keep asking me what I did differently!', doctor: 'Dr. Vikram Kumar', department: 'Cosmetic', rating: 5, gradient: 'linear-gradient(135deg, #7c3aed, #6d28d9)', date: 'Dec 2025' },
    { name: 'Debasis Nayak', initials: 'DN', text: 'Was terrified of root canals but Dr. Rohan made it completely painless. Done in one sitting! Wish I had come here sooner.', doctor: 'Dr. Rohan Sharma', department: 'Endodontics', rating: 5, gradient: 'linear-gradient(135deg, #e11d48, #be123c)', date: 'Jan 2026' },
    { name: 'Meera Joshi', initials: 'MJ', text: 'The clinic is spotlessly clean and the equipment is top-notch. You can tell they invest in the best technology. Highly recommend for anyone in the city.', doctor: 'General', department: 'Clinic', rating: 5, gradient: 'linear-gradient(135deg, #16a34a, #15803d)', date: 'Feb 2026' },
  ];

  gallery: GalleryImage[] = [
    { src: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&q=80', alt: 'Modern reception area', span: 'wide' },
    { src: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&q=80', alt: 'Dental operatory', span: 'normal' },
    { src: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&q=80', alt: 'Advanced equipment', span: 'tall' },
    { src: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=600&q=80', alt: 'Waiting lounge', span: 'normal' },
    { src: 'https://images.unsplash.com/photo-1629909615184-74f495363b67?w=800&q=80', alt: 'Treatment room', span: 'wide' },
    { src: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=600&q=80', alt: 'Sterilization unit', span: 'normal' },
  ];

  locations: ClinicLocation[] = [
    { name: 'Main Center — Saheed Nagar', address: 'Plot 42, Saheed Nagar, Bhubaneswar, Odisha 751007', phone: '+91 98765 43210', hours: 'Mon–Sat: 9:00 AM – 8:00 PM', mapUrl: 'https://maps.google.com', image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400&q=80', isMain: true },
    { name: 'Branch — Patia', address: '2nd Floor, City Mall, Patia Square, Bhubaneswar, Odisha 751024', phone: '+91 98765 43211', hours: 'Mon–Sat: 10:00 AM – 7:00 PM', mapUrl: 'https://maps.google.com', image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&q=80', isMain: false },
  ];

  insurancePartners = [
    'Star Health', 'ICICI Lombard', 'Bajaj Allianz', 'HDFC Ergo', 'New India Assurance',
    'Max Bupa', 'Religare', 'Tata AIG'
  ];

  activeDeptFilter = 'all';
  activeTestimonial = 0;
  private testimonialInterval: any;
  private counterAnimated = false;

  get filteredDoctors(): Doctor[] {
    if (this.activeDeptFilter === 'all') return this.doctors;
    return this.doctors.filter(d => d.department === this.activeDeptFilter);
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      AOS.init({ duration: 700, easing: 'ease-out', once: true, offset: 60 });
    });
    this.startTestimonialAutoplay();
    this.setupCounterObserver();
  }

  ngOnDestroy(): void {
    if (this.testimonialInterval) clearInterval(this.testimonialInterval);
  }

  private startTestimonialAutoplay(): void {
    this.testimonialInterval = setInterval(() => {
      this.activeTestimonial = (this.activeTestimonial + 1) % this.testimonials.length;
    }, 5000);
  }

  setTestimonial(i: number): void {
    this.activeTestimonial = i;
    if (this.testimonialInterval) clearInterval(this.testimonialInterval);
    this.startTestimonialAutoplay();
  }

  private setupCounterObserver(): void {
    const el = document.querySelector('.mc-stats');
    if (!el) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !this.counterAnimated) {
        this.counterAnimated = true;
        this.animateCounters();
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    observer.observe(el);
  }

  private animateCounters(): void {
    this.stats.forEach((stat, i) => {
      const duration = 1800;
      const steps = 40;
      const increment = stat.value / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= stat.value) {
          this.animatedStats[i] = stat.value;
          clearInterval(timer);
        } else {
          this.animatedStats[i] = Math.floor(current);
        }
      }, duration / steps);
    });
  }

  getRatingStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }
}
