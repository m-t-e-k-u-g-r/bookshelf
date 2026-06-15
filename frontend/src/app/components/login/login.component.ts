import {Component, inject} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    ReactiveFormsModule
  ],
  template: `
    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
      <label>E-Mail
        <input type="email" formControlName="email">
      </label>

      <label>Password
        <input type="password" formControlName="password">
      </label>

      <!-- Nur beim Signup anzeigen -->
      @if (!isLogin) {
        <div>
          <label>Confirm Password
            <input type="password" formControlName="confirmPassword">
          </label>
        </div>
      }
      <button type="submit">
        {{ isLogin ? 'Login' : 'Signup' }}
      </button>
      @if (isLogin) {
        <p>No account?
            <a (click)="toggleMode()">
                Sign up
            </a>
        </p>
      }
      @if (!isLogin) {
        <p>Already have an account?
            <a (click)="toggleMode()">
                Log in
            </a>
        </p>
      }
    </form>
  `,
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private authService = inject(AuthService);
  router = inject(Router);
  isLogin = true;
  loginForm: FormGroup<{
    email: FormControl<string | null>,
    password: FormControl<string | null>,
    confirmPassword: FormControl<string | null>
  }> = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email, Validators.minLength(1)]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [])
  });

  toggleMode() {
    this.isLogin = !this.isLogin;

    const confirmControl = this.loginForm.controls.confirmPassword;
    if (!this.isLogin) {
      confirmControl?.setValidators([Validators.required, Validators.minLength(6)]);
    } else {
      confirmControl?.clearValidators();
    }
  }

  onSubmit() {
    const data = this.loginForm.value;
    if (typeof data.email !== 'string' || typeof data.password !== 'string') return;
    if (this.isLogin) {
      this.authService.login(data.email, data.password)
        .subscribe({
          next: () => {
            console.log('Login successful');
            this.router.navigate(['/']);
          },
          error: (err) => {
            console.error('Login failed', err);
          }
        })
    } else {
      if (data.password !== data.confirmPassword) return;
      this.authService.signup(data.email, data.password)
        .subscribe({
          next: () => {
            console.log('Signup successful');
            this.router.navigate(['/']);
          },
          error: (err) => {
            console.error('Signup failed', err);
          }
        })
    }
  }
}
