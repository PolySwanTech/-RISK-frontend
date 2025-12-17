import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth/auth.service';
import { TranslateModule } from '@ngx-translate/core';

// Nouveaux imports Material
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

import { PasswordService } from '../../../core/services/password/password.service';
import { SnackBarService } from '../../../core/services/snack-bar/snack-bar.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    TranslateModule, 
    MatButtonModule,
    MatFormFieldModule, // Indispensable pour envelopper les inputs
    MatInputModule,     // Pour la directive matInput
    MatIconModule       // Pour l'icône de l'œil (mot de passe)
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  private authService = inject(AuthService);
  private passwordService = inject(PasswordService);
  private snackBarService = inject(SnackBarService);
  private fb = inject(FormBuilder);

  loginForm: FormGroup;
  resetMdpForm: FormGroup;
  isForgotPassword: boolean = false;
  isResettingPassword: boolean = false;
  errorMessage: string = '';
  isLoading = false;
  
  // Pour gérer l'affichage du mot de passe (text <-> password)
  hidePassword = true; 

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.resetMdpForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onLogin() {
    if (this.loginForm.invalid) return;
    const { username, password } = this.loginForm.value;
    this.authenticateUser(username, password);
  }

  onForgotPassword() {
    this.isForgotPassword = true;
    this.errorMessage = '';
  }

  onResetPassword() {
    if (this.resetMdpForm.invalid) {
      this.errorMessage = 'Merci de renseigner une adresse email valide.';
      return;
    }

    const email = this.resetMdpForm.value.email;
    this.isResettingPassword = true;
    this.errorMessage = '';

    this.passwordService.sendResetPasswordEmail(email).subscribe({
      next: () => {
        this.isResettingPassword = false;
        this.snackBarService.info('Un email de réinitialisation a été envoyé à votre adresse.');
        this.closeForgotPassword();
      },
      error: (err) => {
        this.isResettingPassword = false;
        this.snackBarService.info(err.error?.error || 'Une erreur est survenue');
      }
    });
  }

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

  closeForgotPassword() {
    this.isForgotPassword = false;
    this.errorMessage = '';
    this.resetMdpForm.reset();
  }
}