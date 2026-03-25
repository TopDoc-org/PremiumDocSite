import { Component, Input } from '@angular/core';
import { ISiteTheme } from '../../../models/doctor-site-config.model';

@Component({
  selector: 'app-cta-section',
  template: `
    <section class="py-20 px-6 text-center text-white"
             [style.background]="'linear-gradient(135deg, var(--gradient-from), var(--gradient-to))'">
      <div class="max-w-2xl mx-auto">
        <h2 class="font-['Playfair_Display'] text-3xl font-bold mb-4">{{ data?.heading }}</h2>
        <p class="opacity-90 mb-8 leading-relaxed">{{ data?.description }}</p>
        <a *ngIf="data?.ctaText"
           [href]="data.ctaLink || '#booking'"
           class="inline-block px-8 py-3.5 bg-white font-semibold rounded-lg transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
           [style.color]="'var(--primary)'">
          {{ data.ctaText }}
        </a>
        <p *ngIf="data?.guaranteeText" class="mt-4 text-sm opacity-75">{{ data.guaranteeText }}</p>
      </div>
    </section>
  `
})
export class CtaSectionComponent {
  @Input() data: any;
  @Input() theme!: ISiteTheme;
}
