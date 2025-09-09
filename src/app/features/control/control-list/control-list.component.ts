import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { ControlService } from '../../../core/services/control/control.service';
import { ControlTemplate } from '../../../core/models/ControlTemplate';
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
import { EnumLabels } from '../../../core/enum/enum-labels';
import { DateRangePickerComponent } from "../../../shared/components/date-range-picker/date-range-picker.component";
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { GlobalSearchBarComponent } from "../../../shared/components/global-search-bar/global-search-bar.component";
import { Filter } from '../../../core/enum/filter.enum';
import { buildFilterFromColumn } from '../../../shared/utils/filter-builder.util';
import { filter } from 'rxjs';
import { FilterTableComponent } from "../../../shared/components/filter-table/filter-table.component";
import { RiskLevel } from '../../../core/enum/riskLevel.enum';

@Component({
  selector: 'app-control-list',
  imports: [
    MatButtonModule, MatTableModule, MatSortModule, MatDatepickerModule,
    MatSelectModule, CommonModule, MatCardModule, MatPaginatorModule,
    MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatNativeDateModule,
    MatIconModule, MatTooltipModule, FormsModule, MatButtonToggleModule,
    GlobalSearchBarComponent,
    FilterTableComponent
  ],
  providers: [DatePipe],
  templateUrl: './control-list.component.html',
  styleUrl: './control-list.component.scss'
})
export class ControlListComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  datePipe = inject(DatePipe);
  fb = inject(FormBuilder);

  filterMode: 'general' | 'detailed' = 'general';

  columns = [
    {
      columnDef: 'reference',
      header: 'Référence',
      cell: (e: ControlTemplate) => e.reference,
      filterType: 'text',
      icon: 'tag' // 🏷️
    },
    {
      columnDef: 'libelle',
      header: 'Nom du contrôle',
      cell: (e: ControlTemplate) => e.libelle,
      filterType: 'text',
      icon: 'title' // 📝
    },
    {
      columnDef: 'processName',
      header: 'Processus métier',
      cell: (e: ControlTemplate) => e.processName,
      filterType: 'text',
      icon: 'business_center' // 🏢
    },

    {
      columnDef: 'type',
      header: 'Type de contrôle',
      cell: (e: ControlTemplate) => this.getTypeLabel(e.controlType),
      isBadge: 'type',
      filterType: 'select',
      options: Object.keys(EnumLabels.type).map(key => ({
        value: key,
        label: this.getTypeLabel(key as keyof typeof EnumLabels.type)
      })),
      icon: 'category' // 📂
    },

    {
      columnDef: 'riskLevel',
      header: 'Degré de risque',
      cell: (e: ControlTemplate) => this.getRiskLabel(e.riskLevel.name),
      isBadge: 'risk',
      filterType: 'select',
      options: Object.keys(EnumLabels.risk).map(key => ({
        value: key,
        label: this.getRiskLabel(key as keyof typeof EnumLabels.risk)
      })),
      icon: 'report_problem' // ⚠️
    },

    {
      columnDef: 'Fréquence',
      header: 'Fréquence',
      cell: (e: ControlTemplate) => this.getRecurrenceLabel(e.frequency),
      filterType: 'select',
      options: Object.keys(EnumLabels.reccurency).map(key => ({
        value: key,
        label: this.getRecurrenceLabel(key as keyof typeof EnumLabels.reccurency)
      })),
      icon: 'schedule' // ⏰
    },

    {
      columnDef: 'controlLevel',
      header: 'Degré de contrôle',
      cell: (e: any) => this.getDegresLabel(e.controlLevel),
      isBadge: 'control',
      filterType: 'select',
      options: Object.keys(EnumLabels.degres).map(key => ({
        value: key,
        label: this.getDegresLabel(key as keyof typeof EnumLabels.degres)
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
      cell: (e: ControlTemplate) => e.actif ? 'Actif' : 'Suspendu',
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
      cell: (e: ControlTemplate) => this.datePipe.transform(e.nextExecution, 'dd/MM/yyyy') || '',
      filterType: 'date',
      icon: 'event' // 📅
    }
  ];

  filtersConfig: Filter[] = this.columns.map(col => buildFilterFromColumn(col));

  selectedRange: { start: Date | null; end: Date | null } = { start: null, end: null };

  displayedColumns = this.columns.map(c => c.columnDef);
  dataSource = new MatTableDataSource<ControlTemplate>([]);

  controlService = inject(ControlService);
  userService = inject(UtilisateurService);
  router = inject(Router);
  dialog = inject(MatDialog);

  controls: ControlTemplate[] = [];

  searchQuery: string = '';

  enumLabels = EnumLabels;

  getTypeLabel(type: keyof typeof EnumLabels.type): string {
    return EnumLabels?.type?.[type] ?? type;
  }

  getPriorityLabel(priority: keyof typeof EnumLabels.priority): string {
    return EnumLabels?.priority?.[priority] ?? priority;
  }

  getDegresLabel(degres: keyof typeof EnumLabels.degres): string {
    return EnumLabels?.degres?.[degres] ?? degres;
  }

  getRecurrenceLabel(key: keyof typeof EnumLabels.reccurency): string {
    return EnumLabels?.reccurency?.[key] ?? key;
  }

  getRiskLabel(risk: keyof typeof EnumLabels.risk): string {
    return EnumLabels?.risk?.[risk] ?? risk;
  }

  getBadgeClass(type: string, value: any) {
    switch (type) {
      case 'type':
        return 'badge-type';
      case 'risk':
        if (value.toLowerCase().includes('faible')) return 'badge-risque-faible';
        if (value.toLowerCase().includes('moyen')) return 'badge-risque-moyen';
        if (value.toLowerCase().includes('élevé') || value.toLowerCase().includes('very_high')) return 'badge-risque-élevé';
        return '';
      case 'control':
        if (value === '1') return 'badge-controle-faible';
        if (value === '2') return 'badge-controle-moyen';
        return '';
      case 'statut':
        if (value.toLowerCase().includes('actif')) return 'badge-statut-ouvert';
        if (value.toLowerCase().includes('suspendu')) return 'badge-statut-ferme';
        return '';
      default:
        return '';
    }
  }

  ngOnInit(): void {
    this.getUsersAndControls();
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

  onRowClick(control: ControlTemplate) {
    this.router.navigate(['control', 'details', control.id.id]);
  }

  create() {
    this.dialog.open(CreateControlComponent, {
      width: '700px !important',
      height: '600px',
      minWidth: '600px',
      maxWidth: '600px'
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
        this.getTypeLabel(c.controlType as keyof typeof this.enumLabels.type).toLowerCase().includes(query) ||
        this.getRiskLabel(c.riskLevel.name as keyof typeof this.enumLabels.risk).toLowerCase().includes(query) ||
        this.getDegresLabel(c.controlLevel as keyof typeof this.enumLabels.degres).toLowerCase().includes(query) ||
        this.getRecurrenceLabel(c.frequency as keyof typeof this.enumLabels.reccurency).toLowerCase().includes(query) ||
        (c.actif ? 'Actif' : 'Suspendu').toLowerCase().includes(query)
      );
    }

    this.dataSource.data = filtered;
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
          return this.getTypeLabel(control.controlType).toLowerCase() === this.getTypeLabel(value).toLowerCase();
        }

        if (key === 'riskLevel') {
          return this.getRiskLabel(control.riskLevel.name).toLowerCase() === this.getRiskLabel(value).toLowerCase();
        }

        if (key === 'controlLevel') {
          return this.getDegresLabel(control.controlLevel).toLowerCase() === this.getDegresLabel(value).toLowerCase();
        }

        if (key === 'Fréquence') {
          return this.getRecurrenceLabel(control.frequency).toLowerCase() === this.getRecurrenceLabel(value).toLowerCase();
        }

        // ✅ Champ texte : reference, libelle, processName, creatorName, etc.
        return fieldValue?.toString().toLowerCase().includes(value.toString().toLowerCase());
      });
    }

    this.dataSource.data = filtered;
  }

}