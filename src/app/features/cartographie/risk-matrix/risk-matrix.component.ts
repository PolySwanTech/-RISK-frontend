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
    return RiskLevelLabels[this.riskData!.rpc[0].brutLevel as RiskLevel] ?? 'Unknown';
  }

  get buName(): string {
    return this.riskData?.buName ?? 'Inconnu';
  }

  get processName(): string {
    return this.riskData?.processName ?? 'Inconnu';
  }

  /** Classe CSS : level-low | level-high … */
  get riskClass(): string {
    return 'level-' + (this.riskData!.rpc[0].brutLevel as string).toLowerCase();
  }

  get control() : string {
    return this.riskData?.rpc[0].controlReference + ' - ' + this.riskData?.rpc[0].controlName || 'Non renseigné'
  }

  getProbabilityText(): string {

  const lastEval = this.riskData?.rpc.at(-1)

  if (!lastEval) {
    return '—';
  }

  let prob = 0
  
  if(lastEval.probability! % 2 != 0){
    prob = (lastEval.probability! + 1)/ 2;
  }
  else{
    prob = lastEval.probability! / 2;
  }
  
  const label = this.frequencyLabel(prob);

  return `${label} (${prob}/5)`;
}

  getImpactText(): string {
    const lastEval = this.riskData?.rpc.at(-1);
    if (!lastEval) {                     // aucun historique
      return '—';
    }

    const level  = lastEval.netLevel as RiskLevel;
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
