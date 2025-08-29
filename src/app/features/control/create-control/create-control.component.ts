import { SnackBarService } from './../../../core/services/snack-bar/snack-bar.service';
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
  snackBarService = inject(SnackBarService)
  private fb = inject(FormBuilder);

  form: FormGroup = this.fb.group({
    libelle: ['', Validators.required],
    description: ['', Validators.required],
    frequency: [null, Validators.required],
    level: [null, Validators.required],
    type: [null, Validators.required],
    priority: [null, Validators.required],
    processId: [null, Validators.required],
    riskId: ['', Validators.required],
    buId: ['', Validators.required],
  });


  listProcess: any[] = [];
  listRisks: any[] = [];
  listEntities: any[] = [];

  priorities = Object.values(Priority);
  types = Object.values(Type);
  levels = Object.values(Degree);

  get buIdValue() {
    console.log(this.form.get('buId')?.value)
    return this.form.get('buId')?.value;
  }

  responsables$ = this.userService.getUsers();

  recurences = Object.values(Recurence);

  enumLabels = EnumLabels;

  ngOnInit() {
    this.fetchTeams();
  }

  fetchTeams(): void {
    this.buService.loadEntities().subscribe({
      next: teams => {
        this.listEntities = teams.filter(team => team.process && team.process.length > 0);
      },
      error: err => {
        console.error("Erreur lors du chargement des équipes", err);
      }
    });
  }

  onTeamChange(event: any) {
    const buId: string = event.value;
    this.form.get('buId')?.setValue(buId);
    this.form.get('buId')?.markAsDirty();

    this.listProcess = [];
    this.listRisks = [];
    this.form.get('processId')?.reset();
    this.form.get('riskId')?.reset();
    this.processService.getProcessTree(event.value.id).subscribe(data => {
      this.listProcess = data;
    });
  }

  onSelectionProcess(value: any) {
    this.form.get('processId')?.setValue(value.id);
    this.form.get('processId')?.markAsDirty();
    this.form.get('processId')?.updateValueAndValidity();

    this.listRisks = [];
    this.riskService.getRisksTree(value.id).subscribe(data => {
      console.log(data)
      this.listRisks = data;
      if (this.listRisks.length === 0) {
        this.snackBarService.error("Attention, il n'y a pas de risque associé à ce processus, vous pouvez en ajouter un dans la consultation des risques.");
      }
    });
    this.form.value.processId = value.id;
  }

  onSelectionRisk(event: RiskTemplate) {
    this.form.get('riskId')?.setValue(event.id);
    this.form.get('riskId')?.markAsDirty();
    this.form.get('riskId')?.updateValueAndValidity();
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
    console.log(this.form.value);
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const payload: ControlTemplateCreateDto = {
      libelle: this.form.value.libelle,
      description: this.form.value.description,
      frequency: this.form.value.frequency,
      controlType: this.form.value.type,
      processId: this.form.value.processId,
      level: this.form.value.level,
      priority: this.form.value.priority,
      riskId: this.form.value.riskId,
    };

    this.controlService.createControl(payload).subscribe({
      next: () => {
        this.snackBarService.success("Le contrôle a bien été ajouté");
        this.dialogRef.close(true);
        console.log('Création réussie', payload);
      },
      error: err => {
        this.snackBarService.error(err.message);
        console.error('Erreur création', err)
      }
    });
  }

  trackById = (index: number, item: { id: string }) => item.id;

}
