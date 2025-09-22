import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { GoBackComponent } from '../../shared/components/go-back/go-back.component';
import { CalculService } from '../../core/services/calcul/calcul.service';
import { SmaPayload } from '../../core/models/Sma';
import { SmaResult } from '../../core/models/SmaResult';
import { ConfirmService } from '../../core/services/confirm/confirm.service';

interface EtatReport {
  poste: string;
  valeur: number;
}

@Component({
  selector: 'app-calcul-view',
  imports: [MatTabsModule, MatCardModule, MatButtonModule, MatIconModule,
    MatSelectModule, MatTableModule, GoBackComponent],
  templateUrl: './calcul-view.component.html',
  styleUrl: './calcul-view.component.scss'
})
export class CalculViewComponent {

  router = inject(Router);
  route = inject(ActivatedRoute);
  calculService = inject(CalculService);
  confirmService = inject(ConfirmService);

  businessIndicator = 0;
  businessIndicatorComponent = 0;
  internalLossMultiplier = 0;
  exigenceFinale = 0;

  goBackButtons = [
    {
      label: 'Lancer le calcul',
      icon: 'play_arrow',
      class: 'btn-purple',
      show: true,
      action: () => this.goToCalcul()
    },
    {
      label: 'Exporter',
      icon: 'download',
      class: 'btn-green', // tu peux garder ce nom si tu l’as stylé dans ton CSS
      show: true,
      action: () => { } // si une fonction existe, sinon remplace ou crées-en une
    }
  ];


  historiqueCalculs: any[] = [];
  displayedColumns = ['periode', 'bi', 'bic', 'ilm', 'exigenceFinale', 'statut'];

  ildcData: any[] = [];

  scData: any[] = [];

  fcData: any[] = [];

  historiquePertes: { annee: number; perte: number }[] = [];

  tranchesBI = [
    { tranche: '1', intervalle: '≤ 1.000', coefficient: 0.12 },
    { tranche: '2', intervalle: '1.000 < BI ≤ 30.000', coefficient: 0.15 },
    { tranche: '3', intervalle: '> 30.000', coefficient: 0.18 }
  ];
  displayedColumnsBi = ['tranche', 'intervalle', 'coefficient'];

  dataC16 = [];

  dataC17 = [];

  displayedColumnsC16 = ['poste', 'valeur'];
  displayedColumnsC17 = ['poste', 'valeur'];

  result?: SmaResult;


  ngOnInit() {
    const inputId =
      this.route.snapshot.paramMap.get('id') ||
      this.route.snapshot.queryParamMap.get('id');

    if (inputId) {
      this.calculService.getPayload(inputId).subscribe({
        next: (payload: SmaPayload) => this.hydrateFromPayload(payload),
        error: (err) => console.error('getPayload error', err)
      });
    } else {
      this.calculService.getLatestPayload().subscribe({
      next: (payload: SmaPayload) => this.hydrateFromPayload(payload),
      error: (err) => {
        console.error('getLatestPayload error', err);

        this.confirmService
          .openConfirmDialog(
            'Aucun calcul disponible',
            'Aucun calcul n’a été trouvé. Veuillez lancer un nouveau calcul.'
          )
          .subscribe((confirmed: boolean) => {
            if (confirmed) {
              this.router.navigate(['/calcul']);
            } else { this.router.navigate(['/dashboard']); }
          });
      }
    });
    }
  }

  hydrateFromPayload(payload: SmaPayload) {
    const i = payload.input;

    this.ildcData = [
      { categorie: "Revenus d’intérêts", valeur: i.revenusInterets },
      { categorie: "Charges d’intérêts", valeur: i.chargesInterets },
      { categorie: "Revenus de dividendes", valeur: i.revenusDividendes },
      { categorie: "Actifs productifs d’intérêts (M€)", valeur: i.actifsProductifsInterets }
    ];
    this.scData = [
      { categorie: "Commissions reçues", valeur: i.commissionsRecues },
      { categorie: "Commissions versées", valeur: i.commissionsVersees },
      { categorie: "Autres revenus d’exploitation", valeur: i.autresRevenusExpl },
      { categorie: "Autres charges d’exploitation", valeur: i.autresChargesExpl }
    ];
    this.fcData = [
      { categorie: "Résultat net portefeuille négociation", valeur: i.resultatNego },
      { categorie: "Résultat net portefeuille bancaire", valeur: i.resultatBanque }
    ];

    this.historiquePertes = (payload.losses || [])
      .sort((a, b) => a.lossYear - b.lossYear)
      .map(l => ({ annee: l.lossYear, perte: l.amountMeur }));

    this.loadResult(i.id);

  }

  private loadResult(inputId: string) {
    this.calculService.getResult(inputId).subscribe({
      next: (res) => {
        this.result = res;

        this.businessIndicator = res.bi ?? 0;
        this.businessIndicatorComponent = res.bic ?? 0;
        this.internalLossMultiplier = res.ilm ?? 0;
        this.exigenceFinale = res.orc ?? 0;
      },
      error: (err) => {
        console.error('getResult error', err);
        this.result = undefined;
      }
    });
  }


  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value) + ' M€';
  }

  exportPDF() {
    alert('Export PDF non implémenté');
  }

  exportExcel() {
    alert('Export Excel non implémenté');
  }

  goToCalcul() {
    this.router.navigate(['/calcul']);
  }
}