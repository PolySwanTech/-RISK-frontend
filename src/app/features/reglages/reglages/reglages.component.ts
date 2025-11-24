import { Component, inject, OnInit } from '@angular/core';
import { GoBackButton, GoBackComponent } from '../../../shared/components/go-back/go-back.component';
import { MatTabsModule } from '@angular/material/tabs';
import { SelectRiskEventComponent } from "../../../shared/components/select-risk-event/select-risk-event.component";
import { MatDialog } from '@angular/material/dialog';
import { AddEntityDialogComponent } from '../add-entity-dialog/add-entity-dialog.component';
import { ActivatedRoute } from '@angular/router';
import { ProcessManagerComponent } from "../../../shared/components/param-process/param-process.component";
import { SnackBarService } from '../../../core/services/snack-bar/snack-bar.service';

@Component({
  selector: 'app-reglages',
  imports: [GoBackComponent, MatTabsModule, SelectRiskEventComponent, ProcessManagerComponent],
  templateUrl: './reglages.component.html',
  styleUrl: './reglages.component.scss'
})
export class ReglagesComponent implements OnInit {


  private dialog = inject(MatDialog);
  private route = inject(ActivatedRoute);

  private snakBarService = inject(SnackBarService);
  // private authService = inject(AuthService);
  
  selectedTabIndex = 0;

  goBackButtons: GoBackButton[] = [
    {
      label: 'Ajouter une entité',
      icon: 'add',
      class: 'btn-primary',
      show: true,
      action: () => this.addBu()
    }
  ]

  ngOnInit(): void {
    const label = this.route.snapshot.queryParams['label'];

    if (label === 'Taxonmie') {
      this.selectedTabIndex = 1; // Index de l'onglet "Taxonomie"
    }
  }

  addBu() {
    this.dialog.open(AddEntityDialogComponent,
      {
        width: '700px',
        maxWidth: '95vw',
        maxHeight: '90vh',
        panelClass: 'custom-dialog-container', // Classe CSS personnalisée
        disableClose: false,
        autoFocus: false

      }
    ).afterClosed().subscribe(bu => {
      if (bu) {
        this.snakBarService.info("L'entité a été créée avec succès")
      }
    })
  }
}
