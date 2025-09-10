import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { ActivatedRoute } from '@angular/router';

import { OperatingLossFamily } from '../../../../core/enum/operatingLossFamily.enum';
import { AmountTypeDto, CreateAmountDto } from '../../../../core/models/Amount';
import { OperatingLossTypeDto, CreateOperatingLossDto } from '../../../../core/models/OperatingLoss';
import { AmountTypeService } from '../../../../core/services/amount/amount-type.service';
import { AmountService } from '../../../../core/services/amount/amount.service';
import { OperatingLossTypeService } from '../../../../core/services/operating-loss/operating-loss-type.service';
import { OperatingLossService } from '../../../../core/services/operating-loss/operating-loss.service';
import { IncidentService } from '../../../../core/services/incident/incident.service';
import { EquipeService, Equipe } from '../../../../core/services/equipe/equipe.service';
import { BusinessUnit } from '../../../../core/models/BusinessUnit';
import { EntitiesService } from '../../../../core/services/entities/entities.service';
import { GoBackButton, GoBackComponent } from '../../../../shared/components/go-back/go-back.component';

// ------------------ Modèles locaux (form) ------------------
interface FinancialImpactDetail {
  amountType: string | null;
  accountingDate: string;
  amount: string;
}
interface FinancialImpact {
  id: number;
  title: string;
  businessUnitId: string;
  type: OperatingLossTypeDto | null;
  description: string;
  accountingReference: string;
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
  selector: 'app-create-operational-impact',
  standalone: true,
  imports: [CommonModule, FormsModule, GoBackComponent],
  templateUrl: './create-operational-impact.component.html',
  styleUrl: './create-operational-impact.component.scss',
})
export class CreateOperationalImpactComponent implements OnInit {

  // ---------- Routing ----------
  private route = inject(ActivatedRoute);

  incidentId?: string;

  // ---------- Services ----------
  private incidentService = inject(IncidentService);
  private operatingLossService = inject(OperatingLossService);
  private operatingLossTypeService = inject(OperatingLossTypeService);
  private amountTypeService = inject(AmountTypeService);
  private amountService = inject(AmountService);
  private equipeService = inject(EntitiesService);

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

  // ---------- State ----------
  formData: FormData = { financialImpacts: [], nonFinancialImpacts: [] };
  errors: Errors = {};
  trackById = (_: number, item: { id: number }) => item.id;

  // ---------- Lifecycle ----------
  ngOnInit(): void {
    this.route.paramMap.subscribe(pm => {
      const id = pm.get('id');
      if (id) { this.incidentId = id; this.loadIncidentContext(); }
    });

    this.equipeService.loadEntities()
    .pipe(catchError(() => of([] as BusinessUnit[])))
    .subscribe(bus => {this.businessUnits = bus.filter(b => b.lm === true); });

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
    });
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
          accountingReference: '',
          details: [{ amountType: null, accountingDate: '', amount: '' }],
        },
      ],
    };
  }
  addFinancialDetail(i: number) {
    this.formData.financialImpacts[i].details.push({ amountType: null, accountingDate: '', amount: '' });
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
      if (!imp.title || !imp.type || !imp.description || !imp.businessUnitId) {
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
      if (!imp.title || !imp.type || !imp.description || !imp.businessUnitId) {
        newErrors[`financial_${i}`] = 'Titre, Entité, type et description sont requis.';
      }
      if (!imp.details.length) {
        newErrors[`financial_details_${i}`] = 'Ajoutez au moins un type de montant.';
      } else {
        // Date optionnelle
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
    const buId = this.currentBusinessUnitId;

    const creations$ = [
      // 1) Financiers
      ...this.formData.financialImpacts.map((imp) => {
        const dto: CreateOperatingLossDto = {
          type: imp.type!,
          incidentId,
          businessUnitId: imp.businessUnitId,
          libelle: imp.title,
          description: imp.description || null,
          comptabilityRef: imp.accountingReference || null,
        };

        return this.operatingLossService.create(dto, 'Création impact financier').pipe(
          switchMap((operatingLossId: string) => {
            if (!operatingLossId) return of(null);

            const amountCalls = imp.details.map((d) => {
              const amountDto: CreateAmountDto = {
                amountType: d.amountType!,
                montant: +d.amount,
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
          businessUnitId: imp.businessUnitId, // on force la BU de l’incident
          libelle: imp.title,
          description: imp.description || null,
          comptabilityRef: null,
        };

        return this.operatingLossService.create(dto, 'Création impact non financier').pipe(
          switchMap((operatingLossId: string) => {
            if (!operatingLossId) return of(null);

            const amountDto: CreateAmountDto = {
              amountType: this.estimeAmountType!.libelle,
              montant: +imp.amount,
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
      .subscribe(() => {
        alert('Impact(s) opérationnel(s) créé(s) avec succès !');
        this.resetForm();
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
}
