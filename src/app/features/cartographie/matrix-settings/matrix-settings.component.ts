import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { MatrixService } from '../../../core/services/matrix/matrix.service';
import { RiskLevel, RiskLevelLabels } from '../../../core/enum/riskLevel.enum';

export interface Range {
  libelle: string;
  min: number;
  max?: number;
}

export type RangeType = 'SEVERITY' | 'FREQUENCY';

@Component({
  selector: 'app-matrix-settings',
  imports: [CommonModule, FormsModule, MatSliderModule],
  templateUrl: './matrix-settings.component.html',
  styleUrls: ['./matrix-settings.component.scss']
})
export class MatrixSettingsComponent {

  @Input() list!: Range[];
  @Input() type!: RangeType;


  riskLevels = RiskLevelLabels;

  private settingSrv = inject(MatrixService);

  updateMin(idx: number, event: any) {
    const newMin = +event.target.value;

    if (idx <= 0) return; // premier min = 0, pas modifiable

    const prev = this.list[idx - 1];
    const next = this.list[idx + 1];

    if (newMin <= prev.min) return; // ne peut pas être < précédent
    if (next && next.max !== undefined && newMin >= next.max) return;

    prev.max = newMin;
    this.list[idx].min = newMin;
  }

  saveSettings() {
    // Logique de sauvegarde des paramètres
    this.settingSrv.saveScale(this.list, this.type).subscribe(
      {

        next: response => {
        },
        error: error => {
        }
      }
    );
  }
}
