import { Component, inject, OnInit, signal } from '@angular/core';
import { GoBackComponent } from "../../../shared/components/go-back/go-back.component";
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { IncidentService } from '../../../core/services/incident/incident.service';
import { RiskService } from '../../../core/services/risk/risk.service';
import { MatRadioModule } from '@angular/material/radio';
import { Risk } from '../../../core/models/Risk';
import { SelectUsersComponent } from "../../../shared/components/select-users/select-users.component";
import { ButtonAddFileComponent } from "../../../shared/components/button-add-file/button-add-file.component";
import { MatSelectModule } from '@angular/material/select';
import { CauseService } from '../../../core/services/cause/cause.service';
import { Cause } from '../../../core/models/Cause';
import { ProcessService } from '../../../core/services/process/process.service';
import { Process } from '../../../core/models/Process';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { EquipeService } from '../../../core/services/equipe/equipe.service';
import { NgIf, NgFor } from '@angular/common';
import { ConfirmService } from '../../../core/services/confirm/confirm.service';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [
    GoBackComponent,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatRadioModule,
    SelectUsersComponent,
    ButtonAddFileComponent,
    NgIf, NgFor
  ],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss'
})
export class CreateComponent implements OnInit {
  private _formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private confirmService = inject(ConfirmService);

  incidentForm1 = this._formBuilder.group({
    titre: ['', Validators.required],
    equipeName: ['', Validators.required],
    commentaire: ['', Validators.required],
    location: ['', Validators.required],
  });

  incidentForm2 = this._formBuilder.group({
    dateDeDeclaration: [new Date().toISOString().split('T')[0], Validators.required],
    dateDeSurvenance: ['', Validators.required],
    dateDeDetection: ['', Validators.required],
    dateDeCloture: ['']
  });

  incidentForm3 = this._formBuilder.group({
    risk: [null, Validators.required],
    subRisk: [null, Validators.required],
    userMail: [''],
    files: [''],
    process: [null, Validators.required]
  });

  listRisk: Risk[] = [];
  listCause: Cause[] = [];
  listProcess: Process[] = [];

  errorMessage = signal('');
  hasTeam = true;
  listTeams: string[] = [];

  constructor(private incidentService: IncidentService, private riskService: RiskService,
    private causeService: CauseService, private processService: ProcessService, private equipeService: EquipeService) {

    this.riskService.getAllByProcess("test").subscribe((resp: any) => {
      this.listRisk = resp;
    });
    this.causeService.getAll().subscribe((resp: any) => {
      this.listCause = resp;
    });
    this.processService.getAll().subscribe((resp: any) => {
      this.listProcess = resp;
    });
  }

  ngOnInit(): void {
    const teamName = this.getUserTeamFromToken();
    if (teamName) {
      this.hasTeam = true;
      this.incidentForm1.patchValue({ equipeName: teamName });
    } else {
      this.hasTeam = false;
      this.fetchTeams();
    }
  }

  fetchTeams(): void {
    this.equipeService.getAllEquipes().subscribe({
      next: (teams: any[]) => {
        this.listTeams = teams.map(t => t.name);
      },
      error: err => {
        console.error("Erreur lors du chargement des équipes", err);
      }
    });
  }

  getUserTeamFromToken(): string | null {
    const token = sessionStorage.getItem('token');
    if (!token) return null;

    try {
      const base64Payload = token.split('.')[1];
      const jsonPayload = new TextDecoder().decode(
        Uint8Array.from(atob(base64Payload), c => c.charCodeAt(0))
      );
      const payload = JSON.parse(jsonPayload);
      return payload.team || null;
    } catch (e) {
      console.error("Erreur lors du décodage du token :", e);
      return null;
    }
  }

  changeUser(event: any) {
    this.incidentForm3.get('userMail')!.setValue(event.email);
  }

  private convertFormToIncident() {
    const incident = {
      title: this.incidentForm1.value.titre,
      location: this.incidentForm1.value.location,
      commentaire: this.incidentForm1.value.commentaire,
      declaredAt: this.parseDate(this.incidentForm2.value.dateDeDeclaration),
      survenueAt: this.parseDate(this.incidentForm2.value.dateDeSurvenance),
      detectedAt: this.parseDate(this.incidentForm2.value.dateDeDetection),
      closedAt: this.parseDate(this.incidentForm2.value.dateDeCloture),
      risk: this.incidentForm3.value.risk,
      subRisk: this.incidentForm3.value.subRisk,
      userMail: this.incidentForm3.value.userMail,
      files: this.incidentForm3.value.files,
      process: this.incidentForm3.value.process,
      equipeName: this.incidentForm1.value.equipeName,
    };
    return incident;
  }

  addIncident() {

    const incident = this.convertFormToIncident();

    this.incidentService.saveIncident(incident).subscribe(
      {
        next: resp => {
          this.afterCreation("Création réussie", resp);
        },
        error: err => {
          console.error("Erreur lors de la création de l'incident", err);
        }
      },
    );
  }

  afterCreation(title: string, incidentId: string) {
    if (this.hasTeam) {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        width: '400px',
        data: {
          title,
          message: 'Allez vers la consultation ?',
          buttons: true
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.router.navigate(['incident', incidentId]);
        } else {
          this.router.navigate(['incident']);
        }
      });
    } else {
      this.confirmService.openConfirmDialog(title, "Allez vers la consultation ?", true)
        .subscribe(result => {
          if (result) {
            this.router.navigate(['incident', incidentId]);
          } else {
            this.router.navigate(['incident']);
          }
        });
    }
  }

  parseDate(date: string | null | undefined): string | null {
    return date ? new Date(date).toISOString() : null;
  }

  onFilesChange(event: any) {
    this.incidentForm3.get('files')!.setValue(event);
  }

  getSubRisk(): any {
    let risk: any = this.incidentForm3.get('risk')!.value;
    if (this.incidentForm3.get('risk')!.value != null) {
      return risk.subRisks
    }
    return risk;
  }
}
