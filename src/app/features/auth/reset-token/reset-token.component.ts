import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PasswordService } from '../../../core/services/password/password.service';
import { SnackBarService } from '../../../core/services/snack-bar/snack-bar.service';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-token',
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
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

  errorMessage: string = '';

  resetPasswordForm = this.formBuilder.group({
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
  });


  onSubmit() {
    if (this.resetPasswordForm.invalid) {
      return;
    }

    if (!this.token) {
      this.errorMessage = 'Token de réinitialisation manquant.';
      return;
    }

    if(this.resetPasswordForm.value.newPassword){
      this.passwordService.resetPassword(this.token, this.resetPasswordForm.value.newPassword!).subscribe(
        {
          next: rep => {
            this.snackBarService.info(rep.message)
            this.router.navigate(['auth', 'login'])
          },
          error: err =>
            this.snackBarService.info(err.message),
        });
    }
  }

}
