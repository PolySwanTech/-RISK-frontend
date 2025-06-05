import { ActionPlanService } from './../../core/services/action-plan/action-plan.service';
import { ActionPlanChartComponent } from "../../features/action-plan/action-plan-chart/action-plan-chart/action-plan-chart.component";
import { AfterViewInit, Component, inject, OnInit, resource, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule, DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfirmService } from "../../core/services/confirm/confirm.service";
import { ActionPlan } from "../../core/models/ActionPlan";
import { Statut } from "../../core/models/Statut";
import { Priority } from "../../core/models/Priority";
import { CreateActionPlanDialogComponent } from "../../features/action-plan/create-action-plan-dialog/create-action-plan-dialog.component";

@Component({
  selector: 'app-plan-action-page',
  imports: [MatButtonModule, MatTableModule, MatSortModule, MatDatepickerModule, MatSelectModule, CommonModule,
    MatCardModule, MatPaginatorModule, MatFormFieldModule, MatInputModule, FormsModule,
    ReactiveFormsModule, MatNativeDateModule, MatIconModule, MatTooltipModule, MatSelectModule, MatFormFieldModule, MatButtonModule ],
  providers: [DatePipe],
  templateUrl: './plan-action-page.component.html',
  styleUrl: './plan-action-page.component.scss'
})
export class PlanActionPageComponent {
  private dialog = inject(MatDialog);
  private datePipe = inject(DatePipe)
  private router = inject(Router);
  private confirmService = inject(ConfirmService)
  private actionPlanService = inject(ActionPlanService);

  columns = [
    {
      columnDef: 'id',
      header: 'Ref',
      cell: (element: ActionPlan) => `${element.id}`,
    },
    {
      columnDef: 'creator',
      header: 'Incident lié',
      cell: (element: ActionPlan) => `${element.creator}`,
    },
    {
      columnDef: 'titre',
      header: 'Titre',
      cell: (element: ActionPlan) => `${element.name}`,
    },
    {
      columnDef: 'description',
      header: 'Description',
      cell: (element: ActionPlan) => `${element.description}`,
    },
    {
      columnDef: 'responsable',
      header: 'Responsable',
      cell: (element: ActionPlan) => `${element.responsable}`,
    },
    {
      columnDef: 'dateEcheance',
      header: 'Date d\'échéance',
      cell: (element: ActionPlan) => this.datePipe.transform(element.echeance, 'dd/MM/yyyy') || '',
    },
     { 
      columnDef: 'priority', 
      header: 'Priorité', 
      cell: (element: ActionPlan) => this.getPriorityBarHtml(element.priority)
    },
    {
      columnDef: 'statut',
      header: 'Statut',
      cell: (element: ActionPlan) => `
  <span class="badge ${element.status.toLowerCase()}">
      ${this.getReadableStatut(element.status)}
    </span>
`    }
  ];

  displayedColumns = [...this.columns.map(c => c.columnDef), 'actions'];

  dataSource = new MatTableDataSource<any>([]);

  selectedIncident: ActionPlan | null = null;

  actionPlans: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dateFilter = new FormControl('');
  priorityFilter = new FormControl('');
  statusFilter = new FormControl('');


  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
  }

  getPriorityBarHtml(priority: 'elevee' | 'moyen' | 'faible'): string {
    const priorityConfig = {
      elevee: { 
        label: 'Élevée', 
        class: 'elevee',
        ariaLabel: 'Priorité élevée - Niveau 3 sur 3'
      },
      moyen: { 
        label: 'Moyen', 
        class: 'moyen',
        ariaLabel: 'Priorité moyenne - Niveau 2 sur 3'
      },
      faible: { 
        label: 'Faible', 
        class: 'faible',
        ariaLabel: 'Priorité faible - Niveau 1 sur 3'
      }
    };

    const config = priorityConfig[priority] || priorityConfig.moyen;

    return `
      <div class="priority-container">
        <div class="priority-bar ${config.class}" 
             role="progressbar" 
             aria-label="${config.ariaLabel}"
             title="${config.label}">
        </div>
        <span class="priority-label ${config.class}">${config.label}</span>
      </div>
    `;
  }

  getPriorityBadge(priority: string) {
  const badges: { [key: string]: string } = {
    'elevee': '<span class="priority-badge priority-elevee">Élevée</span>',
    'moyen': '<span class="priority-badge priority-moyen">Moyen</span>',
    'faible': '<span class="priority-badge priority-faible">Faible</span>'
  };
  return badges[priority] || badges['moyen'];
}

  getPriorityColor(priority: 'elevee' | 'moyen' | 'faible'): string {
    const colors = {
      elevee: '#f44336',
      moyen: '#ff9800',
      faible: '#4caf50'
    };
    return colors[priority] || colors.moyen;
  }

  filterByPriority(priority: 'elevee' | 'moyen' | 'faible' | 'all'): void {
    if (priority === 'all') {
      this.dataSource.filter = '';
    } else {
      this.dataSource.filterPredicate = (data: ActionPlan, filter: string) => {
        return data.priority === filter;
      };
      this.dataSource.filter = priority;
    }
  }

  ngOnInit(): void {
    this.loadActionPlans();

    this.dateFilter.valueChanges.subscribe(() => this.applyAllFilters());
    this.priorityFilter.valueChanges.subscribe(() => this.applyAllFilters());
    this.statusFilter.valueChanges.subscribe(() => this.applyAllFilters());
  }

  clearFilters(): void {
    this.dateFilter.setValue('');
    this.priorityFilter.setValue('');
    this.statusFilter.setValue('');
    this.searchQuery = '';
    this.dataSource.data = this.actionPlans;
  }

  refreshData() {
    this.ngOnInit();
  }

  // This method will be triggered when a row is clicked
  onRowClick(actionPlan: ActionPlan) {
    console.log('Row clicked:', actionPlan);
    // this.router.navigate(['incident', incident.id]);
  }

  formatDate(date: any): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Les mois commencent à 0
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }

  applyAllFilters(): void {
  let filteredData = [...this.actionPlans];

  // 1. Filtre par date
  if (this.dateFilter.value) {
    const formattedDate = this.formatDate(this.dateFilter.value);
    filteredData = filteredData.filter(incident =>
      incident.echeance && new Date(incident.echeance).toISOString().split('T')[0] === formattedDate
    );
  }

  // 2. Filtre par priorité
  if (this.priorityFilter.value) {
    filteredData = filteredData.filter(incident =>
      incident.priority === this.priorityFilter.value
    );
  }

  // 3. Filtre par statut
  if (this.statusFilter.value) {
    filteredData = filteredData.filter(incident =>
      incident.status === this.statusFilter.value
    );
  }

  // 4. Recherche textuelle
  if (this.searchQuery && this.searchQuery.trim() != '') {
    const query = this.searchQuery.toLowerCase();

    filteredData = filteredData.filter(file => {
      const idMatches = file.id?.toString().toLowerCase().includes(query);
      const creatorMatches = file.creator?.toLowerCase().includes(query);
      const nameMatches = file.name?.toLowerCase().includes(query);
      const descriptionMatches = file.description?.toLowerCase().includes(query);
      const responsableMatches = file.responsable?.toLowerCase().includes(query);
      const priorityMatches = file.priority?.toLowerCase().includes(query);

      const date = file.uploadedAt instanceof Date ? file.uploadedAt : new Date(file.uploadedAt);
      const formattedDate = date.toLocaleDateString('fr-FR');
      const dateMatches = formattedDate.includes(query);

      return (
        idMatches ||
        creatorMatches ||
        nameMatches ||
        descriptionMatches ||
        responsableMatches ||
        priorityMatches ||
        dateMatches
      );
    });
  }

  // Mise à jour de la data
  this.dataSource.data = filteredData;
}

  customFilterPredicate(data: ActionPlan, filter: string): boolean {
    // Convert the entire object (including nested objects) to a string and check if it contains the filter term
    const stringifiedData = JSON.stringify(data).toLowerCase();  // Convert the entire data object to a string
    return stringifiedData.includes(filter.toLowerCase()); // Check if the filter term is present in the stringified object
  }



  loadActionPlans() {
    this.actionPlans = this.actionPlanService.getActionsPlan();
    this.dataSource.data = this.actionPlans;
  }

  getUniquePriorities(): string[] {
    return [Priority.MINIMAL, Priority.MEDIUM, Priority.MAXIMUM];
  }

  getReadableStatut(status: Statut): string {
  switch (status) {
    case Statut.IN_PROGRESS:
      return 'En cours';
    case Statut.ACHIEVED:
      return 'Clôturé';
    case Statut.NOT_ACHIEVED:
      return 'Non réalisé';
    default:
      return 'Inconnu';
  }
}


  add() {
    this.dialog.open(CreateActionPlanDialogComponent, {
      width: '600px !important',
      height: '550px',
      minWidth: '600px',
      maxWidth: '600px',
    });
  }

  onConfirmAction(incidentId: number) {

    this.confirmService.openConfirmDialog("Suppression", "Voulez-vous vraiment supprimer cet élément ?")
      .subscribe(res => {
        // delete incidentId
      })
  }

  
  searchQuery: string = '';
  onSearchFiles(event: any): void {
  this.searchQuery = event.target.value.trim();
this.applyAllFilters();
}

  clearSearch() {
    this.searchQuery = '';
    this.dataSource.data = this.actionPlans;
  }
}