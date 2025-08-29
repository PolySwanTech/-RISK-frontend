import { Component } from '@angular/core';
import { ChooseTypeCartoComponent } from '../choose-type-carto/choose-type-carto.component';
import { GoBackComponent } from '../../../../shared/components/go-back/go-back.component';
import { MatCardModule } from '@angular/material/card';
import { CreateEvaluationComponent } from '../../create-evaluation/create-evaluation.component';
import { SelectRiskProcessComponent } from '../select-risk-process/select-risk-process.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-carto',
  standalone: true,
  imports: [ChooseTypeCartoComponent, GoBackComponent, SelectRiskProcessComponent,
    MatCardModule, CreateEvaluationComponent],
  templateUrl: './create-carto.component.html',
  styleUrl: './create-carto.component.scss'
})
export class CreateCartoComponent {


  steps = [
    'Sélection',
    'Évaluation',
    'Résultats'
  ];

  activeStep = 0;

  previous() {
    if (this.activeStep > 0) {
      this.activeStep--;
    }
  }

  next() {
    if (this.activeStep < this.steps.length - 1) {
      this.activeStep++;
    }
  }
}
