import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { ControlService } from '../../../core/services/dmr/control/control.service';
import { ControlTemplateListViewDto } from '../../../core/models/ControlTemplate';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { CreateControlComponent } from '../create-control/create-control.component';
import { MatDialog } from '@angular/material/dialog';
import { UtilisateurService } from '../../../core/services/utilisateur/utilisateur.service';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { GlobalSearchBarComponent } from "../../../shared/components/global-search-bar/global-search-bar.component";
import { Filter } from '../../../core/enum/filter.enum';
import { buildFilterFromColumn } from '../../../shared/utils/filter-builder.util';
import { FilterTableComponent } from "../../../shared/components/filter-table/filter-table.component";
import { ControlTypeLabels, Type } from '../../../core/enum/controltype.enum';
import { Degree } from '../../../core/enum/degree.enum';
import { Recurrence } from '../../../core/enum/recurrence.enum';
import { GoBackButton, GoBackComponent } from '../../../shared/components/go-back/go-back.component';
import { MatMenu, MatMenuModule } from '@angular/material/menu';
import { SnackBarService } from '../../../core/services/snack-bar/snack-bar.service';
import { EnumLabelPipe } from '../../../shared/pipes/enum-label.pipe';

@Component({
  selector: 'app-control-list',
  imports: [
    MatButtonModule, MatTableModule, MatSortModule, MatDatepickerModule,
    MatSelectModule, CommonModule, MatCardModule, MatPaginatorModule,
    MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatNativeDateModule,
    MatIconModule, MatTooltipModule, FormsModule, MatButtonToggleModule,
    GlobalSearchBarComponent, GoBackComponent, MatMenuModule,
    FilterTableComponent
  ],
  providers: [DatePipe, EnumLabelPipe],
  templateUrl: './control-list.component.html',
  styleUrl: './control-list.component.scss'
})
export class ControlListComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('rowMenu') rowMenu!: MatMenu;  // ViewChild to access mat-menu


  datePipe = inject(DatePipe);
  fb = inject(FormBuilder);

  private snackBarService = inject(SnackBarService);
  private enumLabelPipe = inject(EnumLabelPipe);

  filterMode: 'general' | 'detailed' = 'general';

  columns = [
    {
      columnDef: 'reference',
      header: 'Référence',
      cell: (e: ControlTemplateListViewDto) => e.reference,
      filterType: 'text',
      icon: 'tag' // 🏷️
    },
    {
      columnDef: 'libelle',
      header: 'Nom du contrôle',
      cell: (e: ControlTemplateListViewDto) => e.libelle,
      filterType: 'text',
      icon: 'title' // 📝
    },
    {
      columnDef: 'processName',
      header: 'Processus métier',
      cell: (e: ControlTemplateListViewDto) => e.processName,
      filterType: 'text',
      icon: 'business_center' // 🏢
    },

    {
      columnDef: 'type',
      header: 'Type de contrôle',
      cell: (e: ControlTemplateListViewDto) => this.enumLabelPipe.transform(e.controlType, 'controlType'),
      isBadge: 'type',
      filterType: 'select',
      options: Object.values(Type).map(key => ({
        value: key,
        label: ControlTypeLabels[key]
      })),
      icon: 'category' // 📂
    },

    {
      columnDef: 'Fréquence',
      header: 'Fréquence',
      cell: (e: ControlTemplateListViewDto) => this.enumLabelPipe.transform(e.frequency, 'recurrence'),
      filterType: 'select',
      options: Object.values(Recurrence).map(key => ({
        value: key,
        label: this.enumLabelPipe.transform(key, 'recurrence')
      })),
      icon: 'schedule' // ⏰
    },

    {
      columnDef: 'controlLevel',
      header: 'Degré de contrôle',
      cell: (e: any) => this.enumLabelPipe.transform(e.controlLevel, 'degree'),
      isBadge: 'control',
      filterType: 'select',
      options: Object.values(Degree).map(key => ({
        value: key,
        label: this.enumLabelPipe.transform(key, 'degree')
      })),
      icon: 'tune' // 🎚️
    },

    {
      columnDef: 'creator',
      header: 'Responsable',
      cell: (e: any) => e.creator,
      filterType: 'text',
      icon: 'person' // 👤
    },

    {
      columnDef: 'actif',
      header: 'Statut',
      cell: (e: ControlTemplateListViewDto) => e.actif ? 'Actif' : 'Suspendu',
      isBadge: 'statut',
      filterType: 'select',
      options: [
        { value: 'actif', label: 'Actif' },
        { value: 'suspendu', label: 'Suspendu' }
      ],
      icon: 'toggle_on' // 🔛
    },

    {
      columnDef: 'nextExecution',
      header: 'Prochaine échéance',
      cell: (e: ControlTemplateListViewDto) => this.datePipe.transform(e.nextExecution, 'dd/MM/yyyy') || '',
      filterType: 'date',
      icon: 'event' // 📅
    }
  ];

  filtersConfig: Filter[] = this.columns.map(col => buildFilterFromColumn(col));

  selectedRange: { start: Date | null; end: Date | null } = { start: null, end: null };

  displayedColumns = [...this.columns.map(c => c.columnDef), 'actions'];
  dataSource = new MatTableDataSource<ControlTemplateListViewDto>([]);

  controlService = inject(ControlService);
  userService = inject(UtilisateurService);
  router = inject(Router);
  dialog = inject(MatDialog);

  controls: ControlTemplateListViewDto[] = [];

  goBackButtons: GoBackButton[] = [];

  searchQuery: string = '';

  selectedControl: ControlTemplateListViewDto | null = null;

  getBadgeClass(type: string, value: any) {
    switch (type) {
      case 'type':
        return 'type';
      case 'control':
        if (value === 'Niveau 1') return 'faible';
        if (value === 'Niveau 2') return 'moyen';
        return '';
      case 'statut':
        if (value.toLowerCase().includes('actif')) return 'ouvert';
        if (value.toLowerCase().includes('suspendu')) return 'ferme';
        return '';
      default:
        return '';
    }
  }

  ngOnInit(): void {
    this.getUsersAndControls();
    this.goBackButtons = [
      {
        label: 'Ajouter un contrôle',
        icon: 'add',
        action: () => this.create(),
        show: true,
        permission: 'CREATE_CONTROLE',
        class: 'btn-primary'
      },
      {
        label: 'Exporter',
        icon: 'file_download',
        action: () => this.export(),
        show: true,
        class: 'btn-green'
      }
    ]
  }

  export() {
    alert('Fonctionnalité d\'exportation non implémentée');
  }

  refresh() {
    this.ngOnInit();
    this.resetFilters();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
  }

  getUsersAndControls() {
    this.controlService.getAllTemplates().subscribe(
      {
        next: resp => {
          this.controls = resp;
          this.dataSource.data = this.controls;
        },
        error: err => console.error('Erreur lors de la récupération des contrôles', err)
      }
    )
  }

  onRowClick(control: ControlTemplateListViewDto) {
    this.router.navigate(['control', 'details', control.id]);
  }

  create() {
    this.dialog.open(CreateControlComponent, {
      width: '800px',
          maxWidth: '95vw',
          maxHeight: '90vh',
          panelClass: 'custom-dialog-container'
    }).afterClosed().subscribe(() => this.ngOnInit());
  }

  onDateRangeSelected(event: any) {
    this.applyFilters(event.start, event.end);
  }

  applyFilters(start?: string, end?: string) {
    let filtered = [...this.controls];

    const toStartOfDay = (str?: string) => {
      if (!str) return null;
      const d = new Date(str);
      d.setHours(0, 0, 0, 0); // début de la journée
      return d;
    };

    const toEndOfDay = (str?: string) => {
      if (!str) return null;
      const d = new Date(str);
      d.setHours(23, 59, 59, 999); // fin de la journée
      return d;
    };

    const dateStart = toStartOfDay(start);
    const dateEnd = toEndOfDay(end);

    if (dateStart && dateEnd) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.nextExecution);
        return itemDate >= dateStart && itemDate <= dateEnd;
      });
    }

    if (this.searchQuery && this.searchQuery.trim().length > 0) {
      const query = this.searchQuery.trim().toLowerCase();
      filtered = filtered.filter(c =>
        (c.reference?.toLowerCase().includes(query) || '') ||
        (c.libelle?.toLowerCase().includes(query) || '') ||
        (c.processName?.toLowerCase().includes(query) || '') ||
        (c.responsable?.toLowerCase().includes(query) || '') ||
        (c.creator?.toLowerCase().includes(query) || '') ||
        this.enumLabelPipe.transform(c.controlType, 'controlType').toLowerCase().includes(query) ||
        this.enumLabelPipe.transform(c.riskLevel.name, 'riskLevel').toLowerCase().includes(query) ||
        this.enumLabelPipe.transform(c.controlLevel, 'degree').toLowerCase().includes(query) ||
        this.enumLabelPipe.transform(c.frequency, 'recurrence').toLowerCase().includes(query) ||
        (c.actif ? 'Actif' : 'Suspendu').toLowerCase().includes(query)
      );
    }

    this.dataSource.data = filtered;
  }

  activeOrSuspendControl(control: ControlTemplateListViewDto) {
    if (control.actif) {
      // suspend
      this.controlService.suspendControl(control.id).subscribe(_ => this.snackBarService.info('Le contrôle a été suspendu avec succès.'));
      this.getUsersAndControls();
    }
    else {
      // activate
      this.controlService.activateControl(control.id).subscribe(_ => this.snackBarService.info('Le contrôle a été activé avec succès.'));
      this.getUsersAndControls();
    }
  }

  resetFilters() {
    this.searchQuery = '';
    this.dataSource.data = this.controls;
  }

  onSearchControls() {
    this.applyFilters();
  }

  clearSearch() {
    this.searchQuery = '';
    this.applyFilters();
  }

  handleFiltersChanged(filters: Record<string, any>) {
    let filtered = [...this.controls];

    for (const [key, value] of Object.entries(filters)) {
      if (value === null || value === '') continue;

      filtered = filtered.filter(control => {
        const fieldValue = (control as any)[key];

        // ✅ Filtrage par plage de dates
        if (value.start instanceof Date && value.end instanceof Date) {
          if (!fieldValue) return false;

          const controlDate = new Date(fieldValue);
          const start = new Date(value.start);
          const end = new Date(value.end);

          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);

          return controlDate >= start && controlDate <= end;
        }

        // ✅ Filtrage du champ `actif` : Actif / Suspendu
        if (key === 'actif') {
          if (value === 'actif') return control.actif === true;
          if (value === 'suspendu') return control.actif === false;
        }

        // ✅ Champs enum mappés via fonctions
        if (key === 'type') {
          return this.enumLabelPipe.transform(control.controlType, 'controlType').toLowerCase() === this.enumLabelPipe.transform(value, 'controlType').toLowerCase();
        }

        if (key === 'riskLevel') {
          return this.enumLabelPipe.transform(control.riskLevel.name, 'riskLevel').toLowerCase() === this.enumLabelPipe.transform(value, 'riskLevel').toLowerCase();
        }

        if (key === 'controlLevel') {
          return this.enumLabelPipe.transform(control.controlLevel, 'degree').toLowerCase() === this.enumLabelPipe.transform(value, 'degree').toLowerCase();
        }

        if (key === 'Fréquence') {
          return this.enumLabelPipe.transform(control.frequency, 'recurrence').toLowerCase() === this.enumLabelPipe.transform(value, 'recurrence').toLowerCase();
        }

        // ✅ Champ texte : reference, libelle, processName, creatorName, etc.
        return fieldValue?.toString().toLowerCase().includes(value.toString().toLowerCase());
      });
    }

    this.dataSource.data = filtered;
  }

}