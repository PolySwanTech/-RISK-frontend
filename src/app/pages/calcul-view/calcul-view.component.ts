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
import { SmaInputCreateDto, SmaLossUpsert, SmaPayload } from '../../core/models/Sma';
import { SmaResult } from '../../core/models/SmaResult';
import { ConfirmService } from '../../core/services/confirm/confirm.service';
import { NgChartsModule } from 'ng2-charts';
import { MatInputModule } from '@angular/material/input';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { CommonModule, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
    MatSelectModule, MatTableModule, GoBackComponent, CommonModule, NgFor, FormsModule],
  templateUrl: './calcul-view.component.html',
  styleUrl: './calcul-view.component.scss'
})
export class CalculViewComponent {

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private calculService = inject(CalculService);
  private confirmService = inject(ConfirmService);
  private snackBarService = inject(SnackBarService);

  businessIndicator = 0;
  businessIndicatorComponent = 0;
  internalLossMultiplier = 0;
  exigenceFinale = 0;

  allYearsData: YearTabData[] = []

  years: number[] = [];

  formData: any = {
    period_year: new Date().getFullYear(),
    pertes_annuelles: {},
    ratio_cet1: 8.0,
    exemption_ilm: false
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


  historiqueCalculs: any[] = [];
  displayedColumns = ['periode', 'bi', 'bic', 'ilm', 'exigenceFinale', 'statut'];

  ildcData: any[] = [];

  scData: any[] = [];

  fcData: any[] = [];

  historiquePertes: { annee: number; perte: number }[] = [];

  tranchesBI = [
    { intervalle: '≤ 1.000', coefficient: 0.12 },
    { intervalle: '1.000 < BI ≤ 30.000', coefficient: 0.15 },
    { intervalle: '> 30.000', coefficient: 0.18 }
  ];

  displayedColumnsBi = ['intervalle', 'coefficient'];

  result?: SmaResult;


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

    this.rebuildYears();
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

  getAverageBiOverLast3Years(): number {
    if (!this.allYearsData || this.allYearsData.length < 3) return 0;

    const sortedData = [...this.allYearsData]
      .sort((a, b) => parseInt(b.label) - parseInt(a.label)) // Trier par année décroissante

    const last3Years = sortedData.slice(0, 3);

    const totalBi = last3Years.reduce((sum, yearData) => sum + (yearData.bi || 0), 0);
    return totalBi / 3;
  }

  getBic(): number {
    const bi = this.getAverageBiOverLast3Years();
    if (bi <= 1000)
      return bi * 0.12
    else if (bi > 1000 && bi <= 30000)
      return bi * 0.15;
    else if (bi > 30000)
      return bi * 0.18
    else
      return 0;
  }

  biCardVisible = false;
  biCardX = 0;
  biCardY = 0;

  onMouseEnter(event: MouseEvent): void {
    this.biCardVisible = true;
    this.biCardX = event.clientX;
    this.biCardY = event.clientY;
  }

  onMouseLeave(): void {
    this.biCardVisible = false;
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
    const financialData: any = {};

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

  // Mapping of JSON keys to correct fields
  mapDataToSection = (yearData: any) => ({
    label: 'Last Year', // Update label per year if needed
    sections: [
      {
        title: '1. Interest, leases and dividend component (ILDC)',
        isExpanded: false,
        sections: [
          {
            title: 'Interest Income (including from leased assets (Financial & Operating)) (parent)',
            isExpanded: false,
            data: [
              { id: 1, name: "Interest Income", value: yearData.INTEREST_INCOME, description: "Test" },
              { id: 2, name: "Income from leased assets (Financial&Operating) other than Interest income", value: yearData.INCOME_FROM_LEASED_ASSETS, description: "Test" },
              { id: 3, name: "Profits from leased assets (Financial&Operating)", value: yearData.PROFITS_FROM_LEASED_ASSETS, description: "Test" }
            ]
          },
          {
            title: '(Interest expenses (including from leased assets (Financial&Operating))) (parent)',
            isExpanded: false,
            data: [
              { id: 1, name: "(Interest expenses)", value: yearData.INTEREST_EXPENSES, description: "Test" },
              { id: 2, name: "(Expenses from operating leased assets other than Interest expenses)", value: yearData.EXPENSES_FROM_LEASED_ASSETS, description: "Test" },
              { id: 3, name: "(Losses from operating leased assets)", value: yearData.LOSSES_FROM_LEASED_ASSETS, description: "Test" }
            ]
          },
          {
            title: 'Asset component (parent)',
            isExpanded: false,
            data: [
              { id: 1, name: "Cash balances at central banks and other demand deposits", value: yearData.CASH_BALANCES, description: "Test" },
              { id: 2, name: "Debt securities", value: yearData.DEBT_SECURITIES, description: "Test" },
              { id: 3, name: "Loans and advances", value: yearData.LOANS_AND_ADVANCES, description: "Test" },
              { id: 4, name: "Derivatives", value: yearData.DERIVATIVES, description: "Test" },
              { id: 5, name: "Assets subject to leases ", value: yearData.ASSETS_SUBJECT_TO_LEASES, description: "Test" }
            ]
          },
          {
            title: 'Dividend component (parent)',
            isExpanded: false,
            data: [
              { id: 1, name: "Dividend income", value: yearData.DIVIDEND_INCOME, description: "Test" }
            ]
          }
        ]
      },
      {
        title: '2. Services component (SC)',
        isExpanded: false,
        sections: [
          {
            title: 'Other operating income (parent)',
            isExpanded: false,
            data: [
              { id: 1, name: "Other operating income from members belonging to the same IPS", value: yearData.OTHER_OPERATING_INCOME_IPS, description: "Test" },
              { id: 2, name: "Profit from non-current assets and disposal groups classified as held for sale not qualifying as discontinued operations", value: yearData.PROFIT_NON_CURRENT_ASSETS, description: "Test" },
              { id: 3, name: "Other", value: yearData.OTHER_OPERATING_INCOME, description: "Test" }
            ]
          },
          {
            title: '(Other operating expenses) (parent)',
            isExpanded: false,
            data: [
              { id: 1, name: "(Other operating expenses from members belonging to the same IPS)", value: yearData.OTHER_OPERATING_EXPENSES_IPS, description: "Test" },
              { id: 2, name: "(Total losses, expenses, provisions and other financial impacts due to from operational risk events)", value: yearData.LOSSES_FROM_OPERATIONAL_RISK, description: "Test" },
              { id: 3, name: "(Losses from non-current assets and disposal groups classified as held for sale not qualifying as discontinued operations)", value: yearData.LOSSES_NON_CURRENT_ASSETS, description: "Test" },
              { id: 4, name: "(Other)", value: yearData.OTHER_EXPENSES, description: "Test" }
            ]
          },
          {
            title: 'Fee and commission income component (parent)',
            isExpanded: false,
            data: [
              { id: 1, name: "Fee and commission income", value: yearData.FEE_COMMISSION_INCOME, description: "Test" }
            ]
          },
          {
            title: '(Fee and commission expenses component) (parent)',
            isExpanded: false,
            data: [
              { id: 1, name: "(Fee and commission expenses)", value: yearData.FEE_COMMISSION_EXPENSES, description: "Test" }
            ]
          }
        ]
      },
      {
        title: '3. Financial component (FC)',
        isExpanded: false,
        sections: [
          {
            title: 'Net profit or (-)loss applicable to trading book (parent)',
            isExpanded: false,
            data: [
              { id: 1, name: "Gains or (-) losses on financial assets and liabilities held for trading or trading, net", value: yearData.TRADING_BOOK_PROFIT, description: "Test" },
              { id: 2, name: "Trading book - Gains or (-) losses from hedge accounting, net ", value: yearData.TRADING_BOOK_HEDGE, description: "Test" },
              { id: 3, name: "Trading book - Exchange differences [gain or (-) loss], net", value: yearData.TRADING_BOOK_EXCHANGE, description: "Test" }
            ]
          },
          {
            title: 'Net profit or (-)loss applicable to banking book (parent)',
            isExpanded: false,
            data: [
              { id: 1, name: "Gains or (-) losses on derecognition of financial assets and liabilities not measured at fair value through profit or loss, net", value: yearData.BANKING_BOOK_DERECOGNITION, description: "Test" },
              { id: 2, name: "Gains or (-) losses on non-trading financial assets mandatorily at fair value through profit or loss, net", value: yearData.BANKING_BOOK_NON_TRADING_FAIR_VALUE, description: "Test" },
              { id: 3, name: "Gains or (-) losses on financial assets and liabilities designated at fair value through profit or loss, net", value: yearData.BANKING_BOOK_FAIR_VALUE_DESIGNATED, description: "Test" },
              { id: 4, name: "Banking book - Gains or (-) losses from hedge accounting, net ", value: yearData.BANKING_BOOK_HEDGE, description: "Test" },
              { id: 5, name: "Banking book - Exchange differences [gain or (-) loss], net", value: yearData.BANKING_BOOK_EXCHANGE, description: "Test" }
            ]
          }
        ]
      }
    ]
  });

  toggleMainSection(year: number, index: number): void {
    this.allYearsData[year].sections[index].isExpanded = !this.allYearsData[year].sections[index].isExpanded;
  }

  toggleSubSection(year: number, mainIndex: number, subIndex: number): void {
    if (this.allYearsData[year].sections[mainIndex].sections) {
      this.allYearsData[year].sections[mainIndex].sections[subIndex].isExpanded =
        !this.allYearsData[year].sections[mainIndex].sections[subIndex].isExpanded;
    }
  }

  // Méthode pour ouvrir toutes les sections principales
  expandAll(): void {
    for (let year of this.allYearsData) {
      year.sections.forEach(section => {
        section.isExpanded = true;
        if (section.sections)
          section.sections.forEach(subSection => subSection.isExpanded = true);
      });
    }
  }

  // Méthode pour fermer toutes les sections
  collapseAll(): void {
    for (let year of this.allYearsData) {
      year.sections.forEach(section => {
        section.isExpanded = false;
        if (section.sections)
          section.sections.forEach(subSection => subSection.isExpanded = false);
      });
    }
  }
}