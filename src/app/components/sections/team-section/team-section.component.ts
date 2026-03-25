import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-team-section',
  template: `
    <section class="py-16 px-6 bg-gray-50">
      <div class="max-w-6xl mx-auto text-center">
        <h2 class="font-['Playfair_Display'] text-2xl font-bold mb-3 text-gray-900">
          {{ data?.heading || 'Our Team' }}
        </h2>
        <p *ngIf="data?.subtitle" class="text-gray-500 mb-8">{{ data.subtitle }}</p>
        <img *ngIf="data?.image" [src]="data.image" [alt]="data?.heading || 'Team'"
             loading="lazy" class="rounded-2xl mx-auto shadow-lg max-h-[500px] object-cover w-full">
        <div *ngIf="data?.members?.length" class="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
          <div *ngFor="let member of data.members" class="text-center">
            <img *ngIf="member.image" [src]="member.image" [alt]="member.name"
                 class="w-24 h-24 rounded-full mx-auto object-cover mb-3">
            <div class="font-semibold text-gray-800">{{ member.name }}</div>
            <div class="text-sm text-gray-500">{{ member.role }}</div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class TeamSectionComponent {
  @Input() data: any;
}
