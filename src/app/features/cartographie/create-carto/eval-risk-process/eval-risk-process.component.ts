import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SnackBarService } from '../../../../core/services/snack-bar/snack-bar.service';

@Component({
  selector: 'app-eval-risk-process',
  imports: [CommonModule, FormsModule],
  templateUrl: './eval-risk-process.component.html',
  styleUrl: './eval-risk-process.component.scss'
})
export class EvalRiskProcessComponent {

  @Output() evaluationSaved = new EventEmitter<void>();
  private snackBarService = inject(SnackBarService);

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
    this.snackBarService.success("Évaluation sauvegardée avec succès !");
    this.evaluationSaved.emit();
  }
}
