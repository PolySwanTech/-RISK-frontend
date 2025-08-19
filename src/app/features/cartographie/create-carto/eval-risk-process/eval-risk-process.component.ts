import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-eval-risk-process',
  imports: [CommonModule, FormsModule],
  templateUrl: './eval-risk-process.component.html',
  styleUrl: './eval-risk-process.component.scss'
})
export class EvalRiskProcessComponent {
  severities = ['Faible', 'Modéré', 'Significatif', 'Élevé', 'Critique'];
  frequencies = ['Rare', 'Peu fréquent', 'Fréquent', 'Très fréquent'];

  evaluation: any = {
    financier: {},
    image: {},
    regulateur: {},
    judiciaire: {}
  };

  saveEvaluation() {
    console.log("Évaluation enregistrée :", this.evaluation);
    // TODO: appel API
  }
}
