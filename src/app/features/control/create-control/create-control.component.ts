import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { Process } from '../../../core/models/Process';
import { EntitiesService } from '../../../core/services/entities/entities.service';
import { ProcessService } from '../../../core/services/process/process.service';
import { RiskService } from '../../../core/services/risk/risk.service';
import { UtilisateurService } from '../../../core/services/utilisateur/utilisateur.service';
import { ControlTemplateCreateDto } from '../../../core/models/ControlTemplate';
import { ControlService } from '../../../core/services/control/control.service';
import { RiskTemplate } from '../../../core/models/RiskTemplate';
import { Degree } from '../../../core/enum/degree.enum';
import { Priority } from '../../../core/enum/Priority';
import { Recurence } from '../../../core/enum/recurence.enum';
import { MatDialogRef } from '@angular/material/dialog';
import { ConfirmService } from '../../../core/services/confirm/confirm.service';
import { Type } from '../../../core/enum/controltype.enum';
import { EnumLabels } from '../../../core/enum/enum-labels';
import { SelectArborescenceComponent } from "../../../shared/components/select-arborescence/select-arborescence.component";
import { map, Observable, of, startWith, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-create-control',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule, MatButtonModule, ReactiveFormsModule,
    SelectArborescenceComponent
],
  templateUrl: './create-control.component.html',
  styleUrl: './create-control.component.scss'
})
export class CreateControlComponent {

  riskService = inject(RiskService);
  buService = inject(EntitiesService);
  processService = inject(ProcessService);
  userService = inject(UtilisateurService);
  controlService = inject(ControlService);
  dialogRef = inject(MatDialogRef<CreateControlComponent>);
  confirmService = inject(ConfirmService);
  private fb = inject(FormBuilder);

  form: FormGroup = this.fb.group({
    libelle      : ['', Validators.required],
    description  : ['', Validators.required],
    frequency    : [null, Validators.required],
    level        : [null, Validators.required],
    type  : [null, Validators.required],
    priority     : [null, Validators.required],
    processId    : ['',  Validators.required],
    taxonomie    : [null, Validators.required],
    buId : ['', Validators.required],
  });

  priorities = Object.values(Priority);
  types = Object.values(Type);
  levels = Object.values(Degree);
  entitesResponsables$ = this.buService.loadEntities();
  processes$: Observable<Process[]> = this.form.get('buId')!.valueChanges.pipe(
    startWith(this.form.get('buId')!.value),
    tap(() => this.form.get('processId')!.reset()),
    switchMap(id => {
      const buId = typeof id === 'string' ? id : id?.id;
      return buId ? this.processService.getAllByEntite(buId) : of([]);
    }),
  ); 

  risks$: Observable<RiskTemplate[]> = this.form.get('processId')!.valueChanges.pipe(
    startWith(this.form.get('processId')!.value),
    switchMap(id => id ? this.riskService.getAllByProcess(id).pipe(map(list => list ?? [])) : of([]))
  );

  responsables$ = this.userService.getUsers();

  recurences = Object.values(Recurence);
  
  enumLabels = EnumLabels;

  onSelectionRisk(event : RiskTemplate) {
    this.form.get('taxonomie')?.setValue(event);
  }

  getTypeLabel(type: keyof typeof EnumLabels.type): string {
    return this.enumLabels.type[type];
  }

  getPriorityLabel(priority: keyof typeof EnumLabels.priority): string {
    return this.enumLabels.priority[priority];
  }

  getDegresLabel(control: keyof typeof EnumLabels.degres): string {
    return this.enumLabels.degres[control];
  }

  getRecurrenceLabel(recurrence: keyof typeof EnumLabels.reccurency): string {
    return this.enumLabels.reccurency[recurrence];
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const payload: ControlTemplateCreateDto = {
      libelle: this.form.value.libelle,
      description: this.form.value.description,
      frequency: this.form.value.frequency,
      controlType: this.form.value.type,
      processId: this.form.value.processId,
      level: this.form.value.level,
      priority: this.form.value.priority,
      taxonomieId: this.form.value.taxonomie.id.id,
      taxonomieVersion: this.form.value.taxonomie.id.version,

    };

    this.controlService.createControl(payload).subscribe({
      next : ()  => {
        this.confirmService.openConfirmDialog("Contrôle ajouté", "Le contrôle a été ajouté avec succès", false);
        console.log('Création réussie', payload);
        this.dialogRef.close();
      },
      error: err => console.error('Erreur création', err)
    });
  }

  trackById = (index: number, item: {id: string}) => item.id;

}
