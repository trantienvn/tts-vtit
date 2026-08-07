import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, UserForm, UserListResponse, LoginResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly REQRES_BASE = 'https://reqres.in/api';
  private readonly API_KEY = 'pub_8003dd09c0d37bd52c838e3319de80297862374b94c23c84e99824a61812556e';

  constructor(private http: HttpClient) { }

  private get headers(): HttpHeaders {
    const token = localStorage.getItem('vss_token');
    let h = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-api-key': this.API_KEY
    });
    if (token) {
      h = h.set('Authorization', `Bearer ${token}`);
    }
    return h;
  }

  login(email: string, password: string): Observable<LoginResponse> {
    const body = { email, password };
    return this.http.post<LoginResponse>(`${this.REQRES_BASE}/app-users/login`, body, { headers: this.headers });
  }

  getUsers(page: number = 1, perPage: number = 6): Observable<UserListResponse> {
    return this.http.get<UserListResponse>(`${this.REQRES_BASE}/users?page=${page}&per_page=${perPage}`, { headers: this.headers });
  }

  getUser(id: number): Observable<{ data: User }> {
    return this.http.get<{ data: User }>(`${this.REQRES_BASE}/users/${id}`, { headers: this.headers });
  }

  createUser(user: UserForm): Observable<User> {
    return this.http.post<User>(`${this.REQRES_BASE}/users`, user, { headers: this.headers });
  }

  updateUser(id: number, user: UserForm): Observable<User> {
    return this.http.put<User>(`${this.REQRES_BASE}/users/${id}`, user, { headers: this.headers });
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.REQRES_BASE}/users/${id}`, { headers: this.headers });
  }
}
