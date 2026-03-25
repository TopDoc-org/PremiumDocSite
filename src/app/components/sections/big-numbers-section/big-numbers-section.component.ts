import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-big-numbers-section',
  template: `
    <section class="py-16 px-6" [style.background]="'linear-gradient(135deg, var(--gradient-from), var(--gradient-to))'">
      <div class="max-w-6xl mx-auto">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          <div *ngFor="let stat of data?.items || []">
            <div class="text-3xl md:text-4xl font-bold mb-1">{{ stat.value }}</div>
            <div class="text-sm opacity-80">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class BigNumbersSectionComponent {
  @Input() data: any;
}
