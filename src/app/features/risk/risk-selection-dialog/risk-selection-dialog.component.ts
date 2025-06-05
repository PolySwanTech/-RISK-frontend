import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-risk-selection-dialog',
  imports: [MatDialogModule,
    MatListModule,
    MatButtonModule, MatChipsModule],
  templateUrl: './risk-selection-dialog.component.html',
  styleUrl: './risk-selection-dialog.component.scss'
})
export class RiskSelectionDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<RiskSelectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { risks: any[] }
  ) { }

  selectRisk(risk: any) {
    this.dialogRef.close(risk);
  }

  closeDialog() {
    this.dialogRef.close();
  }
}