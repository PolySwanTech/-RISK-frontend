import { inject, Injectable } from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarConfig,
  MatSnackBarHorizontalPosition,
  MatSnackBarModule,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackBarService {

  private snackBar = inject(MatSnackBar);

  show(message: string, action: string = 'OK', duration?: number) {
    const config: MatSnackBarConfig = {
      duration,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    };
    this.snackBar.open(message, action, config);
  }

  success(message: string) {
    this.show(message, 'OK', 3000);
  }

  error(message: string) {
    this.show(message, 'Fermer');
  }

  info(message: string) {
    this.show(message, 'OK', 3000);
  }
}