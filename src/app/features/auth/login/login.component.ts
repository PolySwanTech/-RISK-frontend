import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';


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

  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  // Login form submit
  onLogin() {
    const { email, password } = this.loginForm.value;
    if (this.loginForm.invalid) {
      this.errorMessage = 'Please enter a valid email and password.';
      return;
    }

    // Call API to authenticate
    this.authenticateUser(email, password);
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
    // Simulating API call
    console.log('Login attempt for', email, password);

    // Mock successful login (Replace with your backend logic)
    this.router.navigate(['/dashboard']);
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
