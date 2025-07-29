import { Component, inject, OnInit, signal } from '@angular/core';
import { GoBackComponent } from "../../../shared/components/go-back/go-back.component";
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { IncidentService } from '../../../core/services/incident/incident.service';
import { RiskService } from '../../../core/services/risk/risk.service';
import { MatRadioModule } from '@angular/material/radio';
import { SelectUsersComponent } from "../../../shared/components/select-users/select-users.component";
import { ButtonAddFileComponent } from "../../../shared/components/button-add-file/button-add-file.component";
import { MatSelectModule } from '@angular/material/select';
import { ProcessService } from '../../../core/services/process/process.service';
import { Process } from '../../../core/models/Process';
import { Router } from '@angular/router';
import { EquipeService } from '../../../core/services/equipe/equipe.service';
import { NgIf, NgFor } from '@angular/common';
import { ConfirmService } from '../../../core/services/confirm/confirm.service';
import { ConsequenceService } from '../../../core/services/consequence/consequence.service';
import { Consequence } from '../../../core/models/Consequence';
import { RiskCategoryService } from '../../../core/services/risk/risk-category.service';
import { Cause } from '../../../core/models/Cause';
import { CauseService } from '../../../core/services/cause/cause.service';
import { SelectArborescenceComponent } from "../../../shared/components/select-arborescence/select-arborescence.component";

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatRadioModule,
    SelectUsersComponent,
    ButtonAddFileComponent,
    GoBackComponent,
    NgIf,
    NgFor,
    SelectArborescenceComponent
  ],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss'
})
export class CreateComponent implements OnInit {

  private _formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private confirmService = inject(ConfirmService);

  incidentForm1 = this._formBuilder.group({
    titre: ['', Validators.required],
    equipe: ['', Validators.required],
    commentaire: ['', Validators.required],
    location: ['', Validators.required],
  });

  incidentForm2 = this._formBuilder.group({
    dateDeDeclaration: [new Date().toISOString().split('T')[0], Validators.required],
    dateDeSurvenance: ['', Validators.required],
    dateDeDetection: ['', Validators.required],
    dateDeCloture: ['']
  });

  incidentForm3 = this._formBuilder.group<{
    riskId: FormControl<string | null>;
    userMail: FormControl<string | null>;
    files: FormControl<string | null>;
    lossAmount: FormControl<number | null>;
    cause: FormControl<Cause | null>;
    consequenceId: FormControl<string | null>;
    processId: FormControl<string | null>;
  }>({
    riskId: new FormControl(''),
    userMail: new FormControl(null),
    files: new FormControl(null),
    lossAmount: new FormControl(null, Validators.required),
    cause: new FormControl(null, Validators.required),
    consequenceId: new FormControl(null, Validators.required),
    processId: new FormControl(null, Validators.required),
  });

  listRisks: any[] = [];

  listProcess: Process[] = [];

  errorMessage = signal('');
  hasTeam = true;
  listTeams: any[] = [];

  listConsequence: Consequence[] = [];

  listCauses: Cause[] = [];

  incidentService = inject(IncidentService);
  riskService = inject(RiskService);
  riskCategoryService = inject(RiskCategoryService);
  equipeService = inject(EquipeService);
  causeService = inject(CauseService);
  consequenceService = inject(ConsequenceService);
  processService = inject(ProcessService);

  ngOnInit(): void {
    const teamName = this.getUserTeamFromToken();
    if (teamName) {
      this.hasTeam = true;
      this.incidentForm1.patchValue({ equipe: teamName });
    } else {
      this.hasTeam = false;
      this.fetchTeams();
    }
    this.consequenceService.getAll().subscribe(data =>
      this.listConsequence = data);

    this.causeService.getAll().subscribe(data => {
      this.listCauses = data
    });
  }

  onTeamChange(event: any) {
    this.listProcess = [];
    this.listRisks = [];
    this.incidentForm3.get('processId')?.reset();
    this.incidentForm3.get('riskId')?.reset();
    this.processService.getProcessTree(event.value.id).subscribe(data => {
      this.listProcess = data;
    });
  }

  onSelectionProcess(value: Process) {
    this.listRisks = [];
    this.riskService.getRisksTree(value.id).subscribe(data => {
      this.listRisks = data;
      if (this.listRisks.length === 0) {
        alert("Attention, il n'y a pas de risque associé à ce processus, vous pouvez en ajouter un dans la consultation des risques.");
      }
    });
    this.incidentForm3.get('processId')?.setValue(value.id);
  }

  onSelectionRisk(value: any) {
    this.incidentForm3.get('riskId')?.setValue(value.id);
  }

  fetchTeams(): void {
    this.equipeService.getAllEquipes().subscribe({
      next: teams => {
        this.listTeams = teams.filter(team => team.process && team.process.length > 0);
      },
      error: err => {
        console.error("Erreur lors du chargement des équipes", err);
      }
    });
  }

  getUserTeamFromToken(): string | null {
    const token = sessionStorage.getItem('token');
    if (!token) return null;

    try {
      const base64Payload = token.split('.')[1];
      const jsonPayload = new TextDecoder().decode(
        Uint8Array.from(atob(base64Payload), c => c.charCodeAt(0))
      );
      const payload = JSON.parse(jsonPayload);
      return payload.team || null;
    } catch (e) {
      console.error("Erreur lors du décodage du token :", e);
      return null;
    }
  }

  changeUser(event: any) {
    this.incidentForm3.get('userMail')!.setValue(event.email);
  }

  private convertFormToIncident() {
    return {
      title: this.incidentForm1.value.titre!,
      location: this.incidentForm1.value.location!,
      commentaire: this.incidentForm1.value.commentaire!,
      declaredAt: new Date(this.incidentForm2.value.dateDeDeclaration!),
      survenueAt: new Date(this.incidentForm2.value.dateDeSurvenance!),
      detectedAt: new Date(this.incidentForm2.value.dateDeDetection!),
      closedAt: this.incidentForm2.value.dateDeCloture ? new Date(this.incidentForm2.value.dateDeCloture) : null,
      riskId: this.incidentForm3.value.riskId!,
      processId: this.incidentForm3.value.processId!,
      cause: this.incidentForm3.value.cause!
    };
  }

  addIncident() {

    const incident = this.convertFormToIncident();
    this.incidentService.saveIncident(incident).subscribe(
      {
        next: resp => {
          this.afterCreation("Création réussie", resp);
        },
        error: err => {
          console.error("Erreur lors de la création de l'incident", err);
        }
      },
    );
  }

  afterCreation(title: string, incidentId: string) {
    this.confirmService.openConfirmDialog(title, "Allez vers la consultation ?", true)
      .subscribe(result => {
        if (result) {
          this.router.navigate(['incident', incidentId]);
        } else {
          this.router.navigate(['incident']);
        }
      });
  }

  parseDate(date: string | null | undefined): Date | null {
    return date ? new Date(date) : null;
  }

  onFilesChange(event: any) {
    this.incidentForm3.get('files')!.setValue(event);
  }
}
