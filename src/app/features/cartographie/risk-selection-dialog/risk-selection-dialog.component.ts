//  risk-selection-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-risk-selection-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatListModule,
    MatButtonModule,
    MatChipsModule
  ],
  templateUrl: './risk-selection-dialog.component.html',
  styleUrls : ['./risk-selection-dialog.component.scss']
})
export class RiskSelectionDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<RiskSelectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { risks: any[] }
  ) {}

  /** Ferme le dialog en renvoyant le risque choisi */
  selectRisk(risk: any): void {
    this.dialogRef.close(risk);
  }

  /** Ferme le dialog sans sélection */
  closeDialog(): void {
    this.dialogRef.close();
  }

  /** TrackBy : renvoie une clé unique pour chaque risque */
  trackByRisk(index: number, risk: any): string {
    // si vos risques possèdent déjà un identifiant fiable
    return risk.id ?? index.toString();
  }
}
