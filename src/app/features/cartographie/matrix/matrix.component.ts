import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, inject, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RiskLevel, RiskLevelScores } from '../../../core/enum/riskLevel.enum';
import { RiskSelectionDialogComponent } from '../risk-selection-dialog/risk-selection-dialog.component';
import { RiskTemplate } from '../../../core/models/RiskTemplate';
import { MatrixSettingsComponent } from '../matrix-settings/matrix-settings.component';
import { Range } from '../matrix-settings/matrix-settings.component';
import { SnackBarService } from '../../../core/services/snack-bar/snack-bar.service';
import { MatrixService } from '../../../core/services/matrix/matrix.service';

@Component({
  selector: 'app-matrix',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTooltipModule, MatrixSettingsComponent],
  templateUrl: './matrix.component.html',
  styleUrls: ['./matrix.component.scss']
})
export class MatrixComponent {
  @Input() modifPlan = true;

  @Input() set risks(value: RiskTemplate[]) {
    this._risks = this.arrayToMatrixMap(value);
  }

  rowLabels: Range[] = [];
  colLabels: Range[] = [];

  updatedCells: any[] = [];

  riskLevels: Set<any> = new Set();

  _matrixData: any;
  matrixLevels: any;

  activeCell: any = null;
  overlayPosition: any = {};

  openColorOverlay(event: MouseEvent, cell: any) {
    event.stopPropagation(); // éviter fermeture immédiate
    this.activeCell = cell;

    // Positionner l’overlay exactement là où la souris a cliqué
    this.overlayPosition = {
      top: `${event.clientY - 50}px`,
      left: `${event.clientX}px`,
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
  }

  @Input() set matrixData(value: any) {

    this._matrixData = value;

    this.buildMatrixFromCells(value.cells || []);
  }

  private dialog = inject(MatDialog);
  private snackBarService = inject(SnackBarService);
  private matrixService = inject(MatrixService);

  @Output() selectedRiskEvent = new EventEmitter<any>();

  selectedColor = '';

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

    const riskMap = new Map<string, {color: string, level: string}>();

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

  /* ===================== HELPERS ===================== */
  private cellKey(row: number, col: number): string {
    return `${row},${col}`;
  }

  private buildLabels(matrixId: string) {
    return [
      ...this.rowLabels.map((label, i) => ({
        label,
        labelType: 'row',
        matrix: matrixId,
        position: this.rowLabels.length - i
      })),
      ...this.colLabels.map((label, i) => ({
        label,
        labelType: 'col',
        matrix: matrixId,
        position: i + 1
      }))
    ];
  }

  cellStyle(cell: any) {
    // si le backend t’envoie déjà la couleur (ex: cell.riskLevel.color), utilise-la :
    const bg = cell.riskLevel.color;
    return {
      backgroundColor: bg,
      border: '1px solid #ccc',
      width: '60px',
      height: '60px',
      position: 'relative',
      cursor: this.modifPlan ? 'pointer' : 'default',
    };
  }

  setColor(cell: any) {
    if (!this.modifPlan || !this.selectedColor) return;
    this.matrixLevels[cell.position.row][cell.position.col] = null;
  }

  /* ===================== RISKS ===================== */
  private _risks: Record<string, any | any[]> = {};

  private arrayToMatrixMap(arr: RiskTemplate[]) {
    const map: Record<string, any | any[]> = {};

    arr.forEach(risk => {
      let impact = 0;
      // let frequency = risk.dmr.at(-1)?.probability;
      let frequency = risk.riskEvaluations![0].probability;

      if (!impact || !frequency) {
        // const last = risk.dmr?.at(-1);
        const last = risk.riskEvaluations![0];
        if (last) {
          frequency = Math.ceil((last.probability ?? 1) / 2);
          impact = RiskLevelScores[last.evaluation as RiskLevel];
        }
      }

      if (impact && frequency) {
        const key = this.cellKey(impact - 1, frequency - 1);
        map[key] = map[key] ? ([] as any[]).concat(map[key], risk) : risk;
      }
    });

    return map;
  }

  cellRiskInfo(row: number, col: number) {
    const data = this._risks[this.cellKey(row, col)];
    if (!data) return { id: '', name: '' };

    return Array.isArray(data)
      ? { id: '+' + data.length, name: 'Cliquez pour voir les risques' }
      : { id: data.reference, name: data.name };
  }

  concat(row: number, col: number) {
    const id = this.cellRiskInfo(row, col).id; // ex: "CON_2025_001"
    const afterLastUnderscore = id.split('_').pop();
    return "R" + Number(afterLastUnderscore);
  }

  onRiskClick(cell: any) {
    const data = this._risks[this.cellKey(cell.position.row, cell.position.col)];
    if (!data) return;

    if (Array.isArray(data)) {
      const ref = this.dialog.open(RiskSelectionDialogComponent, {
        width: '400px',
        data: { risks: data }
      });
      ref.afterClosed().subscribe(risk => {
        if (risk) this.selectedRiskEvent.emit(risk);
      });
    } else {
      this.selectedRiskEvent.emit(data);
    }
  }

  /* ===================== SAVE ===================== */
  saveMatrix() {
    console.log(this.updatedCells);
    this.matrixService.updateCells(this.updatedCells).subscribe(_ => {
      this.snackBarService.success("La matrice a bien été mise à jour");
    });
    // const matrixId = this._matrixData.id || '';
    // const labels = this.buildLabels(matrixId);

    // const cells = this.matrixLevels.flatMap((row, rowIdx) =>
    //   row.map((riskLevel, colIdx) => ({
    //     matrix: matrixId,
    //     rowPosition: rowIdx + 1,
    //     colPosition: colIdx + 1,
    //     riskLevel,
    //     colorHex: this.levelToColor(riskLevel)
    //   }))
    // );

    // const payload = { id: matrixId, labels, cells };

    // this.matrixService.saveMatrix(payload).subscribe({
    //   next: resp => this.snackBarService.success("La matrice a bien été sauvegardée"),
    //   error: err => this.snackBarService.error("Une erreur est survenu")
    // });
  }

  /* ===================== TRACKERS ===================== */
  trackByIdx = (index: number): number => index;
  displayRowIdx = (i: number) => this.matrixLevels.length - 1 - i;
}
