import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { ApiService } from './api.service';
import { LoginResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly MAX_ATTEMPTS = 5;
  private readonly LOCK_SECONDS = 30;

  attempts   = signal(0);
  locked     = signal(false);
  lockRemain = signal(0);
  private lockTimer?: ReturnType<typeof setInterval>;

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  isLoggedIn(): boolean {
    return !!localStorage.getItem('vss_token');
  }

  getUser(): { email: string; name?: string } | null {
    const raw = localStorage.getItem('vss_user');
    return raw ? JSON.parse(raw) : null;
  }

  login(email: string, pw: string): Observable<LoginResponse> {
    if (this.locked()) {
      return throwError(() => new Error('Tài khoản đang bị khóa tạm thời.'));
    }

    return this.api.login(email, pw).pipe(
      tap(res => {
        const token = res.token || (res.data?.sent ? 'reqres_magic_token_' + Date.now() : 'mock_token_' + Date.now());
        if (token) {
          localStorage.setItem('vss_token', token);
          localStorage.setItem('vss_user', JSON.stringify({ email, name: res.user?.name || 'Admin' }));
          this.attempts.set(0);
        }
      }),
      catchError(err => {
        this.registerFail();
        return throwError(() => err);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('vss_token');
    localStorage.removeItem('vss_user');
    this.router.navigate(['/login']);
  }

  remainingAttempts(): number {
    return Math.max(0, this.MAX_ATTEMPTS - this.attempts());
  }

  private registerFail(): void {
    this.attempts.update(n => n + 1);
    if (this.attempts() >= this.MAX_ATTEMPTS) {
      this.startLock();
    }
  }

  private startLock(): void {
    this.locked.set(true);
    this.lockRemain.set(this.LOCK_SECONDS);
    this.lockTimer = setInterval(() => {
      this.lockRemain.update(n => n - 1);
      if (this.lockRemain() <= 0) {
        clearInterval(this.lockTimer);
        this.locked.set(false);
        this.attempts.set(0);
      }
    }, 1000);
  }
}
