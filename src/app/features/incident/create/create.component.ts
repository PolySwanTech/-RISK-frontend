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
import { RiskService } from '../../../core/services/risk/risk.service';
import {MatRadioModule} from '@angular/material/radio';
import { Risk } from '../../../core/models/Risk';
import { SelectUsersComponent } from "../../../shared/components/select-users/select-users.component";
import { Utilisateur } from '../../../core/models/Utilisateur';
import { ButtonAddFileComponent } from "../../../shared/components/button-add-file/button-add-file.component";
import { MatSelectModule } from '@angular/material/select';
import { CauseService } from '../../../core/services/cause/cause.service';
import { Cause } from '../../../core/models/Cause';
import { ProcessService } from '../../../core/services/process/process.service';
import { Process } from '../../../core/models/Process';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';

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
    MatRadioModule,
    SelectUsersComponent,
    ButtonAddFileComponent,
    MatSelectModule
],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss'
})
export class CreateComponent {
  private _formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  incidentForm1 = this._formBuilder.group({
    titre: ['', Validators.required],
    location: ['', Validators.required],
    commentaire: ['', Validators.required],
    cause: ['', Validators.required]
    
  });
  
  incidentForm2 = this._formBuilder.group({
    dateDeDeclaration: [new Date().toISOString().split('T')[0], Validators.required],
    dateDeSurvenance: ['', Validators.required],
    dateDeDetection: ['', Validators.required],
    dateDeCloture: ['']
  });

  incidentForm3 = this._formBuilder.group({
    risk: ['', Validators.required],
    subRisk: ['', Validators.required],
    userMail: [''],
    files: [''],
    process: ['', Validators.required]
  });

  listRisk : Risk[] = [];
  listCause : Cause[] = [];
  listProcess : Process[] = [];

  errorMessage = signal('');

  constructor(private incidentService: IncidentService, private riskService: RiskService, 
    private causeService: CauseService, private processService: ProcessService) {
    this.riskService.getAll().subscribe( (resp: any) => {
      this.listRisk = resp;
    });
    this.causeService.getAll().subscribe( (resp: any) => {
      this.listCause = resp;
    });
    this.processService.getAll().subscribe( (resp: any) => {
      this.listProcess = resp;
    });
  }

  changeUser(event: any){
    this.incidentForm3.get('userMail')!.setValue(event.email);
  }

  addIncident() {
    if (this.incidentForm1.invalid || this.incidentForm2.invalid) {
      alert("Tous les champs obligatoires ne sont pas remplis");
      return;
    }

    const incident = {
      title: this.incidentForm1.value.titre,
      location: this.incidentForm1.value.location,
      commentaire: this.incidentForm1.value.commentaire,
      cause: this.incidentForm1.value.cause,
      declaredAt: this.parseDate(this.incidentForm2.value.dateDeDeclaration),
      survenueAt: this.parseDate(this.incidentForm2.value.dateDeSurvenance),
      detectedAt: this.parseDate(this.incidentForm2.value.dateDeDetection),
      closedAt: this.parseDate(this.incidentForm2.value.dateDeCloture),
      risk: this.incidentForm3.value.risk,
      subRisk: this.incidentForm3.value.subRisk,
      userMail: this.incidentForm3.value.userMail,
      files: this.incidentForm3.value.files,
      process: this.incidentForm3.value.process
    
    };
    this.incidentService.saveIncident(incident).subscribe(
      {
        next : resp => {
          this.afterCreation(resp);
        }, 
        error : err => {
          console.error("Erreur lors de la création de l'incident", err);
        }
      },
    );
  }

  afterCreation(incidentId: string) {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        width: '400px',
        data: {
          title: 'Création réussie',
          message: 'Allez vers la consultation ?'
        }
      });
    
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.router.navigate(['incident', incidentId])
        }
        else{
          this.router.navigate(['incident'])
        }
      });
    } 

  parseDate(date: string | null | undefined): string | null {
    return date ? new Date(date).toISOString() : null;
  }

  onFilesChange(event: any){
    this.incidentForm3.get('files')!.setValue(event);
  }

  getSubRisk() : any{
    let risk : any = this.incidentForm3.get('risk')!.value;
    if(this.incidentForm3.get('risk')!.value != ''){
      return risk.subRisks
    }
    return risk;
  }
}
