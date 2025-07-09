import { Component, inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { IncidentService } from '../../../core/services/incident/incident.service';
import { ProcessService } from '../../../core/services/process/process.service';
import { Process } from '../../../core/models/Process';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { Equipe, EquipeService } from '../../../core/services/equipe/equipe.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { GoBackComponent } from '../../../shared/components/go-back/go-back.component';

@Component({
  selector: 'app-create-process',
  imports: [ReactiveFormsModule, ReactiveFormsModule, CommonModule, FormsModule, ReactiveFormsModule,
      MatFormFieldModule, MatInputModule, MatSelectModule,
      MatStepperModule, MatButtonModule],
  templateUrl: './create-process.component.html',
  styleUrl: './create-process.component.scss'
})
export class CreateProcessComponent {
  processForm: FormGroup;
  businessUnits: Equipe[] = [];
  processes: Process[] = [];

  processService = inject(ProcessService);
  equipeService = inject(EquipeService);
  router = inject(Router);
  fb = inject(FormBuilder);
  dialogRef = inject(MatDialogRef<CreateProcessComponent>);

  constructor(
  ) {
    this.processForm = this.fb.group({
      name: ['', Validators.required],
      bu_id: ['', Validators.required],
      parent: [null]
    });
  }

  ngOnInit() {
    this.equipeService.getAllEquipes().subscribe(data => {
      this.businessUnits = data;
    });

    this.processService.getAll().subscribe(data => {
      this.processes = data;
    });
  }

  onSubmit() {
    if (this.processForm.valid) {
      const { name, bu_id, parent } = this.processForm.value;
      const dto = { name, bu: bu_id, parentId: parent || null };
      this.processService.createProcess(dto).subscribe(() => {
        this.dialogRef.close(true);
        this.router.navigate(['reglages', 'process']);
      });

    }
  }

}
