import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';

interface EtatReport {
  poste: string;
  valeur: number;
}

@Component({
  selector: 'app-calcul-view',
  imports: [MatTabsModule, MatCardModule, MatButtonModule, MatIconModule, MatSelectModule, MatTableModule],
  templateUrl: './calcul-view.component.html',
  styleUrl: './calcul-view.component.scss'
})
export class CalculViewComponent {

  router = inject(Router);
  businessIndicator = 145890234;
  businessIndicatorComponent = 18234567;
  internalLossMultiplier = 0.684;
  exigenceFinale = 12456789;

  historiqueCalculs = [
    { periode: 'T1 2025', bi: 145890234, bic: 18234567, ilm: 0.684, exigenceFinale: 12456789, statut: 'Valide' },
    { periode: 'T4 2024', bi: 148730195, bic: 18652845, ilm: 0.685, exigenceFinale: 12752312, statut: 'Soumis' },
    { periode: 'T3 2024', bi: 144380122, bic: 18456243, ilm: 0.678, exigenceFinale: 12235134, statut: 'Soumis' }
  ];
  displayedColumns = ['periode', 'bi', 'bic', 'ilm', 'exigenceFinale', 'statut'];

  ildcData = [
    { categorie: 'Revenus d’intérêts', valeur: 1200 },
    { categorie: 'Charges d’intérêts', valeur: -300 },
    { categorie: 'Revenus de dividendes', valeur: 450 }
  ];

  scData = [
    { categorie: 'Commissions reçues', valeur: 800 },
    { categorie: 'Commissions versées', valeur: -150 },
    { categorie: 'Autres revenus d’exploitation', valeur: 500 },
    { categorie: 'Autres charges d’exploitation', valeur: -200 }
  ];

  fcData = [
    { categorie: 'Résultat net portefeuille négociation', valeur: 650 },
    { categorie: 'Résultat net portefeuille bancaire', valeur: 400 }
  ];

  historiquePertes = [
    { annee: 2015, perte: 800 },
    { annee: 2016, perte: 950 },
    { annee: 2017, perte: 1200 },
    { annee: 2018, perte: 1100 },
    { annee: 2019, perte: 1000 },
    { annee: 2020, perte: 900 },
    { annee: 2021, perte: 1150 },
    { annee: 2022, perte: 1050 },
    { annee: 2023, perte: 1300 },
    { annee: 2024, perte: 1250 }
  ];

  tranchesBI = [
    { tranche: '1', intervalle: '≤ 1.000', coefficient: 0.12 },
    { tranche: '2', intervalle: '1.000 < BI ≤ 30.000', coefficient: 0.15 },
    { tranche: '3', intervalle: '> 30.000', coefficient: 0.18 }
  ];
  displayedColumnsBi = ['tranche', 'intervalle', 'coefficient'];

  dataC16: EtatReport[] = [
    { poste: 'Capital réglementaire', valeur: 150 },
    { poste: 'Risques opérationnels', valeur: 45 },
    { poste: 'Fonds propres', valeur: 105 }
  ];

  dataC17: EtatReport[] = [
    { poste: 'Exposition crédit', valeur: 200 },
    { poste: 'Exposition marché', valeur: 75 },
    { poste: 'Exposition opérationnelle', valeur: 55 }
  ];

  displayedColumnsC16 = ['poste', 'valeur'];
  displayedColumnsC17 = ['poste', 'valeur'];

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