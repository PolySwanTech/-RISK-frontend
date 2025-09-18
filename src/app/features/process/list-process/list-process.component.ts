import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { ProcessService } from '../../../core/services/process/process.service';

import { Process } from '../../../core/models/Process';
import { RiskService } from '../../../core/services/risk/risk.service';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-list-process',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatCardModule,
    MatBadgeModule
  ],
  templateUrl: './list-process.component.html',
  styleUrl: './list-process.component.scss'
})
export class ListProcessComponent implements OnInit {

  buId: string = ''

  private riskService = inject(RiskService);
  private route = inject(ActivatedRoute);

  allRisks: any[] = [];
  searchTerm: string = '';
  selectedYear: number = new Date().getFullYear();

  ngOnInit(): void {
    this.route.queryParams.subscribe(param => {
      this.buId = param["buId"];

      if (this.buId) {
        this.riskService.getEvaluationsByBu(this.buId).subscribe(buEval => {
          this.allRisks = buEval.evaluations;
        });
      } else {
        this.allRisks = []; // pas de BU sélectionnée
      }
    });
  }

  filteredRisks() {
    if (!this.searchTerm) return this.allRisks;
    return this.allRisks.filter(item =>
      item.processName.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}