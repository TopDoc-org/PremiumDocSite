import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-video-section',
  template: `
    <section class="py-16 px-6 bg-gray-50">
      <div class="max-w-4xl mx-auto">
        <h2 class="font-['Playfair_Display'] text-2xl font-bold text-center mb-3 text-gray-900">
          {{ data?.heading || 'Video Tour' }}
        </h2>
        <p *ngIf="data?.description" class="text-center text-gray-500 mb-8">{{ data.description }}</p>
        <div class="relative rounded-2xl overflow-hidden shadow-lg aspect-video" *ngIf="safeUrl">
          <iframe [src]="safeUrl" class="w-full h-full" frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen></iframe>
        </div>
        <ul *ngIf="data?.features?.length" class="mt-6 flex flex-wrap gap-3 justify-center">
          <li *ngFor="let f of data.features"
              class="px-3 py-1.5 bg-white rounded-full text-sm text-gray-600 border border-gray-200">
            {{ f }}
          </li>
        </ul>
      </div>
    </section>
  `
})
export class VideoSectionComponent {
  @Input() data: any;
  safeUrl: SafeResourceUrl | null = null;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges() {
    if (this.data?.youtubeEmbedUrl) {
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.data.youtubeEmbedUrl);
    }
  }
}
