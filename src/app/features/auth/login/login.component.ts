import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { PasswordService } from '../../../core/services/password/password.service';
import { finalize } from 'rxjs';
import { SnackBarService } from '../../../core/services/snack-bar/snack-bar.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule,
    MatButtonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  private authService = inject(AuthService);
  private passwordService = inject(PasswordService);
  private fb = inject(FormBuilder);
  private snackBarService = inject(SnackBarService);

  loginForm: FormGroup;
  resetMdpForm: FormGroup;
  isForgotPassword: boolean = false;
  errorMessage: string = '';
  isLoading = false;

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.resetMdpForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
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
    const email = this.resetMdpForm.value.email;
    if (!email) {
      this.errorMessage = 'Merci de renseigner un mail pour la réinitialisation du mot de passe.';
      return;
    }

    // Call the API for password reset request
    this.resetPassword(email);
  }

  // Simulated API calls (Replace these with real API calls)
  authenticateUser(email: string, password: string) {
    this.isLoading = true;

    this.authService.login(email, password)
      .pipe(
        // finalize s'exécute à la fin (success ou error)
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (res) => {
          // Optionnel : redirection ou message de succès
        },
        error: (err) => {
          console.error('Login error:', err);
          this.snackBarService.error("Nom ou mot de passe incorrect");
        }
      });
  }

  resetPassword(email: string) {
    this.passwordService.requestLink(email).subscribe(
      _ => alert("Un lien vous a été envoyé par mail.")
    )
  }

  // Close Forgot Password form
  closeForgotPassword() {
    this.isForgotPassword = false;
    this.errorMessage = '';
  }
}
