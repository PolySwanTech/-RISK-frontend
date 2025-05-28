import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-risk-details',
  imports: [MatCardModule,
    MatButtonModule,
    MatIconModule, CommonModule],
  templateUrl: './risk-details.component.html',
  styleUrl: './risk-details.component.scss'
})
export class RiskDetailsComponent {
  @Input() riskData: any = null;

  @Output() onModify = new EventEmitter<any>();
  // @Output() onActionPlan = new EventEmitter<any>();

  constructor() { }

  ngOnInit(): void {
    console.log('RiskDetailsComponent initialized with riskData:', this.riskData);
  }

  onModifyClick(): void {
    this.onModify.emit(this.riskData);
  }

  // onActionPlanClick(): void {
  //   this.onActionPlan.emit(this.riskData);
  // }

  getRiskLevelClass(): string {
   switch (this.riskData.level) {
  case 'Critique':
    return 'level-critical';
  case 'Élevé':
    return 'level-high';
  case 'Modéré':
    return 'level-medium';
  case 'Faible':
    return 'level-low';
  case 'Très faible':
    return 'level-very-low';
  default:
    return 'level-medium';
}
  }

  getProbabilityText(): string {
    const label = this.getFrequencyLabel(this.riskData.frequency);
    return `${label} (${this.riskData.frequency}/5)`;
  }

  getImpactText(): string {
    const label = this.getImpactLabel(this.riskData.impact);
    return `${label} (${this.riskData.impact}/5)`;
  }

  private getFrequencyLabel(value: number): string {
  switch (value) {
    case 1: return 'Très rare';
    case 2: return 'Rare';
    case 3: return 'Occasionnel';
    case 4: return 'Fréquent';
    case 5: return 'Très fréquent';
    default: return 'Inconnu';
  }
}

private getImpactLabel(value: number): string {
  switch (value) {
    case 1: return 'Insignifiant';
    case 2: return 'Mineur';
    case 3: return 'Modéré';
    case 4: return 'Majeur';
    case 5: return 'Catastrophique';
    default: return 'Inconnu';
  }
}
}
