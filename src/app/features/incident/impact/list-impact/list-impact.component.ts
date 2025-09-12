import { AfterViewInit, Component, inject, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe, CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { GoBackButton, GoBackComponent } from '../../../../shared/components/go-back/go-back.component';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { FileService } from '../../../../core/services/file/file.service';
import { FichiersComponent } from '../../../../shared/components/fichiers/fichiers.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FilterTableComponent } from "../../../../shared/components/filter-table/filter-table.component";
import { GlobalSearchBarComponent } from "../../../../shared/components/global-search-bar/global-search-bar.component";
import { Filter } from '../../../../core/enum/filter.enum';
import { buildFilterFromColumn } from '../../../../shared/utils/filter-builder.util';
import { firstValueFrom } from 'rxjs';
import { MatPaginator } from "@angular/material/paginator";
import { ImpactTypeEnum } from '../../../../core/enum/impactType.enum';
import { TargetType } from '../../../../core/enum/targettype.enum';
import { OperatingLossService } from '../../../../core/services/operating-loss/operating-loss.service';
import { OperatingLoss } from '../../../../core/models/OperatingLoss';
import { AmountDto } from '../../../../core/models/Amount';
import { AmountService } from '../../../../core/services/amount/amount.service';
import { OperatingLossFamily, OperatingLossFamilyLabels } from '../../../../core/enum/operatingLossFamily.enum';

@Component({
  selector: 'app-list-impact',
  imports: [MatCardModule, MatListModule, MatIconModule, FormsModule,
    MatGridListModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatTooltipModule, CommonModule, GoBackComponent, MatTableModule, MatButtonToggleModule, FilterTableComponent, GlobalSearchBarComponent, MatPaginator],
  providers: [DatePipe, CurrencyPipe],
  templateUrl: './list-impact.component.html',
  styleUrl: './list-impact.component.scss'
})
export class ListImpactComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private impactService = inject(OperatingLossService);
  private dialog = inject(MatDialog);
  private fileService = inject(FileService);
  private datePipe = inject(DatePipe);
    // + NEW: pour l’expansion
  private amountService = inject(AmountService);
  expandedId: string | null = null;
  amountsMap = new Map<string, AmountDto[]>();    // cache par impactId
  loadingAmounts = new Set<string>();              // ids en chargement
  amountsError = new Map<string, string>();        // erreurs éventuelles

  incidentId: string = this.route.snapshot.paramMap.get('id') || '';

  impacts: OperatingLoss[] = [];

  goBackButtons: GoBackButton[] = [];

  filterMode: 'general' | 'detailed' = 'general';

  types: ImpactTypeEnum[] = [ImpactTypeEnum.PROVISION, ImpactTypeEnum.RECUPERATION];


  columns = [
    {
      columnDef: 'libelle',
      header: 'Libellé',
      cell: (impact: OperatingLoss) => impact.libelle || '',
      filterType: 'text',
      icon: 'business'
    },
    {
      columnDef: 'entityName',
      header: 'Entité',
      cell: (impact: OperatingLoss) => impact.entityName || '',
      filterType: 'text',
      icon: 'business'
    },
    {
      columnDef: 'impactType',
      header: "Type d'Impact",
      cell: (impact: OperatingLoss) =>{
        const impactType = impact.type;
        return OperatingLossFamilyLabels[impactType.family] 
      },
      filterType: 'select',
      icon: 'category'
    },
    {
      columnDef: 'type',
      header: 'Type Conséquence',
      cell: (impact: OperatingLoss) => impact.type.label || '',
      filterType: 'select',
      icon: 'category'
    },
    {
      columnDef: 'montantBrut',
      header: 'Montant Brut',
      cell: (impact: OperatingLoss) => impact.type.family === OperatingLossFamily.FINANCIER ? (impact.montantBrut + ' €' || '') : 'N/A',
      filterType: 'numberRange',
      icon: 'euro_symbol'
    },
    {
      columnDef: 'montantNet',
      header: 'Montant Net',
      cell: (impact: OperatingLoss) => impact.type.family === OperatingLossFamily.FINANCIER ? (impact.montantNet + ' €' || '') : 'N/A',
      filterType: 'numberRange',
      icon: 'euro_symbol'
    },
    {
      columnDef: 'montantFinal',
      header: 'Montant Final',
      cell: (impact: OperatingLoss) => impact.type.family === OperatingLossFamily.FINANCIER ? (impact.montantFinal + ' €' || '') : 'N/A',
      filterType: 'numberRange',
      icon: 'euro_symbol'
    },
    {
      columnDef: 'createdAt',
      header: 'Créé le',
      cell: (impact: OperatingLoss) => this.datePipe.transform(impact.createdAt, 'dd/MM/yyyy') || '',
      filterType: 'date',
      icon: 'event'
    },
  ];
  

  filtersConfig: Filter[] = this.columns.map(col => buildFilterFromColumn(col));

  dataSource = new MatTableDataSource<OperatingLoss>([]);

  displayedColumns = ['expand', ...this.columns.map(c => c.columnDef), 'fichiers'];

  @Input() closed: boolean = false;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit() {
    if (this.incidentId) {
      this.impactService.listByIncident(this.incidentId).subscribe(impacts => {
        this.impacts = impacts;
        this.dataSource.data = impacts;
      });
    }
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

  async viewFiles(impact: OperatingLoss) {
    let files = await firstValueFrom(this.fileService.getFiles(TargetType.IMPACT, impact.id ))

    this.dialog.open(FichiersComponent,
      {
        width: '400px',
        data: {
          files: files,
          targetType: TargetType.IMPACT,
          targetId: impact.id
        }
      }
    )
  }

  handleFiltersChanged(filters: any) {
    let filtered = [...this.impacts];

    for (const key in filters) {
      const filterValue = filters[key];
      if (!filterValue) continue;

      filtered = filtered.filter((impact: any) => {
        const fieldValue = impact[key];

        // Cas spécial : filtre par plage de dates { start, end }
        if (filterValue.start instanceof Date && filterValue.end instanceof Date) {
          if (!fieldValue) return false;

          const impactDate = new Date(fieldValue); // date du champ
          if (isNaN(impactDate.getTime())) return false;

          const start = new Date(filterValue.start);
          const end = new Date(filterValue.end);
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);

          return impactDate >= start && impactDate <= end;
        }

        if (typeof filterValue === 'string' || typeof filterValue === 'number') {
          return fieldValue?.toString().toLowerCase().includes(filterValue.toString().toLowerCase());
        }

        if (filterValue.min !== undefined || filterValue.max !== undefined) {
          const fieldNumber = Number(fieldValue);
          if (isNaN(fieldNumber)) return false;

          const min = filterValue.min ?? -Infinity;
          const max = filterValue.max ?? Infinity;
          return fieldNumber >= min && fieldNumber <= max;
        }

        return true;
      });
    }

    this.dataSource.data = filtered;
  }

  searchQuery: string = '';

  onSearchFiles(query: string) {
    const lowerQuery = query.toLowerCase();
    this.dataSource.data = this.impacts.filter(impact =>
      Object.entries(impact).some(([key, value]) => {
        if (key === 'id' || key === 'entityId') return false;

        if (key === 'createdAt') {
          const formattedDate = this.datePipe.transform(value, 'dd/MM/yyyy') || '';
          return formattedDate.toLowerCase().includes(lowerQuery);
        }

        return value?.toString().toLowerCase().includes(lowerQuery);
      })
    );
  }

  toggleExpand(impact: OperatingLoss) {
    // replie si on reclique
    if (this.expandedId === impact.id) {
      this.expandedId = null;
      return;
    }

    this.expandedId = impact.id;

    // si déjà en cache, pas de nouvel appel
    if (this.amountsMap.has(impact.id)) return;

    // sinon on charge
    this.loadingAmounts.add(impact.id);
    this.amountsError.delete(impact.id);

    this.amountService.listByOperatingLoss(impact.id).subscribe({
      next: (amounts) => this.amountsMap.set(impact.id, amounts),
      error: () => this.amountsError.set(impact.id, 'Erreur lors du chargement des montants'),
      complete: () => this.loadingAmounts.delete(impact.id)
    });
  }

  clearSearch() {
    this.searchQuery = '';
    this.dataSource.data = this.impacts;
  }
}


