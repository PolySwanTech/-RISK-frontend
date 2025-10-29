import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Utilisateur } from '../../../../core/models/Utilisateur';
import { UtilisateurService } from '../../../../core/services/utilisateur/utilisateur.service';
import { Priority } from '../../../../core/enum/Priority';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { addDays, addMonths, addWeeks } from 'date-fns';
import { ControlExecution } from '../../../../core/models/dmr/ControlExecution';
import { Range } from '../../../../core/models/range';

@Component({
  standalone: true,
  selector: 'app-planifier-execution-popup',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatSelectModule,
    MatFormFieldModule,
    MatInputModule],
  templateUrl: './planifier-execution-popup.component.html',
  styleUrl: './planifier-execution-popup.component.scss'
})
export class PlanifierExecutionPopupComponent {
  @Input() controlId!: string;
  @Input() controlVersion!: Date;
  @Output() close = new EventEmitter<void>();
  @Output() planifier = new EventEmitter<any>();
  @Input() frequence!: Range;
  @Input() isEditing = false;
  @Input() executionToEdit?: ControlExecution;
  @Input() lastPlannedAt?: string | Date | null;

  form: FormGroup;
  utilisateurs: Utilisateur[] = [];
  priorities = Object.values(Priority);

  private utilisateurService = inject(UtilisateurService);

  constructor(private fb: FormBuilder) {
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
  }

  submit(): void {
    if (this.form.invalid) return;

    this.isEditing && this.executionToEdit
      ? this.emitEditPayload()
      : this.emitCreatePayload();

    this.close.emit();
  }

  cancel(): void {
    this.close.emit();
  }

  initFormForEditing() {
    const exec = this.executionToEdit!;
    const userId = this.utilisateurs.find(u => u.username === exec.performedById) ?? null;

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

  emitEditPayload() {
    const { evaluator, priority } = this.form.getRawValue();
    this.planifier.emit({
      id: this.executionToEdit!.id,
      performedBy: evaluator,
      priority
    });
  }

  emitCreatePayload() {
    const { evaluator, plannedAt, priority } = this.form.getRawValue();
    const [y, m, d] = plannedAt.split('-').map(Number);
    const safe = new Date(y, m - 1, d, 12, 0, 0);
    this.planifier.emit({
      controlTemplateId: this.controlId,
      controlTemplateVersion: this.controlVersion,
      evaluator,
      plannedAt: safe.toISOString(),
      priority
    });
  }


  private calculerDatePlanifieeParDefaut(date: Date, freq: Range): string {
    if (!freq) return date.toISOString().substring(0, 10);

    const d = {
      DAILY: addDays(date, 0),
      WEEKLY: addWeeks(date, 1),
      MONTHLY: addMonths(date, 1),
      QUARTERLY: addMonths(date, 3),
      SEMESTERLY: addMonths(date, 6),
      YEARLY: addMonths(date, 12),
    }[freq.id];

    return d?.toISOString().substring(0, 10) ?? date.toISOString().substring(0, 10);
  }

}