import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { ControlService } from '../../../core/services/control/control.service';
import { ControlTemplate } from '../../../core/models/ControlTemplate';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
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
import { Dialog } from '@angular/cdk/dialog';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-control-list',
  imports: [MatButtonModule, MatTableModule, MatSortModule, MatDatepickerModule,
    MatSelectModule, CommonModule, MatCardModule, MatPaginatorModule, MatFormFieldModule,
    MatInputModule, ReactiveFormsModule, MatNativeDateModule, MatIconModule, MatTooltipModule],
  templateUrl: './control-list.component.html',
  styleUrl: './control-list.component.scss'
})
export class ControlListComponent implements OnInit, AfterViewInit {
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  columns = [
    {
      columnDef: 'Référence',
      header: 'Référence',
      cell: (element: ControlTemplate) => `${element.reference}`,
    },
    {
      columnDef: 'Business Unit',
      header: 'Business Unit',
      cell: (element: ControlTemplate) => `${element.buName}`,
    },

    {
      columnDef: 'Fréquence',
      header: 'Fréquence',
      cell: (element: ControlTemplate) => `${element.frequency}`,
    },
    {
      columnDef: 'type',
      header: 'Type de contrôle',
      cell: (element: ControlTemplate) => `${element.controlType}`,
    },
    {
      columnDef: 'level',
      header: 'Niveau du contrôle',
      cell: (element: ControlTemplate) => `${element.level}`,
    }
  ];

  displayedColumns = [...this.columns.map(c => c.columnDef)];

  dataSource = new MatTableDataSource<ControlTemplate>([]);

  controls: ControlTemplate[] = [];
  controlService = inject(ControlService);
  router = inject(Router);
  dialog = inject(MatDialog);

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
  }

  ngOnInit(): void {
    this.getAll();
  }

  getAll() {
    this.controlService.getAllTemplates().subscribe(resp => {
      this.controls = resp;
      this.dataSource.data = resp;
    });
  }

  // This method will be triggered when a row is clicked
  onRowClick(control: ControlTemplate) {
    this.router.navigate(['control', 'details', control.id.id]);
  }
  
  create() {
    const dialogRef = this.dialog.open(CreateControlComponent, {
      width: '700px !important',
      height: '600px',
      minWidth: '600px',
      maxWidth: '600px',
    }).afterClosed().subscribe(_ => this.ngOnInit());
  }


}
