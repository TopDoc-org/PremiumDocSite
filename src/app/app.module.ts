import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Orchestrator
import { PageOrchestratorComponent } from './components/page-orchestrator/page-orchestrator.component';

// Section components
import { GenericSectionComponent } from './components/sections/generic-section/generic-section.component';
import { HeroSectionComponent } from './components/sections/hero-section/hero-section.component';
import { AboutSectionComponent } from './components/sections/about-section/about-section.component';
import { ServicesSectionComponent } from './components/sections/services-section/services-section.component';
import { TestimonialsSectionComponent } from './components/sections/testimonials-section/testimonials-section.component';
import { OffersSectionComponent } from './components/sections/offers-section/offers-section.component';
import { GallerySectionComponent } from './components/sections/gallery-section/gallery-section.component';
import { BigNumbersSectionComponent } from './components/sections/big-numbers-section/big-numbers-section.component';
import { VideoSectionComponent } from './components/sections/video-section/video-section.component';
import { MapSectionComponent } from './components/sections/map-section/map-section.component';
import { MarqueeSectionComponent } from './components/sections/marquee-section/marquee-section.component';
import { TeamSectionComponent } from './components/sections/team-section/team-section.component';
import { ProcessSectionComponent } from './components/sections/process-section/process-section.component';
import { CtaSectionComponent } from './components/sections/cta-section/cta-section.component';
import { BookingSectionComponent } from './components/sections/booking-section/booking-section.component';
import { JasbirProfileComponent } from './components/custom/jasbir/jasbir-profile.component';
import { SachinProfileComponent } from './components/custom/sachin/sachin-profile.component';
import { DemoProfileComponent } from './components/demo/demo-profile.component';
import { InlineBookingComponent } from './components/shared/inline-booking/inline-booking.component';
import { AdminHomeComponent } from './components/admin-home/admin-home.component';
import { MultiDoctorComponent } from './components/templates/multi-doctor/multi-doctor.component';
import { TenantRouterComponent } from './components/tenant-router/tenant-router.component';
import { ErrorPageComponent } from './components/error-page/error-page.component';
import { TenantService } from './services/tenant.service';
import { tenantInitializerFactory } from './initializers/tenant.initializer';
import { TenantInterceptor } from './interceptors/tenant.interceptor';
import { PinInputComponent } from './components/shared/pin-input/pin-input.component';

@NgModule({
  declarations: [
    AppComponent,
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
    BookingSectionComponent,
    JasbirProfileComponent,
    SachinProfileComponent,
    DemoProfileComponent,
    InlineBookingComponent,
    AdminHomeComponent,
    MultiDoctorComponent,
    TenantRouterComponent,
    ErrorPageComponent,
    PinInputComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
    MatBottomSheetModule,
    MatSnackBarModule,
    MatTabsModule,
    AppRoutingModule,
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: tenantInitializerFactory,
      deps: [TenantService],
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TenantInterceptor,
      multi: true
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
