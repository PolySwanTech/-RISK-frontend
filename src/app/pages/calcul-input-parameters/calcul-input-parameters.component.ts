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


@Component({
  selector: 'app-calcul-input-parameters',
  standalone: true,
  imports: [FormsModule, NgFor, NgChartsModule, MatInputModule],
  templateUrl: './calcul-input-parameters.component.html',
  styleUrl: './calcul-input-parameters.component.scss'
})
export class CalculInputParametersComponent {

  private calculService = inject(CalculService);
  private confirmService = inject(ConfirmService);
  private router = inject(Router);

  financialFields = [
    { name: 'revenus_interets', label: "Revenus d'intérêts" },
    { name: 'charges_interets', label: "Charges d'intérêts" },
    { name: 'actifs_productifs_interets', label: "Actifs productifs d'intérêts" },
    { name: 'revenus_dividendes', label: "Revenus de dividendes" },
    { name: 'commissions_recues', label: "Commissions reçues" },
    { name: 'commissions_versees', label: "Commissions versées" },
    { name: 'autres_revenus_exploitation', label: "Autres revenus d'exploitation" },
    { name: 'autres_charges_exploitation', label: "Autres charges d'exploitation" },
    { name: 'resultat_net_portefeuille_negociation', label: "Résultat net portefeuille négociation" },
    { name: 'resultat_net_portefeuille_bancaire', label: "Résultat net portefeuille bancaire" },
  ];

  formData: any = {
    period_year: new Date().getFullYear(),
    pertes_annuelles: {},
    ratio_cet1: 8.0,
    exemption_ilm: false,
    revenus_interets: 0, charges_interets: 0, actifs_productifs_interets: 0, revenus_dividendes: 0,
    commissions_recues: 0, commissions_versees: 0, autres_revenus_exploitation: 0, autres_charges_exploitation: 0,
    resultat_net_portefeuille_negociation: 0, resultat_net_portefeuille_bancaire: 0
  };

  years: number[] = [];

  constructor() {
    this.rebuildYears();
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
    alert("Données rafraîchies");
  }

  resetForm() {
    this.formData = {
      period_year: new Date().getFullYear(),
      pertes_annuelles: {},
      ratio_cet1: 8.0,
      exemption_ilm: false,
      revenus_interets: 0, charges_interets: 0, actifs_productifs_interets: 0, revenus_dividendes: 0,
      commissions_recues: 0, commissions_versees: 0, autres_revenus_exploitation: 0, autres_charges_exploitation: 0,
      resultat_net_portefeuille_negociation: 0, resultat_net_portefeuille_bancaire: 0
    };
    this.rebuildYears();
    this.updateChart();
  }

  onSubmit() {
    const dto: SmaInputCreateDto = {
      periodYear: Number(this.formData.period_year),
      revenusInterets: Number(this.formData.revenus_interets || 0),
      chargesInterets: Number(this.formData.charges_interets || 0),
      actifsProductifsInterets: Number(this.formData.actifs_productifs_interets || 0),
      revenusDividendes: Number(this.formData.revenus_dividendes || 0),
      commissionsRecues: Number(this.formData.commissions_recues || 0),
      commissionsVersees: Number(this.formData.commissions_versees || 0),
      autresRevenusExpl: Number(this.formData.autres_revenus_exploitation || 0),
      autresChargesExpl: Number(this.formData.autres_charges_exploitation || 0),
      resultatNego: Number(this.formData.resultat_net_portefeuille_negociation || 0),
      resultatBanque: Number(this.formData.resultat_net_portefeuille_bancaire || 0),
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
            this.confirmService.openConfirmDialog("Saisie enregistrée avec succès", "", false).subscribe();
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
}