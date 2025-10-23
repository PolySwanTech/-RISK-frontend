import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subscription } from 'rxjs';
import { RiskService } from '../../../core/services/risk/risk.service';
import { RiskTemplate } from '../../../core/models/RiskTemplate';
import { RiskLevelEnum, RiskLevelLabels, RiskLevelColor, RiskLevelScores } from '../../../core/enum/riskLevel.enum';

@Component({
  selector: 'app-top-critical-risks',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressSpinnerModule],
  templateUrl: './top-critical-risks.component.html',
  styleUrls: ['./top-critical-risks.component.scss']
})
export class TopCriticalRisksComponent implements OnInit, OnDestroy {
  topRisks: { name: string; level: RiskLevelEnum | null; label: string; color: string; score: number }[] = [];
  isLoading = true;
  private sub!: Subscription;

  constructor(private riskService: RiskService) {}

  ngOnInit() {
    this.sub = this.riskService.getAll().subscribe({
      next: (risks: RiskTemplate[]) => {
        if (!risks?.length) {
          this.isLoading = false;
          return;
        }

        // On prend la dernière évaluation brute (par défaut)
        const evaluatedRisks = risks
          .map(r => {
            const latestEval = r.riskBrut?.[r.riskBrut.length - 1]?.evaluation;
            return {
              name: r.libelle,
              level: latestEval?.name ?? null,
              label: latestEval ? RiskLevelLabels[latestEval.name] : 'Non évalué',
              color: latestEval ? RiskLevelColor[latestEval.name] : '#d1d5db',
              score: latestEval ? RiskLevelScores[latestEval.name] : 0
            };
          })
          .filter(r => r.level !== null);

        // Tri décroissant par score
        this.topRisks = evaluatedRisks
          .sort((a, b) => b.score - a.score)
          .slice(0, 5); // top 5

        this.isLoading = false;
      },
      error: () => (this.isLoading = false)
    });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }
}
