import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-process-section',
  template: `
    <section class="py-16 px-6 bg-white">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="font-['Playfair_Display'] text-2xl font-bold mb-10 text-gray-900">
          {{ data?.heading || 'How It Works' }}
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div *ngFor="let step of data?.steps || []" class="flex flex-col items-center">
            <div class="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4"
                 [style.background]="'var(--primary)'">
              <mat-icon *ngIf="step.icon">{{ step.icon }}</mat-icon>
              <span *ngIf="!step.icon">{{ step.number }}</span>
            </div>
            <h3 class="font-semibold text-gray-800 mb-2">{{ step.title }}</h3>
            <p class="text-gray-500 text-sm leading-relaxed">{{ step.description }}</p>
          </div>
        </div>
      </div>
    </section>
  `
})
export class ProcessSectionComponent {
  @Input() data: any;
}
