import { Component, inject, OnInit } from '@angular/core';
import { BuProcessAccordionComponent } from '../../../shared/components/bu-process-accordion/bu-process-accordion.component';
import { GoBackButton, GoBackComponent } from '../../../shared/components/go-back/go-back.component';
import { MatDialog } from '@angular/material/dialog';
import { AddEntityDialogComponent } from '../add-entity-dialog/add-entity-dialog.component';
import { CreateProcessComponent } from '../../process/create-process/create-process.component';

@Component({
  selector: 'app-reglages',
  imports: [BuProcessAccordionComponent, GoBackComponent],
  templateUrl: './reglages.component.html',
  styleUrl: './reglages.component.scss'
})
export class ReglagesComponent {

  private dialog = inject(MatDialog);

  goBackButtons: GoBackButton[] = [
    {
      label: 'Ajouter un process',
      icon: 'add',
      class: 'btn-primary',
      show: true,
      action: () => this.addProcess()
    },
    {
      label: 'Ajouter une entité',
      icon: 'add',
      class: 'btn-primary',
      show: true,
      action: () => this.addBu()
    }
  ]

  addBu() {
    this.dialog.open(AddEntityDialogComponent,
      {
        width: '800px'
      }
    )
  }

  addProcess() {
    this.dialog.open(CreateProcessComponent,
      {
        width: '800px'
      }
    )
  }

}
