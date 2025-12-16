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
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { codeToEnumKeyMap } from '../../core/enum/sma.enum';
import { forkJoin, map } from 'rxjs';
import { PopUpAjoutAnneeComponent } from '../../features/calcul/pop-up-ajout-annee/pop-up-ajout-annee.component';
import { MatDialog } from '@angular/material/dialog';

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

function fillRowsFromEnumCodes(
  rows: string[][],
  dataByYear: { [year: string]: { [enumKey: string]: number } },
  years: string[],
  data: string[][]
): void {
  rows.forEach(row => {
    const dataRow = [...row];
    const code = row[0];
    const enumKey = codeToEnumKeyMap[code];

    years.forEach(year => {
      const yearLabelMap = dataByYear[year] || {};
      const value = enumKey ? (yearLabelMap[enumKey] ?? 0) : 0;
      dataRow.push(value.toString(), '');
    });

    data.push(dataRow);
  });
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
  private dialog = inject(MatDialog);

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
      action: () => this.exportExcel()
    }
  ];

  biCardVisible = false;
  biCardX = 0;
  biCardY = 0;

  tranchesBI = [
    { intervalle: '≤ 1.000', coefficient: 0.12 },
    { intervalle: '1.000 < BI ≤ 30.000', coefficient: 0.15 },
    { intervalle: '> 30.000', coefficient: 0.18 }
  ];

  displayedColumnsBi = ['intervalle', 'coefficient'];

  annualLossesDeclared: { lossYear: number, amount: number }[] = [];
  annualResult: { [year: number]: any } = {};

  updateChart() {
    this.lineChartData = {
      ...this.lineChartData,
      datasets: [
        {
          ...this.lineChartData.datasets[0],
          data: this.years.map(year => {
            return Number(this.annualLossesDeclared.find(l => l.lossYear == year)?.amount || 0)
          }
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
        }
      })
  }

  ngOnInit() {

    // 1. Définir les trois Observables
    const values$ = this.calculService.getValues().pipe(
      // Utiliser 'map' pour effectuer la transformation des données 'values' ici
      map((values: BackendResponse) => {
        return Object.entries(values).map(([year, categories]) => {
          let biValue = 0;
          const categorySections: AccordionSection[] = Object.entries(categories)
            .filter(([categoryName]) => categoryName !== 'BI')
            .map(([categoryName, categoryData]) => {
              const subCategorySections: AccordionSection[] = Object.entries(categoryData.subCategories).map(
                ([subCategoryName, items]) => ({
                  title: subCategoryName,
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
                title: categoryName,
                isExpanded: false,
                value: categoryData.value,
                sections: subCategorySections
              };
            });

          if (categories['BI']) {
            biValue = categories['BI'].value;
          }

          return {
            label: year,
            bi: biValue,
            sections: categorySections
          };
        });
      })
    );

    const losses$ = this.calculService.getLosses();
    const results$ = this.calculService.getResult();

    // 2. Utiliser forkJoin pour attendre les trois
    forkJoin({
      values: values$,   // Le résultat sera stocké dans 'allYearsData' après transformation
      losses: losses$,   // Le résultat sera stocké dans 'losses'
      results: results$  // Le résultat sera stocké dans 'results'
    }).subscribe(({ values, losses, results }) => {
      // --- 3. TOUS LES APPELS SONT TERMINÉS ICI ---

      // A. Traitement des valeurs (déjà transformées dans le 'map' de values$)
      this.allYearsData = values;

      // B. Traitement des pertes (Losses)
      this.annualLossesDeclared = [];
      losses.forEach(l => {
        this.annualLossesDeclared.push({ lossYear: l.lossYear, amount: l.amount });
      });

      // C. Traitement des résultats (Results)
      results.forEach(r => {
        this.annualResult[r.lossYear] = r;
      });

      if (results.length >= 2) {
        const lastYear = this.annualResult[2025].rwa;
        const prevYear = this.annualResult[2024].rwa;
        this.variationRWA = ((lastYear - prevYear) / prevYear) * 100;
      }

      // Assurez-vous que les clés existent avant d'accéder à 2025 (surtout pour les données de test)
      if (this.annualResult[2025]) {
        this.businessIndicator = this.annualResult[2025].bi;
        this.businessIndicatorComponent = this.annualResult[2025].bic;
        this.internalLossMultiplier = this.annualResult[2025].ilm;
        this.ORC = this.annualResult[2025].orc;
        this.RWA = this.annualResult[2025].rwa;
      }


      // D. L'action finale, garantie d'être appelée en dernier
      this.rebuildYears();

    });
  }

  addLoss() {
    const value = prompt(`Nouvelle valeur pour l'année ${this.selectedYear}`);
    const year = +this.selectedYear;
    if (value !== null && this.years.includes(year)) {
      const amount = +value;

      // 🔍 On vérifie si l’année existe déjà
      const declaredIndex = this.annualLossesDeclared.findIndex(l => l.lossYear == year);

      if (declaredIndex !== -1) {
        // 🔄 Met à jour la valeur existante
        this.annualLossesDeclared[declaredIndex].amount = amount;
      } else {
        // ➕ Ajoute une nouvelle entrée
        this.annualLossesDeclared.push({ lossYear: year, amount });
      }
      this.annualLossesDeclared.push({ lossYear: year, amount: amount });

      // 🧮 Mise à jour du graphique
      this.updateChart();
    }
  }

  openAddYearDialog(): void {
    const dialogRef = this.dialog.open(PopUpAjoutAnneeComponent, {
      width: '900px',
      maxWidth: '95vw'
    });
    dialogRef.afterClosed().subscribe(_ => {
      console.log('Le dialogue a été fermé');
      // Ici vous gérerez la création de l'année après la fermeture
    });
  }

  exportExcel(): void {
    const wb = XLSX.utils.book_new();

    // Créer les données pour la feuille
    const data: any[][] = [];

    // En-tête principal
    data.push(['C 16.02 - OPERATIONAL RISK - Business Indicator Component (OPR BIC)']);
    data.push([]);

    // En-têtes des colonnes
    const headerRow1 = ['', ''];
    const headerRow2 = ['Code', 'Description'];

    const years = [2023, 2024, 2025];

    years.map(y => y.toString()).forEach(year => {
      headerRow1.push(year, '');
      headerRow2.push('Accounting Value', 'Value - Prudential Boundary Approach');
    });

    data.push(headerRow1);
    data.push(headerRow2);

    // 1. ILDC Section
    data.push(['', '1. Interest, leases and dividend component (ILDC)', '', '', '', '', '', '']);

    const dataByYear: { [year: string]: { [label: string]: number } } = {};

    years.map(y => y.toString()).forEach(year => {
      const yearData = this.allYearsData.find(d => d.label === year);
      const labelValueMap: { [label: string]: number } = {};

      if (yearData)
        yearData.sections.forEach(category => {
          category?.sections?.forEach(subCategory => {
            subCategory?.data?.forEach(item => {
              labelValueMap[item.name] = item.value;
            });
          });
        });

      dataByYear[year] = labelValueMap;
    });

    const ildcRows = [
      ['0010', 'Interest component'],
      ['0020', 'Net Income'],
      ['0030', 'Interest Income (including from leased assets (Financial & Operating))'],
      ['0040', '  Interest Income'],
      ['0050', '  Income from leased assets (Financial&Operating) other than Interest income'],
      ['0060', '  Profits from leased assets (Financial&Operating)'],
      ['0070', '(Interest expenses (including from leased assets (Financial&Operating)))'],
      ['0080', '  (Interest expenses)'],
      ['0090', '  (Expenses from operating leased assets other than Interest expenses)'],
      ['0100', '  (Losses from operating leased assets)'],
      ['0110', 'Asset component'],
      ['0120', '  Total assets'],
      ['0130', '  Cash balances at central banks and other demand deposits'],
      ['0140', '  Debt securities'],
      ['0150', '  Loans and advances'],
      ['0160', '  Derivatives'],
      ['0170', '  Trading and economic hedges'],
      ['0180', '  Hedge accounting'],
      ['0190', '  Assets subject to leases'],
      ['0200', 'Dividend component'],
      ['0210', '  Dividend income']
    ];

    const scRows = [
      ['0220', 'Other operating income'],
      ['0230', '  Other operating income from members belonging to the same IPS'],
      ['0240', '  Profit from non-current assets and disposal groups classified as held for sale'],
      ['0250', '  Other'],
      ['0260', '(Other operating expenses)'],
      ['0270', '  (Other operating expenses from members belonging to the same IPS)'],
      ['0280', '  (Total losses, expenses, provisions and other financial impacts due to operational risk events)'],
      ['0290', '  (Losses from non-current assets and disposal groups classified as held for sale)'],
      ['0300', '  (Other)'],
      ['0310', 'Fee and commission income component'],
      ['0320', '  Fee and commission income'],
      ['0330', '  of which: from members belonging to the same IPS'],
      ['0340', '(Fee and commission expenses component)'],
      ['0350', '  (Fee and commission expenses)'],
      ['0360', '  (of which: from members belonging to the same IPS)']
    ];

    const fcRows = [
      ['0370', 'Trading book component'],
      ['0380', '  Net profit or (-)loss applicable to trading book'],
      ['0390', '  Gains or (-) losses on financial assets and liabilities held for trading, net'],
      ['0400', '  Trading book - Gains or (-) losses from hedge accounting, net'],
      ['0410', '  Trading book - Exchange differences [gain or (-) loss], net'],
      ['0420', 'Banking book component'],
      ['0430', '  Net profit or (-)loss applicable to banking book'],
      ['0440', '  Gains or (-) losses on derecognition of financial assets and liabilities not measured at fair value through profit or loss, net'],
      ['0450', '  Gains or (-) losses on non-trading financial assets mandatorily at fair value through profit or loss, net'],
      ['0460', '  Gains or (-) losses on financial assets and liabilities designated at fair value through profit or loss, net'],
      ['0470', '  Banking book - Gains or (-) losses from hedge accounting, net'],
      ['0480', '  Banking book - Exchange differences [gain or (-) loss], net']
    ];
    // 1. Interest, Leases and Dividend Component (ILDC)
    fillRowsFromEnumCodes(ildcRows, dataByYear, years.map(y => y.toString()), data);

    // 2. Services Component Section (SC)
    data.push([]);
    data.push(['', '2. Services component (SC)', '', '', '', '', '', '']);
    fillRowsFromEnumCodes(scRows, dataByYear, years.map(y => y.toString()), data);

    // 3. Financial Component Section (FC)
    data.push([]);
    data.push(['', '3. Financial component (FC)', '', '', '', '', '', '']);
    fillRowsFromEnumCodes(fcRows, dataByYear, years.map(y => y.toString()), data);
    // Créer la feuille de calcul
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Définir les largeurs de colonnes
    ws['!cols'] = [
      { wch: 8 },  // Code
      { wch: 80 }, // Description
      { wch: 18 }, // 2024 Accounting
      { wch: 18 }, // 2024 Prudential
      { wch: 18 }, // 2023 Accounting
      { wch: 18 }, // 2023 Prudential
      { wch: 18 }, // 2022 Accounting
      { wch: 18 }  // 2022 Prudential
    ];

    // Fusionner les cellules pour l'en-tête principal
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }, // Titre principal
      { s: { r: 2, c: 2 }, e: { r: 2, c: 3 } }, // 2024
      { s: { r: 2, c: 4 }, e: { r: 2, c: 5 } }, // 2023
      { s: { r: 2, c: 6 }, e: { r: 2, c: 7 } }  // 2022
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'C16.02 - OPR BIC');

    // Télécharger le fichier
    XLSX.writeFile(wb, `C16_Operational_Risk_${new Date().toISOString().split('T')[0]}.xlsx`);
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