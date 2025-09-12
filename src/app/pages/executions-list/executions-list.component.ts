import { ControlService } from './../../core/services/control/control.service';
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
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { GoBackButton, GoBackComponent } from '../../shared/components/go-back/go-back.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FilterTableComponent } from '../../shared/components/filter-table/filter-table.component';
import { GlobalSearchBarComponent } from '../../shared/components/global-search-bar/global-search-bar.component';
import { MatPaginator } from '@angular/material/paginator';
import { Filter } from '../../core/enum/filter.enum';
import { buildFilterFromColumn } from '../../shared/utils/filter-builder.util';
import { ControlExecution } from '../../core/models/ControlExecution';
import { Status, StatusLabels } from '../../core/enum/status.enum';
import { EvaluationControl, EvaluationControlLabels } from '../../core/enum/evaluation-controle.enum';
import { PopUpDetailExecutionComponent } from '../../features/control/pop-up-detail-execution/pop-up-detail-execution.component';

@Component({
  selector: 'app-executions-list',
  imports: [MatCardModule, MatListModule, MatIconModule, FormsModule,
    MatGridListModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatTooltipModule, CommonModule, GoBackComponent, MatTableModule, MatButtonToggleModule,
    FilterTableComponent, GlobalSearchBarComponent, MatPaginator],
  providers: [DatePipe, CurrencyPipe],
  templateUrl: './executions-list.component.html',
  styleUrl: './executions-list.component.scss'
})
export class ExecutionsListComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private controlService = inject(ControlService);
  private dialog = inject(MatDialog);
  private datePipe = inject(DatePipe);
  expandedId: string | null = null;

  executionId: string = this.route.snapshot.paramMap.get('id') || '';

  executions: ControlExecution[] = [];

  goBackButtons: GoBackButton[] = [];

  filterMode: 'general' | 'detailed' = 'general';

  columns = [
    {
      columnDef: 'status',
      header: 'Statut',
      cell: (execution: ControlExecution) =>
        `<span class="badge ${this.getStatusClass(execution.status)}">
       ${this.formatStatus(execution.status)}
     </span>`,
      filterType: 'select',
      icon: 'check_circle',
      options: [
        { value: Status.ACHIEVED, label: this.formatStatus(Status.ACHIEVED) },
        { value: Status.IN_PROGRESS, label: this.formatStatus(Status.IN_PROGRESS) },
        { value: Status.NOT_ACHIEVED, label: this.formatStatus(Status.NOT_ACHIEVED) }
      ]
    },
    {
      columnDef: 'priority',
      header: 'Priorité',
      cell: (execution: ControlExecution) => this.formatPriority(execution.priority) || '',
      filterType: 'select',
      icon: 'priority_high'
    },
    {
      columnDef: 'plannedAt',
      header: 'Prévu le',
      cell: (execution: ControlExecution) =>
        this.datePipe.transform(execution.plannedAt, 'dd/MM/yyyy HH:mm') || '',
      filterType: 'date',
      icon: 'event'
    },
    {
      columnDef: 'achievedAt',
      header: 'Réalisé le',
      cell: (execution: ControlExecution) =>
        execution.achievedAt
          ? this.datePipe.transform(execution.achievedAt, 'dd/MM/yyyy HH:mm')
          : '—',
      filterType: 'date',
      icon: 'event_available'
    },
    {
      columnDef: 'evaluation',
      header: 'Évaluation',
      cell: (execution: ControlExecution) =>  EvaluationControlLabels[execution.evaluation] || '',
      filterType: 'select',
      icon: 'grading',
    },
    {
      columnDef: 'performedBy',
      header: 'Exécuté par',
      cell: (execution: ControlExecution) => execution.performedBy || '',
      filterType: 'text',
      icon: 'person'
    },
  ];
  displayedColumns = this.columns.map(c => c.columnDef);

  filtersConfig: Filter[] = this.columns.map(col => buildFilterFromColumn(col));

  dataSource = new MatTableDataSource<ControlExecution>([]);

  @Input() closed: boolean = false;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit() {
    if (this.executionId) {
      this.controlService.getAllExecutions(this.executionId, true).subscribe(executions => {
        this.executions = executions;
        this.dataSource.data = executions;
      });
    }
    this.goBackButtons = [
      // {
      //   label: 'Ajouter un impact',
      //   icon: 'add',
      //   class: 'btn-primary',
      //   show: true,
      //   action: () => this.addImpact()
      // }
    ];
  }

  getStatusClass(status?: Status): string {
    if (!status) return 'status-default';
    switch (status) {
      case Status.ACHIEVED: return 'status-realise';
      case Status.IN_PROGRESS: return 'status-en-cours';
      case Status.NOT_ACHIEVED: return 'status-non-realise';
      default: return 'status-default';
    }
  }

  getEvaluationLabel(v?: EvaluationControl | null): string {
  return v ? EvaluationControlLabels[v] : '';
}

  formatPriority(p?: string) { return p === 'MINIMAL' ? 'Faible' : p === 'MEDIUM' ? 'Moyenne' : 'Élevée'; }

  formatStatus(s?: Status) { return s ? StatusLabels[s] : '—'; }

  handleFiltersChanged(filters: any) {
    let filtered = [...this.executions];

    for (const key in filters) {
      const filterValue = filters[key];
      if (!filterValue) continue;

      filtered = filtered.filter((exec: any) => {
        const fieldValue = exec[key];

        // Cas spécial : filtre par plage de dates { start, end }
        if (filterValue.start instanceof Date && filterValue.end instanceof Date) {
          if (!fieldValue) return false;

          const execDate = new Date(fieldValue); // date du champ
          if (isNaN(execDate.getTime())) return false;

          const start = new Date(filterValue.start);
          const end = new Date(filterValue.end);
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);

          return execDate >= start && execDate <= end;
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
    this.dataSource.data = this.executions.filter(exec =>
      Object.entries(exec).some(([key, value]) => {
        if (key === 'id' || key === 'entityId') return false;

        // 🔹 Dates
        if (key === 'createdAt' || key === 'plannedAt' || key === 'achievedAt') {
          const formattedDate = this.datePipe.transform(value, 'dd/MM/yyyy HH:mm') || '';
          return formattedDate.toLowerCase().includes(lowerQuery);
        }

        // 🔹 Status (cherche sur le label affiché)
        if (key === 'status') {
          const label = this.formatStatus(value as Status);
          return label.toLowerCase().includes(lowerQuery);
        }

        // 🔹 Priority (cherche sur libellé traduit)
        if (key === 'priority') {
          const label = this.formatPriority(value as string);
          return label.toLowerCase().includes(lowerQuery);
        }

        // 🔹 Evaluation (cherche sur libellé traduit)
        if (key === 'evaluation') {
          const label = EvaluationControlLabels[value as EvaluationControl];
          return label.toLowerCase().includes(lowerQuery);
        }

        // 🔹 Fallback : string brut
        return value?.toString().toLowerCase().includes(lowerQuery);
      })
    );
  }

  openProcessDialog(row?: any) {
    this.dialog.open(PopUpDetailExecutionComponent, {
      width: '600px !important',
      data: row
    }).afterClosed().subscribe(_ => {
      this.ngOnInit();
    });
  }

  clearSearch() {
    this.searchQuery = '';
    this.dataSource.data = this.executions;
  }
}


