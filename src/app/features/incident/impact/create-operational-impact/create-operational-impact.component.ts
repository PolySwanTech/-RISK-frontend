import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import { ActivatedRoute } from '@angular/router';

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
import { OperatingLossState } from '../../../../core/enum/operatingLossState.enum';
import { ReviewStatus } from '../../../../core/enum/reviewStatus.enum';
import { FileService } from '../../../../core/services/file/file.service';
import { TargetType } from '../../../../core/enum/targettype.enum';
import { ConfirmService } from '../../../../core/services/confirm/confirm.service';
import { EnumLabelPipe } from '../../../../shared/pipes/enum-label.pipe';

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
  selector: 'app-create-operational-impact',
  standalone: true,
  imports: [CommonModule, FormsModule, GoBackComponent, EnumLabelPipe],
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
  private snackBarService = inject(SnackBarService);
  private fileService = inject(FileService);
  private confirmService = inject(ConfirmService);

  allBusinessUnits: BusinessUnit[] = [];

  goBackButtons: GoBackButton[] = [];

  TargetType = TargetType;

  attachedCounts: Record<string, number> = {};


  // ---------- Contexte Incident/BU ----------
  private currentBusinessUnitId?: string;
  currentBusinessUnitName?: string;

  // ---------- Données dynamiques ----------
  financialOperatingLossTypes: OperatingLossTypeDto[] = [];
  nonFinancialOperatingLossTypes: OperatingLossTypeDto[] = [];
  financialAmountTypes: AmountTypeDto[] = [];
  nonFinancialAmountTypes: AmountTypeDto[] = [];
  estimeAmountType: AmountTypeDto | null = null;

  newAmounts: Record<string, { amountType: string | null; accountingReference: string; accountingDate: string; amount: string }> = {};
  showAddAmountForm: Record<string, boolean> = {};

  // ---------- Expansion ----------
  expandedDetails: Record<string, boolean> = {};
  expandedImpacts: Record<string, boolean> = {};




  // ---------- State (OperatingLoss existants) ----------
  existingOperatingLosses: OperatingLoss[] = [];
  existingFinancialLosses: OperatingLoss[] = [];
  existingNonFinancialLosses: OperatingLoss[] = [];
  existingAmounts: Record<string, Amount[]> = {};
  selectedImpacts: Record<string, boolean> = {};
  selectedAmounts: Record<string, Record<string, boolean>> = {};
  trackByIdString = (_: number, item: { id: string }) => item.id;

  // ---------- State ----------
  formData: FormData = { financialImpacts: [], nonFinancialImpacts: [] };
  errors: Errors = {};
  trackById = (_: number, item: { id: number }) => item.id;

  // ---------- Lifecycle ----------
  ngOnInit(): void {
    this.route.paramMap.subscribe(pm => {
      const id = pm.get('id');
      if (id) {
        this.incidentId = id;
        this.loadIncidentContext();
      }
    });

    this.equipeService.loadEntities(true)
      .pipe(catchError(() => of([] as BusinessUnit[])))
      .subscribe(bus => {
        this.allBusinessUnits = bus;
      });

    this.operatingLossTypeService
      .findByOperatingLossFamily(OperatingLossFamily.FINANCIER)
      .pipe(catchError(() => of([])))
      .subscribe(types => (this.financialOperatingLossTypes = types));

    this.operatingLossTypeService
      .findByOperatingLossFamily(OperatingLossFamily.NON_FINANCIER)
      .pipe(catchError(() => of([])))
      .subscribe(types => (this.nonFinancialOperatingLossTypes = types));

    this.amountTypeService
      .findByOperatingLossFamily(OperatingLossFamily.FINANCIER)
      .pipe(catchError(() => of([])))
      .subscribe(amountTypes => (this.financialAmountTypes = amountTypes));

    this.amountTypeService
      .findByOperatingLossFamily(OperatingLossFamily.NON_FINANCIER)
      .pipe(catchError(() => of([])))
      .subscribe(amountTypes => {
        this.nonFinancialAmountTypes = amountTypes;
        const found = amountTypes.find(t => t.libelle?.includes('ESTIME'));
        this.estimeAmountType = found || amountTypes[0] || null;
      });

    this.goBackButtons = [
      {
        label: 'Valider la sélection',
        icon: 'check_circle',
        class: 'btn-secondary',
        show: true,
        action: () => this.validateSelected(),
      },
      {
        label: 'Rejeter la sélection',
        icon: 'cancel',
        class: 'btn-tertiary',
        show: true,
        action: () => this.rejectSelected(),
      },
      {
        label: 'Désactiver',
        icon: '',
        class: 'btn-primary',
        show: true,
        action: () => this.deactivateSelected(),
      }
    ];
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
          businessUnitId: this.currentBusinessUnitId ? this.currentBusinessUnitId : '',
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

  toggleImpactSelection(impactId: string, amounts: Amount[]) {
    const newState = !this.selectedImpacts[impactId];
    this.selectedImpacts[impactId] = newState;

    // init si pas encore fait
    this.selectedAmounts[impactId] = this.selectedAmounts[impactId] || {};

    // Appliquer la sélection à tous les montants de l’impact
    amounts.forEach(a => this.selectedAmounts[impactId][a.id] = newState);
  }

  trackByAmountId(index: number, amount: Amount) {
    return amount.id;
  }


  toggleAmountSelection(impactId: string, amountId: string) {

    this.selectedAmounts[impactId] = this.selectedAmounts[impactId] || {};
    const newState = !this.selectedAmounts[impactId][amountId];
    this.selectedAmounts[impactId][amountId] = newState;

    // Vérifier si tous les montants de l’impact sont cochés
    const allSelected = Object.values(this.selectedAmounts[impactId]).every(v => v);
    this.selectedImpacts[impactId] = allSelected;
  }


  toggleAddAmountForm(operatingLossId: string) {
    this.showAddAmountForm[operatingLossId] = !this.showAddAmountForm[operatingLossId];

    // init form si pas encore fait
    if (!this.newAmounts[operatingLossId]) {
      this.newAmounts[operatingLossId] = { amountType: null, accountingReference: '', accountingDate: '', amount: '' };
    }
  }

  toggleDetails(id: string) {
    this.expandedDetails[id] = !this.expandedDetails[id];
  }

  toggleImpactDetails(event: any, id: string) {
    event.stopPropagation();
    this.expandedImpacts[id] = !this.expandedImpacts[id];
  }

  // ajout
  addAmountToExistingImpact(operatingLossId: string) {
    const form = this.newAmounts[operatingLossId];
    if (!form || !form.amountType || !form.amount) {
      this.snackBarService.error("Veuillez renseigner le type et le montant.");
      return;
    }

    const dto: CreateAmountDto = {
      amountType: form.amountType,
      montant: +form.amount,
      comptabilityRef: form.accountingReference || null,
      comptabilisationDate: form.accountingDate || null,
    };

    this.amountService.create(operatingLossId, dto)
      .pipe(catchError((e) => {
        console.error("Erreur ajout montant", e);
        this.snackBarService.error("Erreur lors de l’ajout du montant.");
        return of(null);
      }))
      .subscribe((created) => {
        if (created) {
          this.snackBarService.success("Montant ajouté avec succès !");
          this.loadAmountsForOperatingLoss(operatingLossId);
          this.toggleAddAmountForm(operatingLossId);
        }
      });
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

  refreshExistingOperatingLosses() {
    if (!this.incidentId) return;

    this.operatingLossService
      .listByIncident(this.incidentId)
      .pipe(
        catchError(() => of([] as OperatingLoss[])),
        switchMap(losses => {
          this.existingOperatingLosses = losses;
          this.existingFinancialLosses = losses.filter(l => l?.type?.family === OperatingLossFamily.FINANCIER);
          this.existingNonFinancialLosses = losses.filter(l => l?.type?.family === OperatingLossFamily.NON_FINANCIER);

          this.loadAttachedCountsForAllImpacts(losses);

          const loaders = losses.map(l => this.loadAmountsForOperatingLoss(l.id));

          // forkJoin attend que tous les Observables soient complétés
          return forkJoin(loaders);
        })
      )
      .subscribe({
        next: () => {
          // Ici, toutes les données (y compris les montants) sont chargées
          // Tu peux déclencher une action, ou juste laisser l'UI s'afficher naturellement
        },
        error: () => {
          // Gérer l'erreur ici si besoin
        }
      });
  }


  deactivateSelected() {
    const impactIds = Object.keys(this.selectedImpacts).filter(id => this.selectedImpacts[id]);
    const amountIds: { impactId: string; amountId: string }[] = [];

    Object.entries(this.selectedAmounts).forEach(([impactId, amounts]) => {
      Object.entries(amounts).forEach(([amountId, isSelected]) => {
        if (isSelected) {
          amountIds.push({ impactId, amountId });
        }
      });
    });

    if (impactIds.length === 0 && amountIds.length === 0) {
      this.snackBarService.error("Aucun élément sélectionné à désactiver.");
      return;
    }

    this.confirmService.openConfirmDialog("Désactiver", `Désactiver ${impactIds.length} impact(s) et ${amountIds.length} montant(s) sélectionné(s) ?`)
      .subscribe(res => {
        if (!res) return;
        const calls = [
          ...impactIds.map(id =>
            this.operatingLossService.deactivate(id).pipe(
              catchError(err => {
                console.error("Erreur désactivation impact", err);
                this.snackBarService.error("Erreur désactivation impact");
                return of(null);
              })
            )
          ),
          ...amountIds.map(({ impactId, amountId }) =>
            this.amountService.deactivate(amountId).pipe(
              catchError(err => {
                console.error("Erreur désactivation montant", err);
                this.snackBarService.error("Erreur désactivation montant");
                return of(null);
              }),
              switchMap(() => {
                // recharger les montants de l’impact
                return this.amountService.listByOperatingLoss(impactId).pipe(
                  catchError(() => of([] as AmountDto[])),
                  switchMap(amountDtos => {
                    this.existingAmounts[impactId] = amountDtos.map(a => Amount.fromDto(a));
                    return of(null);
                  })
                );
              })
            )
          )
        ];

        forkJoin(calls).subscribe(() => {
          this.snackBarService.success("Désactivation effectuée.");
          this.refreshExistingOperatingLosses();
          this.selectedImpacts = {};
          this.selectedAmounts = {};
        });
      })
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

  loadAmountsForOperatingLoss(operatingLossId: string): Observable<Amount[]> {
    return this.amountService.listByOperatingLoss(operatingLossId).pipe(
      catchError(() => of([] as AmountDto[])),
      map(amountDtos => amountDtos.map(a => Amount.fromDto(a))),
      tap(amounts => {
        this.existingAmounts[operatingLossId] = amounts;
      })
    );
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

  // ---------- Validation ----------
  validateSelected() {
    this.updateSelected(OperatingLossState.VALIDATED, ReviewStatus.APPROVED, "Validation effectuée !");
  }

  rejectSelected() {
    this.updateSelected(OperatingLossState.REJECTED, ReviewStatus.REJECTED, "Rejet effectué !");
  }

  private updateSelected(lossState: OperatingLossState, amountStatus: ReviewStatus, successMsg: string) {
    const impactIds = Object.keys(this.selectedImpacts).filter(id => this.selectedImpacts[id]);
    const amountIds: { impactId: string; amountId: string }[] = [];

    Object.entries(this.selectedAmounts).forEach(([impactId, amounts]) => {
      Object.entries(amounts).forEach(([amountId, isSelected]) => {
        if (isSelected) {
          amountIds.push({ impactId, amountId });
        }
      });
    });

    if (impactIds.length === 0 && amountIds.length === 0) {
      this.snackBarService.error("Aucun élément sélectionné.");
      return;
    }

    const calls = [
      ...impactIds.map(id =>
        this.operatingLossService.updateState(id, lossState).pipe(
          catchError(err => {
            console.error("Erreur update impact", err);
            this.snackBarService.error("Erreur mise à jour impact");
            return of(null);
          })
        )
      ),
      ...amountIds.map(({ impactId, amountId }) =>
        this.amountService.updateReviewStatus(amountId, amountStatus).pipe(
          catchError(err => {
            console.error("Erreur update montant", err);
            this.snackBarService.error("Erreur mise à jour montant");
            return of(null);
          }),
          switchMap(() =>
            this.amountService.listByOperatingLoss(impactId).pipe(
              catchError(() => of([] as AmountDto[])),
              switchMap(amountDtos => {
                this.existingAmounts[impactId] = amountDtos.map(a => Amount.fromDto(a));
                return of(null);
              })
            )
          )
        )
      )
    ];

    forkJoin(calls).subscribe(() => {
      this.snackBarService.success(successMsg);
      this.refreshExistingOperatingLosses();
      this.selectedImpacts = {};
      this.selectedAmounts = {};
    });
  }

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

  // ---------- Submit Financier ----------
  handleSubmitFinancial(impact: FinancialImpact) {
    if (!this.incidentId || !impact.businessUnitId) return;

    // Vérifier s'il existe déjà un impact avec la même BU et le même type
    const duplicate = this.existingFinancialLosses.find(
      existing =>
        existing.entityId === impact.businessUnitId &&
        existing.type?.libelle === impact.type?.libelle
    );

    if (duplicate) {
      this.snackBarService.error("Un impact existe déjà pour cette BU et ce type.");
      this.expandAndScrollToImpact(duplicate.id);
      return;
    }

    const incidentId = this.incidentId;

    const dto: CreateOperatingLossDto = {
      incidentId,
      libelle: impact.title,
      businessUnitId: impact.businessUnitId,
      type: impact.type!,
      description: impact.description || null,
    };

    this.operatingLossService.create(dto, 'Création impact financier').pipe(
      switchMap((operatingLossId: string) => {
        if (!operatingLossId) return of(null);
        const amountCalls = impact.details.map((d) => {
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
      catchError((e) => {
        console.error('Erreur création impact financier', e);
        this.snackBarService.error('Erreur lors de la création de l’impact financier.');
        return of(null);
      })
    ).subscribe({
      next: () => {
        this.snackBarService.success('Impact financier créé avec succès !');
        this.refreshExistingOperatingLosses();
        this.formData.financialImpacts = this.formData.financialImpacts.filter((i) => i.id !== impact.id);
      }
    });
  }

  // ---------- Submit Non Financier ----------
  handleSubmitNonFinancial(impact: NonFinancialImpact) {
    if (!this.incidentId || !this.currentBusinessUnitId) return;

    // Vérifier s'il existe déjà un impact avec la même BU et le même type
    const duplicate = this.existingNonFinancialLosses.find(
      existing =>
        existing.entityId === impact.businessUnitId &&
        existing.type?.libelle === impact.type?.libelle
    );

    if (duplicate) {
      this.snackBarService.error("Un impact existe déjà pour cette BU et ce type.");
      this.expandAndScrollToImpact(duplicate.id);
      return;
    }

    const incidentId = this.incidentId;

    const dto: CreateOperatingLossDto = {
      type: impact.type!,
      incidentId,
      businessUnitId: impact.businessUnitId,
      libelle: impact.title,
      description: impact.description || null,
    };

    this.operatingLossService.create(dto, 'Création impact non financier').pipe(
      switchMap((operatingLossId: string) => {
        if (!operatingLossId) return of(null);

        const amountDto: CreateAmountDto = {
          amountType: this.estimeAmountType!.libelle,
          montant: +impact.amount,
          comptabilityRef: null,
          comptabilisationDate: null,
        };
        return this.amountService.create(operatingLossId, amountDto);
      }),
      catchError((e) => {
        console.error('Erreur création impact non financier', e);
        this.snackBarService.error('Erreur lors de la création de l’impact non financier.');
        return of(null);
      })
    ).subscribe({
      next: () => {
        this.snackBarService.success('Impact non financier créé avec succès !');
        this.refreshExistingOperatingLosses();
        this.formData.nonFinancialImpacts = this.formData.nonFinancialImpacts.filter((i) => i.id !== impact.id);
      }
    });
  }

  expandAndScrollToImpact(impactId: string) {
    // Étendre l’impact
    this.expandedImpacts[impactId] = true;

    // Petit délai pour s’assurer que l’UI s’est mise à jour
    setTimeout(() => {
      const el = document.getElementById(`impact-${impactId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('highlight');
        setTimeout(() => el.classList.remove('highlight'), 2000); // effet visuel temporaire
      }
    }, 100);
  }


  get filteredGoBackButtons(): GoBackButton[] {
    const hasImpacts = Object.values(this.selectedImpacts).some(v => v);
    const hasAmounts = Object.values(this.selectedAmounts).some(
      amounts => Object.values(amounts).some(v => v)
    );
    return (hasImpacts || hasAmounts) ? this.goBackButtons : [];
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

  openFilesDialog(impactId: string) {
    const ref = this.fileService.openFiles([], TargetType.IMPACT, impactId, /* closed: */ false);

    // rafraîchit le compteur quand on revient du dialog
    ref.afterClosed()
      .pipe(
        switchMap(() => this.fileService.getFiles(TargetType.IMPACT, impactId)),
        catchError(() => of([]))
      )
      .subscribe(files => {
        this.attachedCounts[impactId] = files.length;
      });
  }

  private loadAttachedCountsForAllImpacts(losses: OperatingLoss[]) {
    if (!losses?.length) {
      this.attachedCounts = {};
      return;
    }

    const calls = losses.map(l =>
      this.fileService.getFiles(TargetType.IMPACT, l.id).pipe(
        catchError(() => of([])),                     // si erreur: 0
        map(files => ({ id: l.id, count: files.length }))
      )
    );

    forkJoin(calls).subscribe(rows => {
      const mapCounts: Record<string, number> = {};
      rows.forEach(r => (mapCounts[r.id] = r.count));
      this.attachedCounts = mapCounts;
    });
  }

}
