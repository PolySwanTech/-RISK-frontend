import { CommonModule }           from '@angular/common';
import { Component, Input, Output,
         EventEmitter, 
         OnChanges,
         SimpleChanges}           from '@angular/core';
import { MatCardModule }          from '@angular/material/card';
import { MatButtonModule }        from '@angular/material/button';
import { MatIconModule }          from '@angular/material/icon';
import { RiskLevelLabels, RiskLevel, RiskLevelScores } from '../../../core/enum/riskLevel.enum';
import { Process } from '../../../core/models/Process';
import { RiskTemplate } from '../../../core/models/RiskTemplate';


@Component({
  selector   : 'app-risk-matrix',
  standalone : true,
  imports    : [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './risk-matrix.component.html',
  styleUrls  : ['./risk-matrix.component.scss']
})
export class RiskMatrixComponent {
  
  /* ----------- entrée/sortie ----------- */
  @Input()  riskData: RiskTemplate | null = null;  
  @Input() processMap: Record<string,Process> = {};
  @Output() onModify = new EventEmitter<string>();
  
  /* ----------- actions ----------- */
  onModifyClick(): void {
    this.onModify.emit(this.riskData!.id.id);
  }

  /* ----------- helpers d’affichage ----------- */
  /** Libellé lisible du niveau (High, Low, …) */
  get riskLabel(): string {
    return RiskLevelLabels[this.riskData!.riskBrut as RiskLevel] ?? 'Unknown';
  }

  get process(): Process | undefined {
    return this.processMap[this.riskData!.processId];
  }

  get buName(): string {
    return this.process?.buName ?? 'Inconnu';
  }

  get processName(): string {
    return this.process?.name ?? 'Inconnu';
  }

  /** Classe CSS : level-low | level-high … */
  get riskClass(): string {
    return 'level-' + (this.riskData!.riskBrut as string).toLowerCase();
  }

  getProbabilityText(): string {

  const lastEval = this.riskData!.riskEvaluations?.at(-1);

  if (!lastEval) {
    return '—';
  }

  const prob = lastEval.probability! / 2;
  const label = this.frequencyLabel(prob);

  return `${label} (${prob}/5)`;
}

  getImpactText(): string {
    const lastEval = this.riskData!.riskEvaluations?.at(-1);
    if (!lastEval) {                     // aucun historique
      return '—';
    }

    const level  = lastEval.riskNet as RiskLevel;
    const label  = RiskLevelLabels[level] ?? 'Unknown';
    const score  = RiskLevelScores[level] ?? '∅';

    return `${label} (${score}/5)`;
  }

  /* ----------- mapping internes ----------- */
  private frequencyLabel(v:number){
    switch (v){
      case 1: return 'Très rare';
      case 2: return 'Rare';
      case 3: return 'Occasionnel';
      case 4: return 'Fréquent';
      case 5: return 'Très fréquent';
      default: return 'Inconnu';
    }
  }
  private impactLabel(v:number){
    switch (v){
      case 1: return 'Insignifiant';
      case 2: return 'Mineur';
      case 3: return 'Modéré';
      case 4: return 'Majeur';
      case 5: return 'Catastrophique';
      default: return 'Inconnu';
    }
  }
}
