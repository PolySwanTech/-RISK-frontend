import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { RiskService } from '../../../core/services/risk/risk.service';
import { Risk } from '../../../core/models/Risk';

@Component({
  selector: 'app-risks',
  imports: [CommonModule, MatTableModule],
  templateUrl: './risks.component.html',
  styleUrl: './risks.component.scss'
})
export class RisksComponent implements OnInit{
  
  private router = inject(Router);
  private riskService = inject(RiskService);
  
  displayedColumns: string[] = ['name', 'description', 'level'];
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
