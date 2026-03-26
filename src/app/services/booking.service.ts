import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  private baseUrl = environment.serverUrl;

  constructor(private http: HttpClient) {}

  getSchedule(req: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/v1/appointment/search/`, req);
  }

  searchMulti(query: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/queue/searchMulti`, query);
  }

  getOrgContracts(doctorId: string, pageNo = 0, pageSize = 100): Observable<any> {
    return this.http.post(`${this.baseUrl}/organization/search`, {
      id: doctorId,
      pageNo,
      pageSize,
      filter: [{ type: 'doctor' }, { status: 'active' }]
    });
  }

  getOrgDetails(idList: string[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/doctors/doctorDetail`, {
      id: idList,
      role: 'organisation',
      fields: ['all']
    });
  }

  bookUnregisteredUser(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/v1/appointment/booking`, data);
  }

  fetchDoctorProfile(doctorId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/doctors/doctorDetail`, {
      id: [doctorId],
      role: 'doctor',
      fields: ['all']
    });
  }
}
