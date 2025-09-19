import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PopupHeaderComponent } from '../../../../shared/components/popup-header/popup-header.component';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-create-role-dialog',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatCardModule,
    MatButtonModule, MatIconModule, PopupHeaderComponent],
  templateUrl: './create-role-dialog.component.html',
  styleUrls: ['./create-role-dialog.component.scss']
})
export class CreateRoleDialogComponent {
  roleName: string = '';

  constructor(
    public dialogRef: MatDialogRef<CreateRoleDialogComponent>
  ) {}

  submitRole() {
    if (this.roleName.trim()) {
      this.dialogRef.close(this.roleName);
    }
  }

  closePopup() {
    this.dialogRef.close();
  }
}