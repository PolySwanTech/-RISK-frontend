import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ControlEvaluation } from '../../../../core/models/ControlEvaluation';
import { Evaluation } from '../../../../core/enum/evaluation.enum';
import { ControlService } from '../../../../core/services/control/control.service';
import { EvaluationControl, EvaluationControlLabels } from '../../../../core/enum/evaluation-controle.enum';

@Component({
  selector: 'app-control-evaluation-popup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './control-evaluation-popup.component.html',
  styleUrls: ['./control-evaluation-popup.component.scss']
})
export class ControlEvaluationPopupComponent {

  @Input() executionId!: string;
  @Output() close = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<void>();

  evaluationData: ControlEvaluation = {
    executionId: '',
    evaluation: Evaluation.MEDIUM,
    resume: '',
    comments: ''
  };

  evaluationOptions = Object.values(EvaluationControl);
  labels = EvaluationControlLabels;

  constructor(private controlService: ControlService) { }

  ngOnInit(): void {
    this.evaluationData.executionId = this.executionId;
  }

  submit(): void {
    this.controlService.createEvaluation(this.evaluationData).subscribe(() => {
      this.submitted.emit();
      this.close.emit();
    });
  }

  cancel(): void {
    this.close.emit();
  }
}
