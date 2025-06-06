import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { RiskService } from '../../../core/services/risk/risk.service';
import { Risk } from '../../../core/models/Risk';

@Component({
  selector: 'app-create-risk',
  imports: [ReactiveFormsModule],
  templateUrl: './create-risk.component.html',
  styleUrls: ['./create-risk.component.scss']
})
export class CreateRiskComponent {

  riskForm: FormGroup;
  processId: string = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { processId: string; processName: string },
    private dialog: MatDialog,
    private fb: FormBuilder,
    private riskService: RiskService) {
    this.riskForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      level: ['', Validators.required],
    });
    this.processId = data.processId;
  }

  onSubmit() {
    if (this.riskForm.valid) {
      const formValues = this.riskForm.value;
      const r = new Risk("", formValues.name, formValues.description, formValues.level, this.processId);
      this.riskService.save(r).subscribe(
        resp => {
          this.dialog.open(ConfirmationDialogComponent,
            {
              data: {
                title: 'Risque crée',
                buttons: false
              }
            }
          ).afterClosed().subscribe(result => {
            if (result) {

              console.log(result)
              // Logic to navigate to the risk creation page or perform any other action
              // For example, you can use the router to navigate to the risk creation page
            };
            console.log('Process created successfully:', resp);
            // Optionally, reset the form or navigate to another page
            this.riskForm.reset();
          }
          )
        }
      );
    }
  }
}
