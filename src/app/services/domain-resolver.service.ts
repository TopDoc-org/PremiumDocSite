import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { IDomainMapping } from '../models/doctor-site-config.model';

@Injectable({
  providedIn: 'root'
})
export class DomainResolverService {

  constructor(private http: HttpClient) {}

  resolve(): Observable<IDomainMapping | null> {
    const hostname = window.location.hostname;

    // Dev fallback: use query param ?doctorId=xxx
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      const params = new URLSearchParams(window.location.search);
      const doctorId = params.get('doctorId');
      const profileType = params.get('profileType') || 'standard';
      if (doctorId) {
        return of({ doctorId, profileType });
      }
      return of(null);
    }

    // Production: call backend to resolve domain
    return this.http.get<any>(
      `${environment.serverUrl}/api/microsite/domain`,
      { params: { hostname } }
    ).pipe(
      map(res => res?.data as IDomainMapping),
      catchError(() => of(null))
    );
  }
}
