import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap, catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { IDoctorSiteConfig } from '../models/doctor-site-config.model';

// Map doctorIds to mock config file names (dev only)
const MOCK_CONFIGS: { [key: string]: string } = {
  'jasbir-001': 'jasbir',
  'jasbir': 'jasbir',
  'demo-doctor': 'demo-doctor',
};

@Injectable({
  providedIn: 'root'
})
export class DoctorConfigService {

  private cache = new Map<string, { config: IDoctorSiteConfig; timestamp: number }>();
  private TTL = 5 * 60 * 1000; // 5 minutes

  constructor(private http: HttpClient) {}

  getConfig(doctorId: string): Observable<IDoctorSiteConfig | null> {
    // Check cache
    const cached = this.cache.get(doctorId);
    if (cached && Date.now() - cached.timestamp < this.TTL) {
      return of(cached.config);
    }

    // In dev, try local mock configs first, fall back to backend
    if (!environment.production) {
      const mockFile = MOCK_CONFIGS[doctorId];
      if (mockFile) {
        return this.http.get<IDoctorSiteConfig>(`/assets/mock-configs/${mockFile}.json`).pipe(
          tap(config => this.cache.set(doctorId, { config, timestamp: Date.now() })),
          catchError(() => this.fetchFromBackend(doctorId))
        );
      }
    }

    return this.fetchFromBackend(doctorId);
  }

  private fetchFromBackend(doctorId: string): Observable<IDoctorSiteConfig | null> {
    return this.http.get<any>(
      `${environment.serverUrl}/api/microsite/config`,
      { params: { doctorId } }
    ).pipe(
      map(res => res?.data as IDoctorSiteConfig),
      tap(config => {
        if (config) {
          this.cache.set(doctorId, { config, timestamp: Date.now() });
        }
      }),
      catchError(() => of(null))
    );
  }
}
