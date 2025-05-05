import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { IncidentService } from '../../../core/services/incident/incident.service';
import { ProcessService } from '../../../core/services/process/process.service';
import { Process } from '../../../core/models/Process';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { CreateRiskComponent } from '../../risk/create-risk/create-risk.component';

@Component({
  selector: 'app-create-process',
  imports: [ReactiveFormsModule],
  templateUrl: './create-process.component.html',
  styleUrl: './create-process.component.scss'
})
export class CreateProcessComponent {
  processForm: FormGroup;

  constructor(
    private dialog: MatDialog,
    private fb: FormBuilder,
    private processService: ProcessService) {
    this.processForm = this.fb.group({
      id: [0, Validators.required],
      name: ['', Validators.required],
      bu_id: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.processForm.valid) {
      const formValues = this.processForm.value;
      const newProcess = new Process(formValues.name, formValues.bu_id);
      this.processService.createProcess(newProcess).subscribe(
        resp => {
          this.dialog.open(ConfirmationDialogComponent,
            {
              data: {
                title: 'Process crée',
                message: 'Voulez-vous associer un risque à ce processus ?',
                buttons: true
              }
            }
          ).afterClosed().subscribe(result => {
            if (result) {
              this.dialog.open(CreateRiskComponent,
                {
                  data: {
                    processId: resp.id, // Pass the process}
                    processName: resp.name, // Pass the process}
                  }
                }
              )
              // Logic to navigate to the risk creation page or perform any other action
              // For example, you can use the router to navigate to the risk creation page
            };
            console.log('Process created successfully:', resp);
            // Optionally, reset the form or navigate to another page
            this.processForm.reset();
          }
          )
        }
      );
    }
  }

}
