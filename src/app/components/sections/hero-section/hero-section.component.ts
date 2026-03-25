import { Component, Input } from '@angular/core';
import { ISiteTheme } from '../../../models/doctor-site-config.model';

@Component({
  selector: 'app-hero-section',
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.scss']
})
export class HeroSectionComponent {
  @Input() data: any;
  @Input() theme!: ISiteTheme;
}
