import { AfterViewInit, Component, inject, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ImpactService } from '../../../../core/services/impact/impact.service';
import { Impact, ImpactCreateDto } from '../../../../core/models/Impact';
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
import { CreateImpactPopUpComponent } from '../create-impact-pop-up/create-impact-pop-up.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmService } from '../../../../core/services/confirm/confirm.service';
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

  private route = inject(ActivatedRoute);
  private impactService = inject(ImpactService);
  private dialog = inject(MatDialog);
  private fileService = inject(FileService);
  private currencyPipe = inject(CurrencyPipe);
  private datePipe = inject(DatePipe);

  incidentId: string = this.route.snapshot.paramMap.get('id') || '';

  impacts: Impact[] = [];
  totalAmount = 0;

  goBackButtons: GoBackButton[] = [];

  filterMode: 'general' | 'detailed' = 'general';

  types: ImpactTypeEnum[] = [ImpactTypeEnum.PROVISION, ImpactTypeEnum.RECUPERATION];

  columns = [
    {
      columnDef: 'montant',
      header: 'Montant',
      cell: (impact: Impact) => impact.montant + ' €' || '',
      filterType: 'numberRange',
      icon: 'euro_symbol'
    },
    {
      columnDef: 'entityName',
      header: 'Entité',
      cell: (impact: Impact) => impact.entityName || '',
      filterType: 'text',
      icon: 'business'
    },
    {
      columnDef: 'type',
      header: 'Type',
      cell: (impact: Impact) => impact.type || '',
      filterType: 'select',
      options: this.types,
      icon: 'category'
    },
    {
      columnDef: 'createdAt',
      header: 'Créé le',
      cell: (impact: Impact) => this.datePipe.transform(impact.createdAt, 'dd/MM/yyyy') || '',
      filterType: 'date',
      icon: 'event'
    },
    {
      columnDef: 'comptabilisationDate',
      header: 'Date compta',
      cell: (impact: Impact) => this.datePipe.transform(impact.comptabilisationDate, 'dd/MM/yyyy') || '',
      filterType: 'date',
      icon: 'event_note'
    },
  ];

  filtersConfig: Filter[] = this.columns.map(col => buildFilterFromColumn(col));

  dataSource = new MatTableDataSource<Impact>([]);
  displayedColumns = [...this.columns.map(c => c.columnDef), 'fichiers'];

  @Input() closed: boolean = false;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit() {
    if (this.incidentId) {
      this.impactService.getImpactByIncidentId(this.incidentId).subscribe(impacts => {
        this.impacts = impacts;
        this.dataSource.data = impacts;
      });

      this.impactService.sum(this.incidentId).subscribe(
        result => this.totalAmount = result
      )
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
    this.dialog.open(CreateImpactPopUpComponent, {
      width: '700px !important',
      minWidth: '600px',
      maxWidth: '600px',
      data: { incidentId: this.incidentId }
    }).afterClosed().subscribe(() => this.ngOnInit());
  }

  async viewFiles(impact: Impact) {
    let files = await firstValueFrom(this.fileService.getFiles({ impactId: impact.id }))

    this.dialog.open(FichiersComponent,
      {
        width: '400px',
        data: {
          files: files
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

        // ✅ Cas spécial : filtre par plage de dates { start, end }
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

        // ✅ Cas standard : texte ou nombre
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

  clearSearch() {
    this.searchQuery = '';
    this.dataSource.data = this.impacts;
  }
}


