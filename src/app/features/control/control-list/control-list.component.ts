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

@Component({
  selector: 'app-control-list',
  imports: [
    MatButtonModule, MatTableModule, MatSortModule, MatDatepickerModule,
    MatSelectModule, CommonModule, MatCardModule, MatPaginatorModule,
    MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatNativeDateModule,
    MatIconModule, MatTooltipModule, FormsModule,
    DateRangePickerComponent
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
  
  columns = [
    { columnDef: 'Référence', header: 'Référence', cell: (e: ControlTemplate) => e.reference },
    { columnDef: 'libelle', header: 'Nom du contrôle', cell: (e: ControlTemplate) => e.libelle },
    { columnDef: 'Processus métier', header: 'Processus métier', cell: (e: ControlTemplate) => e.processName },

    // ✅ Mappé via enum
    { columnDef: 'type', header: 'Type de contrôle', cell: (e: ControlTemplate) => this.getTypeLabel(e.controlType), isBadge: 'type' },

    // ✅ Mappé via enum
    { columnDef: 'riskLevel', header: 'Degré de risque', cell: (e: any) => this.getRiskLabel(e.riskLevel), isBadge: 'risk' },

    // ✅ Mappé via enum
    { columnDef: 'Fréquence', header: 'Fréquence', cell: (e: ControlTemplate) => this.getRecurrenceLabel(e.frequency) },

    // ✅ Mappé via enum
    { columnDef: 'controlLevel', header: 'Degré de contrôle', cell: (e: any) => this.getDegresLabel(e.controlLevel), isBadge: 'control' },

    { columnDef: 'creatorName', header: 'Responsable', cell: (e: any) => e.creatorName },

    { columnDef: 'actif', header: 'Statut', cell: (e: ControlTemplate) => e.actif ? 'Actif' : 'Suspendu', isBadge: 'statut' },

    { columnDef: 'nextExecution', header: 'Prochaine échéance', cell: (e: ControlTemplate) => this.datePipe.transform(e.nextExecution, 'dd/MM/yyyy') || '' }
  ];

  selectedRange: { start: Date | null; end: Date | null } = { start: null, end: null };

  displayedColumns = this.columns.map(c => c.columnDef);
  dataSource = new MatTableDataSource<ControlTemplate>([]);

  controlService = inject(ControlService);
  userService = inject(UtilisateurService);
  router = inject(Router);
  dialog = inject(MatDialog);

  controls: any[] = [];
  listUsers: any[] = [];

  searchQuery: string = '';

  enumLabels = EnumLabels;

  getTypeLabel(type: keyof typeof EnumLabels.type): string {
    return this.enumLabels.type[type];
  }

  getPriorityLabel(priority: keyof typeof EnumLabels.priority): string {
    return this.enumLabels.priority[priority];
  }

  getDegresLabel(control: keyof typeof EnumLabels.degres): string {
    return this.enumLabels.degres[control];
  }

  getRecurrenceLabel(recurrence: keyof typeof EnumLabels.reccurency): string {
    return this.enumLabels.reccurency[recurrence];
  }

  getRiskLabel(risk: keyof typeof EnumLabels.risk): string {
    return this.enumLabels.risk[risk];
  }

  getBadgeClass(type: string, value: string) {
    switch (type) {
      case 'type':
        return 'badge-type';
      case 'risk':
        if (value.toLowerCase().includes('faible')) return 'badge-risque-faible';
        if (value.toLowerCase().includes('moyen')) return 'badge-risque-moyen';
        if (value.toLowerCase().includes('élevé') || value.toLowerCase().includes('eleve')) return 'badge-risque-eleve';
        return '';
      case 'control':
        if (value === '2.1') return 'badge-controle-faible';
        if (value === '2.2') return 'badge-controle-moyen';
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

  export(){
    alert('Fonctionnalité d\'exportation non implémentée');
  }

  refresh(){
    this.ngOnInit();
    this.resetFilters();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
  }

  getUsersAndControls() {
    this.userService.getUsers().subscribe(users => {
      this.listUsers = users;
      this.controlService.getAllTemplates().subscribe(resp => {
        this.controls = resp.map(control => {
          const creator = this.listUsers.find(u => u.id === control.creator);
          return {
            ...control,
            creatorName: creator ? creator.username : 'Utilisateur inconnu'
          };
        });
        this.dataSource.data = this.controls;
        console.log('Contrôles récupérés avec succès', this.controls);
      }, err => console.error('Erreur lors de la récupération des contrôles', err));
    }, err => console.error('Erreur lors de la récupération des utilisateurs', err));
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

  const dateStart = start ? new Date(start) : null;
  const dateEnd = end ? new Date(end) : null;

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
      (c.creatorName?.toLowerCase().includes(query) || '') ||
      this.getTypeLabel(c.controlType as keyof typeof this.enumLabels.type).toLowerCase().includes(query) ||
      this.getRiskLabel(c.riskLevel as keyof typeof this.enumLabels.risk).toLowerCase().includes(query) ||
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

  onSearchControls(event: Event) {
    this.applyFilters();
  }

  clearSearch() {
    this.searchQuery = '';
    this.applyFilters();
  }

}