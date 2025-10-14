import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatChip, MatChipListbox } from '@angular/material/chips';

import { PopupHeaderComponent } from '../../../shared/components/popup-header/popup-header.component';
import { BuProcessAccordionComponent } from '../../../shared/components/bu-process-accordion/bu-process-accordion.component';
import { SnackBarService } from '../../../core/services/snack-bar/snack-bar.service';
import { AttenuationMetricsCreateDto, AttenuationMetricsTypeDto } from '../../../core/models/AttenuationMetrics';
import { AttenuationMetricsService } from '../../../core/services/attenuationMetrics/attenuation-metrics.service';

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
    PopupHeaderComponent
  ]
})
export class CreateAttenuationMetricsComponent implements OnInit {

  private fb = inject(FormBuilder);
  private service = inject(AttenuationMetricsService);
  private snackBar = inject(SnackBarService);
  private dialog = inject(MatDialog);
  dialogRef = inject(MatDialogRef<CreateAttenuationMetricsComponent>);

  form: FormGroup = this.fb.group({
    libelle: ['', Validators.required],
    description: ['', Validators.required],
    parentType: ['', Validators.required], // Catégorie principale
    type: ['', Validators.required],       // Sous-catégorie
    riskId: ['', Validators.required],
  });

  selectedBPR: any;
  parentTypes: AttenuationMetricsTypeDto[] = [];
  childTypes: AttenuationMetricsTypeDto[] = [];

  ngOnInit(): void {
    this.loadParentTypes();
  }

  /** Charge les catégories principales (parents) */
  private loadParentTypes(): void {
    this.service.getAllType().subscribe({
      next: types => {
        this.parentTypes = types.filter(t => !t.parentCode);
      },
      error: err => this.snackBar.error("Erreur lors du chargement des catégories")
    });
  }

  /** Quand un parent est sélectionné, on charge ses enfants */
  onParentChange(parentCode: string): void {
    this.form.get('type')?.reset(); // reset du type enfant

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
        this.snackBar.success("La mesure d’atténuation a bien été ajoutée ✅");
        this.closePopup(true);
      },
      error: err => {
        this.snackBar.error(err.message || "Erreur lors de la création");
      }
    });
  }

  closePopup(refresh = false) {
    this.dialogRef.close(refresh);
  }
}
