import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Imports Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { PasswordService } from '../../../core/services/password/password.service';
import { SnackBarService } from '../../../core/services/snack-bar/snack-bar.service';

@Component({
  selector: 'app-reset-token',
  standalone: true,
  imports: [
    FormsModule, 
    CommonModule, 
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './reset-token.component.html',
  styleUrl: './reset-token.component.scss'
})
export class ResetTokenComponent {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private passwordService = inject(PasswordService);
  private snackBarService = inject(SnackBarService);
  private formBuilder = inject(FormBuilder);

  token: string = this.route.snapshot.queryParams['token'];
  email: string = this.route.snapshot.queryParams['email'] || '';

  errorMessage: string = '';
  isResendingEmail: boolean = false;
  
  // Pour l'icône de l'œil
  hidePassword = true;

  resetPasswordForm = this.formBuilder.group({
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
  });

  onSubmit() {
    if (this.resetPasswordForm.invalid) return;

    if (!this.token) {
      this.errorMessage = 'Token de réinitialisation manquant.';
      return;
    }

    const newPassword = this.resetPasswordForm.value.newPassword;

    if(newPassword){
      this.passwordService.resetPassword(this.token, newPassword).subscribe({
        next: (rep) => {
          // On peut afficher un message ou juste rediriger
          // rep.message contient souvent un objet JSON si le backend renvoie une Map
          // Si rep est direct une string ou un objet, adaptez ici :
          this.snackBarService.info("Mot de passe modifié avec succès."); 
          this.router.navigate(['auth', 'login']);
        },
        error: (err) => {
          // Gestion d'erreur propre
          const msg = err.error?.error || err.message || 'Une erreur est survenue';
          this.snackBarService.info(msg);
          this.errorMessage = msg;
        }
      });
    }
  }

  resendResetEmail() {
    if (!this.email) {
      this.errorMessage = 'Adresse email manquante. Veuillez recommencer la procédure.';
      return;
    }

    this.isResendingEmail = true;
    this.errorMessage = '';

    this.passwordService.sendResetPasswordEmail(this.email).subscribe({
      next: () => {
        this.isResendingEmail = false;
        this.snackBarService.info('Un nouvel email de réinitialisation a été envoyé.');
      },
      error: (err) => {
        this.isResendingEmail = false;
        const msg = err.error?.error || 'Erreur lors de l\'envoi de l\'email.';
        this.errorMessage = msg;
        this.snackBarService.info(msg);
      }
    });
  }
}