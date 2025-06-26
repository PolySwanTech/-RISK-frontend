import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { IncidentService } from '../../../core/services/incident/incident.service';
import { ProcessService } from '../../../core/services/process/process.service';
import { Process } from '../../../core/models/Process';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';

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
      bu_id: ['', Validators.required],
      niveau: [1, Validators.required],
      parent: [null]
    });
  }

  onSubmit() {
    if (this.processForm.valid) {
      const formValues = this.processForm.value;
      const newProcess = new Process(formValues.name, formValues.bu_id, formValues.niveau,
      formValues.parent);
      this.processService.createProcess(newProcess).subscribe(() => {
        alert('Process créé avec succès !');
        this.processForm.reset({ id: 0 });
      });
    }
  }

}
