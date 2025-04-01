import { Component, OnInit } from '@angular/core';
import { Impact } from '../../../core/models/Impact';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { EntitiesService } from '../../../core/services/entities/entities.service';
import { ProcessService } from '../../../core/services/process/process.service';
import { Process } from '../../../core/models/Process';
import { EntiteImpactee } from '../../../core/models/EntiteImpactee';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-create-impact-pop-up',
  imports: [FormsModule, MatDialogModule,MatLabel, MatSelectModule],
  templateUrl: './create-impact-pop-up.component.html',
  styleUrl: './create-impact-pop-up.component.scss'
})
export class CreateImpactPopUpComponent implements OnInit{

  impact : Impact = new Impact('', 0, '', '', '', new Date())
  selectedEntite : EntiteImpactee | undefined
  processes : Process[] = []
  entites : EntiteImpactee[] = []

  constructor(
    private processService : ProcessService,
    private entiteService : EntitiesService,
    public dialogRef: MatDialogRef<CreateImpactPopUpComponent>, // MatDialogRef for dialog control
  ){
    
  }

  ngOnInit(): void {
    this.entiteService.loadEntities().subscribe(
      list => this.entites = list
    )
  }

  setEntite(entite : EntiteImpactee){
    this.impact.entityId = entite.id
  }

  close(){
    this.dialogRef.close();
  }


  addImpact() {
    this.dialogRef.close(this.impact)
  }
}
