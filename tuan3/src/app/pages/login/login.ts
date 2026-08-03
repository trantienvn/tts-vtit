import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
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
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
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

    const result = this.auth.login(
      this.email.value.trim(),
      this.password.value
    );

    setTimeout(() => {
      this.loading.set(false);
      switch (result) {
        case 'success':
          this.router.navigate(['/users']);
          break;
        case 'invalid':
          if (this.locked()) {
            this.errorMsg.set('');
          } else {
            this.errorMsg.set(`Sai thông tin đăng nhập. Còn ${this.auth.remainingAttempts()} lần thử.`);
          }
          break;
        default:
          break;
      }
    }, 400);
  }
}
