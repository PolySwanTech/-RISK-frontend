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
import { RiskTemplate } from '../../../core/models/RiskTemplate';
import { SelectUsersComponent } from "../../../shared/components/select-users/select-users.component";
import { ButtonAddFileComponent } from "../../../shared/components/button-add-file/button-add-file.component";
import { MatSelectModule } from '@angular/material/select';
// import { CauseService } from '../../../core/services/cause/cause.service';
// import { Cause } from '../../../core/models/Cause';
import { ProcessService } from '../../../core/services/process/process.service';
import { Process } from '../../../core/models/Process';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { EquipeService } from '../../../core/services/equipe/equipe.service';
import { NgIf, NgFor } from '@angular/common';
import { ConfirmService } from '../../../core/services/confirm/confirm.service';
import { BaloisCategoriesService } from '../../../core/services/balois-categories/balois-categories.service';
import { ConsequenceService } from '../../../core/services/consequence/consequence.service';
// import { MicroProcessService } from '../../../core/services/micro_process/micro-process.service';
import { Consequence } from '../../../core/models/Consequence';
import { MicroProcess } from '../../../core/models/MicroProcess';
import { RiskCategory } from '../../../core/models/RiskCategory';
import { RiskCategoryService } from '../../../core/services/risk/risk-category.service';
import { Cause } from '../../../core/models/Cause';
import { CauseService } from '../../../core/services/cause/cause.service';
import { BaloiseCategory } from '../../../core/models/BaloiseCategory';
import { Incident } from '../../../core/models/Incident';
import { State } from '../../../core/enum/state.enum';


@Component({
  selector: 'app-create',
  standalone: true,
  imports: [
    GoBackComponent,
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
    NgIf, NgFor
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
    equipeName: ['', Validators.required],
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
    risk: FormControl<string | null>;
    subRisk: FormControl<string | null>;
    userMail: FormControl<string | null>;
    files: FormControl<string | null>;
    lossAmount: FormControl<number | null>;
    cause: FormControl<Cause | null>;
    consequenceId: FormControl<string | null>;
    process: FormControl<Process | null>;
  }>({
    risk: new FormControl(''),
    subRisk: new FormControl(null),
    userMail: new FormControl(null),
    files: new FormControl(null),
    lossAmount: new FormControl(null, Validators.required),
    cause: new FormControl(null, Validators.required),
    consequenceId: new FormControl(null, Validators.required),
    process: new FormControl(null, Validators.required),
  });

  listRisk: RiskTemplate[] = [];
  listProcess: Process[] = [];

  errorMessage = signal('');
  hasTeam = true;
  listTeams: string[] = [];

  // listBaloiseL1: BaloiseCategoryL1[] = [];
  listConsequence: Consequence[] = [];

  listCatLvl1: BaloiseCategory[] = [];
  listCatLvl2: BaloiseCategory[] = [];
  listCatLvl3: BaloiseCategory[] = [];

  listP1: Process[] = [];
  listP2: Process[] = [];
  listP3: Process[] = [];

  listCauses: Cause[] = [];

  selectedCategoryLevel = 1;

  incidentService = inject(IncidentService);
  riskService = inject(RiskService);
  baloisCategoriesService = inject(BaloisCategoriesService);
  riskCategoryService = inject(RiskCategoryService);
  equipeService = inject(EquipeService);
  causeService = inject(CauseService);
  consequenceService = inject(ConsequenceService);
  processService = inject(ProcessService);

  ngOnInit(): void {
    const teamName = this.getUserTeamFromToken();
    if (teamName) {
      this.hasTeam = true;
      this.incidentForm1.patchValue({ equipeName: teamName });
    } else {
      this.hasTeam = false;
      this.fetchTeams();
    }
    this.consequenceService.getAll().subscribe(data =>
      this.listConsequence = data);

    this.consequenceService.getAll().subscribe(data => this.listConsequence = data);
    this.riskCategoryService.getAll().subscribe(
      data => {
        this.listCatLvl1 = data;
      }
    )

    this.processService.getAll().subscribe(data => {
      this.listP1 = data;
    });
    this.causeService.getAll().subscribe(data => {
      this.listCauses = data
    });
  }

  fetchTeams(): void {
    this.equipeService.getAllEquipes().subscribe({
      next: teams => {
        this.listTeams = teams.map(t => t.name);
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
    return new Incident(
      "", // ID généré côté backend
      this.incidentForm1.value.titre!,
      this.incidentForm1.value.location!,
      this.incidentForm1.value.commentaire!,
      new Date(this.incidentForm2.value.dateDeDeclaration!),
      new Date(this.incidentForm2.value.dateDeSurvenance!),
      new Date(this.incidentForm2.value.dateDeDetection!),
      this.incidentForm2.value.dateDeCloture ? new Date(this.incidentForm2.value.dateDeCloture) : null,
      this.incidentForm3.value.risk!,
      this.incidentForm3.value.cause!,
      this.incidentForm3.value.process as Process,
      this.hasTeam ? this.incidentForm1.value.equipeName! : undefined,
      [], // impacts (optionnel)
      State.DRAFT,
      this.incidentForm3.value.consequenceId!
    );
  }

  addIncident() {

    const incident = this.convertFormToIncident();
    console.log("Incident à créer :", incident);
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

  getSubRisk(): any {
    let risk: any = this.incidentForm3.get('risk')!.value;
    if (this.incidentForm3.get('risk')!.value != null) {
      return risk.subRisks
    }
    return risk;
  }

  onBaloisChange(cat: BaloiseCategory, level: number) {
    this.incidentForm3.get('risk')!.setValue(cat.name);
    if (level === 1) {
      this.listCatLvl2 = cat.enfants || [];
    }
    if (level === 2) {
      this.listCatLvl3 = cat.enfants || [];
    }
  }

  onProcessChange(process: Process, level: number) {
    if (level === 1) {
      this.incidentForm3.get('process')!.setValue(process); // sélection niveau 1
      this.listP2 = process.enfants || [];
      this.listP3 = [];
    }
    if (level === 2) {
      this.incidentForm3.get('process')!.setValue(process); // sélection niveau 2
      this.listP3 = process.enfants || [];
    }
  }
}
