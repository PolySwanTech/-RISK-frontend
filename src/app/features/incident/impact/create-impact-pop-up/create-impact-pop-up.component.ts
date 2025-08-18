import { Component, inject, Inject, Input, OnInit } from '@angular/core';
import { Impact, ImpactCreateDto } from '../../../../core/models/Impact';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatLabel } from '@angular/material/form-field';
import { EntitiesService } from '../../../../core/services/entities/entities.service';
import { Process } from '../../../../core/models/Process';
import { BusinessUnit } from '../../../../core/models/BusinessUnit';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { ImpactTypeEnum } from '../../../../core/enum/impactType.enum';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ImpactService } from '../../../../core/services/impact/impact.service';
import { GoBackButton, GoBackComponent } from '../../../../shared/components/go-back/go-back.component';
import { ConfirmService } from '../../../../core/services/confirm/confirm.service';
import { FichiersComponent } from '../../../../shared/components/fichiers/fichiers.component';
import { FileService } from '../../../../core/services/file/file.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-create-impact-pop-up',
  imports: [FormsModule, MatDialogModule, MatLabel, MatCardModule, DatePipe,
    MatSelectModule, MatInputModule, MatButtonModule, MatTableModule, DecimalPipe,
    GoBackComponent
  ],
  templateUrl: './create-impact-pop-up.component.html',
  styleUrl: './create-impact-pop-up.component.scss'
})
export class CreateImpactPopUpComponent implements OnInit {

  displayedColumns: string[] = [
    'montant',
    'entityName',
    'type',
    'createdAt',
    'comptabilisationDate',
    'fichiers',
  ];

  goBackButtons: GoBackButton[] = [];

  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private impactService = inject(ImpactService);
  private confirmService = inject(ConfirmService);
  private fileService = inject(FileService);

  impact: Impact | null = null
  selectedEntite: BusinessUnit | undefined
  processes: Process[] = []
  entites: BusinessUnit[] = []
  types: ImpactTypeEnum[] = [ImpactTypeEnum.PROVISION, ImpactTypeEnum.RECUPERATION];

  incidentId: string = '';

  impacts: Impact[] = []

  constructor(
    private entiteService: EntitiesService, @Inject(MAT_DIALOG_DATA) public data: { incidentId: string, impact?: Impact }, private dialogRef: MatDialogRef<CreateImpactPopUpComponent>
  ) {
    this.incidentId = data.incidentId;
  }

  closeDialog() {
    this.dialogRef.close();
  }

  ngOnInit(): void {
    this.impact = new Impact('', 0, '', '', '', new Date(), null)
    const onlyBl = true
    this.entiteService.loadEntities(onlyBl).subscribe(
      list => this.entites = list
    )

    this.impactService.getImpactByIncidentId(this.incidentId).subscribe(
      impacts => this.impacts = impacts
    )
  }

  setEntite(entite: BusinessUnit) {
    if (this.impact) {
      this.impact.entityId = entite.id
    }
  }

  addImpact() {
    if (this.impact) {
      const message = prompt("Pourquoi voulez-vous ajouter cet impact ?") || "";

      if (message && message.trim().length > 0) {
        const dto: ImpactCreateDto = {
          montant: this.impact.montant,
          comptabilisationDate: this.impact.comptabilisationDate ? this.impact.comptabilisationDate : null,
          entityId: this.impact.entityId,
          incidentId: this.incidentId,
          type: this.impact.type,
        };

        console.log(dto)

        this.impactService.addImpact(dto, message).subscribe(() => {
          this.confirmService.openConfirmDialog(
            'Impact ajouté',
            "L'impact a bien été ajouté à l'incident",
            false
          );
          this.dialogRef.close();
        });
      }
      else {
        alert("⚠️ Le message est obligatoire pour justifier l’ajout de l’impact.");
      }
    }
  }

  async viewFiles(impact: Impact) {
    let files = await firstValueFrom(this.fileService.getFiles({ impactId: impact.id }))

   
    console.log(files);
    
    this.dialog.open(FichiersComponent,
      {
        width: '400px',
        data: {
          files: files
        }
      }
    )

    console.log("Voici les fichiers")
  }
}
