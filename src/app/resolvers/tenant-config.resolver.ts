import { Injectable } from '@angular/core';
import { Resolve, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { TenantService } from '../services/tenant.service';
import { DoctorConfigService } from '../services/doctor-config.service';
import { IDoctorSiteConfig } from '../models/doctor-site-config.model';

@Injectable({ providedIn: 'root' })
export class TenantConfigResolver implements Resolve<IDoctorSiteConfig | null> {
  constructor(
    private tenantService: TenantService,
    private doctorConfigService: DoctorConfigService,
    private router: Router
  ) {}

  resolve(): Observable<IDoctorSiteConfig | null> {
    // Only load config for 'standard' template type (config-driven)
    if (this.tenantService.componentType !== 'standard') {
      return of(null);
    }

    const doctorId = this.tenantService.doctorId;
    if (!doctorId) {
      this.router.navigate(['/error']);
      return of(null);
    }

    return this.doctorConfigService.getConfig(doctorId).pipe(
      tap(config => this.tenantService.setConfig(config)),
      catchError(() => {
        this.router.navigate(['/error']);
        return of(null);
      })
    );
  }
}
