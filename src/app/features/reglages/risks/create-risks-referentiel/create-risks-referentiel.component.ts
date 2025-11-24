import { Component, inject, Inject, OnInit, HostListener } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule, MatChipListbox } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BaloiseCategoryDto, RiskReferentielCreateDto } from '../../../../core/models/RiskReferentiel';
import { BasePopupComponent, PopupAction } from '../../../../shared/components/base-popup/base-popup.component';
import { RiskReferentielService } from '../../../../core/services/risk/risk-referentiel.service';
import { SnackBarService } from '../../../../core/services/snack-bar/snack-bar.service';
import { DraftService } from '../../../../core/services/draft.service';
import { SelectRiskEventComponent } from '../../../../shared/components/select-risk-event/select-risk-event.component';
import { RiskSelectionMode } from '../../../../core/enum/risk-enum';

export interface CreateRiskReferentielDialogData {
  riskId?: string;
  draftId?: string;
  baloisPreselected?: BaloiseCategoryDto;
}

@Component({
  selector: 'app-create-risks-referentiel-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgIf,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatChipsModule,
    MatChipListbox,
    MatIconModule,
    MatTooltipModule,
    BasePopupComponent
  ],
  templateUrl: './create-risks-referentiel.component.html',
  styleUrl: './create-risks-referentiel.component.scss'
})
export class CreateRisksReferentielComponent implements OnInit {

  private readonly COMPONENT_NAME = 'CreateRiskReferentielDialog';

  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private dialogRef = inject(MatDialogRef<CreateRisksReferentielComponent>);
  private riskReferentielSrv = inject(RiskReferentielService);
  private snackBarService = inject(SnackBarService);
  private draftService = inject(DraftService);

  balois: BaloiseCategoryDto | null = null;
  isBaloisPreselected = false;
  popupActions: PopupAction[] = [];

  private currentDraftId: string | null = null;

  infoForm = this.fb.group({
    libellePerso: this.fb.nonNullable.control<string>('', Validators.required),
    balois: this.fb.nonNullable.control<BaloiseCategoryDto | null>(null, Validators.required),
    description: this.fb.nonNullable.control<string>(''),
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: CreateRiskReferentielDialogData) { }

  ngOnInit(): void {
    // Charger le brouillon si un draftId est fourni
    if (this.data?.draftId) {
      this.loadDraft(this.data.draftId);
      this.currentDraftId = this.data.draftId;
      this.draftService.hideDraft(this.data.draftId);
    }

    // Charger la catégorie Bâloise présélectionnée
    if (this.data?.baloisPreselected) {
      this.balois = this.data.baloisPreselected;
      this.infoForm.get('balois')?.setValue(this.balois);
      this.isBaloisPreselected = true;
    }

    // Charger le risque existant pour modification
    if (this.data?.riskId) {
      this.loadRiskById(this.data.riskId);
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
      const data = draft.data;
      this.infoForm.patchValue({
        libellePerso: data.libellePerso || '',
        balois: data.balois || null,
        description: data.description || ''
      });
      if (data.balois) {
        this.balois = data.balois;
      }
    }
  }

  private loadRiskById(id: string): void {
    this.riskReferentielSrv.getById(id).subscribe(risk => {
      this.infoForm.patchValue({
        libellePerso: risk.libelle,
        balois: risk.category ?? null,
        description: risk.description,
      });
      if (risk.category) {
        this.balois = risk.category;
      }
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
        label: this.data?.riskId ? 'Mettre à jour' : 'Soumettre',
        icon: 'check',
        primary: true,
        disabled: () => this.infoForm.invalid,
        onClick: () => this.submit()
      }
    ];
  }

  getDialogRef() {
    return this.dialogRef;
  }

  hasFormData(): boolean {
    const values = this.infoForm.value;
    return !!(
      values.libellePerso?.trim() ||
      values.balois ||
      values.description?.trim()
    );
  }

  saveDraft(): void {
    if (!this.hasFormData()) {
      return;
    }

    const draftData = {
      libellePerso: this.infoForm.get('libellePerso')?.value || '',
      balois: this.balois,
      description: this.infoForm.get('description')?.value || ''
    };

    const title = draftData.libellePerso
      ? `Risque: ${draftData.libellePerso}`
      : 'Nouveau risque référentiel';

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

  closePopup() {
    if (this.hasFormData()) {
      this.saveDraft();
    } else if (this.currentDraftId) {
      this.draftService.showDraft(this.currentDraftId);
    }

    this.dialogRef.close();
  }

  openSubCategorySelector(): void {
    const dialogRef = this.dialog.open(SelectRiskEventComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-container',
      data: { mode: RiskSelectionMode.CategoryLevel2, hideNavigationToggle: true }
    });

    dialogRef.afterClosed().subscribe(subcategory => {
      if (subcategory) {
        this.balois = subcategory;
        this.infoForm.get('balois')?.setValue(subcategory);
      }
    });
  }

  submit(): void {
    if (this.infoForm.invalid) {
      this.snackBarService.error('Formulaire invalide');
      return;
    }

    const category = this.infoForm.get('balois')?.value;

    if (!category) {
      this.snackBarService.error('Catégorie Bâloise obligatoire');
      return;
    }

    const payload: RiskReferentielCreateDto = {
      libelle: this.infoForm.get('libellePerso')!.value!,
      category: category!.libelle,
      description: this.infoForm.get('description')!.value!,
    };

    this.riskReferentielSrv.create(payload).subscribe({
      next: (risk) => {
        this.snackBarService.info('Risque référentiel créé avec succès');

        if (this.currentDraftId) {
          this.draftService.deleteDraft(this.currentDraftId);
        }

        this.dialogRef.close(risk);
      },
      error: (err) => {
        this.snackBarService.error('Erreur lors de la création du risque');
        console.error(err);
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