import { Component, inject, Inject, OnInit, HostListener } from '@angular/core';
import { ActionPlanService } from '../../../core/services/action-plan/action-plan.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Action } from '../../../core/models/ActionPlan';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SnackBarService } from '../../../core/services/snack-bar/snack-bar.service';
import { BasePopupComponent, PopupAction } from '../../../shared/components/base-popup/base-popup.component';
import { DraftService } from '../../../core/services/draft.service';

export interface AddActionDialogData {
  actionPlanId: string;
  draftId?: string;
}

@Component({
  selector: 'app-add-action-dialog',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatTooltipModule,
    BasePopupComponent
  ],
  templateUrl: './add-action-dialog.component.html',
  styleUrl: './add-action-dialog.component.scss'
})
export class AddActionDialogComponent implements OnInit {

  private readonly COMPONENT_NAME = 'AddActionDialog';

  private actionPlanService = inject(ActionPlanService);
  private snackBarService = inject(SnackBarService);
  private dialogRef = inject(MatDialogRef<AddActionDialogComponent>);
  private draftService = inject(DraftService);

  actions: Action[] = [];
  popupActions: PopupAction[] = [];
  
  private currentDraftId: string | null = null;

  constructor(@Inject(MAT_DIALOG_DATA) public data: AddActionDialogData) { }

  ngOnInit(): void {
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

  loadDraft(draftId: string): void {
    const draft = this.draftService.getDraftById(draftId);
    if (draft) {
      this.actions = draft.data.actions || [];
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
        label: 'Enregistrer',
        icon: 'check',
        primary: true,
        disabled: () => this.isFormInvalid(),
        onClick: () => this.save()
      }
    ];
  }

  getDialogRef() {
    return this.dialogRef;
  }

  hasFormData(): boolean {
    return this.actions.length > 0 && this.actions.some(a => a.name && a.name.trim() !== '');
  }

  saveDraft(): void {
    if (!this.hasFormData()) {
      return;
    }

    const draftData = {
      actions: this.actions,
      actionPlanId: this.data.actionPlanId
    };

    const actionCount = this.actions.filter(a => a.name && a.name.trim() !== '').length;
    const title = `${actionCount} action${actionCount > 1 ? 's' : ''} à ajouter`;

    // Si on édite un brouillon existant, on le met à jour
    if (this.currentDraftId) {
      this.draftService.updateDraft(
        this.currentDraftId,
        title,
        draftData,
        true
      );
    } else {
      // Sinon on crée un nouveau brouillon
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

  save() {
    if (this.isFormInvalid()) return;

    this.actionPlanService.addActions(this.actions, this.data.actionPlanId).subscribe({
      next: (action) => {
        this.snackBarService.info("Action(s) ajoutée(s) avec succès");
        
        // Supprimer le brouillon après sauvegarde réussie
        if (this.currentDraftId) {
          this.draftService.deleteDraft(this.currentDraftId);
        }
        
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.snackBarService.error("Erreur lors de l'ajout des actions");
        this.dialogRef.close(false);
      }
    });
  }

  addAction() {
    this.actions.push(new Action('', '', new Date(), '', '', ''));
  }

  removeAction(index: number) {
    this.actions.splice(index, 1);
  }

  isFormInvalid(): boolean {
    return (
      this.actions.length === 0 ||
      this.actions.every(a => !a.name || a.name.trim() === '')
    );
  }

  @HostListener('window:beforeunload')
  beforeUnload(): void {
    if (this.hasFormData()) {
      this.saveDraft();
    }
  }
}