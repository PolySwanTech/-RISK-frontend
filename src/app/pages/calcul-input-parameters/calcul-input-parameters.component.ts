import { NgFor } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalculService } from '../../core/services/calcul/calcul.service';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { MatInputModule } from '@angular/material/input';
import { ConfirmService } from '../../core/services/confirm/confirm.service';
import { Router } from '@angular/router';
import { SmaInputCreateDto, SmaLossUpsert } from '../../core/models/Sma';
import { GoBackComponent } from '../../shared/components/go-back/go-back.component';
import { SnackBarService } from '../../core/services/snack-bar/snack-bar.service';

interface FinancialField {
  name: string;
  label: string;
  value?: number;
}

interface FinancialGroup {
  name: string;
  displayName: string;
  value: number;
  expanded: boolean;
  group: FinancialField[];
}

@Component({
  selector: 'app-calcul-input-parameters',
  standalone: true,
  imports: [FormsModule, NgFor, NgChartsModule, MatInputModule, GoBackComponent],
  templateUrl: './calcul-input-parameters.component.html',
  styleUrl: './calcul-input-parameters.component.scss'
})
export class CalculInputParametersComponent {

  private calculService = inject(CalculService);
  private confirmService = inject(ConfirmService);
  private snackBarService = inject(SnackBarService);
  private router = inject(Router);

  ildcFields: FinancialGroup[] = [
  {
    name: 'groupe_interets',
    displayName: 'Revenus d’intérêts (y compris des actifs loués)',
    value: 0,
    expanded: false,
    group: [
      { name: 'revenus_interets', label: "Revenus d'intérêts", value: 0 },
      { name: 'revenus_actifs_loues', label: "Revenus d'actifs loués (hors intérêts)", value: 0 },
      { name: 'profits_actifs_loues', label: "Profits des actifs loués", value: 0 }
    ]
  },
  {
    name: 'groupe_charges_interets',
    displayName: 'Charges d’intérêts (y compris des actifs loués)',
    value: 0,
    expanded: false,
    group: [
      { name: 'charges_interets', label: "Charges d'intérêts", value: 0 },
      { name: 'charges_actifs_loues', label: "Dépenses des actifs loués (hors intérêts)", value: 0 },
      { name: 'pertes_actifs_loues', label: "Pertes des actifs loués", value: 0 }
    ]
  },
  {
    name: 'groupe_actifs',
    displayName: 'Composants d’actifs',
    value: 0,
    expanded: false,
    group: [
      { name: 'soldes_caisse', label: "Soldes de trésorerie auprès des banques centrales et autres dépôts à vue", value: 0 },
      { name: 'titres_dette', label: "Titres de créance", value: 0 },
      { name: 'pret_avances', label: "Prêts et avances", value: 0 },
      { name: 'derives', label: "Instruments dérivés", value: 0 },
      { name: 'actifs_soumis_location', label: "Actifs soumis à des contrats de location", value: 0 }
    ]
  },
  {
    name: 'groupe_dividendes',
    displayName: 'Composants de dividendes',
    value: 0,
    expanded: false,
    group: [
      { name: 'revenus_dividendes', label: "Revenus de dividendes", value: 0 }
    ]
  }
];

scFields: FinancialGroup[] = [
  {
    name: 'groupe_autres_revenus_exploitation',
    displayName: "Autres revenus d'exploitation",
    value: 0,
    expanded: false,
    group: [
      { name: 'revenus_autres_membres_ips', label: "Autres revenus d'exploitation des membres de la même IPS", value: 0 },
      { name: 'profits_actifs_non_courants', label: "Profits des actifs non courants et groupes destinés à la vente ne relevant pas des opérations abandonnées", value: 0 },
      { name: 'autres_revenus', label: "Autres", value: 0 }
    ]
  },
  {
    name: 'groupe_autres_charges_exploitation',
    displayName: "Autres charges d'exploitation",
    value: 0,
    expanded: false,
    group: [
      { name: 'charges_autres_membres_ips', label: "Autres charges d'exploitation des membres de la même IPS", value: 0 },
      { name: 'pertes_evenements_risque', label: "Pertes, dépenses, provisions et autres impacts financiers liés aux événements de risque opérationnel", value: 0 },
      { name: 'pertes_actifs_non_courants', label: "Pertes des actifs non courants et groupes destinés à la vente ne relevant pas des opérations abandonnées", value: 0 },
      { name: 'autres_charges', label: "Autres", value: 0 }
    ]
  },
  {
    name: 'groupe_commissions_revenus',
    displayName: "Revenus de commissions et frais",
    value: 0,
    expanded: false,
    group: [
      { name: 'revenus_commissions_frais', label: "Revenus de commissions et frais", value: 0 }
    ]
  },
  {
    name: 'groupe_commissions_charges',
    displayName: "Charges de commissions et frais",
    value: 0,
    expanded: false,
    group: [
      { name: 'charges_commissions_frais', label: "Charges de commissions et frais", value: 0 }
    ]
  }
];

fcFields: FinancialGroup[] = [
  {
    name: 'groupe_resultat_trading',
    displayName: "Résultat net applicable au portefeuille de trading",
    value: 0,
    expanded: false,
    group: [
      { name: 'gains_pertes_actifs_passifs_trading', label: "Gains ou pertes sur actifs et passifs financiers détenus à des fins de trading, net", value: 0 },
      { name: 'gains_pertes_hedge_trading', label: "Portefeuille de trading - Gains ou pertes issus de la comptabilité de couverture, net", value: 0 },
      { name: 'differences_change_trading', label: "Portefeuille de trading - Différences de change [gain ou perte], net", value: 0 }
    ]
  },
  {
    name: 'groupe_resultat_bancaire',
    displayName: "Résultat net applicable au portefeuille bancaire",
    value: 0,
    expanded: false,
    group: [
      { name: 'gains_pertes_derecognition', label: "Gains ou pertes sur la radiation d'actifs et passifs financiers non évalués à la juste valeur par le résultat, net", value: 0 },
      { name: 'gains_pertes_actifs_non_trading_fv', label: "Gains ou pertes sur actifs financiers non-trading évalués de manière obligatoire à la juste valeur par le résultat, net", value: 0 },
      { name: 'gains_pertes_designated_fv', label: "Gains ou pertes sur actifs et passifs financiers désignés à la juste valeur par le résultat, net", value: 0 },
      { name: 'gains_pertes_hedge_banking', label: "Portefeuille bancaire - Gains ou pertes issus de la comptabilité de couverture, net", value: 0 },
      { name: 'differences_change_banking', label: "Portefeuille bancaire - Différences de change [gain ou perte], net", value: 0 }
    ]
  }
];

 sectionList = [
  { title: '💰 Composants Intérêts, Actifs Loués et Dividendes (ILDC)', fields: this.ildcFields },
  { title: '💰 Composants Services (SC)', fields: this.scFields },
  { title: '💰 Composants Financiers (FC)', fields: this.fcFields }
]

  formData: any = {
    period_year: new Date().getFullYear(),
    pertes_annuelles: {},
    ratio_cet1: 8.0,
    exemption_ilm: false
  };

  years: number[] = [];

  constructor() {
    this.rebuildYears();
  }

  // Méthode pour basculer l'expansion d'une carte
  toggleCard(groupIndex: number): void {
    this.ildcFields[groupIndex].expanded = !this.ildcFields[groupIndex].expanded;
  }

  // Méthode pour calculer le total d'un groupe
  calculateGroupTotal(group: FinancialGroup): number {
    return group.group.reduce((sum, field) => sum + (field.value || 0), 0);
  }

  // Méthode pour mettre à jour le total d'un groupe
  updateGroupTotal(groupIndex: number): void {
    const group = this.ildcFields[groupIndex];
    group.value = this.calculateGroupTotal(group);
  }

  // Méthode appelée quand une valeur de champ change
  onFieldValueChange(groupIndex: number): void {
    this.updateGroupTotal(groupIndex);
  }

  // Méthode pour formater la devise
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value || 0);
  }

  onPeriodYearChange() {
    this.rebuildYears();
    this.updateChart();
  }

  rebuildYears() {
    const end = this.formData.period_year;
    const start = end - 9;
    this.years = Array.from({ length: 10 }, (_, i) => start + i);
    this.years.forEach(y => {
      if (this.formData.pertes_annuelles[y] === undefined) this.formData.pertes_annuelles[y] = 0;
    });
    this.lineChartData.labels = this.years.map(String);
  }

  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Pertes annuelles (€)',
        data: [],
        borderColor: '#3f51b5',
        backgroundColor: 'rgba(63,81,181,0.3)',
        fill: true,
        tension: 0.3
      }
    ]
  };

  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: { display: true }
    }
  };

  updateChart() {
    this.lineChartData = {
      ...this.lineChartData,
      datasets: [
        {
          ...this.lineChartData.datasets[0],
          data: this.years.map(year => Number(this.formData.pertes_annuelles[year] || 0))
        }
      ]
    };
  }

  importData() {
    alert("Import de données pas encore implémenté");
  }

  refreshData() {
    // Simuler un refresh des données
    this.ildcFields.forEach(group => {
      group.group.forEach(field => {
        field.value = Math.random() * 1000; // Valeurs aléatoires pour la démo
      });
      group.value = this.calculateGroupTotal(group);
    });
    this.snackBarService.success("Données rafraîchies");
  }

  resetForm() {
    // Reset des groupes financiers
    this.ildcFields.forEach(group => {
      group.group.forEach(field => {
        field.value = 0;
      });
      group.value = 0;
      group.expanded = false;
    });

    // Reset des autres champs
    this.formData = {
      period_year: new Date().getFullYear(),
      pertes_annuelles: {},
      ratio_cet1: 8.0,
      exemption_ilm: false
    };
    
    this.rebuildYears();
    this.updateChart();
  }

  onSubmit() {
    // Récupérer les valeurs des champs financiers
    const financialData: any = {};
    this.ildcFields.forEach(group => {
      group.group.forEach(field => {
        financialData[field.name] = field.value || 0;
      });
    });

    const dto: SmaInputCreateDto = {
      periodYear: Number(this.formData.period_year),
      revenusInterets: Number(financialData.revenus_interets || 0),
      chargesInterets: Number(financialData.charges_interets || 0),
      actifsProductifsInterets: Number(financialData.actifs_productifs_interets || 0),
      revenusDividendes: Number(financialData.revenus_dividendes || 0),
      commissionsRecues: Number(financialData.commissions_recues || 0),
      commissionsVersees: Number(financialData.commissions_versees || 0),
      autresRevenusExpl: Number(financialData.autres_revenus_exploitation || 0),
      autresChargesExpl: Number(financialData.autres_charges_exploitation || 0),
      resultatNego: Number(financialData.resultat_net_portefeuille_negociation || 0),
      resultatBanque: Number(financialData.resultat_net_portefeuille_bancaire || 0),
      exemptionIlm: !!this.formData.exemption_ilm,
      ratioCet1Pct: Number(this.formData.ratio_cet1 ?? 8.0)
    };

    const losses: SmaLossUpsert[] = this.years
      .filter(y => this.formData.pertes_annuelles[y] !== undefined)
      .map(y => ({
        lossYear: y,
        amountMeur: Number(this.formData.pertes_annuelles[y] || 0)
      }));

    this.calculService.createInput(dto).subscribe({
      next: (created) => {
        const inputId = created.id;
        this.calculService.upsertLosses(inputId, losses).subscribe({
          next: () => {
            this.snackBarService.success("Saisie enregistrée avec succès");
            this.router.navigate(['/calcul/view']);
          },
          error: (e) => {
            console.error(e);
            this.confirmService.openConfirmDialog("Erreur lors de l'enregistrement des pertes", "", false).subscribe();
          }
        });
      },
      error: (err) => {
        console.error(err);
        this.confirmService.openConfirmDialog("Erreur lors de la création de la saisie", "", false).subscribe();
      }
    });
  }

  toggleCardBySection(sectionFields: FinancialGroup[], groupIndex: number): void {
  sectionFields[groupIndex].expanded = !sectionFields[groupIndex].expanded;
}

onFieldValueChangeBySection(sectionFields: FinancialGroup[], groupIndex: number): void {
  const group = sectionFields[groupIndex];
  group.value = group.group.reduce((sum, field) => sum + (field.value || 0), 0);
}
}