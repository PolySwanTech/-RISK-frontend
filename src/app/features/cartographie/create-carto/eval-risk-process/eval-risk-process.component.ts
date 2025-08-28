import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-eval-risk-process',
  imports: [CommonModule, FormsModule],
  templateUrl: './eval-risk-process.component.html',
  styleUrl: './eval-risk-process.component.scss'
})
export class EvalRiskProcessComponent {

  @Output() evaluationSaved = new EventEmitter<void>();

  severities = ['Faible', 'Modéré', 'Significatif', 'Élevé', 'Critique'];
  frequencies = ['Rare', 'Peu fréquent', 'Fréquent', 'Très fréquent'];

  evaluation: any = {
    financier: {},
    image: {},
    regulateur: {},
    judiciaire: {}
  };

  saveEvaluation() {
    // TODO: Implement the logic to save the evaluation
    // TODO: appel API
    alert("Évaluation sauvegardée avec succès !");
    this.evaluationSaved.emit();
  }
}
