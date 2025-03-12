import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  loginForm: FormGroup;
  isForgotPassword: boolean = false;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  // Login form submit
  onLogin() {
    const { username, password } = this.loginForm.value;
    // Call API to authenticate
    this.authenticateUser(username, password);
  }

  // Forgot Password handler
  onForgotPassword() {
    this.isForgotPassword = true;
  }

  // Reset Password functionality (send email for password reset)
  onResetPassword() {
    const email = this.loginForm.value.email;
    if (!email) {
      this.errorMessage = 'Please provide your email for password reset.';
      return;
    }

    // Call the API for password reset request
    this.resetPassword(email);
  }

  // Simulated API calls (Replace these with real API calls)
  authenticateUser(email: string, password: string) {
    this.authService.login(email, password).subscribe({
      next: res => {
        sessionStorage.setItem('token', res.token);
        this.router.navigate(['/dashboard']);
      },
      error: err => {
        this.errorMessage = 'Invalid email or password.';
      }
    });
  }

  resetPassword(email: string) {
    console.log('Password reset requested for', email);
    // Simulating API call for password reset
    // You can make an actual HTTP request here using Angular's HttpClient service.
    this.errorMessage = 'Password reset link has been sent to your email.';
  }

  // Close Forgot Password form
  closeForgotPassword() {
    this.isForgotPassword = false;
    this.errorMessage = '';
  }
}
