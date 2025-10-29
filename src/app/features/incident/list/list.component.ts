import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Incident, IncidentListDto, IncidentListViewDto } from '../../../core/models/Incident';
import { IncidentService } from '../../../core/services/incident/incident.service';
import { MatCardModule } from '@angular/material/card';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { State, StateLabels } from '../../../core/enum/state.enum';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import * as XLSX from 'xlsx';
import { FilterTableComponent } from "../../../shared/components/filter-table/filter-table.component";
import { Filter } from '../../../core/enum/filter.enum';
import { buildFilterFromColumn } from '../../../shared/utils/filter-builder.util';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { GlobalSearchBarComponent } from "../../../shared/components/global-search-bar/global-search-bar.component";
import { GoBackButton, GoBackComponent } from '../../../shared/components/go-back/go-back.component';
import { ActivatedRoute, Router } from '@angular/router';
import { EnumLabelPipe } from '../../../shared/pipes/enum-label.pipe';


@Component({
  selector: 'app-list',
  standalone: true,
  imports: [MatButtonModule, MatTableModule, MatSortModule, MatDatepickerModule, MatSelectModule, CommonModule, MatMenuModule,
    MatCardModule, MatPaginatorModule, MatFormFieldModule, MatInputModule, GoBackComponent,
    ReactiveFormsModule, MatNativeDateModule, MatIconModule, MatCheckboxModule,
    MatTooltipModule, MatSelectModule, MatFormFieldModule,
    MatButtonModule, FilterTableComponent, MatButtonToggleModule, GlobalSearchBarComponent, FormsModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
  providers: [DatePipe, EnumLabelPipe]
})

export class ListComponent implements OnInit {

  private incidentService = inject(IncidentService)
  private datePipe = inject(DatePipe)
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private enumLabelPipe = inject(EnumLabelPipe);

  filterMode: 'general' | 'detailed' = 'general';

  columns = [
    {
      columnDef: 'reference',
      header: 'Référence',
      cell: (element: IncidentListViewDto) => `${element.reference}`,
      filterType: 'text',
      icon: 'tag' // 🏷️
    },
    {
      columnDef: 'title',
      header: 'Libellé',
      cell: (element: IncidentListViewDto) => `${element.title}`,
      filterType: 'text',
      icon: 'title' // 📝
    },
    {
      columnDef: 'declaredAt',
      header: 'Date de déclaration',
      cell: (element: IncidentListViewDto) => this.datePipe.transform(element.declaredAt, 'dd/MM/yyyy') || '',
      filterType: 'date',
      icon: 'event' // 📅
    },
    {
      columnDef: 'survenueAt',
      header: 'Date de survenance',
      cell: (element: IncidentListViewDto) => this.datePipe.transform(element.survenueAt, 'dd/MM/yyyy') || '',
      filterType: 'date',
      icon: 'event_note' // 🗓️
    },
    {
      columnDef: 'state',
      header: 'Statut',
      cell: (incident: Incident) => `
          <span class="badge ${incident.state.toLowerCase()}">
            ${this.enumLabelPipe.transform(incident.state, 'state')}
          </span>
        `, // ← label lisible
      isBadge: 'state',                                                // ← si ton template gère les badges
      filterType: 'select',
      options: Object.values(State).map(s => ({                        // ← options = enum + label
        value: s,
        label: StateLabels[s]
      })),
      icon: 'flag'
    }
  ];


  goBackButtons: GoBackButton[] = []

  filtersConfig: Filter[] = this.columns.map(col => buildFilterFromColumn(col));

  displayedColumns = ['select', ...this.columns.map(c => c.columnDef)];
  dataSource = new MatTableDataSource<IncidentListViewDto | IncidentListDto>([]);
  filteredByRisk = false;
  selectedIncident: IncidentListViewDto | IncidentListDto | null = null;
  incidents: IncidentListViewDto[] | IncidentListDto[] = [];

  searchQuery: string = '';

  selectedIncidents = new Set<string>();


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const riskId = params['riskId'];
      const processId = params['processId'];

      if (riskId && processId) {
        this.filteredByRisk = true;
        this.incidentService.getIncidentByProcessAndRisk(riskId).subscribe(data => {
          this.incidents = data;
          this.dataSource.data = data;
        });

        this.goBackButtons = [
          {
            label: 'Voir tous les incidents',
            icon: 'list',
            class: 'btn-primary',
            show: true,
            action: () => this.clearRiskFilter()
          },
          {
            label: 'Exporter',
            icon: 'file_download',
            class: 'btn-green',
            show: true,
            action: () => this.exportExcel()
          }
        ];
      } else {
        this.filteredByRisk = false;
        this.loadIncidents();

        this.goBackButtons = [
          {
            label: 'Créer un incident',
            icon: 'add',
            class: 'btn-primary',
            show: true,
            permission: 'CREATE_INCIDENT',
            action: () => this.add()
          },
          {
            label: 'Exporter',
            icon: 'file_download',
            class: 'btn-green',
            show: true,
            action: () => this.exportExcel()
          }
        ];
      }
    });
  }


  refreshData() {
    this.ngOnInit();
  }

  // This method will be triggered when a row is clicked
  onRowClick(incident: IncidentListViewDto) {
    this.router.navigate(['incident', incident.id]);
  }

  clearRiskFilter() {
    this.router.navigate(['incident']);
  }

  loadIncidents() {
    this.incidentService.loadIncidents().subscribe(data => {
      this.incidents = data;
      this.dataSource.data = data;
    });
  }

  add() {
    this.router.navigate(
      ['incident', 'create']
    );
  }

  toggleIncidentSelection(incidentId: string) {
    if (this.selectedIncidents.has(incidentId)) {
      this.selectedIncidents.delete(incidentId);
    } else {
      this.selectedIncidents.add(incidentId);
    }
  }

  isIncidentSelected(incidentId: string): boolean {
    return this.selectedIncidents.has(incidentId);
  }

  toggleAllSelection(): void {
    if (this.isAllSelected()) {
      this.selectedIncidents.clear();
    } else {
      this.dataSource.data.forEach(incident => {
        this.selectedIncidents.add(incident.id);
      });
    }
  }

  edit(row: IncidentListViewDto) {
    this.router.navigate(['incident', 'create'], {
      queryParams: { id: row.id }
    })
  }

  isAllSelected(): boolean {
    return this.selectedIncidents.size === this.dataSource.data.length && this.dataSource.data.length > 0;
  }

  isIndeterminate(): boolean {
    return this.selectedIncidents.size > 0 && this.selectedIncidents.size < this.dataSource.data.length;
  }

  isUpdatable(incident: IncidentListViewDto): boolean {
    return incident!.state === State.DRAFT;
  }

  handleFiltersChanged(filters: Record<string, any>) {
    let filtered = [...this.incidents];

    for (const [key, value] of Object.entries(filters)) {
      if (value === null || value === '') continue;

      filtered = filtered.filter(incident => {
        const fieldValue = incident[key as keyof IncidentListDto];

        // ✅ Cas spécial : filtre par plage de dates { start, end }
        if (value.start instanceof Date && value.end instanceof Date) {
          if (!fieldValue) return false; // skip si vide

          const incidentDate = new Date(fieldValue as string | number | Date); // <-- cast ici

          const start = new Date(value.start);
          const end = new Date(value.end);
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);

          return incidentDate >= start && incidentDate <= end;
        }


        // ✅ Cas spécial : filtre par statut (clôturé ou en cours)
        if (key === 'state') {
          // Si le filtre renvoie encore les vieux libellés, on garde une compatibilité.
          if (value === 'Clôturé') return incident.state === State.CLOSED;
          if (value === 'En cours') return incident.state !== State.CLOSED;

          // Sinon on filtre proprement par enum.
          return incident.state === value; // value : State
        }

        // ✅ Cas standard : texte ou valeur simple
        return fieldValue?.toString().toLowerCase().includes(value.toString().toLowerCase());
      });
    }

    this.dataSource.data = filtered;
  }

  onSearchFiles(query: string): void {
    this.searchQuery = query;

    const lowerQuery = query.toLowerCase().trim();

    const filtered = this.incidents.filter(incident => {
      return (
        incident.reference?.toLowerCase().includes(lowerQuery) ||
        incident.title?.toLowerCase().includes(lowerQuery) ||
        this.datePipe.transform(incident.declaredAt, 'dd/MM/yyyy')?.includes(lowerQuery) ||
        this.datePipe.transform(incident.survenueAt, 'dd/MM/yyyy')?.includes(lowerQuery) ||
        this.enumLabelPipe.transform(incident.state, 'state').toLowerCase().includes(lowerQuery) ||     // ← NEW
        (incident.closedAt ? 'clôturé' : 'en cours').includes(lowerQuery)            // compat “en cours/clôturé”
      );
    });

    this.dataSource.data = filtered;
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.dataSource.data = this.incidents;
  }

  exportExcel(filename: string = 'incidents.xlsx') {

    this.incidentService.findAllByIds(this.selectedIncidents).subscribe(
      list => {
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(list);

        // Example of adding column widths
        const columnWidths = list.length > 0
          ? Object.keys(list[0]).map(key => ({ wch: key.length + 5 }))
          : [];

        worksheet['!cols'] = columnWidths; // Apply column widths

        const workbook: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Incidents');

        // Write to file
        XLSX.writeFile(workbook, filename);
      }
    )
  }
}
