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
import { EvaluationFrequency } from '../../../core/enum/evaluation-frequency.enum';
import { MatOption } from "@angular/material/core";
import { MatSelectModule } from '@angular/material/select';

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
    MatOption,
    MatSelectModule
],
  templateUrl: './list-process.component.html',
  styleUrl: './list-process.component.scss'
})
export class ListProcessComponent implements OnInit {

  buId: string = ''

  private riskEvaluationService = inject(RiskEvaluationService);
  private route = inject(ActivatedRoute);

  allRisks: any[] = [];
  allPeriods: string[] = [];
  selectedPeriod: string = '';
  frequency: EvaluationFrequency | null = null;
  searchTerm: string = '';
  selectedYear: number = new Date().getFullYear();

  ngOnInit(): void {
    this.route.queryParams.subscribe(param => {
      this.buId = param["buId"];

      if (this.buId) {
        this.riskEvaluationService.getEvaluationsByBu(this.buId).subscribe(buEval => {
          console.log(buEval) 
          this.allRisks = buEval.evaluations;
          this.frequency = buEval.evaluationFrequency;
        });
        this.riskEvaluationService.getPeriodsByBu(this.buId).subscribe(periodsData => {
          this.allPeriods = periodsData;
          this.selectedPeriod = this.getCurrentPeriod();

          // Ajouter la période actuelle si absente
          const currentPeriod = this.getCurrentPeriod();
          if (!this.allPeriods.includes(currentPeriod)) {
            this.allPeriods.push(currentPeriod);
          }
          this.allPeriods.sort((a, b) => b.localeCompare(a)); // plus récente d'abord
          this.selectedPeriod = currentPeriod;
        });
      } else {
        this.allRisks = [];
      }
    });
  }

  getCurrentPeriod(): string {
    const year = new Date().getFullYear();
    if (this.frequency === EvaluationFrequency.SEMESTER) {
      const month = new Date().getMonth() + 1;
      const semester = month <= 6 ? 'S1' : 'S2';
      return `${semester} ${year}`;
    } else {
      return `${year}`;
    }
  }

  filteredRisks() {
    return this.allRisks
      .filter(item => 
        (!this.searchTerm || item.processName.toLowerCase().includes(this.searchTerm.toLowerCase()))
      )
      .filter(item => 
        !this.selectedPeriod || item.evaluationPeriod === this.selectedPeriod
      );
  }

}