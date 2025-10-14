import { Component, inject } from '@angular/core';
import { BuProcessAccordionComponent } from '../../../shared/components/bu-process-accordion/bu-process-accordion.component';
import { GoBackButton, GoBackComponent } from '../../../shared/components/go-back/go-back.component';
import { MatTabsModule } from '@angular/material/tabs';
import { SelectRiskEventComponent } from "../../../shared/components/select-risk-event/select-risk-event.component";
import { MatDialog } from '@angular/material/dialog';
import { EntitiesService } from '../../../core/services/entities/entities.service';
import { AddEntityDialogComponent } from '../add-entity-dialog/add-entity-dialog.component';

@Component({
  selector: 'app-reglages',
  imports: [BuProcessAccordionComponent, GoBackComponent, MatTabsModule, SelectRiskEventComponent],
  templateUrl: './reglages.component.html',
  styleUrl: './reglages.component.scss'
})
export class ReglagesComponent {

  private dialog = inject(MatDialog);
  private entitiesService = inject(EntitiesService)

  goBackButtons: GoBackButton[] = [
    {
      label: 'Ajouter une entité',
      icon: 'add',
      class: 'btn-primary',
      show: true,
      action: () => {}
    }
  ]

  addBu() {
    this.dialog.open(AddEntityDialogComponent,
      {
        width: '800px'
      }
    ).afterClosed().subscribe(bu => {
      this.entitiesService.save(bu).subscribe(resp => {
      })
    })
  }
}
