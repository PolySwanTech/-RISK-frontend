import { Component, inject, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { GoBackComponent } from '../../shared/components/go-back/go-back.component';
import { CalculService } from '../../core/services/calcul/calcul.service';
import { ConfirmService } from '../../core/services/confirm/confirm.service';
import { BaseChartDirective, NgChartsModule } from 'ng2-charts';
import { MatInputModule } from '@angular/material/input';
import { ChartConfiguration, ChartEvent, ChartOptions } from 'chart.js';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

interface DataItem {
  id: number;
  name: string;
  value: number;
  description: string;
}

interface AccordionSection {
  title: string;
  isExpanded: boolean;
  data?: DataItem[];
  sections?: AccordionSection[];
  value?: number;
}

interface YearTabData {
  label: string; // ex: '2024'
  bi: number,
  sections: AccordionSection[];  // ici, catégorie (FC, SC, ILDC)
}
interface ItemKey {
  name: string;
  label: string;
  category: string;
  subCategory: {
    name: string;
    label: string;
  };
}

interface SmaItemValueDto {
  id: number;
  year: string;
  itemKey: ItemKey;
  value: number;
}

interface CategoryResponse {
  value: number;
  subCategories: {
    [subCategoryName: string]: SmaItemValueDto[];
  };
}

interface BackendResponse {
  [year: string]: {
    [categoryName: string]: CategoryResponse;
  };
}

@Component({
  selector: 'app-calcul-view',
  imports: [MatTabsModule, MatCardModule, MatButtonModule, MatIconModule, NgChartsModule, MatInputModule,
    MatSelectModule, ReactiveFormsModule, FormsModule, MatTableModule, GoBackComponent, CommonModule,
    FormsModule],
  templateUrl: './calcul-view.component.html',
  styleUrl: './calcul-view.component.scss'
})
export class CalculViewComponent {

  @ViewChild(BaseChartDirective) chartComponent!: BaseChartDirective;

  private calculService = inject(CalculService);
  private confirmService = inject(ConfirmService);

  businessIndicator = 0;
  businessIndicatorComponent = 0;
  internalLossMultiplier = 0;
  ORC = 0;
  RWA = 0;
  variationRWA = 0;

  allYearsData: YearTabData[] = []

  years: number[] = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

  selectedYear: number = -1

  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Pertes annuelles (M€)',
        data: [],
        borderColor: '#3f51b5',
        backgroundColor: 'rgba(63,81,181,0.3)',
        fill: true,
        tension: 0.3
      },
      {
        label: 'BI (M€)',
        data: [],            // valeurs BI
        backgroundColor: '#f44336'
      }
    ]
  };

  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: { display: true },
      tooltip: { enabled: true }

    },
    interaction: {
      mode: 'index',     // ← détecte sur l'axe des X
      intersect: false   // ← pas besoin de cliquer pile sur le point
    }
  };

  barLineChartData: ChartConfiguration<'bar' | 'line'>['data'] = {
    labels: [], // 3 dernières années
    datasets: [
      {
        type: 'bar',
        label: 'RWA (M€)',
        data: [],
        backgroundColor: 'rgba(63,81,181,0.6)',
        borderRadius: 6
      },
      {
        type: 'line',
        label: 'Tendance',
        data: [],
        borderColor: '#f44336',
        borderWidth: 2,
        fill: false,
        tension: 0.3, // arrondi de la courbe
        pointBackgroundColor: '#f44336'
      }
    ]
  };

  barLineChartOptions: ChartOptions<'bar' | 'line'> = {
    responsive: true,
    plugins: {
      legend: { display: true },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (context) {
            const year = context.label;
            const result = context.chart.data.datasets[0].data[context.dataIndex]; // juste la valeur par défaut
            // Si tu as accès à annualResult via closure
            const annualResult = (context.chart as any).annualResult as any;
            const r = annualResult ? annualResult[year] : null;
            if (!r) return `${context.dataset.label}: ${context.parsed.y}`;
            return [
              `RWA: ${r.rwa} M€`,
              `BI: ${r.bi} M€`,
              `BIC: ${r.bic} M€`,
              `ILM: ${r.ilm}`,
              `ORC: ${r.orc}`
            ];
          },
          title: function (context) {
            // context[0].label -> valeur de l'axe X (année)
            return `Année ${context[0].label}`;
          }
        }
      }
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true }
    }
  };


  goBackButtons = [
    {
      label: 'Rapport C16',
      icon: 'download',
      class: 'btn-green', // tu peux garder ce nom si tu l’as stylé dans ton CSS
      show: true,
      action: () => { } // si une fonction existe, sinon remplace ou crées-en une
    }
  ];

  ILM: number = 0;

  historiqueCalculs: any[] = [];
  displayedColumns = ['periode', 'bi', 'bic', 'ilm', 'exigenceFinale', 'statut'];

  biCardVisible = false;
  biCardX = 0;
  biCardY = 0;

  tranchesBI = [
    { intervalle: '≤ 1.000', coefficient: 0.12 },
    { intervalle: '1.000 < BI ≤ 30.000', coefficient: 0.15 },
    { intervalle: '> 30.000', coefficient: 0.18 }
  ];

  displayedColumnsBi = ['intervalle', 'coefficient'];

  annualLossesDetected: { lossYear: number, amount: number }[] = [];
  annualLossesDeclared: { lossYear: number, amount: number }[] = [];
  annualResult: { [year: number]: any } = {};

  updateChart() {
    this.lineChartData = {
      ...this.lineChartData,
      datasets: [
        {
          ...this.lineChartData.datasets[0],
          data: this.years.map(year =>
            Number(this.annualLossesDetected.find(l => l.lossYear === year)?.amount || 0)
          )
        },
        {
          ...this.lineChartData.datasets[1],
          data: this.years.map(year =>
            Number(this.annualLossesDeclared.find(l => l.lossYear === year)?.amount || 0)
          )
        }
      ]
    };

    this.barLineChartData = {
      ...this.barLineChartData,
      datasets: [
        {
          ...this.barLineChartData.datasets[0],
          data: this.years.map(year => Number(this.annualResult[year]?.rwa || 0))
        },
        {
          ...this.barLineChartData.datasets[1],
          data: this.years.map(year => Number(this.annualResult[year]?.rwa || 0))
        }
      ]
    };

    this.barLineChartOptions.plugins!.tooltip!.callbacks!.label = (context) => {
      const year = +context.label;
      const r = this.annualResult[year];
      if (!r) return `${context.dataset.label}: ${context.parsed.y}`;
      return [
        `RWA: ${r.rwa.toFixed(2)} M€`,
        `BI: ${r.bi.toFixed(2)} M€`,
        `BIC: ${r.bic.toFixed(2)} M€`,
        `ILM: ${r.ilm.toFixed(2)}`,
        `ORC: ${r.orc.toFixed(2)}`
      ];
    };
  }


  rebuildYears() {
    this.lineChartData.labels = this.years;
    this.barLineChartData.labels = this.years;
    this.updateChart();
  }

  validateLosses() {
    this.confirmService.openConfirmDialog("Confirmation", "Confirmer la sauvegarde des pertes ?")
      .subscribe(res => {
        if (res) {
          this.calculService.saveLosses(this.annualLossesDeclared).subscribe();
          this.calculService.saveLosses(this.annualLossesDetected).subscribe();
        }
      })
  }

  ngOnInit() {

    this.calculService.getValues().subscribe((values: BackendResponse) => {
      this.allYearsData = Object.entries(values).map(([year, categories]) => {
        let biValue = 0;

        const categorySections: AccordionSection[] = Object.entries(categories)
          .filter(([categoryName]) => categoryName !== 'BI') // Exclure la catégorie 'BI'
          .map(([categoryName, categoryData]) => {
            const subCategorySections: AccordionSection[] = Object.entries(categoryData.subCategories).map(
              ([subCategoryName, items]) => ({
                title: subCategoryName, // ex: 'INTEREST_INCOME_COMPONENT'
                isExpanded: false,
                value: items.reduce((sum, item) => sum + item.value, 0),
                data: items.map(item => ({
                  id: item.id,
                  name: item.itemKey.name,
                  value: item.value,
                  description: item.itemKey.label
                }))
              })
            );

            return {
              title: categoryName, // 'ILDC', 'SC', 'FC'
              isExpanded: false,
              value: categoryData.value,
              sections: subCategorySections
            };
          });

        // Récupérer la valeur de BI si elle est présente
        if (categories['BI']) {
          biValue = categories['BI'].value;
        }

        return {
          label: year,
          bi: biValue,
          sections: categorySections
        };
      });
    });


    // TODO : Ajouter la méthode pour recuperer les pertes declarées / detectées

    this.calculService.getLosses().subscribe(losses => {
      this.annualLossesDeclared = [];
      this.annualLossesDetected = [];

      losses.forEach(l => {
        this.annualLossesDeclared.push({ lossYear: l.lossYear, amount: l.amount });
        this.annualLossesDetected.push({ lossYear: l.lossYear, amount: l.amount * 1.5 });
      });

      this.updateChart();
    });


    this.calculService.getResult().subscribe(results => {
      results.forEach(
        r => {
          this.annualResult[r.lossYear] = r;
        }
      )
      if (results.length >= 2) {
        const lastYear = this.annualResult[2025].rwa;
        const prevYear = this.annualResult[2024].rwa;
        this.variationRWA = ((lastYear - prevYear) / prevYear) * 100; // variation %
      }
      this.businessIndicator = this.annualResult[2025].bi;
      this.businessIndicatorComponent = this.annualResult[2025].bic;
      this.internalLossMultiplier = this.annualResult[2025].ilm;
      this.ORC = this.annualResult[2025].orc;
      this.RWA = this.annualResult[2025].rwa;
      this.updateChart();
    })

    this.rebuildYears();
  }

  addLoss() {
    const value = prompt(`Nouvelle valeur pour l'année ${this.selectedYear}`);
    const year = +this.selectedYear;
    if (value !== null && this.years.includes(year)) {
      const amount = +value;

      // 🔍 On vérifie si l’année existe déjà
      const declaredIndex = this.annualLossesDeclared.findIndex(l => l.lossYear == year);
      const detectedIndex = this.annualLossesDetected.findIndex(l => l.lossYear == year);

      if (declaredIndex !== -1) {
        // 🔄 Met à jour la valeur existante
        this.annualLossesDeclared[declaredIndex].amount = amount;
      } else {
        // ➕ Ajoute une nouvelle entrée
        this.annualLossesDeclared.push({ lossYear: year, amount });
      }

      if (detectedIndex !== -1) {
        this.annualLossesDetected[detectedIndex].amount = amount * 1.5; // ou amount selon ton besoin
      } else {
        this.annualLossesDetected.push({ lossYear: year, amount: amount * 1.5 });
      }

      // 🧮 Mise à jour du graphique
      this.updateChart();
    }
  }


  exportExcel() {
    alert('Export Excel non implémenté');
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value) + ' M€';
  }

  toggleMainSection(year: number, index: number): void {
    this.allYearsData[year].sections[index].isExpanded = !this.allYearsData[year].sections[index].isExpanded;
  }

  toggleSubSection(year: number, mainIndex: number, subIndex: number): void {
    if (this.allYearsData[year].sections[mainIndex].sections) {
      this.allYearsData[year].sections[mainIndex].sections[subIndex].isExpanded =
        !this.allYearsData[year].sections[mainIndex].sections[subIndex].isExpanded;
    }
  }


  // ---------- TOOLS ------------------

  onMouseEnter(event: MouseEvent): void {
    this.biCardVisible = true;
    this.biCardX = event.clientX;
    this.biCardY = event.clientY;
  }

  onMouseLeave(): void {
    this.biCardVisible = false;
  }
}