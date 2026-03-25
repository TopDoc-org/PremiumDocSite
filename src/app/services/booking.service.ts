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
    return this.http.post(`${this.baseUrl}/api/queue/searchMulti`, req);
  }

  searchMulti(query: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/queue/searchMulti`, query);
  }

  bookUnregisteredUser(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/v1/appointment/booking`, data);
  }

  fetchDoctorProfile(doctorId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/doctor/profile`, {
      params: { doctorId }
    });
  }
}
