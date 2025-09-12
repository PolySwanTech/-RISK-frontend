import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, Inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ControlService } from '../../../core/services/control/control.service';
import { Status, StatusLabels } from '../../../core/enum/status.enum';
import { PopupEvaluationControleComponent } from '../../../pages/control-details-page/popup-evaluation-controle/popup-evaluation-controle/popup-evaluation-controle.component';
import { EvaluationCardComponent } from "../../../pages/control-details-page/evaluation-card/evaluation-card.component";

@Component({
  selector: 'app-pop-up-detail-execution',
  imports: [CommonModule, FormsModule, MatDialogModule, MatFormFieldModule,
    MatSlideToggleModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, EvaluationCardComponent],
  templateUrl: './pop-up-detail-execution.component.html',
  styleUrl: './pop-up-detail-execution.component.scss'
})
export class PopUpDetailExecutionComponent {

  private controlService = inject(ControlService);
  private dialog = inject(MatDialog);

  s : any = { exec: null, view: null };

  constructor(public dialogRef: MatDialogRef<PopUpDetailExecutionComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any, private cdRef: ChangeDetectorRef
    ) {
    }

    ngOnInit(): void {  
      this.getExecution();
    }

    getExecution(){
      this.controlService.getEvaluationByExecution(this.data.id).subscribe((data) => {
        this.s.exec = this.data;
        this.s.view = data;
        console.log(this.s);
      });
    }

    computeMetaStripe(s: any): string {
    if (s?.view?.reexamen === true || s?.view?.needsReexamination === true || s?.view?.status === 'REEXAMINATION') {
      return 'stripe--danger';
    }

    if (s?.exec?.status === 'IN_PROGRESS') {
      return 'stripe--danger';
    }

    if (s?.view && !s?.view?.reviewedAt) {
      return 'stripe--pending';
    }

    if (s?.exec?.status === 'ACHIEVED' || s?.exec?.status === 'CLOSED') {
      return 'stripe--success';
    }

    return 'stripe--neutral';
  }

  getStatusClass(status?: Status): string {
      if (!status) return 'status-default';
      switch (status) {
        case Status.ACHIEVED: return 'status-realise';
        case Status.IN_PROGRESS: return 'status-en-cours';
        case Status.NOT_ACHIEVED: return 'status-non-realise';
        default: return 'status-default';
      }
    }
    
    formatStatus(s?: Status) { return s ? StatusLabels[s] : '—'; }

    evaluateExec(executionId: string, action: string): void {
        this.dialog.open(PopupEvaluationControleComponent, {
          data: {
            action: action,
            executionId: executionId,
            mode: 'FORM',
            canValidate: true
          }
        })
      }
    
      openEvaluationDetailsPopup(executionId: string, action: string): void {
    this.dialog.open(PopupEvaluationControleComponent, {
      data: {
        action: action,
        executionId: executionId,
        mode: action == 'eval' ? 'FORM' : 'DETAILS',
        canValidate: true
      }
    })
  }
}
