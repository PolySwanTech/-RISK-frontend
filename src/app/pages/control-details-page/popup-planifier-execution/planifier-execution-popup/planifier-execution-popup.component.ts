import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Utilisateur } from '../../../../core/models/Utilisateur';
import { UtilisateurService } from '../../../../core/services/utilisateur/utilisateur.service';
import { Priority } from '../../../../core/enum/Priority';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Recurence } from '../../../../core/enum/recurence.enum';
import { addDays, addMonths, addWeeks } from 'date-fns';

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
  @Input() frequence!: string;
  @Input() createdAt!: Date;

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
    console.log('Frequence reçue :', this.frequence);
    this.utilisateurService.getUsers().subscribe({
      next: (users) => (this.utilisateurs = users),
      error: () => console.error('Erreur lors du chargement des utilisateurs')
    });
    const defaultDate = this.calculerDatePlanifieeParDefaut(new Date(this.controlVersion), this.frequence);
    this.form.patchValue({ plannedAt: defaultDate });
  }

  submit(): void {
    if (this.form.invalid) return;

    const { evaluator, plannedAt, priority } = this.form.value;

    this.planifier.emit({
      controlTemplateId: this.controlId,
      controlTemplateVersion: this.controlVersion,
      evaluator,
      plannedAt: new Date(plannedAt).toISOString(),
      priority
    });

    this.close.emit();
  }

  cancel(): void {
    this.close.emit();
  }

  private calculerDatePlanifieeParDefaut(date: Date, freq: string | undefined): string {
    if (!freq) return date.toISOString().substring(0, 10);

    const d = {
      DAILY: addDays(date, 1),
      WEEKLY: addWeeks(date, 1),
      MONTHLY: addMonths(date, 1),
      QUARTERLY: addMonths(date, 3),
      SEMESTERLY: addMonths(date, 6),
      YEARLY: addMonths(date, 12),
    }[freq];

    return d?.toISOString().substring(0, 10) ?? date.toISOString().substring(0, 10);
  }

}
