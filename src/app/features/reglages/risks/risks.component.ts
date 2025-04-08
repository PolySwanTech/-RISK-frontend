import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { RiskService } from '../../../core/services/risk/risk.service';
import { Risk } from '../../../core/models/Risk';
import { MatPaginatorModule } from '@angular/material/paginator';
import { GoBackComponent } from "../../../shared/components/go-back/go-back.component";
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-risks',
  imports: [CommonModule, MatTableModule, MatPaginatorModule, GoBackComponent, MatIconModule, MatButtonModule],
  templateUrl: './risks.component.html',
  styleUrl: './risks.component.scss'
})
export class RisksComponent implements OnInit{
  
  private router = inject(Router);
  private riskService = inject(RiskService);
  
 

  columns = [
    {
      columnDef: 'name',
      header: 'Nom',
      cell: (element: Risk) => `${element.titre}`,
    },
    {
      columnDef: 'description',
      header: 'Description',
      cell: (element: Risk) => `${element.description}`,
    },
    {
      columnDef: 'level',
      header: 'Niveau',
      cell: (element: Risk) => `
  <span class="badge ${element.level.toLowerCase()}">
    ${element.level.toString() || 'Inconnu'}
  </span>
`
    }
  ];

  displayedColumns = [...this.columns.map(c => c.columnDef), 'actions'];

  dataSource : Risk[] = []
  
  ngOnInit(): void {
    this.riskService.getAll().subscribe(
      rep => {
        this.dataSource = rep
      }
    );
  }

  navToRisk(id : number){
    this.router.navigate(['reglages', 'risks', id])
  }
  
  navToCreate(){
    this.router.navigate(['reglages', 'risks', 'create'])
  }
}
