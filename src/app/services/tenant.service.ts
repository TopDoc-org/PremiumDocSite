import { Injectable } from '@angular/core';
import { DOMAIN_REGISTRY, TenantEntry, ComponentType } from '../config/domain-registry';
import { IDoctorSiteConfig } from '../models/doctor-site-config.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TenantService {
  private _tenant: TenantEntry | null = null;
  private _config: IDoctorSiteConfig | null = null;

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

  initialize(): void {
    const hostname = window.location.hostname;

    // Check domain registry first
    const entry = DOMAIN_REGISTRY[hostname];
    if (entry && entry.component !== 'fallback') {
      this._tenant = entry;
      return;
    }

    // Dev fallback: use query params ?doctorId=xxx&component=standard
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      const params = new URLSearchParams(window.location.search);
      const doctorId = params.get('doctorId');
      const component = (params.get('component') as ComponentType) || 'standard';
      if (doctorId) {
        this._tenant = { doctorId, component };
        return;
      }
    }

    // No match — set fallback
    this._tenant = entry || { doctorId: null, component: 'fallback' };
  }
}
