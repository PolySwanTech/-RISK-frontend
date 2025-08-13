import { NgFor } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalculService } from '../../core/services/calcul/calcul.service';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-calcul-input-parameters',
  standalone: true,
  imports: [FormsModule, NgFor, NgChartsModule, MatInputModule],
  templateUrl: './calcul-input-parameters.component.html',
  styleUrl: './calcul-input-parameters.component.scss'
})
export class CalculInputParametersComponent {

  calculService = inject(CalculService);

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

  years = Array.from({ length: 10 }, (_, i) => 2015 + i);

  formData: any = {
    pertes_annuelles: {},
    ratio_cet1: 8.0,
    exemption_ilm: false
  };

  // Configuration du graphique
  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: this.years.map(String),
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
  // On crée une nouvelle référence pour déclencher le redraw
  this.lineChartData = {
    ...this.lineChartData,
    datasets: [
      {
        ...this.lineChartData.datasets[0],
        data: this.years.map(year => this.formData.pertes_annuelles[year] || 0)
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

  getListLosses() {
    this.calculService.getLosses().subscribe({
      next: (data: any) => {
        this.formData.pertes_annuelles = data;
        this.updateChart();
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des pertes', err);
      }
    });
  }

  resetForm() {
    this.formData = {
      pertes_annuelles: {},
      ratio_cet1: 8.0,
      exemption_ilm: false
    };
    this.updateChart();
  }

  onSubmit() {
    const dataToSubmit = {
      ...this.formData,
      ratio_cet1: this.formData.ratio_cet1 / 100,
      pertes_annuelles: Object.values(this.formData.pertes_annuelles || {}).map(val => parseFloat(val as string) || 0)
    };

    this.calculService.submitFormData(dataToSubmit).subscribe({
      next: (res) => {
        alert('Formulaire soumis avec succès !');
      },
      error: (err) => {
        console.error('Erreur lors de l’envoi :', err);
        alert('Erreur lors de l’envoi des données.');
      }
    });
  }
}