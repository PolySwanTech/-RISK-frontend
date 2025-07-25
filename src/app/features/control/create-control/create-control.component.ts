import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { EntiteResponsable } from '../../../core/models/EntiteResponsable';
import { Process } from '../../../core/models/Process';
import { Utilisateur } from '../../../core/models/Utilisateur';
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

@Component({
  selector: 'app-create-control',
  imports: [
    FormsModule, 
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule, MatButtonModule, ReactiveFormsModule
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
  entitesResponsables: EntiteResponsable[] = [/* à remplir */];
  processes: Process[] = [/* à remplir */];
  risks: RiskTemplate[] = [/* à remplir */];
  responsables: Utilisateur[] = [/* à remplir */];

  recurences = Object.values(Recurence);
  entiteResponsableId = ""
  processId = "";


  ngOnInit(): void {
    this.buService.loadEntities().subscribe(entites => {
      this.entitesResponsables = entites;
    });

    this.userService.getUsers().subscribe(responsables => {
      this.responsables = responsables;
    });
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const payload: ControlTemplateCreateDto = {
      libelle: this.form.value.libelle,
      description: this.form.value.description,
      frequency: this.form.value.frequency,
      level: this.form.value.level,
      controlType: this.form.value.type,
      priority: this.form.value.priority,
      taxonomieId: this.form.value.taxonomie.id.id,
      taxonomieVersion: this.form.value.taxonomie.id.version,

    };

    this.controlService.createControl(payload).subscribe({
      next : ()  => {
        this.confirmService.openConfirmDialog("Contrôle ajouté", "Le contrôle a été ajouté avec succès", false);
        this.dialogRef.close();
      },
      error: err => console.error('Erreur création', err)
    });
  }

  onEntiteResponsableChange() {
    const entiteResponsableId = this.form.get('buId')?.value;
    if (entiteResponsableId) {
      this.processService.getAllByEntite(entiteResponsableId).subscribe(processes => {
        this.processes = processes;
      });
    }
  }

  onProcessChange() {
    const processId = this.form.get('processId')?.value;
    if (processId) {
      this.riskService.getAllByProcess(processId).subscribe(risks => {
        this.risks = risks;
      });
    }
  }
}
