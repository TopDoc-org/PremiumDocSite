import { Component, Input, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-gallery-section',
  styles: [`
    .gallery-nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255,255,255,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    .gallery-nav:hover { background: white; }
    .gallery-nav-left { left: 12px; }
    .gallery-nav-right { right: 12px; }
    .gallery-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      background: rgba(255,255,255,0.5);
      transition: background 0.2s;
    }
    .gallery-dot.active { background: white; }
  `],
  template: `
    <section class="py-16 px-6 bg-white">
      <div class="max-w-6xl mx-auto">
        <h2 class="font-['Playfair_Display'] text-2xl font-bold text-center mb-8 text-gray-900">
          {{ data?.heading || 'Gallery' }}
        </h2>

        <div class="relative overflow-hidden rounded-2xl" *ngIf="data?.images?.length">
          <div class="flex transition-transform duration-500 ease-out"
               [style.transform]="'translateX(-' + currentIndex * 100 + '%)'">
            <div *ngFor="let img of data.images" class="w-full flex-shrink-0">
              <img [src]="img.src" [alt]="img.alt || ''" loading="lazy"
                   class="w-full h-[400px] object-cover"
                   [style.object-position]="img.position || 'center'">
            </div>
          </div>

          <!-- Navigation -->
          <button (click)="prev()" class="gallery-nav gallery-nav-left">
            <mat-icon>chevron_left</mat-icon>
          </button>
          <button (click)="next()" class="gallery-nav gallery-nav-right">
            <mat-icon>chevron_right</mat-icon>
          </button>

          <!-- Dots -->
          <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            <button *ngFor="let img of data.images; let i = index"
                    (click)="goTo(i)"
                    class="gallery-dot"
                    [class.active]="i === currentIndex">
            </button>
          </div>
        </div>
      </div>
    </section>
  `
})
export class GallerySectionComponent implements OnInit, OnDestroy {
  @Input() data: any;
  currentIndex = 0;
  private interval: any;

  ngOnInit() {
    this.startAutoplay();
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }

  startAutoplay() {
    this.interval = setInterval(() => this.next(), 4000);
  }

  prev() {
    const len = this.data?.images?.length || 1;
    this.currentIndex = (this.currentIndex - 1 + len) % len;
    this.resetAutoplay();
  }

  next() {
    const len = this.data?.images?.length || 1;
    this.currentIndex = (this.currentIndex + 1) % len;
  }

  goTo(i: number) {
    this.currentIndex = i;
    this.resetAutoplay();
  }

  private resetAutoplay() {
    clearInterval(this.interval);
    this.startAutoplay();
  }
}
