import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-offers-section',
  template: `
    <section class="py-16 px-6 bg-gradient-to-br from-gray-50 to-white">
      <div class="max-w-6xl mx-auto">
        <h2 class="font-['Playfair_Display'] text-2xl font-bold text-center mb-8 text-gray-900">
          {{ data?.heading || 'Special Offers' }}
        </h2>

        <!-- Hero offer -->
        <div *ngIf="data?.heroOffer" class="mb-8 p-6 rounded-2xl border-2 text-center"
             [style.border-color]="'var(--primary)'"
             [style.background]="'linear-gradient(135deg, var(--gradient-from), var(--gradient-to))'">
          <span class="inline-block px-3 py-1 rounded-full text-sm text-white mb-3" style="background: rgba(255,255,255,0.2);">
            {{ data.heroOffer.badge }}
          </span>
          <h3 class="text-2xl font-bold text-white mb-2">{{ data.heroOffer.title }}</h3>
          <p class="text-white mb-3" style="opacity: 0.8;">{{ data.heroOffer.description }}</p>
          <div class="text-white font-semibold">
            Save {{ data.heroOffer.savingsAmount }} · {{ data.heroOffer.validUntil }}
          </div>
        </div>

        <!-- Offer cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div *ngFor="let offer of data?.cards || []"
               class="p-5 bg-white rounded-xl border border-gray-100 shadow-sm hover:-translate-y-1 transition-transform duration-200">
            <span *ngIf="offer.badge"
                  class="inline-block px-2 py-0.5 rounded-full text-xs font-semibold mb-3"
                  [style.background]="'var(--primary)'" style="color: white;">
              {{ offer.badge }}
            </span>
            <h4 class="font-semibold text-gray-900 mb-2">{{ offer.title }}</h4>
            <p class="text-gray-500 text-sm leading-relaxed">{{ offer.description }}</p>
          </div>
        </div>
      </div>
    </section>
  `
})
export class OffersSectionComponent {
  @Input() data: any;
}
