import { SnackBarService } from './../../../core/services/snack-bar/snack-bar.service';
import { MatrixService } from './../../../core/services/matrix/matrix.service';
import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RiskLevel, RiskLevelLabels, RiskLevelScores } from '../../../core/enum/riskLevel.enum';
import { RiskSelectionDialogComponent } from '../risk-selection-dialog/risk-selection-dialog.component';
import { RiskTemplate } from '../../../core/models/RiskTemplate';

/** Couleur à afficher pour chaque RiskLevel */
const COLOR_MAP: Record<RiskLevel, string> = {
  [RiskLevel.LOW]: '#F5F8FA',       // Très faible / Faible
  [RiskLevel.MEDIUM]: '#FFA500',    // Moyen
  [RiskLevel.HIGH]: '#FF4500',      // Élevé
  [RiskLevel.VERY_HIGH]: '#8B0000', // Critique
};

const RISK_LABEL_MAP: Record<RiskLevel, string> = {
  [RiskLevel.LOW]: 'Très faible',
  [RiskLevel.MEDIUM]: 'Moyen',
  [RiskLevel.HIGH]: 'Élevé',
  [RiskLevel.VERY_HIGH]: 'Critique',
};

/** Matrice par défaut (5x5) */
const DEFAULT_MATRIX_LEVELS: RiskLevel[][] = [
  [RiskLevel.LOW, RiskLevel.LOW, RiskLevel.MEDIUM, RiskLevel.MEDIUM, RiskLevel.HIGH],
  [RiskLevel.LOW, RiskLevel.MEDIUM, RiskLevel.MEDIUM, RiskLevel.HIGH, RiskLevel.HIGH],
  [RiskLevel.MEDIUM, RiskLevel.MEDIUM, RiskLevel.HIGH, RiskLevel.HIGH, RiskLevel.VERY_HIGH],
  [RiskLevel.MEDIUM, RiskLevel.HIGH, RiskLevel.HIGH, RiskLevel.VERY_HIGH, RiskLevel.VERY_HIGH],
  [RiskLevel.MEDIUM, RiskLevel.HIGH, RiskLevel.VERY_HIGH, RiskLevel.VERY_HIGH, RiskLevel.VERY_HIGH],
];

@Component({
  selector: 'app-matrix',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTooltipModule],
  templateUrl: './matrix.component.html',
  styleUrls: ['./matrix.component.scss']
})
export class MatrixComponent {
  @Input() modifPlan = true;

  @Input() set risks(value: RiskTemplate[]) {
    this._risks = this.arrayToMatrixMap(value);
  }

  rowLabels: string[] = ['Catastrophique', 'Majeur', 'Modéré', 'Mineur', 'Insignifiant'];
  colLabels: string[] = ['Très rare', 'Rare', 'Occasionnel', 'Fréquent', 'Très fréquent'];

  _matrixData: any;
  matrixLevels: RiskLevel[][] = [];

  private matrixService = inject(MatrixService);

  @Input() set matrixData(value: any) {
    if (!value) {
      this._matrixData = { labels: this.buildLabels(''), cells: [] };
      this.initMatrix();
      return;
    }

    this._matrixData = value;

    if (value.labels) {
      this.rowLabels = value.labels
        .filter((l: { labelType: string }) => l.labelType === 'row')
        .sort((a: any, b: any) => b.position - a.position)
        .map((l: any) => l.label);

      this.colLabels = value.labels
        .filter((l: { labelType: string }) => l.labelType === 'col')
        .sort((a: any, b: any) => a.position - b.position)
        .map((l: any) => l.label);
    }

    this.buildMatrixFromCells(value.cells || []);
  }

  @Output() selectedRiskEvent = new EventEmitter<any>();

  /** légende dynamique */
  readonly colorLevels = Object.entries(COLOR_MAP).map(([lvl, color]) => ({
    level: lvl as RiskLevel,
    label: RISK_LABEL_MAP[lvl as RiskLevel],
    color
  }));

  selectedColor = '';

  constructor(private dialog: MatDialog) {}

  private snackBarService = inject(SnackBarService);

  /* ===================== INIT ===================== */
  private initMatrix() {
    this.matrixLevels = DEFAULT_MATRIX_LEVELS.map(row => [...row]);
  }

  private buildMatrixFromCells(cells: any[]) {
    this.initMatrix();
    cells.forEach(cell => {
      const rowIdx = cell.rowPosition - 1;
      const colIdx = cell.colPosition - 1;
      if (rowIdx >= 0 && rowIdx < 5 && colIdx >= 0 && colIdx < 5) {
        this.matrixLevels[rowIdx][colIdx] = cell.riskLevel as RiskLevel;
      }
    });
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

  private colorToLevel(color: string): RiskLevel {
    return (Object.entries(COLOR_MAP).find(([_, c]) => c === color)?.[0] as RiskLevel) ?? RiskLevel.MEDIUM;
  }

  private levelToColor(level: RiskLevel): string {
    return COLOR_MAP[level];
  }

  /* ===================== TEMPLATE ===================== */
  get reversedMatrixLevels() {
    return [...this.matrixLevels].reverse();
  }

  cellStyle(lvl: RiskLevel) {
    return {
      backgroundColor: this.levelToColor(lvl),
      border: '1px solid #ccc',
      width: '60px',
      height: '60px',
      cursor: this.modifPlan ? 'pointer' : 'default',
      position: 'relative'
    };
  }

  setColor(row: number, col: number) {
    if (!this.modifPlan || !this.selectedColor) return;
    this.matrixLevels[row][col] = this.colorToLevel(this.selectedColor);
  }

  /* ===================== RISKS ===================== */
  private _risks: Record<string, any | any[]> = {};

  private arrayToMatrixMap(arr: RiskTemplate[]) {
    const map: Record<string, any | any[]> = {};

    arr.forEach(risk => {
      let impact = 0;
      let frequency = risk.rpc.at(-1)?.probability;

      if (!impact || !frequency) {
        const last = risk.rpc?.at(-1);
        if (last) {
          frequency = Math.ceil(last.probability / 2);
          impact = RiskLevelScores[last.netLevel as RiskLevel];
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

  onRiskClick(row: number, col: number) {
    const data = this._risks[this.cellKey(row, col)];
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
    const matrixId = this._matrixData.id || '';
    const labels = this.buildLabels(matrixId);

    const cells = this.matrixLevels.flatMap((row, rowIdx) =>
      row.map((riskLevel, colIdx) => ({
        matrix: matrixId,
        rowPosition: rowIdx + 1,
        colPosition: colIdx + 1,
        riskLevel,
        colorHex: this.levelToColor(riskLevel)
      }))
    );

    const payload = { id: matrixId, labels, cells };

    this.matrixService.saveMatrix(payload).subscribe({
      next: resp => this.snackBarService.success("La matrice a bien été sauvegardée"),
      error: err => this.snackBarService.error("Une erreur est survenu")
    });
  }

  /* ===================== TRACKERS ===================== */
  trackByIdx = (index: number): number => index;
  displayRowIdx = (i: number) => this.matrixLevels.length - 1 - i;
}
