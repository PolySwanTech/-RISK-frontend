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
import { firstValueFrom, forkJoin, map, tap } from 'rxjs';
import { Incident } from '../../../core/models/Incident';
import { State } from '../../../core/enum/state.enum';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { BuProcessAccordionComponent } from "../../../shared/components/bu-process-accordion/bu-process-accordion.component";
import { MatDialog } from '@angular/material/dialog';
import { MatChipListbox, MatChipsModule } from '@angular/material/chips';
import { SelectRiskEventComponent } from '../../../shared/components/select-risk-event/select-risk-event.component';


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
    GoBackComponent,
    NgIf,
    NgFor,
    MatIconModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatChipsModule,
    MatChipListbox
  ],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss'
})
export class CreateComponent implements OnInit {

  private _formBuilder = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private confirmService = inject(ConfirmService);
  private dialog = inject(MatDialog)
  private incidentId = this.route.snapshot.queryParams['id'];

  incident: Incident | null = null;
  selectedUser: string | null = null;
  title = "Ajout d'un incident";

  today = new Date();

  selectedBP: any = null
  risk: any = null;



  incidentForm1 = this._formBuilder.group({
    reference: [''],
    titre: ['', Validators.required],
    commentaire: ['', Validators.required],
    location: ['', Validators.required],
  });

  incidentForm2 = this._formBuilder.group({
    dateDeDeclaration: [new Date().toISOString().split('T')[0], Validators.required],
    dateDeSurvenance: [
      '',
      [Validators.required, this.maxDateValidator(new Date())]
    ],
    dateDeDetection: [
      '',
      [Validators.required, this.maxDateValidator(new Date())]
    ],
  });

  incidentForm3 = this._formBuilder.group<{
    teamId: FormControl<string | null>,
    processId: FormControl<string | null>;
    riskId: FormControl<string | null>;
    intervenant: FormControl<string | null>;
    files: FormControl<string | null>;
    cause: FormControl<Cause | null>;
  }>({
    teamId: new FormControl('', Validators.required),
    processId: new FormControl(null, Validators.required),
    riskId: new FormControl(''),
    intervenant: new FormControl(null),
    files: new FormControl(null),
    cause: new FormControl(null, Validators.required),
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
    await this.fetchTeams();

    const draft = sessionStorage.getItem('incident_draft');
    if (draft) {
      const data = JSON.parse(draft);
      this.incidentForm1.patchValue(data.incidentForm1);
      this.incidentForm2.patchValue(data.incidentForm2);
      this.incidentForm3.patchValue(data.incidentForm3);
      this.selectedBP = data.selectedBP;
      sessionStorage.removeItem('incident_draft');
    }

    if (this.incidentId) {
      this.title = "Modification d'un incident";
      this.loadIncident(this.incidentId);
    } else {
      this.loadTrees().subscribe();
    }
  }

  maxDateValidator(maxDate: Date) {
    return (control: any) => {
      if (!control.value) return null; 
      const inputDate = new Date(control.value);
      return inputDate <= maxDate ? null : { maxDate: true };
    };
  }

  private loadTrees(processRootId?: string ) {
    return forkJoin({
      processes: this.processService.getProcessTree(processRootId),
      risks: this.riskService.getRisksTree(processRootId),
      causes: this.causeService.getAll()
    }).pipe(
      tap(({ processes, risks, causes }) => {
        this.listProcess = processes;
        this.listRisks = risks;
        this.listCauses = causes;
      }),
      map(() => void 0)
    );
  }

  loadIncident(id: string): void {
    this.incidentService.getIncidentById(id).subscribe((incident) => {
      console.log(incident)
      this.incidentForm1.patchValue({
        reference: incident.reference,
        titre: incident.title,
        commentaire: incident.commentaire,
        location: incident.location
      });
      this.incidentForm2.patchValue({
        dateDeDeclaration: this.toInputDate(incident.declaredAt),
        dateDeSurvenance: this.toInputDate(incident.survenueAt),
        dateDeDetection: this.toInputDate(incident.detectedAt),
      });

      const wantedBuId = incident.teamId;

      this.loadTrees(wantedBuId).subscribe(() => {
        this.incidentForm3.patchValue({
          teamId: incident.teamId,
          processId: incident.process,
          riskId: incident.risk,
          cause: incident.cause,
          intervenant: incident.intervenantId,
        });
      });

      if (incident.riskName) {
        this.selectedBP = {
          bu: {
            name: incident.teamName
          },
          process: {
            name: incident.processName
          }
        }
      }

      this.incident = incident;
      this.selectedUser = incident.intervenantId || null;
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

  private convertFormToIncident(isDraft: boolean = false) {
    return {
      reference: this.incidentForm1.value.reference || "",
      state: "",
      title: this.incidentForm1.value.titre || (isDraft ? null : ""),
      location: this.incidentForm1.value.location || (isDraft ? null : ""),
      commentaire: this.incidentForm1.value.commentaire || (isDraft ? null : ""),
      declaredAt: new Date(this.incidentForm2.value.dateDeDeclaration!),
      survenueAt: this.incidentForm2.value.dateDeSurvenance ? new Date(this.incidentForm2.value.dateDeSurvenance) : null,
      detectedAt: this.incidentForm2.value.dateDeDetection ? new Date(this.incidentForm2.value.dateDeDetection) : null,
      teamId: this.incidentForm3.value.teamId || (isDraft ? null : ""),
      riskId: this.incidentForm3.value.riskId || null,
      processId: this.incidentForm3.value.processId || null,
      cause: this.incidentForm3.value.cause || null,
      intervenant: this.incidentForm3.value.intervenant || null,
    };
  }

  addIncident() {

    if (this.incidentForm1.invalid || this.incidentForm2.invalid || this.incidentForm3.invalid) {
      console.error("Formulaire invalide pour la soumission");
      return;
    }



    const incident = this.convertFormToIncident(false);
    incident.state = State.SUBMIT

    console.log(incident)

    if (this.incidentId) {
      this.incidentService.updateIncident(this.incidentId, incident).subscribe(
        {
          next: resp => {
            this.afterCreation("Modification réussie", this.incidentId);
          },
          error: err => {
            console.error("Erreur lors de la modification de l'incident", err);
          }
        },
      );
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
    const incident = this.convertFormToIncident(true);

    incident.state = State.DRAFT;
    if (this.incidentId) {
      this.incidentService.updateIncident(this.incidentId, incident).subscribe(
        {
          next: resp => {
            this.afterCreation("Modification réussie", this.incidentId);
          },
          error: err => console.error('Erreur update draft', err)
        });
    } else {
      this.incidentService.saveIncident(incident).subscribe({
        next: resp => this.afterCreation('Création réussie', resp),
        error: err => console.error('Erreur création draft', err)
      });
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

    const date = d instanceof Date ? d : new Date(d);
    return date.toLocaleDateString('sv-SE');
  }

  onFilesChange(event: any) {
    this.incidentForm3.get('files')!.setValue(event);
  }

  compareById = (a: { id: string } | null, b: { id: string } | null) =>
    a && b ? a.id === b.id : a === b;


  selectBP(event: any) {
    this.selectedBP = event;
    this.incidentForm3.get('teamId')?.setValue(event.bu.id)
    this.incidentForm3.get('processId')?.setValue(event.process.id)
  }

  create() {
    const dialogRef = this.dialog.open(BuProcessAccordionComponent, {
      minWidth: '750px',
      height: '600px',
      maxHeight: '600px',
      data:{
        stopAtProcess : true
      }
    });

    dialogRef.afterClosed().subscribe(event => {
      this.selectBP(event);
    });
  }

  openRiskEventDialog() {
    const processId = this.incidentForm3.get('processId')?.value;

    const draftIncident = {
      incidentForm1: this.incidentForm1.value,
      incidentForm2: this.incidentForm2.value,
      incidentForm3: this.incidentForm3.value,
      selectedBP: this.selectedBP
    };
    sessionStorage.setItem('incident_draft', JSON.stringify(draftIncident));

    const dialogRef = this.dialog.open(SelectRiskEventComponent, {
      minWidth: '650px',
      height: '550px',
      data: processId ? { processId } : null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.risk = result;
        this.incidentForm3.get('riskId')?.setValue(result.id);
      }
    });
  }


}
