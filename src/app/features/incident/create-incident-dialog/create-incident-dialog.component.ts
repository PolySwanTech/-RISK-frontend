import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { BasePopupComponent, PopupAction } from '../../../shared/components/base-popup/base-popup.component';
import { SelectUsersComponent } from '../../../shared/components/select-users/select-users.component';
import { BuProcessAccordionComponent } from '../../../shared/components/bu-process-accordion/bu-process-accordion.component';
import { IncidentService } from '../../../core/services/incident/incident.service';
import { RiskService } from '../../../core/services/risk/risk.service';
import { ProcessService } from '../../../core/services/process/process.service';
import { CauseService } from '../../../core/services/cause/cause.service';
import { EntitiesService } from '../../../core/services/entities/entities.service';
import { ConfirmService } from '../../../core/services/confirm/confirm.service';
import { DraftService } from '../../../core/services/draft.service';
import { Process } from '../../../core/models/Process';
import { Cause } from '../../../core/models/Cause';
import { Incident, IncidentCreateDto } from '../../../core/models/Incident';
import { State } from '../../../core/enum/state.enum';
import { forkJoin, tap, map, firstValueFrom } from 'rxjs';

export interface CreateIncidentDialogData {
  incidentId?: string;
  draftId?: string;
}

@Component({
  selector: 'app-create-incident-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    BasePopupComponent,
    SelectUsersComponent
  ],
  templateUrl: './create-incident-dialog.component.html',
  styleUrl: './create-incident-dialog.component.scss'
})
export class CreateIncidentDialogComponent implements OnInit {

  private _formBuilder = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private dialogRef = inject(MatDialogRef<CreateIncidentDialogComponent>);
  private incidentService = inject(IncidentService);
  private riskService = inject(RiskService);
  private processService = inject(ProcessService);
  private causeService = inject(CauseService);
  private entitiesService = inject(EntitiesService);
  private confirmService = inject(ConfirmService);
  private draftService = inject(DraftService);

  popupActions: PopupAction[] = [];
  incident: Incident | null = null;
  selectedUser: string | null = null;
  today = new Date();
  selectedBP: any = null;
  risk: any = null;
  currentStep = 0;

  listRisks: any[] = [];
  listProcess: Process[] = [];
  listTeams: any[] = [];
  listCauses: Cause[] = [];

  private currentDraftId: string | null = null;

  incidentForm1 = this._formBuilder.group({
    reference: [''],
    titre: ['', Validators.required],
    commentaire: ['', Validators.required],
    location: ['', Validators.required],
  });

  incidentForm2 = this._formBuilder.group({
    dateDeDeclaration: [new Date().toISOString().split('T')[0], Validators.required],
    dateDeSurvenance: ['', [Validators.required, this.maxDateValidator(new Date())]],
    dateDeDetection: ['', [Validators.required, this.maxDateValidator(new Date())]],
  });

  incidentForm3 = this._formBuilder.group<{
    teamId: FormControl<string | null>,
    processId: FormControl<string | null>;
    riskId: FormControl<string | null>;
    intervenant: FormControl<string | null>;
    cause: FormControl<Cause | null>;
  }>({
    teamId: new FormControl('', Validators.required),
    processId: new FormControl(null, Validators.required),
    riskId: new FormControl(''),
    intervenant: new FormControl(null),
    cause: new FormControl(null, Validators.required),
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: CreateIncidentDialogData | null) { }

  async ngOnInit(): Promise<void> {
    await this.fetchTeams();

    // Charger le brouillon si un draftId est fourni
    if (this.data?.draftId) {
      this.loadDraft(this.data.draftId);
      this.currentDraftId = this.data.draftId;
      this.draftService.hideDraft(this.data.draftId);
    }

    if (this.data?.incidentId) {
      this.loadIncident(this.data.incidentId);
    } else {
      this.loadTrees().subscribe();
    }

    this.initActions();
  }

  loadDraft(draftId: string): void {
    const draft = this.draftService.getDraftById(draftId);
    if (draft) {
      this.incidentForm1.patchValue(draft.data.incidentForm1);
      this.incidentForm2.patchValue(draft.data.incidentForm2);
      this.incidentForm3.patchValue(draft.data.incidentForm3);
      this.selectedBP = draft.data.selectedBP;
      this.currentStep = draft.data.currentStep || 0;
      console.log('Brouillon d\'incident restauré:', draft);
    }
  }

  initActions(): void {
    this.popupActions = [
      {
        label: 'Annuler',
        icon: 'close',
        color: 'red',
        onClick: () => this.closePopup()
      },
      {
        label: 'Enregistrer comme brouillon',
        icon: 'drafts',
        color: 'green',
        onClick: () => this.addDraft(),
      },
      {
        label: 'Précédent',
        icon: 'arrow_back',
        primary: true,
        onClick: () => this.previousStep(),
        hidden: () => this.currentStep === 0
      },
      {
        label: 'Suivant',
        icon: 'arrow_forward',
        primary: true,
        disabled: () => this.isCurrentStepInvalid(),
        onClick: () => this.nextStep(),
        hidden: () => this.currentStep === 2
      },
      {
        label: 'Soumettre',
        icon: 'check',
        primary: true,
        disabled: () => this.isFormInvalid(),
        onClick: () => this.addIncident(),
        hidden: () => this.currentStep !== 2
      }
    ];
  }

  getDialogRef() {
    return this.dialogRef;
  }

  hasFormData(): boolean {
    return !!(
      this.incidentForm1.value.titre ||
      this.incidentForm1.value.commentaire ||
      this.incidentForm1.value.location
    );
  }


  closePopup() {
    this.dialogRef.close();
  }

  nextStep() {
    if (this.currentStep < 2) {
      this.currentStep++;
      this.initActions();
    }
  }

  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.initActions();
    }
  }

  isCurrentStepInvalid(): boolean {
    switch (this.currentStep) {
      case 0:
        return this.incidentForm1.invalid;
      case 1:
        return this.incidentForm2.invalid;
      case 2:
        return this.incidentForm3.invalid;
      default:
        return false;
    }
  }

  isFormInvalid(): boolean {
    return this.incidentForm1.invalid || this.incidentForm2.invalid || this.incidentForm3.invalid;
  }

  maxDateValidator(maxDate: Date) {
    return (control: any) => {
      if (!control.value) return null;
      const inputDate = new Date(control.value);
      return inputDate <= maxDate ? null : { maxDate: true };
    };
  }

  private loadTrees(processRootId?: string) {
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

      if (incident.risk) {
        this.riskService.getById(incident.risk).subscribe({
          next: (risk) => {
            this.risk = risk;
            this.incidentForm3.get('riskId')?.setValue(risk.id);
          }
        });
      }

      if (incident.riskName) {
        this.selectedBP = { 
          bu: { name: incident.teamName }, 
          process: { name: incident.processName }, 
          risk: { name: incident.riskName } 
        };
      }

      this.incident = incident;
      this.selectedUser = incident.intervenantId || null;
    });
  }

  fetchTeams(): Promise<any> {
    return firstValueFrom(this.entitiesService.loadEntities().pipe(
      tap((teams) => this.listTeams = teams)
    ));
  }

  changeUser(event: any) {
    this.incidentForm3.get('intervenant')!.setValue(event.id);
  }

  private convertFormToIncident(isDraft: boolean = false): IncidentCreateDto {
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
    if (this.isFormInvalid()) return;

    const incident = this.convertFormToIncident(false);
    incident.state = State.SUBMIT;

    const request$ = this.data?.incidentId
      ? this.incidentService.updateIncident(this.data.incidentId, incident)
      : this.incidentService.saveIncident(incident);

    request$.subscribe({
      next: resp => {
        const id = this.data?.incidentId ? this.data.incidentId : resp;
        
        if (this.currentDraftId) {
          this.draftService.deleteDraft(this.currentDraftId);
        }

        this.dialogRef.close({ success: true, incidentId: id });
        this.confirmService.openConfirmDialog(
          this.data?.incidentId ? "Modification réussie" : "Création réussie",
          "Aller vers la consultation ?"
        ).subscribe(result => {
          if (result) {
            // Navigation gérée par le composant parent
          }
        });
      },
      error: err => {
        console.error("Erreur lors de la sauvegarde de l'incident", err);
      }
    });
  }

  addDraft() {
    const incident = this.convertFormToIncident(true);
    incident.state = State.DRAFT;

    if (this.data?.incidentId) {
      this.incidentService.updateIncident(this.data.incidentId, incident).subscribe({
        next: resp => {
          if (this.currentDraftId) {
            this.draftService.deleteDraft(this.currentDraftId);
          }
          this.dialogRef.close({ success: true, incidentId: this.data?.incidentId, draft: true });
        }
      });
    } else {
      this.incidentService.saveIncident(incident).subscribe({
        next: resp => {
          if (this.currentDraftId) {
            this.draftService.deleteDraft(this.currentDraftId);
          }
          this.dialogRef.close({ success: true, incidentId: resp, draft: true });
        }
      });
    }
  }

  private toInputDate(d?: string | Date | null): string | null {
    if (!d) return '';
    const date = d instanceof Date ? d : new Date(d);
    return date.toLocaleDateString('sv-SE');
  }

  compareById = (a: { id: string } | null, b: { id: string } | null) =>
    a && b ? a.id === b.id : a === b;

  selectBP(event: any) {
    this.selectedBP = event;
    this.incidentForm3.get('teamId')?.setValue(event.bu.id);
    this.incidentForm3.get('processId')?.setValue(event.process.id);
    this.incidentForm3.get('riskId')?.setValue(event.risk.id);
  }

  openBuProcessDialog() {
    const dialogRef = this.dialog.open(BuProcessAccordionComponent, {
      minWidth: '750px',
      height: '600px',
      maxHeight: '600px',
      data: {
        stopAtProcess: false
      }
    });
    dialogRef.afterClosed().subscribe(event => {
      if (event) {
        this.selectBP(event);
      }
    });
  }
}