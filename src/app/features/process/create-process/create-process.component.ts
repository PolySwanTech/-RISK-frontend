import { Component, Inject, inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ProcessService } from '../../../core/services/process/process.service';
import { Process } from '../../../core/models/Process';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Equipe, EquipeService } from '../../../core/services/equipe/equipe.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { SnackBarService } from '../../../core/services/snack-bar/snack-bar.service';
import { SelectArborescenceComponent } from "../../../shared/components/select-arborescence/select-arborescence.component";

@Component({
  selector: 'app-create-process',
  imports: [ReactiveFormsModule, ReactiveFormsModule, CommonModule, FormsModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatStepperModule, MatButtonModule, SelectArborescenceComponent],
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
  snackBarService = inject(SnackBarService);

  ope = 'Créer'

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { process: Process, buId?: string } | null
  ) {

    if (data && data.process) {
      this.ope = 'Modifier';
      this.processForm = this.fb.group({
        name: [data.process.name, Validators.required],
        parentId: [data.process.parentId, Validators.required]
      });
    }
    else {
      this.processForm = this.fb.group({
        name: ['', Validators.required],
        buId: [this.data ? this.data.buId : null, Validators.required],
        parentId: [null]
      });
    }

  }

  ngOnInit() {
    this.equipeService.getAllEquipes().subscribe(data => {
      this.businessUnits = data;

      if (this.businessUnits.length === 1) {
        const onlyUnit = this.businessUnits[0];

        // Set value in the form
        this.processForm.get('buId')?.setValue(onlyUnit.id);

        // Disable the field
        this.processForm.get('buId')?.disable();

        // Appeler le handler manuellement si nécessaire
        this.onBuChange(onlyUnit.id);
      } else {
        // Assurez-vous que le champ est activé dans le cas général
        this.processForm.get('buId')?.enable();
      }

      const buId = this.processForm.get('buId')!.value;
      
      if (buId) {
        this.onBuChange(buId);
      }
    });
  }

  onBuChange(buId: string) {
    this.processForm.patchValue({ parentId: null });
    this.processes = [];
    this.processService.getProcessLeaf(buId).subscribe(list => {
      this.processes = [...list];
    });
  }

  onSelectionProcess(value: any) {
    this.processForm.get('parentId')?.setValue(value.id);
  }

  onSubmit() {
    if (this.processForm.valid) {
      if (this.data && this.data.process) {
        const { name, parentId } = this.processForm.value;
        const dto = { name, parentId: parentId || null };
        this.processService.updateProcess(this.data.process.id, dto).subscribe(resp => {
          this.snackBarService.success("Le processus a bien été modifié")
          this.dialogRef.close(true);
          this.router.navigate(['reglages']);
        });
      }
      else {
        const { name, buId, parentId } = this.processForm.value;
        const dto = { name, bu: buId, parentId: parentId || null };
        this.processService.createProcess(dto).subscribe(resp => {
          this.snackBarService.success("Le processus a bien été créé")
          this.dialogRef.close(true);
          this.router.navigate(['reglages']);
        });
      }
    }
  }
}
