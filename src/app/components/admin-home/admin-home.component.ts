import { Component } from '@angular/core';

interface Template {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  previewUrl: string;
  demoUrl: string;
  thumbnail: string;
  tags: string[];
  features: string[];
  status: 'live' | 'beta' | 'coming-soon';
  accentColor: string;
}

interface QuickLink {
  icon: string;
  label: string;
  description: string;
  url: string;
  color: string;
}

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.scss']
})
export class AdminHomeComponent {

  templates: Template[] = [
    {
      id: 'premium-v1',
      name: 'Premium Profile V1',
      subtitle: 'Jasbir / Dr. Meher',
      description: 'Full-featured premium doctor profile with animated hero, service showcase, inline booking, testimonials, team section, video tour, and map. Built for orthodontists and dental clinics.',
      previewUrl: '/jasbir',
      demoUrl: '/demo',
      thumbnail: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&q=80',
      tags: ['Premium', 'Animated', 'Booking', 'SEO'],
      features: [
        'Animated hero with AOS transitions',
        'Inline booking with real slot data',
        'Service showcase with detail popups',
        'Patient testimonials carousel',
        'Team members section',
        'Video tour embed',
        'Google Maps integration',
        'Education & experience timeline',
        'Awards & honors',
        'WhatsApp & call integration',
        'Offers with confetti animation',
        'Mobile responsive'
      ],
      status: 'live',
      accentColor: '#2563eb'
    },
    {
      id: 'demo-customizable',
      name: 'Demo / Customizable Preview',
      subtitle: 'Interactive demo with live editing',
      description: 'Interactive demo page that lets prospects customize doctor name, specialization, clinic info, profile photo, and color theme in real-time. Shareable via URL params. Includes mock booking flow.',
      previewUrl: '/demo',
      demoUrl: '/demo',
      thumbnail: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&q=80',
      tags: ['Demo', 'Customizable', 'Shareable', 'Mock Data'],
      features: [
        'Live edit panel for all doctor info',
        'Color theme presets + custom picker',
        'Profile photo upload / URL',
        'Hero overlay tinting',
        'Mock booking with slot selection',
        'Shareable URL with all config',
        'Animation toggle',
        'Features showcase panel',
        'Responsive design'
      ],
      status: 'live',
      accentColor: '#7c3aed'
    },
    {
      id: 'minimal-v1',
      name: 'Minimal Clean',
      subtitle: 'Lightweight single-page profile',
      description: 'A clean, minimal doctor profile focused on essential information — hero, about, services, and contact. Fast loading, zero animations, perfect for quick deployments.',
      previewUrl: '',
      demoUrl: '',
      thumbnail: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80',
      tags: ['Minimal', 'Fast', 'Clean'],
      features: [
        'Single-page layout',
        'Essential sections only',
        'Ultra-fast loading',
        'Clean typography',
        'Contact form',
        'Mobile first'
      ],
      status: 'coming-soon',
      accentColor: '#0d9488'
    },
    {
      id: 'multi-doctor',
      name: 'Multi-Doctor Clinic',
      subtitle: 'For clinics with multiple practitioners',
      description: 'A clinic-first template showcasing multiple doctors, shared services, clinic gallery, and centralized booking. Ideal for multi-specialty clinics and hospital departments.',
      previewUrl: '',
      demoUrl: '',
      thumbnail: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&q=80',
      tags: ['Multi-Doctor', 'Clinic', 'Enterprise'],
      features: [
        'Doctor grid / profiles',
        'Shared service catalog',
        'Clinic-level booking',
        'Department sections',
        'Photo gallery',
        'Insurance partners',
        'Facility tour'
      ],
      status: 'coming-soon',
      accentColor: '#ea580c'
    }
  ];

  sharedComponents = [
    { name: 'InlineBookingComponent', path: 'shared/inline-booking', description: 'Two-column booking widget with form + slot grid. Accepts accent color, form group, schedule data.', usedIn: ['Premium V1', 'Demo'] },
    { name: 'HeroSectionComponent', path: 'sections/hero-section', description: 'Configurable hero with background image, overlay, doctor info, and CTA buttons.', usedIn: ['Orchestrator'] },
    { name: 'ServicesSectionComponent', path: 'sections/services-section', description: 'Service cards grid with icons, descriptions, and detail popups.', usedIn: ['Orchestrator'] },
    { name: 'TestimonialsSectionComponent', path: 'sections/testimonials-section', description: 'Patient review cards with ratings and treatment tags.', usedIn: ['Orchestrator'] },
    { name: 'MapSectionComponent', path: 'sections/map-section', description: 'Google Maps embed with clinic address and directions link.', usedIn: ['Orchestrator'] },
    { name: 'BookingSectionComponent', path: 'sections/booking-section', description: 'Bottom sheet booking flow with slot selection and confirmation.', usedIn: ['Orchestrator'] },
  ];

  quickLinks: QuickLink[] = [
    { icon: 'visibility', label: 'Live Site', description: 'View Jasbir\'s production profile', url: '/jasbir', color: '#2563eb' },
    { icon: 'palette', label: 'Demo Editor', description: 'Customize & share demo link', url: '/demo', color: '#7c3aed' },
    { icon: 'code', label: 'Backend API', description: 'Open backend routes', url: '', color: '#0d9488' },
    { icon: 'analytics', label: 'Analytics', description: 'Site traffic & booking stats', url: '', color: '#ea580c' },
  ];

  stats = [
    { label: 'Templates', value: '2', sub: 'live', icon: 'dashboard' },
    { label: 'Shared Components', value: '6', sub: 'reusable', icon: 'widgets' },
    { label: 'Active Sites', value: '1', sub: 'deployed', icon: 'public' },
    { label: 'Features', value: '20+', sub: 'per template', icon: 'star' },
  ];

  activeFilter: 'all' | 'live' | 'coming-soon' = 'all';
  currentYear = new Date().getFullYear();

  get filteredTemplates(): Template[] {
    if (this.activeFilter === 'all') return this.templates;
    return this.templates.filter(t => t.status === this.activeFilter);
  }
}
