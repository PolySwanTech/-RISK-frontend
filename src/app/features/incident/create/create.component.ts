import { Component, inject, signal } from '@angular/core';
import { GoBackComponent } from "../../../shared/components/go-back/go-back.component";
import { MatButtonModule } from '@angular/material/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { merge } from 'rxjs';
import { IncidentService } from '../../../core/services/incident/incident.service';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [
    GoBackComponent,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatStepperModule,
  ],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss'
})
export class CreateComponent {
  private _formBuilder = inject(FormBuilder);

  incidentForm = this._formBuilder.group({
    titre: ['', Validators.required],
    dateDeSurvenance: ['', Validators.required],
    dateDeDetection: ['', Validators.required],
    dateDeDeclaration: [new Date().toISOString().split('T')[0], Validators.required],
    dateDeCloture: ['']
  });

  errorMessage = signal('');

  constructor(private incidentService: IncidentService) {
    merge(
      this.incidentForm.get('titre')!.valueChanges,
      this.incidentForm.get('dateDeSurvenance')!.valueChanges,
      this.incidentForm.get('dateDeDetection')!.valueChanges,
      this.incidentForm.get('dateDeDeclaration')!.valueChanges
    ).pipe(
      takeUntilDestroyed()
    ).subscribe(() => {
      if (this.incidentForm.invalid) {
        this.errorMessage.set('Tous les champs ne sont pas remplis correctement.');
      } else {
        this.errorMessage.set('');
      }
    });
  }

  addIncident() {
    if (this.incidentForm.invalid) {
      alert("Tous les champs obligatoires ne sont pas remplis");
      return;
    }

    const incident = {
      title: this.incidentForm.value.titre,
      declaredAt: this.parseDate(this.incidentForm.value.dateDeDeclaration),
      survenueAt: this.parseDate(this.incidentForm.value.dateDeSurvenance),
      detectedAt: this.parseDate(this.incidentForm.value.dateDeDetection),
      closedAt: this.parseDate(this.incidentForm.value.dateDeCloture),
    };

    this.incidentService.saveIncident(incident).subscribe(
      resp => {
        console.log("Incident ajouté avec succès", resp);
      },
      error => {
        console.error("Erreur lors de la création de l'incident", error);
      }
    );

    console.log("Incident envoyé :", incident);
  }

  parseDate(date: string | null | undefined): string | null {
    return date ? new Date(date).toISOString() : null;
  }
}
