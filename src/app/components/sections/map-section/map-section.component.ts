import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-map-section',
  template: `
    <section class="py-16 px-6 bg-white">
      <div class="max-w-6xl mx-auto">
        <h2 class="font-['Playfair_Display'] text-2xl font-bold text-center mb-8 text-gray-900">
          {{ data?.heading || 'Find Us' }}
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="rounded-2xl overflow-hidden shadow-md h-[350px]" *ngIf="safeMapUrl">
            <iframe [src]="safeMapUrl" class="w-full h-full" frameborder="0"
                    style="border:0;" allowfullscreen loading="lazy"></iframe>
          </div>
          <div class="flex flex-col justify-center space-y-4">
            <div *ngIf="data?.address" class="flex items-start gap-3">
              <mat-icon class="text-gray-400 mt-0.5">location_on</mat-icon>
              <p class="text-gray-600">{{ data.address }}</p>
            </div>
            <div *ngIf="data?.workingHours" class="flex items-start gap-3">
              <mat-icon class="text-gray-400 mt-0.5">schedule</mat-icon>
              <p class="text-gray-600">{{ data.workingHours }}</p>
            </div>
            <div *ngIf="data?.phone" class="flex items-start gap-3">
              <mat-icon class="text-gray-400 mt-0.5">phone</mat-icon>
              <a [href]="'tel:' + data.phone" class="text-gray-600 hover:underline">{{ data.phone }}</a>
            </div>
            <div *ngIf="data?.parkingInfo" class="flex items-start gap-3">
              <mat-icon class="text-gray-400 mt-0.5">local_parking</mat-icon>
              <p class="text-gray-600">{{ data.parkingInfo }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class MapSectionComponent {
  @Input() data: any;
  safeMapUrl: SafeResourceUrl | null = null;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges() {
    if (this.data?.embedUrl) {
      this.safeMapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.data.embedUrl);
    }
  }
}
