import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly VALID_EMAIL    = 'admin@vss.com';
  private readonly VALID_PASSWORD = 'Admin@123';
  private readonly MAX_ATTEMPTS   = 5;
  private readonly LOCK_SECONDS   = 30;

  attempts    = signal(0);
  locked      = signal(false);
  lockRemain  = signal(0);
  private lockTimer?: ReturnType<typeof setInterval>;

  constructor(private router: Router) {}

  isLoggedIn(): boolean {
    return !!localStorage.getItem('vss_user');
  }

  getUser(): { email: string; name: string } | null {
    const raw = localStorage.getItem('vss_user');
    return raw ? JSON.parse(raw) : null;
  }

  /**
   * Validate email format + password length, then check credentials.
   * Returns: 'format_email' | 'format_password' | 'invalid' | 'locked' | 'success'
   */
  login(email: string, password: string): 'format_email' | 'format_password' | 'invalid' | 'locked' | 'success' {
    if (this.locked()) return 'locked';

    if (!this.isValidEmail(email))    return 'format_email';
    if (!this.isValidPassword(password)) return 'format_password';

    if (email !== this.VALID_EMAIL || password !== this.VALID_PASSWORD) {
      this.registerFail();
      return 'invalid';
    }

    // Success
    localStorage.setItem('vss_user', JSON.stringify({ email, name: 'Admin' }));
    this.attempts.set(0);
    return 'success';
  }

  logout(): void {
    localStorage.removeItem('vss_user');
    this.router.navigate(['/login']);
  }

  isValidEmail(v: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  }

  isValidPassword(v: string): boolean {
    return v.length >= 6;
  }

  private registerFail(): void {
    this.attempts.update(n => n + 1);
    if (this.attempts() >= this.MAX_ATTEMPTS) {
      this.startLock();
    }
  }

  remainingAttempts(): number {
    return Math.max(0, this.MAX_ATTEMPTS - this.attempts());
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
