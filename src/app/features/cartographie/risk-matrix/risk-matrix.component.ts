import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RiskLevelLabels, RiskLevel } from '../../../core/enum/riskLevel.enum';
import { Process } from '../../../core/models/Process';
import { RiskTemplate } from '../../../core/models/RiskTemplate';

@Component({
  selector: 'app-risk-matrix',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './risk-matrix.component.html',
  styleUrls: ['./risk-matrix.component.scss']
})
export class RiskMatrixComponent {

  /* ----------- entrée/sortie ----------- */
  @Input() riskData: RiskTemplate | null = null;
  @Input() processMap: Record<string, Process> = {};
  @Output() onModify = new EventEmitter<string>();

  /* ----------- actions ----------- */
  onModifyClick(): void {
    if (this.riskData?.id?.id) {
      this.onModify.emit(this.riskData.id.id);
    }
  }

  /* ----------- helpers d’affichage ----------- */
  /** Dernière évaluation brute */
  private get lastEvalBrute() {
    return this.riskData?.riskBrut?.at(-1) ?? null;
  }

   private get lastEvalNette() {
    return this.riskData?.riskNet?.at(-1) ?? null;
  }

  /** Libellé lisible du niveau (High, Low, …) */
  get riskBrut(): string {
    const level = this.lastEvalBrute?.evaluation as RiskLevel | undefined;
    return level ? RiskLevelLabels[level.name] ?? 'Unknown' : 'N/R';
  }

  get buName(): string {
    return this.riskData?.buName ?? 'Inconnu';
  }

  get processName(): string {
    return this.riskData?.processName ?? 'Inconnu';
  }

  /** Classe CSS : level-low | level-high … */
  get riskNet(): string {
    this.riskData?.riskNet?.at(-1)
    const level = this.lastEvalNette?.evaluation as string | undefined;
    return level ? 'level-' + level.toLowerCase() : 'N/R';
  }

  /** Premier contrôle si dispo */
  get control(): string {
    if (this.riskData?.dmr?.controls && this.riskData.dmr.controls.length > 0) {
      const c = this.riskData.dmr.controls[0];
      return `${c.reference} - ${c.libelle}`;
    }
    return 'Non renseigné';
  }

  getFrequency(): string {
    return '—'; // il faut recalculer à partir des incidents qui ont eu ce risque ? 
  }


  /* ----------- mapping internes ----------- */
  private frequencyLabel(v: number) {
    switch (v) {
      case 1: return 'Très rare';
      case 2: return 'Rare';
      case 3: return 'Occasionnel';
      case 4: return 'Fréquent';
      case 5: return 'Très fréquent';
      default: return 'Inconnu';
    }
  }

  private impactLabel(v: number) {
    switch (v) {
      case 1: return 'Insignifiant';
      case 2: return 'Mineur';
      case 3: return 'Modéré';
      case 4: return 'Majeur';
      case 5: return 'Catastrophique';
      default: return 'Inconnu';
    }
  }
}
