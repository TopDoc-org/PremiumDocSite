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

  bookRegisteredUser(data: any, token: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/v1/appointment/booking`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  loginUser(mobileNumber: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/user/login`, { mobileNumber, password });
  }

  signupUser(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/user/signup`, payload);
  }

  checkMobileRegistered(mobile: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/user/numCheck`, { mobile });
  }

  sendForgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/forgetPassword/send`, { email, role: 'user' });
  }

  checkUserSessionBookings(doctorId: string, sessionId: string, mobile: string): Observable<any> {
    const today = new Date();
    const dateStr = today.getFullYear() + '-' +
      (today.getMonth() + 1).toString().padStart(2, '0') + '-' +
      today.getDate().toString().padStart(2, '0');
    return this.http.post(`${this.baseUrl}/api/v1/appointment/search`, {
      pageSize: 1000,
      pageNo: 0,
      search: {
        doctorId,
        sessionId,
        range: { appointmentDate: { gte: dateStr, lte: dateStr } }
      },
      sort: [{ slotId: 'asc' }],
      filters: [
        { bool: { must_not: [{ terms: { status: ['sessionCancelled', 'cancelled'] } }] } },
        { bool: { must: [{ term: { mobile } }] } }
      ]
    });
  }

  fetchDoctorProfile(doctorId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/doctors/doctorDetail`, {
      id: [doctorId],
      role: 'doctor',
      fields: ['all']
    });
  }
}
