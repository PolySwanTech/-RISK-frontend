import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-create-role-dialog',
  imports: [FormsModule],
  template: `
    <input [(ngModel)]="roleName" placeholder="Nom du rôle" />
    <button (click)="submitRole()">Ajouter</button>
  `,
  styleUrls: ['./create-role-dialog.component.scss']
})
export class CreateRoleDialogComponent {
  roleName: string = '';

  constructor(
    public dialogRef: MatDialogRef<CreateRoleDialogComponent>,
  ) { }

  submitRole() {
    this.dialogRef.close(this.roleName);
  }
}
