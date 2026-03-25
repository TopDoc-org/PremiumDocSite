import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TenantService } from '../services/tenant.service';
import { environment } from '../../environments/environment';

@Injectable()
export class TenantInterceptor implements HttpInterceptor {
  constructor(private tenantService: TenantService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const doctorId = this.tenantService.doctorId;

    if (doctorId && req.url.startsWith(environment.serverUrl)) {
      const cloned = req.clone({
        setHeaders: {
          'X-Doctor-Id': doctorId,
          'X-Profile-Type': this.tenantService.componentType || 'standard'
        }
      });
      return next.handle(cloned);
    }

    return next.handle(req);
  }
}
