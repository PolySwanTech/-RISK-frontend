import { ActionPlanService } from './../../core/services/action-plan/action-plan.service';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
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
import { CreateActionPlanDialogComponent } from "../../features/action-plan/create-action-plan-dialog/create-action-plan-dialog.component";
import { Priority, PriorityLabels } from '../../core/enum/Priority';
import { Status, StatusLabels } from '../../core/enum/status.enum';
import { buildFilterFromColumn } from '../../shared/utils/filter-builder.util';
import { Filter } from '../../core/enum/filter.enum';
import { FilterTableComponent } from "../../shared/components/filter-table/filter-table.component";
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { GlobalSearchBarComponent } from "../../shared/components/global-search-bar/global-search-bar.component";
import { GoBackButton, GoBackComponent } from '../../shared/components/go-back/go-back.component';
import { MatMenu, MatMenuModule } from '@angular/material/menu';
import { SnackBarService } from '../../core/services/snack-bar/snack-bar.service';

@Component({
  selector: 'app-plan-action-page',
  imports: [MatButtonModule, MatTableModule, MatSortModule, MatDatepickerModule, MatSelectModule, CommonModule,
    MatCardModule, MatPaginatorModule, MatFormFieldModule, MatInputModule, FormsModule, GoBackComponent,
    ReactiveFormsModule, MatNativeDateModule, MatIconModule, MatTooltipModule, MatMenuModule,
    MatSelectModule, MatFormFieldModule, MatButtonModule, FilterTableComponent, MatButtonToggleModule, GlobalSearchBarComponent],
  providers: [DatePipe],
  templateUrl: './plan-action-page.component.html',
  styleUrl: './plan-action-page.component.scss'
})
export class PlanActionPageComponent implements OnInit {
  private dialog = inject(MatDialog);
  private datePipe = inject(DatePipe)
  private router = inject(Router);
  private confirmService = inject(ConfirmService)
  private actionPlanService = inject(ActionPlanService);
  private snackBarService = inject(SnackBarService);

  filterMode: 'general' | 'detailed' = 'general';

  columns = [
    {
      columnDef: 'reference',
      header: 'Référence',
      cell: (element: ActionPlan) => `${element.reference}`,
      filterType: 'text',
      icon: 'tag' // 🏷️
    },
    {
      columnDef: 'ref_incident',
      header: 'Référence Incident',
      cell: (element: ActionPlan) => `${element.incidentRef != '' ? element.incidentRef : 'N/A'}`,
      filterType: 'text',
      icon: 'tag' // 🏷️
    },
    {
      columnDef: 'libelle',
      header: 'Titre',
      cell: (element: ActionPlan) => `${element.libelle}`,
      filterType: 'text',
      icon: 'title' // 📝
    },
    {
      columnDef: 'userInCharge',
      header: 'Responsable',
      cell: (element: ActionPlan) => `${element.userInCharge}`,
      filterType: 'text',
      icon: 'person' // 👤
    },
    {
      columnDef: 'echeance',
      header: 'Date d\'échéance',
      cell: (element: ActionPlan) => this.datePipe.transform(element.echeance, 'dd/MM/yyyy') || '',
      filterType: 'date',
      icon: 'event' // 📅
    },
    {
      columnDef: 'priority',
      header: 'Priorité',
      cell: (element: ActionPlan) => this.getPriorityBarHtml(element.priority),
      filterType: 'select',
      icon: 'signal_cellular_alt', // 📶
      options: [
        { value: Priority.MAXIMUM, label: 'Maximale' },
        { value: Priority.MEDIUM, label: 'Moyenne' },
        { value: Priority.MINIMAL, label: 'Minimale' }
      ]
    },
    {
      columnDef: 'status',
      header: 'Statut',
      cell: (element: ActionPlan) => `
      <span class="badge ${element.status.toLowerCase()}">
        ${this.getReadableStatut(element.status)}
      </span>
    `,
      filterType: 'select',
      icon: 'flag', // 🚩
      options: Object.values(Status).map(status => ({
        value: status,
        label: this.getReadableStatut(status)
      }))
    }
  ];

  goBackButtons: GoBackButton[] = [];

  filtersConfig: Filter[] = this.columns.map(col => buildFilterFromColumn(col));

  displayedColumns = [...this.columns.map(c => c.columnDef), 'actions'];

  dataSource = new MatTableDataSource<any>([]);

  actionPlans: ActionPlan[] = [];

  priorities = Object.values(Priority);
  statuses = Object.values(Status);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatMenu) rowMenu! : MatMenu;

  dateFilter = new FormControl('');
  priorityFilter = new FormControl('');
  statusFilter = new FormControl('');


  selectedActionPlan : ActionPlan | null = null;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'priority':
          return item.priority;
        case 'statut':
          return this.getReadableStatut(item.status);
        case 'dateEcheance':
          return new Date(item.echeance);
        case 'id':
          return item.reference; // ou item.id
        default:
          return (item as any)[property];
      }
    }
  }

  getPriorityBarHtml(priority: Priority): string {
    const priorityConfig = {
      [Priority.MAXIMUM]: {
        label: 'Maximale',
        class: 'elevee',
        ariaLabel: 'Priorité élevée - Niveau 3 sur 3'
      },
      [Priority.MEDIUM]: {
        label: 'Moyenne',
        class: 'moyen',
        ariaLabel: 'Priorité moyenne - Niveau 2 sur 3'
      },
      [Priority.MINIMAL]: {
        label: 'Minimale',
        class: 'faible',
        ariaLabel: 'Priorité faible - Niveau 1 sur 3'
      }
    };

    const config = priorityConfig[priority] || priorityConfig[Priority.MEDIUM];

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

  delete(actionPlan : ActionPlan){
    this.actionPlanService.delete(actionPlan.id).subscribe(_ =>  {
      this.snackBarService.info("Plan d'action supprimé");
      this.ngOnInit();
    })
  }

  formatPriority(p: Priority): string {
    return PriorityLabels[p] || p;
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

    this.goBackButtons = [

      {
        label: 'Ajouter un plan d\'action',
        icon: 'add',
        show: true,
        class: 'btn-primary',
        action: () => this.add()
      },
      {
        label: 'Exporter',
        icon: 'file_download',
        show: true,
        class: 'btn-green',
        action: () => console.log('Export action plans')
      },

    ]
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
    this.router.navigate(['action-plan', actionPlan.id]);
  }

  applyAllFilters(): void {

    let filteredData = this.actionPlans.slice(); // Copie de la liste d'origine

    // 1. Filtre par date
    if (this.dateFilter.value) {
      filteredData = filteredData.filter(incident => {
        const formattedDate = new Date(this.dateFilter.value!).toISOString().replace('Z', '+00:00');
        return incident.echeance && new Date(incident.echeance) < new Date(formattedDate);
      });
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
      filteredData = filteredData.filter(actionPlan => {
        const idMatches = actionPlan.reference?.toString().toLowerCase().includes(query);
        const creatorMatches = actionPlan.creator?.toLowerCase().includes(query);
        const nameMatches = actionPlan.libelle?.toLowerCase().includes(query);
        const descriptionMatches = actionPlan.description?.toLowerCase().includes(query);
        const responsableMatches = actionPlan.userInCharge?.toLowerCase().includes(query);
        const priorityMatches = actionPlan.priority?.toLowerCase().includes(query);

        const date = actionPlan.echeance instanceof Date ? actionPlan.echeance : new Date(actionPlan.echeance);
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
    this.actionPlanService.getActionsPlan().subscribe((data: ActionPlan[]) => {
      this.dataSource.data = data;
      this.actionPlans = data;
    });
  }

  getReadableStatut(status: Status): string {
    return StatusLabels[status] || status;
  }


  add() {
    this.dialog.open(CreateActionPlanDialogComponent, {
      width: '800px !important',
      height: '550px',
      minWidth: '800px',
      maxWidth: '800px',
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
    this.searchQuery = event.trim();
    this.applyAllFilters();
  }

  clearSearch() {
    this.searchQuery = '';
    this.dataSource.data = this.actionPlans;
  }

  handleFiltersChanged(filters: Record<string, any>) {
    let filtered = [...this.actionPlans];

    for (const [key, value] of Object.entries(filters)) {
      if (value === null || value === '' || value === undefined) continue;

      filtered = filtered.filter(actionPlan => {
        const itemValue = actionPlan[key as keyof ActionPlan];

        // 🎯 Cas plage de dates
        if (typeof value === 'object' && value.start && value.end) {
          const start = new Date(value.start);
          const end = new Date(value.end);
          const actionDate = new Date(itemValue as string | number | Date);

          // ⚠️ Normaliser les dates à minuit pour ignorer l'heure
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
          actionDate.setHours(0, 0, 0, 0);

          return actionDate >= start && actionDate <= end;
        }

        // 🎯 Cas select ou text simple
        if (typeof itemValue === 'string' || typeof itemValue === 'number') {
          return itemValue.toString().toLowerCase().includes(value.toString().toLowerCase());
        }

        return itemValue === value;
      });
    }

    this.dataSource.data = filtered;
  }
}