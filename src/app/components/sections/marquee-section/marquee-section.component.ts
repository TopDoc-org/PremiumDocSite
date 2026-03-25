import { Component, Input } from '@angular/core';
import { ISiteTheme } from '../../../models/doctor-site-config.model';

@Component({
  selector: 'app-marquee-section',
  template: `
    <section class="marquee-section" [class.dark]="data?.dark">
      <div class="marquee-track">
        <div class="marquee-content">
          <span *ngFor="let item of doubledItems" class="marquee-item">
            <span class="marquee-dot">●</span>
            {{ item }}
          </span>
        </div>
      </div>
    </section>
  `,
  styleUrls: ['./marquee-section.component.scss']
})
export class MarqueeSectionComponent {
  @Input() data: any;
  @Input() theme!: ISiteTheme;

  get doubledItems(): string[] {
    const items = this.data?.items || [];
    return [...items, ...items];
  }
}
