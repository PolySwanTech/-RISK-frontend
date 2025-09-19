import { AfterViewInit, Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { ActivatedRoute, Router } from '@angular/router';

import { OperatingLossFamily } from '../../../../core/enum/operatingLossFamily.enum';
import { Amount, AmountDto, AmountTypeDto, CreateAmountDto } from '../../../../core/models/Amount';
import { OperatingLossTypeDto, CreateOperatingLossDto, OperatingLoss } from '../../../../core/models/OperatingLoss';
import { AmountTypeService } from '../../../../core/services/amount/amount-type.service';
import { AmountService } from '../../../../core/services/amount/amount.service';
import { OperatingLossTypeService } from '../../../../core/services/operating-loss/operating-loss-type.service';
import { OperatingLossService } from '../../../../core/services/operating-loss/operating-loss.service';
import { IncidentService } from '../../../../core/services/incident/incident.service';
import { BusinessUnit } from '../../../../core/models/BusinessUnit';
import { EntitiesService } from '../../../../core/services/entities/entities.service';
import { GoBackButton, GoBackComponent } from '../../../../shared/components/go-back/go-back.component';
import { SnackBarService } from '../../../../core/services/snack-bar/snack-bar.service';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FilterTableComponent } from '../../../../shared/components/filter-table/filter-table.component';
import { GlobalSearchBarComponent } from '../../../../shared/components/global-search-bar/global-search-bar.component';
import { ReviewStatus, ReviewStatusLabels } from '../../../../core/enum/reviewStatus.enum';

// ------------------ Modèles locaux (form) ------------------
interface FinancialImpactDetail {
  amountType: string | null;
  accountingReference: string;
  accountingDate: string;
  amount: string;
}
interface FinancialImpact {
  id: number;
  title: string;
  businessUnitId: string;
  type: OperatingLossTypeDto | null;
  description: string;
  details: FinancialImpactDetail[];
}
interface NonFinancialImpact {
  id: number;
  title: string;
  businessUnitId: string;
  type: OperatingLossTypeDto | null;
  description: string;
  amount: string;
}
interface FormData {
  financialImpacts: FinancialImpact[];
  nonFinancialImpacts: NonFinancialImpact[];
}
type Errors = Record<string, string>;


@Component({
  selector: 'app-list-impact',
  imports: [
    CommonModule, FormsModule, GoBackComponent,
    MatCardModule, MatListModule, MatIconModule, FormsModule,
    MatGridListModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatTooltipModule, CommonModule,
    GoBackComponent, MatTableModule, MatButtonToggleModule,
    FilterTableComponent, GlobalSearchBarComponent, MatPaginator
  ],
  providers: [DatePipe, CurrencyPipe],
  templateUrl: './list-impact.component.html',
  styleUrl: './list-impact.component.scss'
})
export class ListImpactComponent implements OnInit, AfterViewInit {
  ngAfterViewInit(): void {
    // no-op
  }

  // ---------- Routing ----------
  private route = inject(ActivatedRoute);
  private router = inject(Router);


  incidentId?: string;

  // ---------- Services ----------
  private incidentService = inject(IncidentService);
  private operatingLossService = inject(OperatingLossService);
  private operatingLossTypeService = inject(OperatingLossTypeService);
  private amountTypeService = inject(AmountTypeService);
  private amountService = inject(AmountService);
  private equipeService = inject(EntitiesService);
  private snackBarService = inject(SnackBarService);


  businessUnits: BusinessUnit[] = [];
  goBackButtons: GoBackButton[] = [];

  // ---------- Contexte Incident/BU ----------
  private currentBusinessUnitId?: string;
  currentBusinessUnitName?: string;

  // ---------- Données dynamiques ----------
  financialOperatingLossTypes: OperatingLossTypeDto[] = [];
  nonFinancialOperatingLossTypes: OperatingLossTypeDto[] = [];
  financialAmountTypes: AmountTypeDto[] = [];
  nonFinancialAmountTypes: AmountTypeDto[] = [];
  estimeAmountType: AmountTypeDto | null = null;
  expandedDetails: Record<string, boolean> = {};



  // ---------- State (form) ----------
  formData: FormData = { financialImpacts: [], nonFinancialImpacts: [] };
  errors: Errors = {};
  trackById = (_: number, item: { id: number }) => item.id;

  // ---------- State (OperatingLoss existants) ----------
  existingOperatingLosses: OperatingLoss[] = [];
  existingFinancialLosses: OperatingLoss[] = [];
  existingNonFinancialLosses: OperatingLoss[] = [];
  existingAmounts: Record<string, Amount[]> = {};
  isLoadingExisting = false;
  trackByIdString = (_: number, item: { id: string }) => item.id;

  // ---------- Lifecycle ----------
  ngOnInit(): void {
    this.route.paramMap.subscribe(pm => {
      const id = pm.get('id');
      if (id) { this.incidentId = id; this.loadIncidentContext(); }
    });

    this.equipeService.loadEntities()
      .pipe(catchError(() => of([] as BusinessUnit[])))
      .subscribe(bus => { this.businessUnits = bus.filter(b => b.lm === true); });

    // Si on a déjà l’ID au snapshot, on charge tout de suite
    this.loadIncidentContext();

    // 2) Types d’impacts
    this.operatingLossTypeService
      .findByOperatingLossFamily(OperatingLossFamily.FINANCIER)
      .pipe(catchError(() => of([])))
      .subscribe((types) => (this.financialOperatingLossTypes = types));

    this.operatingLossTypeService
      .findByOperatingLossFamily(OperatingLossFamily.NON_FINANCIER)
      .pipe(catchError(() => of([])))
      .subscribe((types) => (this.nonFinancialOperatingLossTypes = types));

    // 3) Types de montants
    this.amountTypeService
      .findByOperatingLossFamily(OperatingLossFamily.FINANCIER)
      .pipe(catchError(() => of([])))
      .subscribe((amountTypes) => (this.financialAmountTypes = amountTypes));

    this.amountTypeService
      .findByOperatingLossFamily(OperatingLossFamily.NON_FINANCIER)
      .pipe(catchError(() => of([])))
      .subscribe((amountTypes) => {
        this.nonFinancialAmountTypes = amountTypes;
        const found = amountTypes.find((t) => t.libelle?.includes('ESTIME'));
        this.estimeAmountType = found || amountTypes[0] || null;
      });
    this.goBackButtons = [
        {
          label: 'Ajouter un impact',
          icon: 'add',
          class: 'btn-primary',
          show: true,
          action: () => this.addImpact()
        }
      ];
    }
    
    addImpact() {
      this.router.navigate(['incident', this.incidentId, 'impacts', 'create']);
    }

  loadAmountsForOperatingLoss(operatingLossId: string) {
  this.amountService.listByOperatingLoss(operatingLossId)
    .pipe(catchError(() => of([] as AmountDto[])))
    .subscribe(amountDtos => {
      this.existingAmounts[operatingLossId] = amountDtos.map(a => Amount.fromDto(a));
    });
    console.log(this.existingAmounts);
}

  deactivateAmount(id: string, operatingLossId: string) {
    if (!id) return;
    if (!window.confirm('Désactiver ce montant ?')) return;

    this.amountService.deactivate(id)
      .pipe(
        catchError((e) => {
          console.error('Erreur désactivation montant', e);
          this.snackBarService.error('Erreur lors de la désactivation du montant.');
          return of(void 0);
        })
      )
      .subscribe(() => {
        this.snackBarService.success('Montant désactivé.');
        this.loadAmountsForOperatingLoss(operatingLossId);
      });
  }

  /** Charge teamId/teamName depuis l'incident, et applique la BU aux éléments du formulaire. */
  private loadIncidentContext() {
    if (!this.incidentId) return;

    this.incidentService.getIncidentById(this.incidentId).pipe(
      catchError((e) => { console.error('Erreur chargement incident', e); return of(null); })
    ).subscribe(incident => {
      if (!incident) return;

      this.currentBusinessUnitId = incident.teamId ?? undefined;
      this.currentBusinessUnitName = incident.teamName ?? undefined;

      // Charger les impacts déjà associés
      this.refreshExistingOperatingLosses();
    });
  }

 refreshExistingOperatingLosses() {
  if (!this.incidentId) return;
  this.isLoadingExisting = true;

  this.operatingLossService
    .listByIncident(this.incidentId)
    .pipe(catchError(() => of([] as OperatingLoss[])))
    .subscribe((losses) => {
      this.existingOperatingLosses = losses;
      this.existingFinancialLosses = losses.filter(
        (l) => l?.type?.family === OperatingLossFamily.FINANCIER
      );
      this.existingNonFinancialLosses = losses.filter(
        (l) => l?.type?.family === OperatingLossFamily.NON_FINANCIER
      );

      // Charger les montants pour chaque OperatingLoss
      losses.forEach((l) => this.loadAmountsForOperatingLoss(l.id));

      this.isLoadingExisting = false;
    });
}

  deactivateOperatingLoss(id: string) {
    if (!id) return;
    if (!window.confirm('Désactiver cet impact ?')) return;

    this.operatingLossService.deactivate(id)
      .pipe(
        catchError((e) => {
          console.error('Erreur désactivation', e);
          this.snackBarService.error('Erreur lors de la désactivation de l’impact.');
          return of(void 0);
        })
      )
      .subscribe(() => {
        this.snackBarService.success('Impact désactivé.');
        this.refreshExistingOperatingLosses();
      });
  }

  toggleDetails(olId: string) {
  this.expandedDetails[olId] = !this.expandedDetails[olId];
}

  // ---------- Financier ----------
  addFinancialImpact() {
    this.formData = {
      ...this.formData,
      financialImpacts: [
        ...this.formData.financialImpacts,
        {
          id: Date.now(),
          title: '',
          businessUnitId: '',
          type: null,
          description: '',
          details: [{ amountType: null, accountingReference: '', accountingDate: '', amount: '' }],
        },
      ],
    };
  }
  addFinancialDetail(i: number) {
    this.formData.financialImpacts[i].details.push({ amountType: null, accountingReference: '', accountingDate: '', amount: '' });
  }
  removeFinancialDetail(i: number, j: number) {
    this.formData.financialImpacts[i].details.splice(j, 1);
  }

  // ---------- Non financier ----------
  addNonFinancialImpact() {
    this.formData = {
      ...this.formData,
      nonFinancialImpacts: [
        ...this.formData.nonFinancialImpacts,
        {
          id: Date.now(),
          title: '',
          businessUnitId: '',
          type: null,
          description: '',
          amount: '',
        },
      ],
    };
  }
  removeItem(type: keyof FormData, id: number) {
    const list = (this.formData[type] as any[]) ?? [];
    this.formData = { ...this.formData, [type]: list.filter((it) => it.id !== id) } as FormData;
  }

  // ---------- Validation ----------
  validateForm(): boolean {
    const newErrors: Errors = {};

    if (!this.incidentId) {
      newErrors['impacts'] = 'Incident non défini. Impossible d’associer les impacts.';
    }

    if (this.formData.financialImpacts.length === 0 && this.formData.nonFinancialImpacts.length === 0) {
      newErrors['impacts'] = (newErrors['impacts'] ? newErrors['impacts'] + ' ' : '') +
        'Ajoutez au moins un impact (financier ou non financier).';
    }

    // Non financier
    this.formData.nonFinancialImpacts.forEach((imp, i) => {
      if (!imp.title || !imp.type || !imp.businessUnitId) {
        newErrors[`nonfinancial_${i}`] = 'Titre, Entité, type et description sont requis.';
      }
      if (!imp.amount || isNaN(+imp.amount)) {
        newErrors[`nonfinancial_${i}`] = (newErrors[`nonfinancial_${i}`] ? newErrors[`nonfinancial_${i}`] + ' ' : '') +
          'Montant (estimé) requis et numérique.';
      }
      if (!this.estimeAmountType) {
        newErrors[`nonfinancial_${i}`] = (newErrors[`nonfinancial_${i}`] ? newErrors[`nonfinancial_${i}`] + ' ' : '') +
          'Impossible de déterminer le type de montant "ESTIME".';
      }
    });

    // Financier
    this.formData.financialImpacts.forEach((imp, i) => {
      if (!imp.title || !imp.type || !imp.businessUnitId) {
        newErrors[`financial_${i}`] = 'Titre, Entité, type et description sont requis.';
      }
      if (!imp.details.length) {
        newErrors[`financial_details_${i}`] = 'Ajoutez au moins un type de montant.';
      } else {
        const anyMissing = imp.details.some(
          (d) => !d.amountType || !d.amount || isNaN(+d.amount)
        );
        if (anyMissing) {
          newErrors[`financial_details_${i}`] =
            'Chaque détail doit avoir un type de montant et un montant numérique.';
        }
        const dateInvalid = imp.details.some(
          (d) => d.accountingDate && !/^\d{4}-\d{2}-\d{2}$/.test(d.accountingDate)
        );
        if (dateInvalid) {
          newErrors[`financial_details_${i}`] =
            (newErrors[`financial_details_${i}`] ? newErrors[`financial_details_${i}`] + ' ' : '') +
            'Format de date attendu AAAA-MM-JJ.';
        }
      }
    });

    this.errors = newErrors;
    return Object.keys(newErrors).length === 0;
  }

  // ---------- Submit ----------
  handleSubmit() {
    if (!this.validateForm()) return;
    if (!this.incidentId || !this.currentBusinessUnitId) return;

    const incidentId = this.incidentId;

    const creations$ = [
      // 1) Financiers
      ...this.formData.financialImpacts.map((imp) => {
        const dto: CreateOperatingLossDto = {
          type: imp.type!,
          incidentId,
          businessUnitId: imp.businessUnitId,
          libelle: imp.title,
          description: imp.description || null,
        };

        return this.operatingLossService.create(dto, 'Création impact financier').pipe(
          switchMap((operatingLossId: string) => {
            if (!operatingLossId) return of(null);

            const amountCalls = imp.details.map((d) => {
              const amountDto: CreateAmountDto = {
                amountType: d.amountType!,
                montant: +d.amount,
                comptabilityRef: d.accountingReference || null,
                comptabilisationDate: d.accountingDate || null,
              };
              return this.amountService.create(operatingLossId, amountDto);
            });
            return amountCalls.length ? forkJoin(amountCalls) : of(null);
          }),
          catchError((e) => { console.error('Erreur création impact financier', e); return of(null); })
        );
      }),

      // 2) Non financiers
      ...this.formData.nonFinancialImpacts.map((imp) => {
        const dto: CreateOperatingLossDto = {
          type: imp.type!,
          incidentId,
          businessUnitId: imp.businessUnitId,
          libelle: imp.title,
          description: imp.description || null,
        };

        return this.operatingLossService.create(dto, 'Création impact non financier').pipe(
          switchMap((operatingLossId: string) => {
            if (!operatingLossId) return of(null);

            const amountDto: CreateAmountDto = {
              amountType: this.estimeAmountType!.libelle,
              montant: +imp.amount,
              comptabilityRef: null,
              comptabilisationDate: null,
            };
            return this.amountService.create(operatingLossId, amountDto);
          }),
          catchError((e) => { console.error('Erreur création impact non financier', e); return of(null); })
        );
      }),
    ];

    forkJoin(creations$)
      .pipe(catchError((e) => { console.error(e); return of([]); }))
      .subscribe({
        next:() => {
          this.snackBarService.success('Impact(s) opérationnel(s) créé(s) avec succès !');
          this.resetForm();
          this.refreshExistingOperatingLosses();
        },
        error:() => {  this.snackBarService.error('Erreur lors de la création des impacts.'); }
      });
  }

  onCancel() {
    if (window.confirm('Êtes-vous sûr de vouloir annuler ? Toutes les données saisies seront perdues.')) {
      this.resetForm();
    }
  }

  resetForm() {
    this.formData = { financialImpacts: [], nonFinancialImpacts: [] };
    this.errors = {};
  }

  getReviewStatusLabel(rs: ReviewStatus): string {
    return ReviewStatusLabels[rs];
  }

  trackByAmountId = (_: number, item: Amount) => item.id;

}
