import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { RiskService } from '../../../core/services/risk/risk.service';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { GoBackComponent } from "../../../shared/components/go-back/go-back.component";
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSort } from '@angular/material/sort';
import { RiskTemplate } from '../../../core/models/RiskTemplate';
import { ProcessService } from '../../../core/services/process/process.service';

@Component({
  selector: 'app-risks',
  imports: [CommonModule, MatTableModule, MatPaginatorModule, GoBackComponent, MatIconModule, MatButtonModule],
  templateUrl: './risks.component.html',
  styleUrl: './risks.component.scss'
})
export class RisksComponent implements OnInit {

  private router = inject(Router);
  private riskService = inject(RiskService);
  private processService = inject(ProcessService);
  private processNameMap: Record<string, string> = {};

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  columns = [
    {
      columnDef: 'refence',
      header: 'Référence',
      cell: (element: RiskTemplate) => `${element.reference}`,
    },
    {
      columnDef: 'name',
      header: 'Libellé',
      cell: (element: RiskTemplate) => `${element.libelle}`,
    },
    {
      columnDef: 'description',
      header: 'Description',
      cell: (element: RiskTemplate) => `${element.description}`,
    },
    // {
    //   columnDef: 'balois1',
    //   header: 'balois1',
    //   cell: (element: RiskTemplate) => `${element.category?.category?.name || 'Inconnu'}`,
    // },
    {
      columnDef: 'balois2',
      header: 'balois2',
      cell: (element: RiskTemplate) => `${element.category?.name || 'Inconnu'}`,
    },
    {
      columnDef: 'process',
      header   : 'Processus',
      cell     : (row: RiskTemplate) =>
        this.processNameMap[row.processId] ?? 'Inconnu'
    },
    {
      columnDef: 'impactTypes',
      header: 'Types d\'impact',
      cell: (element: RiskTemplate) => `${element.impactTypes.map(type => type).join(', ') || 'Inconnu'}`,
    },
    {
      columnDef: 'level',
      header: 'Niveau',
      cell: (element: RiskTemplate) => `
  <span class="badge ${element.riskBrut}">
    ${element.riskBrut || 'Inconnu'}
  </span>
`
    }
  ];

  displayedColumns = [...this.columns.map(c => c.columnDef), 'actions'];

  dataSource = new MatTableDataSource<RiskTemplate>([]);

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnInit(): void {
    this.processService.getAll().subscribe(procList => {
      this.processNameMap = procList.reduce<Record<string,string>>(
        (acc, p) => ({ ...acc, [p.id]: p.name }),
        {}
      );

      this.riskService.getAll().subscribe(risks => {
        this.dataSource.data = risks;
      });
    });
  }

  navToRisk(risk: RiskTemplate) {
    this.router.navigate(['reglages', 'risks', risk.id.id]);
  }

  navToCreate() {
    alert("ici")
    this.router.navigate(['reglages', 'risks', 'create']);
  }
}
