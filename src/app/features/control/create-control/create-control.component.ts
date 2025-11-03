import { SnackBarService } from './../../../core/services/snack-bar/snack-bar.service';
import { Component, inject, HostListener, Inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { EntitiesService } from '../../../core/services/entities/entities.service';
import { ProcessService } from '../../../core/services/process/process.service';
import { RiskService } from '../../../core/services/risk/risk.service';
import { UtilisateurService } from '../../../core/services/utilisateur/utilisateur.service';
import { ControlTemplateCreateDto } from '../../../core/models/ControlTemplate';
import { ControlService } from '../../../core/services/dmr/control/control.service';
import { Degree } from '../../../core/enum/degree.enum';
import { Priority } from '../../../core/enum/Priority';
import { Recurrence } from '../../../core/enum/recurrence.enum';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmService } from '../../../core/services/confirm/confirm.service';
import { Type } from '../../../core/enum/controltype.enum';
import { MatIconModule } from '@angular/material/icon';
import { BuProcessAccordionComponent } from '../../../shared/components/bu-process-accordion/bu-process-accordion.component';
import { MatChipListbox, MatChip } from "@angular/material/chips";
import { EnumLabelPipe } from '../../../shared/pipes/enum-label.pipe';
import { BasePopupComponent, PopupAction } from '../../../shared/components/base-popup/base-popup.component';
import { DraftService } from '../../../core/services/draft.service';

export interface CreateControlDialogData {
  draftId?: string;
}

@Component({
  selector: 'app-create-control',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatChipListbox,
    MatChip,
    EnumLabelPipe,
    BasePopupComponent
  ],
  templateUrl: './create-control.component.html',
  styleUrl: './create-control.component.scss'
})
export class CreateControlComponent {

  private readonly COMPONENT_NAME = 'CreateControlDialog';

  riskService = inject(RiskService);
  buService = inject(EntitiesService);
  processService = inject(ProcessService);
  userService = inject(UtilisateurService);
  controlService = inject(ControlService);
  dialogRef = inject(MatDialogRef<CreateControlComponent>);
  confirmService = inject(ConfirmService);
  snackBarService = inject(SnackBarService);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private draftService = inject(DraftService);

  popupActions: PopupAction[] = [];
  private currentDraftId: string | null = null;

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
  recurences = Object.values(Recurrence);

  selectedBPR: any;

  get buIdValue() {
    return this.form.get('buId')?.value;
  }

  responsables$ = this.userService.getUsers();

  constructor(@Inject(MAT_DIALOG_DATA) public data: CreateControlDialogData | null) { }

  ngOnInit() {
    // Charger le brouillon si un draftId est fourni
    if (this.data?.draftId) {
      this.loadDraft(this.data.draftId);
      this.currentDraftId = this.data.draftId;
      this.draftService.hideDraft(this.data.draftId);
    }

    this.dialogRef.backdropClick().subscribe(() => {
      if (this.hasFormData()) {
        this.saveDraft();
      } else if (this.currentDraftId) {
        this.draftService.showDraft(this.currentDraftId);
      }
    });

    this.initActions();
  }

  loadDraft(draftId: string): void {
    const draft = this.draftService.getDraftById(draftId);
    if (draft) {
      this.form.patchValue(draft.data.form);
      this.selectedBPR = draft.data.selectedBPR;
      console.log('Brouillon de contrôle restauré:', draft);
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
        label: 'Créer le Contrôle',
        icon: 'check',
        primary: true,
        disabled: () => this.form.invalid,
        onClick: () => this.onSubmit()
      }
    ];
  }

  getDialogRef() {
    return this.dialogRef;
  }

  hasFormData(): boolean {
  // Vérifie si au moins un champ du formulaire est rempli
  const formValue = this.form.value;
  const hasFormFields = Object.values(formValue).some(value => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim() !== '';
    return true; // si c’est un objet ou une valeur numérique
  });

  // Vérifie aussi si un BPR a été sélectionné
  const hasSelectedBPR = !!this.selectedBPR;

  return hasFormFields || hasSelectedBPR;
}

  saveDraft(): void {
    if (!this.hasFormData()) {
      return;
    }

    const draftData = {
      form: this.form.value,
      selectedBPR: this.selectedBPR
    };

    const title = `${this.form.get('libelle')?.value || 'Nouveau contrôle'}`;

    if (this.currentDraftId) {
      this.draftService.updateDraft(
        this.currentDraftId,
        title,
        draftData,
        true
      );
    } else {
      this.currentDraftId = this.draftService.createDraft(
        this.COMPONENT_NAME,
        title,
        draftData,
        true
      );
    }
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

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
        // Supprimer le brouillon après sauvegarde réussie
        if (this.currentDraftId) {
          this.draftService.deleteDraft(this.currentDraftId);
        }

        this.snackBarService.success("Le contrôle a bien été ajouté");
        this.dialogRef.close();
      },
      error: err => {
        this.snackBarService.error(err.message);
      }
    });
  }

  closePopup() {
    if (this.hasFormData()) {
      this.saveDraft();
    } else if (this.currentDraftId) {
      this.draftService.showDraft(this.currentDraftId);
    }

    this.dialogRef.close();
  }

  trackById = (index: number, item: { id: string }) => item.id;

  selectBPR(event: any) {
    this.selectedBPR = event;
    this.form.get('buId')?.setValue(event.bu.id);
    this.form.get('processId')?.setValue(event.process.id);
    this.form.get('riskId')?.setValue(event.risk.id);
  }

  create() {
    const dialogRef = this.dialog.open(BuProcessAccordionComponent, {
      minWidth: '750px',
      height: '600px',
      maxHeight: '600px',
    });

    dialogRef.afterClosed().subscribe(event => {
      if (event) {
        this.selectBPR(event);
      }
    });
  }

  @HostListener('window:beforeunload')
  beforeUnload(): void {
    if (this.hasFormData()) {
      this.saveDraft();
    }
  }
}