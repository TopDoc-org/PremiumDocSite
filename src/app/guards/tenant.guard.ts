import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { TenantService } from '../services/tenant.service';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TenantGuard implements CanActivate {
  constructor(private tenantService: TenantService, private router: Router) {}

  canActivate(): boolean {
    if (this.tenantService.isResolved) {
      return true;
    }

    // Dev mode: redirect to jasbir as default profile
    if (!environment.production) {
      this.router.navigate(['/jasbir']);
      return false;
    }

    this.router.navigate(['/error']);
    return false;
  }
}
