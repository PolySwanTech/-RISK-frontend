import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmService {

  private dialog = inject(MatDialog);

  openConfirmDialog(title: string, text : string, buttons : boolean) {
    return this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: title,
        message: text, 
        buttons : buttons
      }
    })
    .afterClosed();
  }
}
