import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { PageOrchestratorComponent } from './page-orchestrator.component';
import { GenericSectionComponent } from '../sections/generic-section/generic-section.component';
import { HeroSectionComponent } from '../sections/hero-section/hero-section.component';
import { AboutSectionComponent } from '../sections/about-section/about-section.component';
import { ServicesSectionComponent } from '../sections/services-section/services-section.component';
import { TestimonialsSectionComponent } from '../sections/testimonials-section/testimonials-section.component';
import { OffersSectionComponent } from '../sections/offers-section/offers-section.component';
import { GallerySectionComponent } from '../sections/gallery-section/gallery-section.component';
import { BigNumbersSectionComponent } from '../sections/big-numbers-section/big-numbers-section.component';
import { VideoSectionComponent } from '../sections/video-section/video-section.component';
import { MapSectionComponent } from '../sections/map-section/map-section.component';
import { MarqueeSectionComponent } from '../sections/marquee-section/marquee-section.component';
import { TeamSectionComponent } from '../sections/team-section/team-section.component';
import { ProcessSectionComponent } from '../sections/process-section/process-section.component';
import { CtaSectionComponent } from '../sections/cta-section/cta-section.component';
import { BookingSectionComponent } from '../sections/booking-section/booking-section.component';

@NgModule({
  declarations: [
    PageOrchestratorComponent,
    GenericSectionComponent,
    HeroSectionComponent,
    AboutSectionComponent,
    ServicesSectionComponent,
    TestimonialsSectionComponent,
    OffersSectionComponent,
    GallerySectionComponent,
    BigNumbersSectionComponent,
    VideoSectionComponent,
    MapSectionComponent,
    MarqueeSectionComponent,
    TeamSectionComponent,
    ProcessSectionComponent,
    CtaSectionComponent,
    BookingSectionComponent
  ],
  imports: [
    CommonModule,
    MatIconModule
  ]
})
export class StandardModule {
  static entry = PageOrchestratorComponent;
}
