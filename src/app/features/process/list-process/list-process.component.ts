import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { ActivatedRoute } from '@angular/router';
import { RiskEvaluationService } from '../../../core/services/risk-evaluation/risk-evaluation.service';
import { EnumLabelPipe } from '../../../shared/pipes/enum-label.pipe';

interface GroupedRisk {
  processName: string;
  riskName: string;
  category: string;
  exercicePeriod: { start: string; end: string };
  brutEvaluation: { color: string; name: string } | null;
  netEvaluation: { color: string; name: string } | null;
}

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
    MatBadgeModule,
    EnumLabelPipe
  ],
  templateUrl: './list-process.component.html',
  styleUrl: './list-process.component.scss'
})
export class ListProcessComponent implements OnInit {

  buId: string = ''

  private riskEvaluationService = inject(RiskEvaluationService);
  private route = inject(ActivatedRoute);

  allRisks: any[] = [];
  groupedRisks: GroupedRisk[] = [];
  searchTerm: string = '';
  selectedYear: number = new Date().getFullYear();

  ngOnInit(): void {
    this.route.queryParams.subscribe(param => {
      this.buId = param["buId"];

      if (this.buId) {
        this.riskEvaluationService.getEvaluationsByBu(this.buId).subscribe(buEval => {
          console.log(buEval) 
          this.allRisks = buEval.evaluations;
          this.groupRisks();
        });
      } else {
        this.allRisks = [];
        this.groupedRisks = [];
      }
    });
  }

  groupRisks(): void {
    const grouped = new Map<string, GroupedRisk>();

    this.allRisks.forEach(item => {
      const key = `${item.processName}-${item.riskName}-${item.exercicePeriod.start}-${item.exercicePeriod.end}`;
      
      if (!grouped.has(key)) {
        grouped.set(key, {
          processName: item.processName,
          riskName: item.riskName,
          category: item.category,
          exercicePeriod: item.exercicePeriod,
          brutEvaluation: null,
          netEvaluation: null
        });
      }

      const risk = grouped.get(key)!;
      if (item.brut) {
        risk.brutEvaluation = item.evaluation;
      } else {
        risk.netEvaluation = item.evaluation;
      }
    });

    this.groupedRisks = Array.from(grouped.values());
  }

  filteredRisks(): GroupedRisk[] {
    if (!this.searchTerm) return this.groupedRisks;
    return this.groupedRisks.filter(item =>
      item.processName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      item.riskName.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}