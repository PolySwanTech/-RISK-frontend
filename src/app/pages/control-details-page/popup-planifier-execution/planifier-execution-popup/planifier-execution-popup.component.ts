import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Utilisateur } from '../../../../core/models/Utilisateur';
import { UtilisateurService } from '../../../../core/services/utilisateur/utilisateur.service';
import { Priority } from '../../../../core/enum/Priority';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

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
      next: (users) => (this.utilisateurs = users),
      error: () => console.error('Erreur lors du chargement des utilisateurs')
    });
  }

  submit(): void {
    if (this.form.valid) {
      const plannedAtRaw = this.form.value.plannedAt;
      const plannedAt = new Date(plannedAtRaw).toISOString(); // conversion ISO Instant

      const payload = {
        controlTemplateId: this.controlId,
        controlTemplateVersion: this.controlVersion,
        evaluator: this.form.value.evaluator,
        plannedAt: plannedAt,
        priority: this.form.value.priority
      };

      console.log('[Payload envoyé]', payload);
      this.planifier.emit(payload);
      this.close.emit();
    }
  }

  cancel(): void {
    this.close.emit();
  }
}
