import { Component, signal } from '@angular/core';
import { GoBackComponent } from "../../../shared/components/go-back/go-back.component";
import { MatButtonModule } from '@angular/material/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { merge } from 'rxjs';

@Component({
  selector: 'app-create',
  imports: [GoBackComponent, MatButtonModule, MatFormFieldModule, MatInputModule, FormsModule, ReactiveFormsModule],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss'
})
export class CreateComponent {

  readonly incidentForm = new FormGroup({
    titre: new FormControl('', [Validators.required, Validators.email]),
    dateDeSurvenance: new FormControl('', [Validators.required]),
    dateDeDetection: new FormControl('', [Validators.required]),
    dateDeDeclaration: new FormControl('', [Validators.required])
  });

  errorMessage = signal('');

  constructor() {
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
    if (this.incidentForm.invalid){
      alert("Tous les champs ne sont pas remplis");
    }
    else{

    }
  }

  next(index : number){
    const currentStep = document.getElementById(`step${index}`);
    const nextStep = document.getElementById(`step${index + 1}`);

    if (currentStep && nextStep) {
      currentStep.style.display = 'none';
      nextStep.style.display = 'block';
    }
  }
}
