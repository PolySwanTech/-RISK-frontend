import { Component, Inject, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BasePopupComponent, PopupAction } from '../../../../shared/components/base-popup/base-popup.component';
import { OperatingLossService } from '../../../../core/services/operating-loss/operating-loss.service';
import { OperatingLossTypeService } from '../../../../core/services/operating-loss/operating-loss-type.service';
import { AmountTypeService } from '../../../../core/services/amount/amount-type.service';
import { AmountService } from '../../../../core/services/amount/amount.service';
import { EntitiesService } from '../../../../core/services/entities/entities.service';
import { SnackBarService } from '../../../../core/services/snack-bar/snack-bar.service';
import { FileService } from '../../../../core/services/file/file.service';
import { BusinessUnit } from '../../../../core/models/BusinessUnit';
import { CreateOperatingLossDto, OperatingLoss, OperatingLossTypeDto } from '../../../../core/models/OperatingLoss';
import { Amount, AmountTypeDto, CreateAmountDto } from '../../../../core/models/Amount';
import { OperatingLossFamily } from '../../../../core/enum/operatingLossFamily.enum';
import { TargetType } from '../../../../core/enum/targettype.enum';
import { EnumLabelPipe } from '../../../../shared/pipes/enum-label.pipe';
import { OperatingLossState } from '../../../../core/enum/operatingLossState.enum';
import { ReviewStatus } from '../../../../core/enum/reviewStatus.enum';

export interface CreateOperationalImpactDialogData {
  incidentId: string;
  businessUnitId?: string;
}

@Component({
  selector: 'app-create-operational-impact-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatBadgeModule,
    MatDatepickerModule,
    BasePopupComponent,
    EnumLabelPipe
  ],
  templateUrl: './create-operational-impact.component.html',
  styleUrl: './create-operational-impact.component.scss'
})
export class CreateOperationalImpactComponent implements OnInit {

  private dialogRef = inject(MatDialogRef<CreateOperationalImpactComponent>);
  private operatingLossService = inject(OperatingLossService);
  private operatingLossTypeService = inject(OperatingLossTypeService);
  private amountTypeService = inject(AmountTypeService);
  private amountService = inject(AmountService);
  private entitiesService = inject(EntitiesService);
  private snackBarService = inject(SnackBarService);
  private fileService = inject(FileService);

  popupActions: PopupAction[] = [];
  currentStep: 'select-type' | 'create-new' | 'manage-existing' = 'select-type';

  // Données de référence
  allBusinessUnits: BusinessUnit[] = [];
  financialTypes: OperatingLossTypeDto[] = [];
  nonFinancialTypes: OperatingLossTypeDto[] = [];
  financialAmountTypes: AmountTypeDto[] = [];
  nonFinancialAmountTypes: AmountTypeDto[] = [];

  // Formulaire nouveau montant
  selectedFamily: OperatingLossFamily | null = null;
  newImpact = {
    title: '',
    businessUnitId: '',
    type: null as OperatingLossTypeDto | null,
    description: '',
    amounts: [{ amountType: null as string | null, accountingRef: '', accountingDate: '', amount: '' }]
  };

  // Gestion des impacts existants
  existingImpacts: OperatingLoss[] = [];
  expandedImpacts: Set<string> = new Set();
  selectedImpacts: Set<string> = new Set();
  impactAmounts: Map<string, Amount[]> = new Map();
  selectedAmounts: Map<string, Set<string>> = new Map();
  filesCounts: Map<string, number> = new Map();

  OperatingLossFamily = OperatingLossFamily;
  TargetType = TargetType;

  editingImpactId: string | null = null;
  tempAmount: any = null;


  constructor(@Inject(MAT_DIALOG_DATA) public data: CreateOperationalImpactDialogData) { }

  async ngOnInit(): Promise<void> {
    await this.loadReferenceData();
    await this.loadExistingImpacts();
    this.initActions();
  }

  async loadReferenceData(): Promise<void> {
    const [businessUnits, finTypes, nonFinTypes, finAmountTypes, nonFinAmountTypes] = await Promise.all([
      this.entitiesService.loadEntities(true).pipe(catchError(() => of([]))).toPromise(),
      this.operatingLossTypeService.findByOperatingLossFamily(OperatingLossFamily.FINANCIER).pipe(catchError(() => of([]))).toPromise(),
      this.operatingLossTypeService.findByOperatingLossFamily(OperatingLossFamily.NON_FINANCIER).pipe(catchError(() => of([]))).toPromise(),
      this.amountTypeService.findByOperatingLossFamily(OperatingLossFamily.FINANCIER).pipe(catchError(() => of([]))).toPromise(),
      this.amountTypeService.findByOperatingLossFamily(OperatingLossFamily.NON_FINANCIER).pipe(catchError(() => of([]))).toPromise()
    ]);

    this.allBusinessUnits = businessUnits || [];
    this.financialTypes = finTypes || [];
    this.nonFinancialTypes = nonFinTypes || [];
    this.financialAmountTypes = finAmountTypes || [];
    this.nonFinancialAmountTypes = nonFinAmountTypes || [];

    if (this.data.businessUnitId) {
      this.newImpact.businessUnitId = this.data.businessUnitId;
    }
  }

  async loadExistingImpacts(): Promise<void> {
    const impacts = await this.operatingLossService.listByIncident(this.data.incidentId)
      .pipe(catchError(() => of([]))).toPromise();

    this.existingImpacts = impacts || [];

    // Charger les montants pour chaque impact
    for (const impact of this.existingImpacts) {
      this.loadAmountsForImpact(impact.id);
      this.loadFilesCount(impact.id);
    }
  }

  loadAmountsForImpact(impactId: string): void {
    this.amountService.listByOperatingLoss(impactId)
      .pipe(catchError(() => of([])))
      .subscribe(amounts => {
        this.impactAmounts.set(impactId, amounts.map(a => Amount.fromDto(a)));
      });
  }

  loadFilesCount(impactId: string): void {
    this.fileService.getFiles(TargetType.IMPACT, impactId)
      .pipe(catchError(() => of([])))
      .subscribe(files => {
        this.filesCounts.set(impactId, files.length);
      });
  }

  private processBulkUpdate(
    lossState: OperatingLossState,
    amountStatus: ReviewStatus,
    successMsg: string
  ): void {
    const tasks$: any[] = [];

    // 1. Récupérer les IDs des impacts sélectionnés (depuis le Set)
    const selectedImpactIds = Array.from(this.selectedImpacts);

    // 2. Récupérer les IDs des montants sélectionnés (depuis la Map de Sets)
    const selectedAmountIds: string[] = [];
    this.selectedAmounts.forEach((amountSet) => {
      amountSet.forEach(amountId => selectedAmountIds.push(amountId));
    });

    if (selectedImpactIds.length === 0 && selectedAmountIds.length === 0) {
      this.snackBarService.error("Aucun élément sélectionné.");
      return;
    }

    // 3. Créer les observables pour les Impacts
    selectedImpactIds.forEach(id => {
      tasks$.push(
        this.operatingLossService.updateState(id, lossState).pipe(
          catchError(err => {
            console.error(`Erreur update impact ${id}`, err);
            // On retourne null pour ne pas casser le forkJoin global
            return of(null);
          })
        )
      );
    });

    // 4. Créer les observables pour les Montants
    selectedAmountIds.forEach(id => {
      tasks$.push(
        this.amountService.updateReviewStatus(id, amountStatus).pipe(
          catchError(err => {
            console.error(`Erreur update montant ${id}`, err);
            return of(null);
          })
        )
      );
    });

    // 5. Exécuter tout en parallèle
    forkJoin(tasks$).subscribe({
      next: async () => {
        // Vérifier s'il y a eu des erreurs partielles si nécessaire, 
        // sinon on considère que c'est un succès global
        this.snackBarService.success(successMsg);

        // On recharge tout pour avoir les statuts à jour
        await this.loadExistingImpacts();

        // On vide la sélection
        this.clearSelection();
      },
      error: (err) => {
        console.error('Erreur critique lors de la mise à jour massive', err);
        this.snackBarService.error("Une erreur est survenue lors du traitement.");
      }
    });
  }

  initActions(): void {
    this.popupActions = [
      {
        label: 'Fermer',
        icon: 'close',
        color: 'red',
        onClick: () => this.closePopup(),
        hidden: () => this.currentStep !== 'select-type' && this.currentStep !== 'manage-existing'
      },
      {
        label: 'Retour',
        icon: 'arrow_back',
        color: 'purple',
        onClick: () => this.goBack(),
        hidden: () => this.currentStep === 'select-type'
      },
      {
        label: 'Créer l\'impact',
        icon: 'check',
        primary: true,
        disabled: () => this.isNewImpactInvalid(),
        onClick: async () => await this.submitNewImpact(),

        hidden: () => this.currentStep !== 'create-new'
      },
      {
        label: 'Valider la sélection',
        icon: 'check_circle',
        primary: true,
        disabled: () => !this.hasSelection(),
        onClick: async () => await this.validateSelection(),

        hidden: () => this.currentStep !== 'manage-existing'
      },
      {
        label: 'Rejeter la sélection',
        icon: 'cancel',
        color: 'red',
        disabled: () => !this.hasSelection(),
        onClick: async () => await this.rejectSelection(),

        hidden: () => this.currentStep !== 'manage-existing'
      }
    ];
  }

  getDialogRef() {
    return this.dialogRef;
  }

  closePopup(): void {
    this.dialogRef.close();
  }

  goBack(): void {
    if (this.currentStep === 'create-new' || this.currentStep === 'manage-existing') {
      this.currentStep = 'select-type';
      this.resetNewImpact();
    }
    this.initActions();
  }

  selectImpactType(family: OperatingLossFamily): void {
    this.selectedFamily = family;
    this.currentStep = 'create-new';
    this.newImpact.amounts = [{ amountType: null, accountingRef: '', accountingDate: '', amount: '' }];
    this.initActions();
  }

  goToManageExisting(): void {
    this.currentStep = 'manage-existing';
    this.initActions();
  }

  get currentAmountTypes(): AmountTypeDto[] {
    return this.selectedFamily === OperatingLossFamily.FINANCIER
      ? this.financialAmountTypes
      : this.nonFinancialAmountTypes;
  }

  get currentImpactTypes(): OperatingLossTypeDto[] {
    return this.selectedFamily === OperatingLossFamily.FINANCIER
      ? this.financialTypes
      : this.nonFinancialTypes;
  }

  get isFinancial(): boolean {
    return this.selectedFamily === OperatingLossFamily.FINANCIER;
  }


  initNewAmountForImpact(impact: any) {
    this.selectedFamily = impact.type.family;
    this.editingImpactId = impact.id;
    this.tempAmount = {
      amountType: null,
      amount: null,
      accountingRef: '',
      accountingDate: new Date()
    };
  }

  cancelEdition() {
    this.editingImpactId = null;
    this.tempAmount = null;
  }

  saveNewAmount(impactId: string) {

    this.amountService.create(impactId, {
      amountType: this.tempAmount.amountType,
      montant: +this.tempAmount.amount,
      comptabilityRef: this.tempAmount.accountingRef || null,
      comptabilisationDate: this.tempAmount.accountingDate || null
    }).subscribe({
      next: () => {
        this.snackBarService.success('Montant ajouté avec succès !');
        this.loadAmountsForImpact(impactId);
      }
    });

    // Une fois sauvegardé, on ferme le petit formulaire
    this.cancelEdition();
    // Ne pas oublier de rafraîchir la liste impactAmounts.get(impactId)
  }

  addAmountLine(): void {
    this.newImpact.amounts.push({ amountType: null, accountingRef: '', accountingDate: '', amount: '' });
  }

  removeAmountLine(index: number): void {
    if (this.newImpact.amounts.length > 1) {
      this.newImpact.amounts.splice(index, 1);
    }
  }

  isNewImpactInvalid(): boolean {
    return !this.newImpact.title ||
      !this.newImpact.type ||
      !this.newImpact.businessUnitId ||
      this.newImpact.amounts.length === 0 ||
      this.newImpact.amounts.some(a => !a.amountType || !a.amount || isNaN(+a.amount));
  }

  async submitNewImpact(): Promise<void> {
    if (this.isNewImpactInvalid()) return;

    // Vérifier les doublons
    const duplicate = this.existingImpacts.find(
      i => i.entityId === this.newImpact.businessUnitId && i.type?.libelle === this.newImpact.type?.libelle
    );

    if (duplicate) {
      this.snackBarService.error('Un impact existe déjà pour cette entité et ce type.');
      this.currentStep = 'manage-existing';
      this.expandedImpacts.add(duplicate.id);
      this.initActions();
      return;
    }

    const dto: CreateOperatingLossDto = {
      incidentId: this.data.incidentId,
      libelle: this.newImpact.title,
      businessUnitId: this.newImpact.businessUnitId,
      type: this.newImpact.type!,
      state: OperatingLossState.WAITING,
      description: this.newImpact.description || null
    };

    try {
      const operatingLossId = await this.operatingLossService.create(dto, 'Création impact').toPromise();

      if (!operatingLossId) throw new Error('Pas d\'ID retourné');

      // Créer les montants
      const amountCalls = this.newImpact.amounts.map(a => {
        const amountDto: CreateAmountDto = {
          amountType: a.amountType!,
          montant: +a.amount,
          comptabilityRef: a.accountingRef || null,
          comptabilisationDate: a.accountingDate || null
        };
        return this.amountService.create(operatingLossId, amountDto);
      });

      if (amountCalls.length > 0) {
        await forkJoin(amountCalls).toPromise();
      }

      this.snackBarService.success('Impact créé avec succès !');
      await this.loadExistingImpacts();
      this.resetNewImpact();
      this.currentStep = 'select-type';
      this.initActions();
    } catch (error) {
      console.error('Erreur création impact:', error);
      this.snackBarService.error('Erreur lors de la création de l\'impact.');
      throw error;
    }
  }

  resetNewImpact(): void {
    this.newImpact = {
      title: '',
      businessUnitId: this.data.businessUnitId || '',
      type: null,
      description: '',
      amounts: [{ amountType: null, accountingRef: '', accountingDate: '', amount: '' }]
    };
    this.selectedFamily = null;
  }

  toggleImpact(impactId: string): void {
    if (this.expandedImpacts.has(impactId)) {
      this.expandedImpacts.delete(impactId);
    } else {
      this.expandedImpacts.add(impactId);
    }
  }

  toggleImpactSelection(impactId: string, event: MatCheckboxChange): void {
    // Note: Pas besoin de event.stopPropagation() ici car géré dans le (click) du HTML

    const isChecked = event.checked; // On utilise la valeur réelle de la checkbox

    if (isChecked) {
      // 1. On ajoute le parent
      this.selectedImpacts.add(impactId);

      // 2. On récupère tous les montants de cet impact
      const amounts = this.impactAmounts.get(impactId) || [];

      // 3. On crée un Set contenant TOUS les IDs des montants
      const allAmountIds = new Set(amounts.map(a => a.id));
      this.selectedAmounts.set(impactId, allAmountIds);
    } else {
      // 1. On retire le parent
      this.selectedImpacts.delete(impactId);

      // 2. On vide la sélection des montants pour cet impact
      this.selectedAmounts.delete(impactId);
    }
  }

  toggleAmountSelection(impactId: string, amountId: string): void {
    // 1. Initialiser le Set pour cet impact s'il n'existe pas
    if (!this.selectedAmounts.has(impactId)) {
      this.selectedAmounts.set(impactId, new Set());
    }

    const amountSet = this.selectedAmounts.get(impactId)!;

    // 2. Basculer l'état du montant cliqué
    if (amountSet.has(amountId)) {
      amountSet.delete(amountId);
    } else {
      amountSet.add(amountId);
    }

    // 3. Vérifier l'état global pour mettre à jour le PARENT
    const allAmounts = this.impactAmounts.get(impactId) || [];

    // Si la liste est vide, on ne coche pas le parent
    if (allAmounts.length === 0) {
      this.selectedImpacts.delete(impactId);
      return;
    }

    // Le parent est coché SI ET SEULEMENT SI tous les montants sont dans le Set de sélection
    const allSelected = allAmounts.every(a => amountSet.has(a.id));

    if (allSelected) {
      this.selectedImpacts.add(impactId);
    } else {
      this.selectedImpacts.delete(impactId);
    }
  }

  hasSelection(): boolean {
    return this.selectedImpacts.size > 0 ||
      Array.from(this.selectedAmounts.values()).some(set => set.size > 0);
  }

  async validateSelection(): Promise<void> {
    this.processBulkUpdate(
      OperatingLossState.VALIDATED,
      ReviewStatus.APPROVED,
      "Validation effectuée avec succès !"
    );
  }

  async rejectSelection(): Promise<void> {
    this.processBulkUpdate(
      OperatingLossState.REJECTED,
      ReviewStatus.REJECTED,
      "Rejet effectué avec succès !"
    );
  }

  clearSelection(): void {
    this.selectedImpacts.clear();
    this.selectedAmounts.clear();
  }

  openFilesDialog(impactId: string): void {
    const ref = this.fileService.openFiles([], TargetType.IMPACT, impactId, false);
    ref.afterClosed().subscribe(() => {
      this.loadFilesCount(impactId);
    });
  }

  getImpactStatusColor(impact: OperatingLoss): string {
    // Retourner une classe CSS selon le statut
    return impact.state.toLowerCase();
  }

  getAmountStatusColor(amount: Amount): string {
    // Retourner une classe CSS selon le statut de review
    return amount.reviewStatus.toLowerCase();
  }

  trackByImpactId(_: number, impact: OperatingLoss): string {
    return impact.id;
  }

  trackByAmountId(_: number, amount: Amount): string {
    return amount.id;
  }
}