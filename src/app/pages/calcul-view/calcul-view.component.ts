import { Component, inject, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { GoBackComponent } from '../../shared/components/go-back/go-back.component';
import { CalculService } from '../../core/services/calcul/calcul.service';
import { SmaInputCreateDto, SmaLossUpsert } from '../../core/models/Sma';
import { ConfirmService } from '../../core/services/confirm/confirm.service';
import { BaseChartDirective, NgChartsModule } from 'ng2-charts';
import { MatInputModule } from '@angular/material/input';
import { ChartConfiguration, ChartEvent, ChartOptions } from 'chart.js';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SnackBarService } from '../../core/services/snack-bar/snack-bar.service';

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
  private fb = inject(FormBuilder);

  businessIndicator = 0;
  businessIndicatorComponent = 0;
  internalLossMultiplier = 0;
  ORC = 0;
  RWA = 0;

  allYearsData: YearTabData[] = []

  years: number[] = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

  formData: any = {
    period_year: new Date().getFullYear(),
    pertes_annuelles: {},
    ratio_cet1: 8.0,
    exemption_ilm: false
  };

  pertesForm: FormGroup;

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

  goBackButtons = [
    {
      label: 'Lancer le calcul',
      icon: 'play_arrow',
      class: 'btn-purple',
      show: true,
      action: () => this.goToCalcul()
    },
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

  constructor() {
    // Construire le formulaire dynamique dans le constructeur
    const controls = this.years.reduce((acc, year) => {
      acc['perte_' + year] = new FormControl(this.formData.pertes_annuelles[year] || null);
      return acc;
    }, {} as { [key: string]: FormControl });

    this.pertesForm = this.fb.group(controls);

    this.pertesForm.valueChanges.subscribe(values => {
      for (const key in values) {
        if (values.hasOwnProperty(key)) {
          const year = key.replace('perte_', '');
          this.formData.pertes_annuelles[year] = values[key];
        }
      }
      this.updateChart();
    });
  }

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

  rebuildYears(losses: any[]) {
    losses.forEach(l => {
      this.pertesForm.get(`perte_${l.lossYear}`)?.setValue(l.amount);
      // if (this.formData.pertes_annuelles[`perte_${l.lossYear}`] === undefined) this.formData.pertes_annuelles[`perte_${l.lossYear}`] = l.amount;
    });
    this.lineChartData.labels = this.years.map(String);
  }

  validateLosses() {
    this.confirmService.openConfirmDialog("Confirmation", "Confirmer la sauvegarde des pertes ?")
      .subscribe(res => {
        if (res) {
          const lossesList = Object.entries(this.formData.pertes_annuelles).map(
            ([year, value]) => ({
              lossYear: +year,
              amount: +(value as string)
            })
          );

          this.calculService.saveLosses(lossesList).subscribe();
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

    this.calculService.getLosses().subscribe(losses => {
      this.rebuildYears(losses);
    })

    this.calculService.getResult().subscribe(results => {
      this.businessIndicator = results[0].bi;
      this.businessIndicatorComponent = results[0].bic;
      this.internalLossMultiplier = results[0].ilm;
      this.ORC = results[0].orc;
      this.RWA = results[0].rwa;
    })

  }

  goToCalcul() {
    console.log("calcul")
  }

  onChartClick(event: { event?: ChartEvent, active?: any[] }) {
    if (!event.event) return;

    const canvasPosition = event.event;
    const chart = this.chartComponent.chart; // Instance Chart.js (à récupérer selon votre setup)

    if (!chart) return;
    // La position du clic relative au canvas
    const clickX = canvasPosition.x;
    const clickY = canvasPosition.y;

    if (!clickX || !clickY) return;

    // Position de l'axe X (exemple, à ajuster selon le graphique)
    // Normalement, axe X est proche du bas, on peut récupérer la position via chart.chartArea
    const chartArea = chart.chartArea;

    // Largeur de la zone graphique
    const width = chartArea.right - chartArea.left;

    // Position relative sur l'axe X (entre 0 et 1)
    const relativeX = (clickX - chartArea.left) / width;

    const index = Math.floor(relativeX * (this.years.length));
    if (index >= 0 && index < this.years.length) {
      const selectedYear = this.years[index];
      if (this.formData.pertes_annuelles[selectedYear] !== undefined && this.formData.pertes_annuelles[selectedYear] !== null) {
        alert(`Une valeur existe déjà pour l'année ${selectedYear}: ${this.formData.pertes_annuelles[selectedYear]}`);
        return;
      }
      const value = prompt(`Nouvelle valeur pour l'année ${selectedYear}`);

      if (value !== null) {
        this.pertesForm.get('perte_' + selectedYear)?.setValue(value);
        // Le subscribe valueChanges prendra le relais pour mettre à jour formData et redraw le chart
      }
    } else {
      console.warn('Index hors limites :', index);
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