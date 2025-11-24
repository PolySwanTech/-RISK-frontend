import { Component, OnInit, inject, Inject, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatChip, MatChipListbox } from '@angular/material/chips';

import { BuProcessAccordionComponent } from '../../../shared/components/bu-process-accordion/bu-process-accordion.component';
import { SnackBarService } from '../../../core/services/snack-bar/snack-bar.service';
import { AttenuationMetricsCreateDto, AttenuationMetricsTypeDto } from '../../../core/models/AttenuationMetrics';
import { AttenuationMetricsService } from '../../../core/services/dmr/attenuationMetrics/attenuation-metrics.service';
import { BasePopupComponent, PopupAction } from '../../../shared/components/base-popup/base-popup.component';
import { DraftService } from '../../../core/services/draft.service';

export interface CreateAttenuationMetricsDialogData {
  draftId?: string;
}

@Component({
  selector: 'app-create-attenuation-metrics',
  standalone: true,
  templateUrl: './create-attenuation-metrics.component.html',
  styleUrls: ['./create-attenuation-metrics.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipListbox,
    MatChip,
    BasePopupComponent
  ]
})
export class CreateAttenuationMetricsComponent implements OnInit {

  private readonly COMPONENT_NAME = 'CreateAttenuationMetricsDialog';

  private fb = inject(FormBuilder);
  private service = inject(AttenuationMetricsService);
  private snackBar = inject(SnackBarService);
  private dialog = inject(MatDialog);
  private draftService = inject(DraftService);
  dialogRef = inject(MatDialogRef<CreateAttenuationMetricsComponent>);

  popupActions: PopupAction[] = [];
  private currentDraftId: string | null = null;

  form: FormGroup = this.fb.group({
    libelle: ['', Validators.required],
    description: ['', Validators.required],
    parentType: ['', Validators.required],
    type: ['', Validators.required],
    riskId: ['', Validators.required],
  });

  selectedBPR: any;
  parentTypes: AttenuationMetricsTypeDto[] = [];
  childTypes: AttenuationMetricsTypeDto[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: CreateAttenuationMetricsDialogData | null) { }

  ngOnInit(): void {
    // Charger d'abord les parentTypes, puis restaurer le brouillon si nécessaire
    this.loadParentTypes().then(() => {
      // Charger le brouillon si un draftId est fourni
      if (this.data?.draftId) {
        this.loadDraft(this.data.draftId);
        this.currentDraftId = this.data.draftId;
        this.draftService.hideDraft(this.data.draftId);
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
      // D'abord patcher les valeurs du formulaire
      this.form.patchValue(draft.data.form);
      this.selectedBPR = draft.data.selectedBPR;
      
      // Ensuite recharger les childTypes si un parentType est présent
      if (draft.data.form.parentType) {
        this.service.getTypeByParent(draft.data.form.parentType).subscribe({
          next: children => {
            this.childTypes = children;
            // Une fois les childTypes chargés, patcher à nouveau le type pour être sûr
            if (draft.data.form.type) {
              this.form.get('type')?.setValue(draft.data.form.type);
            }
          },
          error: err => this.snackBar.error("Erreur lors du chargement des sous-catégories")
        });
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
        label: 'Créer la Mesure',
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
    const libelle = this.form.get('libelle')?.value;
    const description = this.form.get('description')?.value;
    
    return !!(
      (libelle && libelle.trim() !== '') ||
      (description && description.trim() !== '') ||
      this.selectedBPR ||
      this.form.get('parentType')?.value ||
      this.form.get('type')?.value
    );
  }

  saveDraft(): void {
    if (!this.hasFormData()) {
      return;
    }

    const draftData = {
      form: this.form.value,
      selectedBPR: this.selectedBPR
    };

    const title = `${this.form.get('libelle')?.value || 'Nouvelle mesure d\'atténuation'}`;

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

  /** Charge les catégories principales (parents) */
  private loadParentTypes(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.service.getAllType().subscribe({
        next: types => {
          this.parentTypes = types.filter(t => !t.parentCode);
          resolve();
        },
        error: err => {
          this.snackBar.error("Erreur lors du chargement des catégories");
          reject(err);
        }
      });
    });
  }

  /** Quand un parent est sélectionné, on charge ses enfants */
  onParentChange(parentCode: string): void {
    this.form.get('type')?.reset();

    this.service.getTypeByParent(parentCode).subscribe({
      next: children => {
        this.childTypes = children;
      },
      error: err => this.snackBar.error("Erreur lors du chargement des sous-catégories")
    });
  }

  /** Ouvre le sélecteur BU / Processus / Risque */
  create() {
    const dialogRef = this.dialog.open(BuProcessAccordionComponent, {
      minWidth: '750px',
      height: '600px',
      maxHeight: '600px',
    });

    dialogRef.afterClosed().subscribe(event => {
      if (event) this.selectBPR(event);
    });
  }

  selectBPR(event: any) {
    this.selectedBPR = event;
    this.form.get('riskId')?.setValue(event.risk.id);
  }

  /** Soumission du formulaire */
  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: AttenuationMetricsCreateDto = {
      libelle: this.form.value.libelle,
      description: this.form.value.description,
      type: this.form.value.type,
      riskId: this.form.value.riskId,
    };

    this.service.create(payload).subscribe({
      next: () => {
        // Supprimer le brouillon après sauvegarde réussie
        if (this.currentDraftId) {
          this.draftService.deleteDraft(this.currentDraftId);
        }

        this.snackBar.success("La mesure d'atténuation a bien été ajoutée ✅");
        this.closePopup(true);
      },
      error: err => {
        this.snackBar.error(err.message || "Erreur lors de la création");
      }
    });
  }

  closePopup(refresh = false) {
    if (!refresh && this.hasFormData()) {
      this.saveDraft();
    } else if (this.currentDraftId && !refresh) {
      this.draftService.showDraft(this.currentDraftId);
    }

    this.dialogRef.close(refresh);
  }

  @HostListener('window:beforeunload')
  beforeUnload(): void {
    if (this.hasFormData()) {
      this.saveDraft();
    }
  }
}