import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { DemoProfileComponent } from './components/demo/demo-profile.component';
import { AdminHomeComponent } from './components/admin-home/admin-home.component';
import { TenantRouterComponent } from './components/tenant-router/tenant-router.component';
import { ErrorPageComponent } from './components/error-page/error-page.component';
import { TenantService } from './services/tenant.service';
import { tenantInitializerFactory } from './initializers/tenant.initializer';
import { TenantInterceptor } from './interceptors/tenant.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    DemoProfileComponent,
    AdminHomeComponent,
    TenantRouterComponent,
    ErrorPageComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
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
