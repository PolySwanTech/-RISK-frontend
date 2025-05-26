import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-matrix',
  imports: [CommonModule, FormsModule],
  templateUrl: './matrix.component.html',
  styleUrls: ['./matrix.component.scss']
})
export class MatrixComponent {

  @Input() modifPlan = true;
  // Matrice 5x5 avec les couleurs selon l'image
  matrix: string[][] = [
    ['#8B0000', '#8B0000', '#FF4500', '#FF4500', '#FFFF99'], // Catastrophique
    ['#8B0000', '#FF4500', '#FF4500', '#FFA500', '#FFFF99'], // Majeur
    ['#FF4500', '#FF4500', '#FFA500', '#FFA500', '#FFFF99'], // Significatif
    ['#FFA500', '#FFFF99', '#FFFF99', '#FFFF99', '#FFFF99'], // Modéré
    ['#FFFF99', '#FFFF99', '#FFFF99', '#FFFF99', '#FFFF99']  // Mineur
  ];

  selectedColor: string = '';

  // Labels pour les lignes (Impact)
  rowLabels: string[] = [
    'Catastrophique',
    'Majeur', 
    'Significatif',
    'Modéré',
    'Mineur'
  ];

  // Labels pour les colonnes (Probabilité)
  colLabels: string[] = [
    'Très faible',
    'Faible', 
    'Moyen',
    'Élevé',
    'Critique'
  ];

  // Définition des niveaux de couleur pour le sélecteur
  colorLevels = [
    { label: 'Très faible', color: '#F5F8FA' },
    { label: 'Faible', color: '#FFFF99' },
    { label: 'Moyen', color: '#FFA500' },
    { label: 'Élevé', color: '#FF4500' },
    { label: 'Critique', color: '#8B0000' }
  ];

  // Risques positionnés dans la matrice (coordonnées row,col)
  risks: { [key: string]: string } = {
    '0,4': 'R2', 
    '1,2': 'R4', 
    '2,1': 'R3', 
    '2,4': 'R5', 
    '3,0': 'R1'
  };

  setColor(row: number, col: number): void {
    if(this.selectedColor != '') {
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
      width: '80px',
      height: '60px',
      cursor: 'pointer',
      position: 'relative'
    };
  }

  // Fonction pour obtenir le code de risque d'une cellule
  getRiskCode(rowIndex: number, colIndex: number): string | null {
    const key = `${rowIndex},${colIndex}`;
    return this.risks[key] || null;
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
}