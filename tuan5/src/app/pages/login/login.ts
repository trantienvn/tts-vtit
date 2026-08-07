import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  form: FormGroup;
  showPassword = signal(false);
  rememberMe   = signal(false);
  submitted    = signal(false);
  loading      = signal(false);
  errorMsg     = signal('');

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email:    ['admin@vss.com', [Validators.required, Validators.email]],
      password: ['Admin@123', [Validators.required, Validators.minLength(6)]]
    });
  }

  get email():    AbstractControl { return this.form.get('email')!; }
  get password(): AbstractControl { return this.form.get('password')!; }
  get attempts()  { return this.auth.attempts; }
  get locked()    { return this.auth.locked; }
  get lockRemain(){ return this.auth.lockRemain; }

  togglePassword(): void { this.showPassword.update(v => !v); }
  toggleRemember():  void { this.rememberMe.update(v => !v); }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.form.invalid || this.locked()) return;

    this.loading.set(true);
    this.errorMsg.set('');

    const emailVal = this.email.value.trim();
    const pwVal    = this.password.value;

    this.auth.login(emailVal, pwVal).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/users']);
      },
      error: err => {
        this.loading.set(false);
        if (this.locked()) {
          this.errorMsg.set('');
        } else {
          const apiErr = err.error?.error || 'Sai thông tin đăng nhập hoặc không kết nối được server.';
          this.errorMsg.set(`${apiErr} (Còn ${this.auth.remainingAttempts()} lần thử)`);
        }
      }
    });
  }
}
