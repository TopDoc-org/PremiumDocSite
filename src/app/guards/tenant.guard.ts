import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { TenantService } from '../services/tenant.service';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TenantGuard implements CanActivate {
  constructor(private tenantService: TenantService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    // Route-level tenant override (dev convenience routes like /jasbir, /sachin)
    const doctorId = route.data['doctorId'];
    const component = route.data['component'];
    if (doctorId && component) {
      this.tenantService.setRouteOverride(doctorId, component);
      return true;
    }

    if (this.tenantService.isResolved) {
      return true;
    }

    // Dev mode: set jasbir as default profile and allow route to proceed
    if (!environment.production) {
      this.tenantService.setDevFallback('0e828c42-82da-4c56-bf35-a3e205161b92', 'custom-jasbir');
      return true;
    }

    this.router.navigate(['/error']);
    return false;
  }
}
