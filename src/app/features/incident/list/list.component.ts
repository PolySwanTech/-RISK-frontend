import { AfterViewInit, Component, inject, OnInit, resource, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Incident, State } from '../../../core/models/Incident';
import { IncidentService } from '../../../core/services/incident/incident.service';
import { MatCardModule } from '@angular/material/card';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule, DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HasPermissionDirective } from '../../../core/directives/has-permission.directive';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ConfirmService } from '../../../core/services/confirm/confirm.service';
import { IncidentChartComponent } from '../incident-chart/incident-chart.component';


@Component({
  selector: 'app-list',
  standalone: true,
  imports: [MatButtonModule, MatTableModule, MatSortModule, MatDatepickerModule, MatSelectModule, CommonModule, IncidentChartComponent,
    MatCardModule, MatPaginatorModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatNativeDateModule, MatIconModule, MatTooltipModule, HasPermissionDirective],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
  providers: [DatePipe]
})
export class ListComponent implements OnInit, AfterViewInit {

  private dialog = inject(MatDialog);
  private incidentService = inject(IncidentService)
  private datePipe = inject(DatePipe)
  private router = inject(Router);
  private confirmService = inject(ConfirmService)

  columns = [
    {
      columnDef: 'référence',
      header: 'Référence',
      cell: (element: Incident) => `${element.reference}`,
    },
    {
      columnDef: 'titre',
      header: 'Titre',
      cell: (element: Incident) => `${element.titre}`,
    },
    {
      columnDef: 'dateDeclaration',
      header: 'Date de déclaration',
      cell: (element: Incident) => this.datePipe.transform(element.declaredAt, 'dd/MM/yyyy') || '',
    },
    {
      columnDef: 'dateSurvenance',
      header: 'Date de survenance',
      cell: (element: Incident) => this.datePipe.transform(element.survenueAt, 'dd/MM/yyyy') || '',
    },

    {
      columnDef: 'statut',
      header: 'Statut',
      cell: (incident: Incident) => `
  <span class="badge ${incident.state.toLowerCase()}">
    ${State[incident.state.toString() as keyof typeof State] || 'Inconnu'}
  </span>
`    }
  ];

  displayedColumns = [...this.columns.map(c => c.columnDef), 'actions'];

  dataSource = new MatTableDataSource<Incident>([]);

  selectedIncident: Incident | null = null;

  incidents: Incident[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dateFilter = new FormControl('');
  categoryFilter = new FormControl('');
  statusFilter = new FormControl('');


  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
  }

  ngOnInit(): void {
    this.loadIncidents();

    this.dateFilter.valueChanges.subscribe(() => this.applyAdvancedFilters());
    this.categoryFilter.valueChanges.subscribe(() => this.applyAdvancedFilters());
    this.statusFilter.valueChanges.subscribe(() => this.applyAdvancedFilters());
  }

  // This method will be triggered when a row is clicked
  onRowClick(incident: Incident) {
    this.router.navigate(['incident', incident.id]);
  }

  formatDate(date: any): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Les mois commencent à 0
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }

  applyAdvancedFilters() {
    let filteredData = [...this.incidents];

    if (this.dateFilter.value) {
      const formattedDate = this.formatDate(this.dateFilter.value);
      filteredData = filteredData.filter(incident =>
        incident.survenueAt && new Date(incident.survenueAt).toISOString().split('T')[0] === formattedDate
      );
    }
    if (this.statusFilter.value) {
      filteredData = filteredData.filter(incident =>
        this.statusFilter.value === 'Clôturé' ? incident.closedAt !== null : incident.closedAt === null
      );
    }

    this.dataSource.data = filteredData;
  }

  customFilterPredicate(data: Incident, filter: string): boolean {
    // Convert the entire object (including nested objects) to a string and check if it contains the filter term
    const stringifiedData = JSON.stringify(data).toLowerCase();  // Convert the entire data object to a string
    return stringifiedData.includes(filter.toLowerCase()); // Check if the filter term is present in the stringified object
  }



  loadIncidents() {
    this.incidentService.loadIncidents().subscribe(data => {
      this.incidents = data;
      this.dataSource.data = data;
    });
  }

  getUniqueCategories(): string[] {
    return []
    // return [...new Set(this.incidents.map(incident => incident.riskPrincipal?.taxonomie || 'Autre'))];
  }


  add() {
    this.router.navigate(
      ['incident', 'create']
    );
  }

  onConfirmAction(incidentId: number) {

    this.confirmService.openConfirmDialog("Suppression", "Voulez-vous vraiment supprimer cet élément ?")
      .subscribe(res => {
        // delete incidentId
      })
  }
}
