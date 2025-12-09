import { Component, OnInit, inject, Inject, Optional, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatChip, MatChipListbox } from '@angular/material/chips';
import { BasePopupComponent, PopupAction } from '../../../../shared/components/base-popup/base-popup.component';
import { SelectArborescenceComponent } from '../../../../shared/components/select-arborescence/select-arborescence.component';
import { RiskService } from '../../../../core/services/risk/risk.service';
import { ProcessService } from '../../../../core/services/process/process.service';
import { RiskReferentielService } from '../../../../core/services/risk/risk-referentiel.service';
import { SnackBarService } from '../../../../core/services/snack-bar/snack-bar.service';
import { DraftService } from '../../../../core/services/draft.service';
import { RiskTemplate, RiskTemplateCreateDto } from '../../../../core/models/RiskTemplate';
import { Process } from '../../../../core/models/Process';
import { SelectRiskEventComponent } from '../../../../shared/components/select-risk-event/select-risk-event.component';
import { RiskSelectionMode } from '../../../../core/enum/risk-enum';

export interface CreateRiskEventDialogData {
  processId?: string;
  buId?: string;
  riskReferentielId?: string;
  libelle?: string;
  redirect?: string;
  draftId?: string;
}

@Component({
  selector: 'app-create-risk-event',
  standalone: true,
  templateUrl: './create-risks.component.html',
  styleUrls: ['./create-risks.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipListbox,
    MatChip,
    BasePopupComponent,
    SelectArborescenceComponent
  ]
})
export class CreateRisksComponent implements OnInit {
  private readonly COMPONENT_NAME = 'CreateRisksComponent';
  private fb = inject(FormBuilder);
  private riskSrv = inject(RiskService);
  private procSrv = inject(ProcessService);
  private riskRefSrv = inject(RiskReferentielService);
  private snackBar = inject(SnackBarService);
  private dialog = inject(MatDialog);
  private draftService = inject(DraftService);

  dialogRef = inject(MatDialogRef<CreateRisksComponent>);
  popupActions: PopupAction[] = [];
  private currentDraftId: string | null = null;

  form: FormGroup = this.fb.group({
    libellePerso: ['', Validators.required],
    parentRisk: ['', Validators.required],
    processId: ['', Validators.required],
    description: [''],
  });

  risk: RiskTemplate | null = null;
  listProcess: Process[] = [];
  pageTitle = 'Créer un événement de risque';

  constructor(@Optional() @Inject(MAT_DIALOG_DATA) public data: CreateRiskEventDialogData | null) {}

  ngOnInit(): void {
    this.initActions();
    this.loadProcesses();
    this.restoreFromDataOrDraft();
    this.setupDraftHandling();
  }

  private restoreFromDataOrDraft(): void {
    if (this.data?.draftId) {
      this.loadDraft(this.data.draftId);
      this.currentDraftId = this.data.draftId;
      this.draftService.hideDraft(this.data.draftId);
    } else if (this.data) {
      this.form.patchValue({
        libellePerso: this.data.libelle || '',
        parentRisk: this.data.riskReferentielId || '',
        processId: this.data.processId || '',
      });
      if (this.data.riskReferentielId) {
        this.loadRiskReferentiel(this.data.riskReferentielId);
      }
    }
  }

  private loadProcesses(): void {
    if (this.data?.buId) {
      this.procSrv.getProcessTree(this.data.buId).subscribe(list => {
        this.listProcess = list;
      });
    }
  }

  private loadRiskReferentiel(id: string): void {
    this.riskRefSrv.getById(id).subscribe(ref => {
      this.risk = new RiskTemplate({ riskReferentiel: ref });
    });
  }

  loadDraft(draftId: string): void {
    const draft = this.draftService.getDraftById(draftId);
    if (draft) {
      this.form.patchValue(draft.data.form);
      this.risk = draft.data.risk || null;
      if (draft.data.form.processId && this.data?.buId) {
        this.loadProcesses();
      }
      if (draft.data.form.parentRisk) {
        this.loadRiskReferentiel(draft.data.form.parentRisk);
      }
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
        label: 'Créer',
        icon: 'check',
        primary: true,
        disabled: () => this.form.invalid || !this.risk,
        onClick: () => this.onSubmit()
      }
    ];
  }

  getDialogRef() {
    return this.dialogRef;
  }

  hasFormData(): boolean {
    const values = this.form.value;
    return !!(
      values.libellePerso?.trim() ||
      values.description?.trim() ||
      values.parentRisk ||
      this.risk
    );
  }

  saveDraft(): void {
    if (!this.hasFormData()) return;

    const draftData = {
      form: this.form.value,
      risk: this.risk
    };
    const title = `${this.form.get('libellePerso')?.value || 'Nouvel événement de risque'}`;

    if (this.currentDraftId) {
      this.draftService.updateDraft(this.currentDraftId, title, draftData, true);
    } else {
      this.currentDraftId = this.draftService.createDraft(this.COMPONENT_NAME, title, draftData, true);
    }
  }

  onProcessSelected(process: Process) {
    this.form.get('processId')?.setValue(process.id);
  }

  openRiskEventDialog() {
    const dialogRef = this.dialog.open(SelectRiskEventComponent, {
      minWidth: '700px',
      height: '550px',
      data: {
        mode: RiskSelectionMode.Taxonomie,
        processId: this.form.get('processId')?.value,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadRiskReferentiel(result.id);
        this.form.get('parentRisk')?.setValue(result.id);
      }
    });
  }

  onSubmit() {
    if (this.form.invalid || !this.risk) return;

    const payload: RiskTemplateCreateDto = {
      libelle: this.form.value.libellePerso,
      processId: this.form.value.processId,
      riskReferentielId: this.form.value.parentRisk,
      description: this.form.value.description || null,
    };

    this.riskSrv.save(payload).subscribe({
      next: (riskId) => {
        if (this.currentDraftId) {
          this.draftService.deleteDraft(this.currentDraftId);
        }
        this.snackBar.success('Événement de risque créé avec succès');
        this.closePopup({ createdEventId: riskId, libelle: this.form.value.libellePerso });
      },
      error: (err) => this.snackBar.error(err.message || 'Erreur lors de la création')
    });
  }

  closePopup(result: boolean | { createdEventId: string | RiskTemplate; libelle?: string } = false) {
    if (result === false && this.hasFormData()) {
      this.saveDraft();
    } else if (this.currentDraftId && result === false) {
      this.draftService.showDraft(this.currentDraftId);
    }
    this.dialogRef.close(result);
  }

  private setupDraftHandling(): void {
    this.dialogRef.backdropClick().subscribe(() => {
      if (this.hasFormData()) this.saveDraft();
      else if (this.currentDraftId) this.draftService.showDraft(this.currentDraftId);
    });
  }

  @HostListener('window:beforeunload')
  beforeUnload(): void {
    if (this.hasFormData()) this.saveDraft();
  }
}