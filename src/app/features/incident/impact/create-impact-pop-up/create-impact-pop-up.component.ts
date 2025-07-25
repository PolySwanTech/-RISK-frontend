import { Component, OnInit } from '@angular/core';
import { Impact } from '../../../../core/models/Impact';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatLabel } from '@angular/material/form-field';
import { EntitiesService } from '../../../../core/services/entities/entities.service';
import { Process } from '../../../../core/models/Process';
import { EntiteResponsable } from '../../../../core/models/EntiteResponsable';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { ImpactTypeEnum } from '../../../../core/enum/impactType.enum';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-create-impact-pop-up',
  imports: [FormsModule, MatDialogModule, MatLabel, MatSelectModule, MatInputModule, MatButtonModule],
  templateUrl: './create-impact-pop-up.component.html',
  styleUrl: './create-impact-pop-up.component.scss'
})
export class CreateImpactPopUpComponent implements OnInit {

  impact: Impact = new Impact('', 0, '', '', '', new Date(), null)
  selectedEntite: EntiteResponsable | undefined
  processes: Process[] = []
  entites: EntiteResponsable[] = []
  types: ImpactTypeEnum[] = [ImpactTypeEnum.PROVISION, ImpactTypeEnum.RECUPERATION];


  constructor(
    private entiteService: EntitiesService,
    public dialogRef: MatDialogRef<CreateImpactPopUpComponent>,
  ) { }

  ngOnInit(): void {
    this.entiteService.loadEntities().subscribe(
      list => this.entites = list
    )
  }

  setEntite(entite: EntiteResponsable) {
    this.impact.entityId = entite.id
  }

  close() {
    this.dialogRef.close();
  }


  addImpact() {
    console.log(this.impact);
    const message = prompt("Pourquoi voulez-vous ajouter cet impact ?");
    if (message && message.trim().length > 0) {
      this.dialogRef.close(
        {
          impact: this.impact,
          message: message
        });
    } else {
      alert("⚠️ Le message est obligatoire pour justifier l’ajout de l’impact.");
    }
  }
}
