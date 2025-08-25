import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCard, MatCardModule } from '@angular/material/card';

interface ResultRow {
  activite: string;
  macro: string;
  process: string;
  risque: string;
  code: string;
  frequence: number;
  impact: number;
  niveauBrut: { label: string; value: number; color: string };
  niveauNet: string;
}

@Component({
  selector: 'app-result-cartographie',
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './result-cartographie.component.html',
  styleUrl: './result-cartographie.component.scss'
})
export class ResultCartographieComponent {
results: ResultRow[] = [
    {
      activite: 'Activités Bancaires',
      macro: 'Gestion des Dépôts',
      process: 'Versements',
      risque: 'Risque Opérationnel',
      code: 'RO-002',
      frequence: 3,
      impact: 3,
      niveauBrut: { label: 'Moyen', value: 9, color: 'yellow' },
      niveauNet: 'Non évalué'
    },
    {
      activite: 'Trading',
      macro: 'Opérations de Marché',
      process: "Exécution d'ordres",
      risque: 'Risque Opérationnel',
      code: 'RO-002',
      frequence: 5,
      impact: 5,
      niveauBrut: { label: 'Critique', value: 25, color: 'red' },
      niveauNet: 'Non évalué'
    }
  ];

  export() {
    console.log('Exporter...');
    // TODO: logique export CSV/XLS
  }

  print() {
    window.print();
  }
}
