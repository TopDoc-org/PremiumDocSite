import { Injectable } from '@angular/core';
import { DOMAIN_REGISTRY, TenantEntry, ComponentType } from '../config/domain-registry';
import { IDoctorSiteConfig } from '../models/doctor-site-config.model';
import { DomainResolverService } from './domain-resolver.service';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TenantService {
  private _tenant: TenantEntry | null = null;
  private _config: IDoctorSiteConfig | null = null;

  constructor(private domainResolver: DomainResolverService) {}

  get tenant(): TenantEntry | null { return this._tenant; }
  get doctorId(): string | null { return this._tenant?.doctorId ?? null; }
  get componentType(): ComponentType | null { return this._tenant?.component ?? null; }
  get isResolved(): boolean { return this._tenant !== null && this._tenant.component !== 'fallback'; }
  get config(): IDoctorSiteConfig | null { return this._config; }

  setConfig(config: IDoctorSiteConfig | null): void {
    this._config = config;
  }

  setDevFallback(doctorId: string, component: ComponentType): void {
    if (!environment.production && !this._tenant?.doctorId) {
      this._tenant = { doctorId, component };
    }
  }

  /** Force-set tenant from route data (dev convenience routes like /jasbir) */
  setRouteOverride(doctorId: string, component: ComponentType): void {
    this._tenant = { doctorId, component };
  }

  async initialize(): Promise<void> {
    const hostname = window.location.hostname;

    // 1. Static registry — fast path, no network call
    const entry = DOMAIN_REGISTRY[hostname];
    if (entry && entry.component !== 'fallback') {
      this._tenant = entry;
      return;
    }

    // 2. Dev fallback: use query params ?doctorId=xxx&component=standard
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      const params = new URLSearchParams(window.location.search);
      const doctorId = params.get('doctorId');
      const component = (params.get('component') as ComponentType) || 'standard';
      if (doctorId) {
        this._tenant = { doctorId, component };
        return;
      }
    }

    // 3. Production: resolve domain via backend API
    if (environment.production) {
      const mapping = await firstValueFrom(this.domainResolver.resolve());
      if (mapping?.doctorId) {
        this._tenant = {
          doctorId: mapping.doctorId,
          component: (mapping.profileType as ComponentType) || 'standard'
        };
        return;
      }
    }

    // 4. No match — set fallback
    this._tenant = entry || { doctorId: null, component: 'fallback' };
  }
}
