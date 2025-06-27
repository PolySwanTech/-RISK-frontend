import { Component, inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { IncidentService } from '../../../core/services/incident/incident.service';
import { ProcessService } from '../../../core/services/process/process.service';
import { Process } from '../../../core/models/Process';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { Equipe, EquipeService } from '../../../core/services/equipe/equipe.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-process',
  imports: [ReactiveFormsModule, ReactiveFormsModule, CommonModule],
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

  constructor(
  ) {
    this.processForm = this.fb.group({
      name: ['', Validators.required],
      bu_id: ['', Validators.required],
      parent: [null]
    });
  }

  ngOnInit() {
    console.log('[INIT] CreateProcessComponent loaded');
    this.equipeService.getAllEquipes().subscribe(data => {
      console.log('[BU] Reçues :', data);
      this.businessUnits = data;
    });

    this.processService.getAll().subscribe(data => {
      console.log('[PROCESS] Reçus :', data);
      this.processes = data;
    });
  }

  onSubmit() {
    if (this.processForm.valid) {
      const { name, bu_id, parent } = this.processForm.value;
      const dto = { name, bu: bu_id, parentId: parent || null };
      this.processService.createProcess(dto).subscribe(() => {
        this.router.navigate(['reglages', 'process']);
      });

    }
  }

}
