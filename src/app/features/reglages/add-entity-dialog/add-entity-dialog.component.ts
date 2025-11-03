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

export interface EntityDialogData {
  id?: string;
  draftId?: string; // ID du brouillon à restaurer
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

  private _formBuilder = inject(FormBuilder);
  evaluationFrequencies = Object.entries(EvaluationFrequencyLabels).map(([key, label]) => ({
  id: key as EvaluationFrequency,
  libelle: label
}));

  BusinessUnit = new BusinessUnit("", '', false, [], []);
  private readonly COMPONENT_NAME = 'AddEntityDialog';

  titlePage: string = 'Créer une entité';
  formGroup!: FormGroup;
  popupActions: PopupAction[] = [];
  BusinessUnit: any = {};

  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<AddEntityDialogComponent>);
  private draftService = inject(DraftService);

  // Stocke l'ID du brouillon en cours d'édition (si applicable)
  private currentDraftId: string | null = null;

  constructor(public dialogRef: MatDialogRef<AddEntityDialogComponent>, public entitiesService : EntitiesService,
    @Inject(MAT_DIALOG_DATA) public data: EntityDialogData | any, private cdRef: ChangeDetectorRef
  ) {
    this.BusinessUnit = data || new BusinessUnit("", '', false, [], []);
  }

  ngOnInit(): void {
    this.initForm();

    if (this.data?.id) {
    this.titlePage = 'Modifier une entité';
    this.formGroup.patchValue({
      name: this.data.name || '',
      lm: this.data.lm || false
    });
    this.BusinessUnit = { id: this.data.parentId || null };
  }

    // Charger le brouillon si un draftId est fourni
    if (this.data?.draftId) {
      this.loadDraft(this.data.draftId);
      this.currentDraftId = this.data.draftId;
      // Cacher ce brouillon pendant l'édition
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

  initForm(): void {
    this.formGroup = this.fb.group({
      name: ['', Validators.required],
      lm: [false],
      parent: [null],
    evaluationFrequency: [EvaluationFrequency.SEMESTER, Validators.required]
    });
  }

  onSave(): void {
    this.BusinessUnit.name = this.formGroup.get('name')?.value;
    this.BusinessUnit.lm = this.formGroup.get('lm')?.value;
    this.BusinessUnit.parentId = this.formGroup.get('parent')?.value;
    this.BusinessUnit.evaluationFrequency = this.formGroup.get('evaluationFrequency')?.value;
    this.dialogRef.close(this.BusinessUnit);
}
  loadDraft(draftId: string): void {
    const draft = this.draftService.getDraftById(draftId);
    if (draft) {
      this.formGroup.patchValue(draft.data.formData);
      Object.assign(this.BusinessUnit, draft.data.businessUnit || {});
      console.log(this.BusinessUnit)
      this.titlePage = 'Reprendre le brouillon';
      console.log('Brouillon restauré:', draft);
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
    return !!(formData.name || formData.lm || this.BusinessUnit.parentId);
  }

  saveDraft(): void {
    if (!this.hasFormData()) {
      return;
    }

    const draftData = {
      formData: this.formGroup.value,
      businessUnit: this.BusinessUnit
    };

    const title = `${this.formGroup.value.name || 'Nouvelle entité'}`;

    // Si on édite un brouillon existant, on le met à jour
    if (this.currentDraftId) {
      this.draftService.updateDraft(
        this.currentDraftId,
        title,
        draftData,
        true // visible = true
      );
    } else {
      // Sinon on crée un nouveau brouillon
      this.currentDraftId = this.draftService.createDraft(
        this.COMPONENT_NAME,
        title,
        draftData,
        true // visible = true
      );
    }
  }

  goBack(): void {
    if (this.hasFormData()) {
      this.saveDraft();
    } else if (this.currentDraftId) {
      // Si on ferme sans données mais qu'on avait un brouillon, le réafficher
      this.draftService.showDraft(this.currentDraftId);
    }

    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  onSave(): void {
  if (this.formGroup.valid) {
    const { name, lm } = this.formGroup.value;

    const businessUnitCreateDto: any = {
      name,
      lm,
      parentId: this.BusinessUnit.id || null
    };

    // 👉 Ajout de l'ID si c’est une modification
    if (this.data?.id) {
      businessUnitCreateDto.id = this.data.id;
    }

    console.log('Saving DTO:', businessUnitCreateDto);

    // Supprimer le brouillon après sauvegarde réussie
    if (this.currentDraftId) {
      this.draftService.deleteDraft(this.currentDraftId);
    }

    this.dialogRef.close(businessUnitCreateDto);
  }
}

  entiteChange(event: any): void {
    console.log('Entity changed:', event);
    this.BusinessUnit = event;
  }

  @HostListener('window:beforeunload')
  beforeUnload(): void {
    if (this.hasFormData()) {
      this.saveDraft();
    }
  }
}