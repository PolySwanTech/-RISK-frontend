import { CommonModule } from '@angular/common';
import { Component, inject, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { addDays, addMonths, addWeeks } from 'date-fns';

import { Utilisateur } from '../../../../core/models/Utilisateur';
import { UtilisateurService } from '../../../../core/services/utilisateur/utilisateur.service';
import { Priority } from '../../../../core/enum/Priority';
import { ControlExecution } from '../../../../core/models/ControlExecution';
import { BasePopupComponent, PopupAction } from '../../../../shared/components/base-popup/base-popup.component';
import { EnumLabelPipe } from '../../../../shared/pipes/enum-label.pipe';

export interface PlanifierExecutionDialogData {
  controlId: string;
  controlVersion: Date;
  frequence: string;
  isEditing?: boolean;
  executionToEdit?: ControlExecution;
  lastPlannedAt?: string | Date | null;
}

@Component({
  standalone: true,
  selector: 'app-planifier-execution-popup',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    BasePopupComponent,
    EnumLabelPipe
  ],
  templateUrl: './planifier-execution-popup.component.html',
  styleUrl: './planifier-execution-popup.component.scss'
})
export class PlanifierExecutionPopupComponent {
  
  private utilisateurService = inject(UtilisateurService);
  private fb = inject(FormBuilder);
  dialogRef = inject(MatDialogRef<PlanifierExecutionPopupComponent>);

  popupActions: PopupAction[] = [];
  form: FormGroup;
  utilisateurs: Utilisateur[] = [];
  priorities = Object.values(Priority);

  // Données du dialog
  controlId: string;
  controlVersion: Date;
  frequence: string;
  isEditing: boolean;
  executionToEdit?: ControlExecution;
  lastPlannedAt?: string | Date | null;

  constructor(@Inject(MAT_DIALOG_DATA) public data: PlanifierExecutionDialogData) {
    this.controlId = data.controlId;
    this.controlVersion = data.controlVersion;
    this.frequence = data.frequence;
    this.isEditing = data.isEditing || false;
    this.executionToEdit = data.executionToEdit;
    this.lastPlannedAt = data.lastPlannedAt;

    this.form = this.fb.group({
      evaluator: [null, Validators.required],
      plannedAt: [null, Validators.required],
      priority: [Priority.MEDIUM, Validators.required]
    });
  }

  ngOnInit(): void {
    this.utilisateurService.getUsers().subscribe({
      next: (users) => {
        this.utilisateurs = users;
        this.isEditing && this.executionToEdit
          ? this.initFormForEditing()
          : this.initFormForCreation();
      },
      error: () => console.error('❌ Erreur lors du chargement des utilisateurs')
    });

    this.initActions();
  }

  initActions(): void {
    this.popupActions = [
      {
        label: 'Annuler',
        icon: 'close',
        color: 'red',
        onClick: () => this.cancel()
      },
      {
        label: this.isEditing ? 'Mettre à jour' : 'Planifier',
        icon: 'check',
        primary: true,
        disabled: () => this.form.invalid,
        onClick: () => this.submit()
      }
    ];
  }

  getDialogRef() {
    return this.dialogRef;
  }

  submit(): void {
    if (this.form.invalid) return;

    const payload = this.isEditing && this.executionToEdit
      ? this.buildEditPayload()
      : this.buildCreatePayload();

    this.dialogRef.close(payload);
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  initFormForEditing() {
    const exec = this.executionToEdit!;
    const userId = this.utilisateurs.find(u => u.username === exec.performedBy)?.id ?? null;

    this.form.patchValue({
      evaluator: userId,
      priority: exec.priority,
      plannedAt: exec.plannedAt ? this.formatDateInput(exec.plannedAt) : ''
    });

    this.form.get('plannedAt')?.disable();
  }

  formatDateInput(date: Date | string): string {
    const parsedDate = typeof date === 'string' ? new Date(date) : date;
    return parsedDate.toISOString().substring(0, 10);
  }

  initFormForCreation() {
    const base = this.lastPlannedAt ? new Date(this.lastPlannedAt) : new Date();
    const defaultDate = this.calculerDatePlanifieeParDefaut(base, this.frequence);
    this.form.patchValue({ plannedAt: defaultDate });
  }

  buildEditPayload() {
    const { evaluator, priority } = this.form.getRawValue();
    return {
      id: this.executionToEdit!.id,
      performedBy: evaluator,
      priority
    };
  }

  buildCreatePayload() {
    const { evaluator, plannedAt, priority } = this.form.getRawValue();
    const [y, m, d] = plannedAt.split('-').map(Number);
    const safe = new Date(y, m - 1, d, 12, 0, 0);
    return {
      controlTemplateId: this.controlId,
      controlTemplateVersion: this.controlVersion,
      evaluator,
      plannedAt: safe.toISOString(),
      priority
    };
  }

  private calculerDatePlanifieeParDefaut(date: Date, freq: string | undefined): string {
    if (!freq) return date.toISOString().substring(0, 10);

    const d = {
      DAILY: addDays(date, 0),
      WEEKLY: addWeeks(date, 1),
      MONTHLY: addMonths(date, 1),
      QUARTERLY: addMonths(date, 3),
      SEMESTERLY: addMonths(date, 6),
      YEARLY: addMonths(date, 12),
    }[freq];

    return d?.toISOString().substring(0, 10) ?? date.toISOString().substring(0, 10);
  }
}