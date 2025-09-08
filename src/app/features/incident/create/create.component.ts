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
import { ActivatedRoute, Router } from '@angular/router';
import { EquipeService } from '../../../core/services/equipe/equipe.service';
import { NgIf, NgFor } from '@angular/common';
import { ConfirmService } from '../../../core/services/confirm/confirm.service';
import { ConsequenceService } from '../../../core/services/consequence/consequence.service';
import { Consequence } from '../../../core/models/Consequence';
import { RiskCategoryService } from '../../../core/services/risk/risk-category.service';
import { Cause } from '../../../core/models/Cause';
import { CauseService } from '../../../core/services/cause/cause.service';
import { SelectArborescenceComponent } from "../../../shared/components/select-arborescence/select-arborescence.component";
import { firstValueFrom, forkJoin, map, tap } from 'rxjs';
import { Incident } from '../../../core/models/Incident';
import { State } from '../../../core/enum/state.enum';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';


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
    SelectArborescenceComponent,
    MatIconModule,
    MatTooltipModule,
    MatDatepickerModule
  ],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss'
})
export class CreateComponent implements OnInit {

  private _formBuilder = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private confirmService = inject(ConfirmService);
  private incidentId = this.route.snapshot.queryParams['id'];

  incident: Incident | null = null;
  selectedUser: string | null = null;
  title = "Ajout d'un incident";


  incidentForm1 = this._formBuilder.group({
    reference: [''],
    titre: ['', Validators.required],
    teamId: ['', Validators.required],
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
    intervenant: FormControl<string | null>;
    files: FormControl<string | null>;
    cause: FormControl<Cause | null>;
    consequences: FormControl<string[]>;
    processId: FormControl<string | null>;
  }>({
    riskId: new FormControl(''),
    intervenant: new FormControl(null),
    files: new FormControl(null),
    cause: new FormControl(null, Validators.required),
    consequences: new FormControl<string[]>([], { validators: [Validators.required], nonNullable: true }),
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


  async ngOnInit(): Promise<void> {
    this.hasTeam = false;

    
    // D'abord charger les équipes
    await this.fetchTeams();
    
    // Ensuite charger l'incident ou l'arbre
    if (this.incidentId) {
      this.title = "Modification d'un incident";
      this.loadIncident(this.incidentId);
    } else {
      this.loadTrees().subscribe();
    }
  }

  private loadTrees(processRootId?: string /** optionnel */) {
    /* on renvoie un Observable<void> qui émet quand tout est chargé */
    return forkJoin({
      processes: this.processService.getProcessTree(processRootId),
      risks: this.riskService.getRisksTree(processRootId),
      consequences: this.consequenceService.getAll(),
      causes: this.causeService.getAll()
    }).pipe(
      tap(({ processes, risks, consequences, causes }) => {
        this.listProcess = processes;
        this.listRisks = risks;
        this.listConsequence = consequences;
        this.listCauses = causes;
      }),
      /* on ne renvoie plus de valeur (juste la fin du chargement) */
      map(() => void 0)
    );
  }

  loadIncident(id: string): void {
    this.incidentService.getIncidentById(id).subscribe((incident) => {
      this.incidentForm1.patchValue({
        reference: incident.reference,
        titre: incident.title,
        teamId: incident.teamId,
        commentaire: incident.commentaire,
        location: incident.location
      });
      this.incidentForm2.patchValue({
        dateDeDeclaration: this.toInputDate(incident.declaredAt),
        dateDeSurvenance: this.toInputDate(incident.survenueAt),
        dateDeDetection: this.toInputDate(incident.detectedAt),
        dateDeCloture: this.toInputDate(incident.closedAt),
      });

      const wantedBuId = incident.teamId;

      this.loadTrees(wantedBuId).subscribe(() => {
        this.incidentForm3.patchValue({
          riskId: incident.risk,
          cause: incident.cause,
          consequences: incident.consequences.map((c: any) => c.id),
          processId: incident.process,
          intervenant: incident.intervenant,
        });
      });
      this.incident = incident;
      this.selectedUser = incident.intervenant || null;
    });
  }

  onTeamChange(event: any) {
    this.listProcess = [];
    this.listRisks = [];
    this.incidentForm3.get('processId')?.reset();
    this.incidentForm3.get('riskId')?.reset();
    this.processService.getProcessTree(event.value).subscribe(data => {
      this.listProcess = data;
    });
  }

  onSelectionProcess(value: Process) {
    this.listRisks = [];
    this.riskService.getRisksTree(value.id).subscribe(data => {
      this.listRisks = data;
    });
    this.incidentForm3.get('processId')?.setValue(value.id);
  }

  onSelectionRisk(value: any) {
    this.incidentForm3.get('riskId')?.setValue(value.id);
  }

  fetchTeams(): Promise<any> {
    return firstValueFrom(this.equipeService.getAllEquipes().pipe(
      tap((teams) => this.listTeams = teams)
    ));
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
    this.incidentForm3.get('intervenant')!.setValue(event.id);
  }

  private convertFormToIncident() {
    return {
      reference: this.incidentForm1.value.reference || "",
      state: "",
      title: this.incidentForm1.value.titre!,
      location: this.incidentForm1.value.location!,
      commentaire: this.incidentForm1.value.commentaire!,
      teamId: this.incidentForm1.value.teamId!,
      declaredAt: new Date(this.incidentForm2.value.dateDeDeclaration!),
      survenueAt: new Date(this.incidentForm2.value.dateDeSurvenance!),
      detectedAt: new Date(this.incidentForm2.value.dateDeDetection!),
      closedAt: this.incidentForm2.value.dateDeCloture ? new Date(this.incidentForm2.value.dateDeCloture) : null,
      riskId: this.incidentForm3.value.riskId!,
      processId: this.incidentForm3.value.processId!,
      consequences: this.incidentForm3.value.consequences!,
      cause: this.incidentForm3.value.cause!,
      intervenant: this.incidentForm3.value.intervenant || null,
    };
  }

  addIncident() {

    const incident = this.convertFormToIncident();
    incident.state = State.SUBMIT
    if (this.incidentId) {
      this.incidentService.updateIncident(this.incidentId, incident).subscribe(
        {
          error: err => {
            console.error("Erreur lors de la modification de l'incident", err);
          }
        },
      );
      this.router.navigate(['incident']);
    }
    else {
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
  }

  addDraft() {
    const incident = this.convertFormToIncident();
    incident.state = State.DRAFT;
    if (this.incidentId) {
      this.incidentService.updateIncident(this.incidentId, incident).subscribe(
        {
          error: err => {
            console.error("Erreur lors de la modification de l'incident", err);
          }
        },
      );
      this.router.navigate(['incident']);
    }
    else {
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

  private toInputDate(d?: string | Date | null): string | null {
    if (!d) return '';
    return (d instanceof Date ? d : new Date(d))
      .toISOString()
      .split('T')[0];
  }

  onFilesChange(event: any) {
    this.incidentForm3.get('files')!.setValue(event);
  }

  compareById = (a: { id: string } | null, b: { id: string } | null) =>
    a && b ? a.id === b.id : a === b;

}
