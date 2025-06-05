import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { RiskSelectionDialogComponent } from '../risk-selection-dialog/risk-selection-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-matrix',
  imports: [CommonModule, FormsModule, MatTooltipModule],
  templateUrl: './matrix.component.html',
  styleUrls: ['./matrix.component.scss']
})
export class MatrixComponent {

  constructor(private dialog: MatDialog) {

  }

  @Input() modifPlan = false;
  @Output() selectedRiskEvent = new EventEmitter<any>();

  get reversedMatrix() {
  return [...this.matrix].reverse();
}

get transformedMatrix() {
  return this.matrix.map((row, rowIndex) => ({
    originalRow: row,
    displayRowIndex: this.matrix.length - 1 - rowIndex,  // inversé pour affichage
    rowData: row
  }));
}

getDisplayRowIndex(rowIndex: number): number {
  return this.matrix.length - 1 - rowIndex;
}

  // Matrice 5x5 avec les couleurs selon l'image
  matrix: string[][] = [
    ['#FFFF99', '#FFA500', '#FF4500', '#8B0000', '#8B0000'], // Catastrophique (haut)
    ['#FFFF99', '#FFA500', '#FF4500', '#FF4500', '#8B0000'], // Majeur
    ['#FFFF99', '#FFA500', '#FFA500', '#FF4500', '#FF4500'], // Significatif
    ['#F5F8FA', '#FFFF99', '#FFA500', '#FFA500', '#FF4500'], // Modéré
    ['#F5F8FA', '#F5F8FA', '#FFFF99', '#FFA500', '#FFA500']  // Mineur (bas)
  ];

  getLevelFromColor(color: string): string {
  switch (color) {
    case '#8B0000':
      return 'Critique';
    case '#FF4500':
      return 'Élevé';
    case '#FFA500':
      return 'Moyen';
    case '#FFFF99':
      return 'Faible';
    case '#F5F8FA':
      return 'Très faible';
    default:
      return 'Inconnu';
  }
}

  selectedColor: string = '';

  // Labels pour les lignes (Impact)
  rowLabels: string[] = [
    'Catastrophique',
    'Majeur',
    'Modéré',
    'Mineur',
    'Insignifiant'
  ];
  
  // Labels pour les colonnes (Probabilité)
  colLabels: string[] = [
    'Très rare',
    'Rare',
    'Occasionnel',
    'Fréquent',
    'Très fréquent'
  ];

  // Définition des niveaux de couleur pour le sélecteur
  colorLevels = [
    { label: 'Très faible', color: '#F5F8FA' },
    { label: 'Faible', color: '#FFFF99' },
    { label: 'Moyen', color: '#FFA500' },
    { label: 'Élevé', color: '#FF4500' },
    { label: 'Critique', color: '#8B0000' }
  ];

  

  getRisk(rowIndex: number, colIndex: number) {
  const key = `${rowIndex},${colIndex}`;
  const riskValue = this.risks[key];
  const cellColor = this.reversedMatrix[rowIndex][colIndex];
  const levelFromColor = this.getLevelFromColor(cellColor);

  if (riskValue) {
    if (Array.isArray(riskValue)) {
      const dialogRef = this.dialog.open(RiskSelectionDialogComponent, {
        width: '400px',
        data: { risks: riskValue }
      });

      dialogRef.afterClosed().subscribe(selectedRisk => {
        if (selectedRisk) {
          this.selectedRiskEvent.emit(selectedRisk);
        }
      });
    } else {
      this.selectedRiskEvent.emit(riskValue);
      console.log(riskValue);
    }
  }
}

  setColor(row: number, col: number): void {
    if (this.selectedColor != '') {
      this.matrix[row][col] = this.selectedColor;
    }
  }

  trackByFn(index: number, item: string): any {
    return index;
  }

  getCellStyle(color: string): any {
    return {
      backgroundColor: color || '#F5F8FA',
      border: '1px solid #ccc',
      width: '60px',
      height: '60px',
      cursor: 'pointer',
      position: 'relative'
    };
  }

  // Fonction pour obtenir le code de risque d'une cellule
  getRiskCode(rowIndex: number, colIndex: number): any {
    const key = `${rowIndex},${colIndex}`;

    let data = { id: '', name: '' };
    if (this.risks[key]) {
      if (Array.isArray(this.risks[key])) {
        data.id = '+' + this.risks[key].length
        data.name = 'Cliquer pour voir les risques';
      } else {
        data.id = this.risks[key].id;
        data.name = this.risks[key].name;
      }
    }
    return data
  }

  saveMatrice(): void {
    console.log('Matrice sauvegardée:', {
      matrix: this.matrix,
      rowLabels: this.rowLabels,
      colLabels: this.colLabels,
      risks: this.risks
    });
    alert('Matrice sauvegardée !');
  }

  // Private property to hold the transformed risks
  private _risks: { [key: string]: any | any[] } = {};

  // Input setter to transform the array into the desired object format
  @Input()
  set risks(risksArray: any[]) {
    this._risks = this.transformRisksArrayToObject(risksArray);
  }

  // Getter to access the transformed risks within the component
  get risks(): { [key: string]: any | any[] } {
    return this._risks;
  }

  private transformRisksArrayToObject(risksArray: any[]): { [key: string]: any | any[] } {
    const transformedRisks: { [key: string]: any | any[] } = {};
    risksArray.forEach(risk => {
      // Ensure both impact and frequency are present and are numbers
      if (typeof risk.impact === 'number' && typeof risk.frequency === 'number') {
        // Subtract 1 because your matrix indices are 0-based
        const rowIndex = risk.impact - 1;
        const colIndex = risk.frequency - 1;
        const key = `${rowIndex},${colIndex}`;

        if (transformedRisks[key]) {
          // If a risk already exists at this position, convert to array or push
          if (Array.isArray(transformedRisks[key])) {
            (transformedRisks[key] as any[]).push(risk);
          } else {
            transformedRisks[key] = [transformedRisks[key], risk];
          }
        } else {
          transformedRisks[key] = risk;
        }
      }
    });
    return transformedRisks;
  }
}