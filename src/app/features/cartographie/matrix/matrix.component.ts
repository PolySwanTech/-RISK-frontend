import { CommonModule } from '@angular/common';
import { Component, inject, HostListener, OnInit, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SnackBarService } from '../../../core/services/snack-bar/snack-bar.service';
import { MatrixService } from '../../../core/services/matrix/matrix.service';
import { Range } from '../../../core/models/range';
import { GoBackButton, GoBackComponent } from '../../../shared/components/go-back/go-back.component';
import { ActivatedRoute } from '@angular/router';
import { EntitiesService } from '../../../core/services/entities/entities.service';
import { MatCardModule } from '@angular/material/card';
import { EnumLabelPipe } from '../../../shared/pipes/enum-label.pipe';

@Component({
  selector: 'app-matrix',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTooltipModule, GoBackComponent, MatCardModule, EnumLabelPipe],
  templateUrl: './matrix.component.html',
  styleUrls: ['./matrix.component.scss']
})
export class MatrixComponent implements OnInit {

  @Input() modif: boolean = true;
  @Input() buId: string | undefined = undefined;

  rowLabels: Range[] = [];
  colLabels: Range[] = [];

  updatedCells: any[] = [];

  riskLevels: Set<any> = new Set();

  _matrixData: any;
  matrixLevels: any;

  activeCell: any = null;
  activeScale: any = null;
  overlayPosition: any = {};
  goBackButtons: GoBackButton[] = []

  private route = inject(ActivatedRoute);
  private entitiesSrv = inject(EntitiesService);
  private matrixService = inject(MatrixService);
  private snackBarService = inject(SnackBarService);

  selectedColor = '';

  buName: string = ""

  ngOnInit(): void {
    this.goBackButtons = [
      { label: 'Sauvegarder', icon: 'save', class: 'btn-primary', action: () => this.saveMatrix(), show: true },
    ];

    if (!this.buId) {
      this.buId = this.route.snapshot.paramMap.get('id')!;
    }

    this.matrixService.getDefaultMatrix(this.buId).subscribe({
      next: resp => this.matrixData = resp,
      error: err => console.error(err)
    });


    this.entitiesSrv.findById(this.buId).subscribe(resp => {
      this.buName = resp.name
    });
  }

  openColorOverlay(event: MouseEvent, cell: any) {
    if (!this.modif) return;
    if (this.activeCell == cell) {
      this.activeCell = null;
      return;
    }
    event.stopPropagation(); // éviter fermeture immédiate
    this.activeCell = cell;
    this.overlayPosition = {
      top: `${event.clientY}px`,
      left: `${event.clientX - 250}px`,
      'border-radius': '5%',
    };
  }

  selectColor(cell: any, risk: any) {
    cell.riskLevel = risk;
    this.updatedCells.push({ id: cell.id, riskLevel: { name: cell.riskLevel.name, color: cell.riskLevel.color } });
    this.activeCell = null; // ferme l’overlay
  }
  
  // ferme overlay si on clique en dehors
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    this.activeCell = null;
    this.activeScale = null;
  }
  
  set matrixData(value: any) {
    this._matrixData = value ?? {};
    this.buildMatrixFromCells(value?.cells || []);
  }
  
  openScaleOverlay(event: MouseEvent, scale: any) {
    if (!this.modif) return;
    if (this.activeScale == scale) {
      this.activeScale = null;
      return;
    }
    event.stopPropagation(); // éviter fermeture immédiate
    this.activeScale = scale;
    this.overlayPosition = {
      top: `${event.clientY}px`,
      left: `${event.clientX - 250}px`,
      'border-radius': '5%',
    };
  }

  private buildMatrixFromCells(cells: any[]) {
    if (!cells?.length) {
      this.matrixLevels = [];
      this.rowLabels = [];
      this.colLabels = [];
      return;
    }

    // Nombre de lignes = nb niveaux d'IMPACT = max(position.col)
    const maxImpact = Math.max(...cells.map(c => c.position?.col ?? 1));
    // Nombre de colonnes = nb niveaux de PROBABILITÉ = max(position.row)
    const maxProb = Math.max(...cells.map(c => c.position?.row ?? 1));

    // Matrice (on stocke l'objet cell complet)
    const matrix: any[][] = Array.from({ length: maxImpact }, () =>
      Array.from({ length: maxProb }, () => null)
    );

    // Labels
    this.rowLabels = Array(maxImpact).fill('');
    this.colLabels = Array(maxProb).fill('');

    const riskMap = new Map<string, { color: string, level: string }>();

    cells.forEach(cell => {
      const key = `${cell.riskLevel.color}|${cell.riskLevel.level}`;
      if (!riskMap.has(key)) {
        riskMap.set(key, cell.riskLevel);
      }
      // ⚠️ swap : rowIndex = impact (col), colIndex = probabilité (row)
      const rowIdx = (cell.position.col ?? 1) - 1; // lignes = IMPACT
      const colIdx = (cell.position.row ?? 1) - 1; // colonnes = PROBABILITÉ

      if (rowIdx >= 0 && rowIdx < maxImpact && colIdx >= 0 && colIdx < maxProb) {
        matrix[rowIdx][colIdx] = cell;
        // Remplir les labels si absents
        if (!this.rowLabels[rowIdx]) this.rowLabels[rowIdx] = cell.severite ?? '';
        if (!this.colLabels[colIdx]) this.colLabels[colIdx] = cell.frequence ?? '';
      }
    });

    this.riskLevels = new Set(riskMap.values());
    this.matrixLevels = matrix.reverse();
  }

  cellStyle(cell: any) {
    const bg = cell?.riskLevel?.color || '#fff'; // blanc si rien
    return {
      backgroundColor: bg,
      border: '1px solid #ccc',
      width: '60px',
      height: '60px',
      position: 'relative',
      cursor: 'pointer',
    };
  }

  setColor(cell: any) {
    this.matrixLevels[cell.position.row][cell.position.col] = null;
  }

  /* ===================== SAVE ===================== */
  saveMatrix() {
    this.matrixService.updateCells(this.updatedCells).subscribe(_ => {
      this.snackBarService.success("La matrice a bien été mise à jour");
    });
  }

  /* ===================== TRACKERS ===================== */
  trackByIdx = (index: number): number => index;
  displayRowIdx = (i: number) => this.matrixLevels.length - 1 - i;
}
