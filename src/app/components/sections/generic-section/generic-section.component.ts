import { Component, Input } from '@angular/core';
import { ISection } from '../../../models/doctor-site-config.model';

@Component({
  selector: 'app-generic-section',
  template: `
    <section class="py-12 px-4 max-w-6xl mx-auto">
      <div *ngIf="section.data?.heading" class="text-2xl font-bold mb-4">{{ section.data.heading }}</div>
      <div *ngIf="section.data?.content" [innerHTML]="section.data.content"></div>
      <div *ngIf="section.data?.text" class="text-gray-600 leading-relaxed">{{ section.data.text }}</div>
    </section>
  `
})
export class GenericSectionComponent {
  @Input() section!: ISection;
}
