import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';

import { ControlService } from '../../../core/services/control/control.service';
import { ControlMethodology, ControlMethodologyCreateDto } from '../../../core/models/ControlMethodology';
import { ControlNature, ControlNatureLabels } from '../../../core/enum/ControlNature.enum';
import { ExecutionMode, ExecutionModeLabels } from '../../../core/enum/exceutionmode.enum';


@Component({
  selector: 'app-methodology-card',
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, MatInputModule],
  templateUrl: './methodology-card.component.html',
  styleUrl: './methodology-card.component.scss'
})
export class MethodologyCardComponent implements OnInit {

  @Input({ required: true }) controlId!: string;
  @Input({ required: true }) controlVersion!: Date | string;

  loading = true;
  submitting = false;
  methodology: ControlMethodology | null = null;

  form: FormGroup;

  private fb = inject(FormBuilder);
  private controlService = inject(ControlService);

  ControlNature = ControlNature;
  ExecutionMode = ExecutionMode;

  controlNatureValues = Object.values(ControlNature)
  executionModeValues = Object.values(ExecutionMode);

  constructor() {
    this.form = this.fb.group({
      controlNature: [null as ControlNature | null, Validators.required],
      executionMode: [null as ExecutionMode | null, Validators.required],
      scope: [''],
      sampling: [''],
    });
  }

  ngOnInit(): void {
    this.controlService.getMethodology(this.controlId).subscribe({
      next: (m) => { this.methodology = m; this.loading = false; },
      error: () => { this.methodology = null; this.loading = false; },
    });
  }

  submit(): void {
    if (this.form.invalid || this.submitting) return;
    this.submitting = true;

    const versionIso =
      typeof this.controlVersion === 'string'
        ? this.controlVersion
        : this.controlVersion.toISOString();

    const payload: ControlMethodologyCreateDto = {
      controlTemplateId: this.controlId,
      controlTemplateVersion: versionIso,
      controlNature: this.form.value.controlNature,
      executionMode: this.form.value.executionMode,
      scope: this.form.value.scope || '',
      sampling: this.form.value.sampling || '',
    };

    this.controlService.createMethodology(payload).subscribe({
      next: () => {
        this.controlService.getMethodology(this.controlId).subscribe({
          next: (m) => { this.methodology = m; this.submitting = false; },
          error: () => { this.submitting = false; }
        });
      },
      error: () => { this.submitting = false; }
    });
  }

  getControlNature(n: ControlNature): string {
    return ControlNatureLabels[n]
  }

  getExecutionMode(m: ExecutionMode): string {
    return ExecutionModeLabels[m]
  }

  controlTypeLabel(t?: string): string {
    switch (t) {
      case 'PREVENTIVE': return 'Préventif';
      case 'DETECTIVE': return 'Détectif';
      case 'CORRECTIVE': return 'Correctif';
      default: return t || '—';
    }
  }
  executionModeLabel(m?: string): string {
    switch (m) {
      case 'CHECK_LIST': return 'Checklist';
      case 'TESTING': return 'Tests';
      case 'SAMPLING': return 'Échantillonnage';
      default: return m || '—';
    }
  }
}
