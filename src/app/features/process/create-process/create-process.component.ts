import { Component, Inject, inject, OnInit, HostListener } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ProcessService } from '../../../core/services/process/process.service';
import { Process } from '../../../core/models/Process';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SnackBarService } from '../../../core/services/snack-bar/snack-bar.service';
import { EntitiesService } from '../../../core/services/entities/entities.service';
import { BusinessUnit } from '../../../core/models/BusinessUnit';
import { BasePopupComponent, PopupAction } from '../../../shared/components/base-popup/base-popup.component';
import { DraftService } from '../../../core/services/draft.service';

export interface CreateProcessDialogData {
  process?: Process;
  buId?: string;
  draftId?: string;
}

@Component({
  selector: 'app-create-process',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    BasePopupComponent
  ],
  templateUrl: './create-process.component.html',
  styleUrl: './create-process.component.scss'
})
export class CreateProcessComponent implements OnInit {

  private readonly COMPONENT_NAME = 'CreateProcessDialog';

  private processService = inject(ProcessService);
  private entitiesService = inject(EntitiesService);
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CreateProcessComponent>);
  private snackBarService = inject(SnackBarService);
  private draftService = inject(DraftService);

  popupActions: PopupAction[] = [];
  private currentDraftId: string | null = null;

  processForm: FormGroup;
  businessUnits: BusinessUnit[] = [];
  processes: Process[] = [];
  isEditMode = false;
  titlePage = 'Créer un processus';
  selectedParentId: string | null = null;

  constructor(@Inject(MAT_DIALOG_DATA) public data: CreateProcessDialogData | null) {
    this.isEditMode = !!(data?.process);
    this.titlePage = this.isEditMode ? 'Modifier un processus' : 'Créer un processus';

    if (this.isEditMode && data?.process) {
      this.processForm = this.fb.group({
        name: [data.process.name, Validators.required],
      });
      this.selectedParentId = data.process.parentId || null;
    } else {
      this.processForm = this.fb.group({
        name: ['', Validators.required],
        bu: [data?.buId || null, Validators.required],
      });
    }
  }

  ngOnInit() {
    this.loadBusinessUnits().then(() => {
      // Charger le brouillon si un draftId est fourni
      if (this.data?.draftId) {
        this.loadDraft(this.data.draftId);
        this.currentDraftId = this.data.draftId;
        this.draftService.hideDraft(this.data.draftId);
      } else if (this.data?.buId && !this.isEditMode) {
        // Si un buId est fourni (ouverture depuis une BU spécifique), le pré-sélectionner
        this.processForm.get('bu')?.setValue(this.data.buId);
        this.onBuChange(this.data.buId);
      }
    });

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
      // Sauvegarder le parentId avant de patcher le formulaire
      const savedParentId = draft.data.form.parentId;

      this.processForm.patchValue(draft.data.form);

      // Recharger les processus si une BU était sélectionnée
      const buId = draft.data.form.bu || draft.data.buId;
      if (buId) {
        this.processService.getProcessLeaf(buId).subscribe(list => {
          this.processes = [...list];

          // Une fois les processus chargés, restaurer le parentId
          if (savedParentId) {
            this.selectedParentId = savedParentId;
            this.processForm.get('parentId')?.setValue(savedParentId);
          }
        });
      }
    }
  }

  private loadBusinessUnits(): Promise<void> {
    return new Promise((resolve) => {
      this.entitiesService.loadEntities().subscribe(data => {
        this.businessUnits = data;

        // Si une BU unique et pas de buId spécifique fourni
        if (this.businessUnits.length === 1 && !this.data?.buId) {
          const onlyUnit = this.businessUnits[0];
          this.processForm.get('bu')?.setValue(onlyUnit.id);
          this.onBuChange(onlyUnit.id);
        }

        // Si un buId existe déjà dans le formulaire (mais pas encore traité)
        const buId = this.processForm.get('bu')?.value;
        if (buId && !this.data?.buId) {
          this.onBuChange(buId);
        }

        resolve();
      });
    });
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
        label: this.isEditMode ? 'Mettre à jour' : 'Créer le processus',
        icon: 'check',
        primary: true,
        disabled: () => this.processForm.invalid,
        onClick: () => this.onSubmit()
      }
    ];
  }

  getDialogRef() {
    return this.dialogRef;
  }

  hasFormData(): boolean {
    const name = this.processForm.get('name')?.value;

    return !!(
      (name && name.trim() !== '')
    );
  }

  saveDraft(): void {
    if (!this.hasFormData() || this.isEditMode) {
      return; // Ne pas sauvegarder de brouillon en mode édition
    }

    const draftData = {
      form: this.processForm.value,
      buId: this.data?.buId // Sauvegarder le buId si fourni
    };

    const title = `${this.processForm.get('name')?.value || 'Nouveau processus'}`;

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

  onBuChange(buId: string) {
    this.processForm.patchValue({ parentId: null });
    this.selectedParentId = null;
    this.processes = [];
    this.processService.getProcessLeaf(buId).subscribe(list => {
      this.processes = [...list];
    });
  }

  onSubmit() {
    if (this.processForm.invalid) {
      this.processForm.markAllAsTouched();
      return;
    }

    if (this.isEditMode && this.data?.process) {
      const { name, parentId } = this.processForm.value;
      const dto = { name, parentId: parentId || null };

      this.processService.updateProcess(this.data.process.id, dto).subscribe({
        next: () => {
          this.snackBarService.success("Le processus a bien été modifié ✅");
          this.closePopup(true);
        },
        error: (err) => {
          this.snackBarService.error(err.message || "Erreur lors de la modification");
        }
      });
    } else {
      const { name, bu } = this.processForm.value;
      const dto = { name, bu };

      this.processService.createProcess(dto).subscribe({
        next: () => {
          // Supprimer le brouillon après sauvegarde réussie
          if (this.currentDraftId) {
            this.draftService.deleteDraft(this.currentDraftId);
          }

          this.snackBarService.success("Le processus a bien été créé ✅");
          this.closePopup(true);
        },
        error: (err) => {
          this.snackBarService.error(err.message || "Erreur lors de la création");
        }
      });
    }
  }

  closePopup(refresh = false) {
    if (!refresh && this.hasFormData() && !this.isEditMode) {
      this.saveDraft();
    } else if (this.currentDraftId && !refresh) {
      this.draftService.showDraft(this.currentDraftId);
    }

    this.dialogRef.close(refresh);
  }

  @HostListener('window:beforeunload')
  beforeUnload(): void {
    if (this.hasFormData() && !this.isEditMode) {
      this.saveDraft();
    }
  }
}