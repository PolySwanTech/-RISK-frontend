import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, HostListener, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SelectEntitiesComponent } from "../../../shared/components/select-entities/select-entities.component";
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { EvaluationFrequency, EvaluationFrequencyLabels } from '../../../core/enum/evaluation-frequency.enum';
import { MatSelectModule } from "@angular/material/select";
import { BasePopupComponent, PopupAction } from "../../../shared/components/base-popup/base-popup.component";
import { DraftService } from '../../../core/services/draft.service';
import { EntitiesService } from '../../../core/services/entities/entities.service';

export interface EntityDialogData {
  id?: string;
  name?: string;
  lm?: boolean;
  parentId?: string;
  evaluationFrequency?: EvaluationFrequency;
  draftId?: string;
  enableDraft?: boolean; // Nouvelle propriété pour activer/désactiver les brouillons
}

@Component({
  selector: 'app-add-entity-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatCardModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    SelectEntitiesComponent,
    MatInputModule,
    MatButtonModule,
    BasePopupComponent,
    MatSelectModule
  ],
  templateUrl: './add-entity-dialog.component.html',
  styleUrls: ['./add-entity-dialog.component.scss']
})
export class AddEntityDialogComponent implements OnInit {

  private readonly COMPONENT_NAME = 'AddEntityDialog';

  titlePage: string = 'Créer une entité';
  formGroup!: FormGroup;
  popupActions: PopupAction[] = [];
  BusinessUnit: any = {};
  enableDraft: boolean = true; // Par défaut, les brouillons sont activés

  evaluationFrequencies = Object.entries(EvaluationFrequencyLabels).map(([key, label]) => ({
    id: key as EvaluationFrequency,
    libelle: label
  }));

  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<AddEntityDialogComponent>);
  private draftService = inject(DraftService);
  public entitiesService = inject(EntitiesService);

  private currentDraftId: string | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: EntityDialogData | null
  ) {
    this.BusinessUnit = data ? { id: data.parentId || null } : {};
    // Désactiver les brouillons si enableDraft est false ou si on est en mode édition sans enableDraft explicite
    this.enableDraft = data?.enableDraft ?? !data?.id;
  }

  ngOnInit(): void {
    this.initForm();

    if (this.data?.id) {
      this.titlePage = 'Modifier une entité';
      this.formGroup.patchValue({
        name: this.data.name || '',
        lm: this.data.lm || false,
        evaluationFrequency: this.data.evaluationFrequency || EvaluationFrequency.SEMESTER
      });
      this.BusinessUnit = { id: this.data.parentId || null };
    }

    // Charger le brouillon si un draftId est fourni et que les brouillons sont activés
    if (this.enableDraft && this.data?.draftId) {
      this.loadDraft(this.data.draftId);
      this.currentDraftId = this.data.draftId;
      this.draftService.hideDraft(this.data.draftId);
    }

    this.dialogRef.backdropClick().subscribe(() => {
      if (this.enableDraft && this.hasFormData()) {
        this.saveDraft();
      } else if (this.enableDraft && this.currentDraftId) {
        this.draftService.showDraft(this.currentDraftId);
      }
    });

    this.initActions();
  }

  initForm(): void {
    this.formGroup = this.fb.group({
      name: ['', Validators.required],
      lm: [false],
      parent: [null],
      evaluationFrequency: [EvaluationFrequency.SEMESTER, Validators.required]
    });
  }

  loadDraft(draftId: string): void {
    const draft = this.draftService.getDraftById(draftId);
    if (draft) {
      this.formGroup.patchValue(draft.data.formData);
      Object.assign(this.BusinessUnit, draft.data.businessUnit || {});
      this.titlePage = 'Reprendre le brouillon';
    }
  }

  getDialogRef() {
    return this.dialogRef;
  }

  initActions(): void {
    this.popupActions = [
      {
        label: 'Annuler',
        icon: 'close',
        color: 'red',
        onClick: () => this.goBack()
      },
      {
        label: this.data?.id ? 'Mettre à jour' : 'Créer',
        icon: 'check',
        primary: true,
        disabled: () => this.formGroup.invalid,
        onClick: () => this.onSave()
      }
    ];
  }

  hasFormData(): boolean {
    const formData = this.formGroup.value;
    return !!(formData.name || formData.lm || this.BusinessUnit.id);
  }

  saveDraft(): void {
    if (!this.enableDraft || !this.hasFormData()) {
      return;
    }

    const draftData = {
      formData: this.formGroup.value,
      businessUnit: this.BusinessUnit
    };

    const title = `${this.formGroup.value.name || 'Nouvelle entité'}`;

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

  goBack(): void {
    if (this.enableDraft && this.hasFormData()) {
      this.saveDraft();
    } else if (this.enableDraft && this.currentDraftId) {
      this.draftService.showDraft(this.currentDraftId);
    }

    this.dialogRef.close();
  }

  onSave(): void {
    if (this.formGroup.valid) {
      const { name, lm, evaluationFrequency } = this.formGroup.value;

      const businessUnitCreateDto: any = {
        name,
        lm,
        parentId: this.BusinessUnit.id || null,
        evaluationFrequency
      };

      if (this.data?.id) {
        businessUnitCreateDto.id = this.data.id;
      }

      // Supprimer le brouillon après sauvegarde réussie (seulement si les brouillons sont activés)
      if (this.enableDraft && this.currentDraftId) {
        this.draftService.deleteDraft(this.currentDraftId);
      }

      this.entitiesService.save(businessUnitCreateDto).subscribe({
        next: _ => {
          this.dialogRef.close(businessUnitCreateDto);
        }
      });
    }
  }

  entiteChange(event: any): void {
    this.BusinessUnit = event;
  }

  @HostListener('window:beforeunload')
  beforeUnload(): void {
    if (this.enableDraft && this.hasFormData()) {
      this.saveDraft();
    }
  }
}