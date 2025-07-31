import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog }  from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RiskLevel, RiskLevelLabels, RiskLevelScores } from '../../../core/enum/riskLevel.enum';
import { RiskSelectionDialogComponent } from '../risk-selection-dialog/risk-selection-dialog.component';
import { RiskTemplate } from '../../../core/models/RiskTemplate';

/** Couleur à afficher pour chaque RiskLevel */
const COLOR_MAP: Record<RiskLevel,string> = {
  [RiskLevel.LOW]       : '#F5F8FA',  // Très faible / Faible
  [RiskLevel.MEDIUM]    : '#FFA500',  // Moyen
  [RiskLevel.HIGH]      : '#FF4500',  // Élevé
  [RiskLevel.VERY_HIGH] : '#8B0000',  // Critique
};

/** Grille 5 × 5 : pour chaque (impact,probabilité) on détermine le RiskLevel */
const MATRIX_LEVELS: RiskLevel[][] = [
  /* IMPACT 5 ― Catastrophique */ [
    RiskLevel.MEDIUM,    // Prob 1  (Très rare)
    RiskLevel.HIGH,
    RiskLevel.VERY_HIGH,
    RiskLevel.VERY_HIGH,
    RiskLevel.VERY_HIGH  // Prob 5  (Très fréquent)
  ],
  /* IMPACT 4 ― Majeur */ [
    RiskLevel.MEDIUM,
    RiskLevel.HIGH,
    RiskLevel.HIGH,
    RiskLevel.VERY_HIGH,
    RiskLevel.VERY_HIGH
  ],
  /* IMPACT 3 ― Modéré */ [
    RiskLevel.MEDIUM,
    RiskLevel.MEDIUM,
    RiskLevel.HIGH,
    RiskLevel.HIGH,
    RiskLevel.VERY_HIGH
  ],
  /* IMPACT 2 ― Mineur */ [
    RiskLevel.LOW,
    RiskLevel.MEDIUM,
    RiskLevel.MEDIUM,
    RiskLevel.HIGH,
    RiskLevel.HIGH
  ],
  /* IMPACT 1 ― Insignifiant */ [
    RiskLevel.LOW,
    RiskLevel.LOW,
    RiskLevel.MEDIUM,
    RiskLevel.MEDIUM,
    RiskLevel.HIGH
  ]
];

/* -------------------------------------------------------------- */
@Component({
  selector   : 'app-matrix',
  standalone : true,
  imports    : [CommonModule, FormsModule, MatTooltipModule],
  templateUrl: './matrix.component.html',
  styleUrls  : ['./matrix.component.scss']
})
export class MatrixComponent {

  /* ========== Entrées / sorties ========== */
  /** mode édition (true → on peut cliquer pour recolorer la matrice) */
  @Input() modifPlan = false;

  /** tableau de risques réels (impact 1-5, frequency 1-5, id, name…) */
  @Input() set risks(value: any[]) {
    this._risks = this.arrayToMatrixMap(value);
  }
  @Output() selectedRiskEvent = new EventEmitter<any>();

  /* ========== données “vivantes” ========== */
  rowLabels: string[] = [
    'Catastrophique', 'Majeur', 'Modéré',
    'Mineur', 'Insignifiant'
  ];
  colLabels: string[] = [
    'Très rare', 'Rare', 'Occasionnel',
    'Fréquent',  'Très fréquent'
  ];

  /** Couleur cliquée dans la légende (mode édition) */
  selectedColor = '';

  /** légende construite dynamiquement à partir de COLOR_MAP */
  readonly colorLevels = Object.entries(COLOR_MAP).map(
    ([lvl, color]) => ({
      level : lvl as RiskLevel,
      label : RiskLevelLabels[lvl as RiskLevel],
      color
    })
  );

  /* ========== matrices prêtes à l’emploi dans le template ========== */
  readonly matrixLevels = MATRIX_LEVELS;               // enum
  readonly matrixColors = MATRIX_LEVELS.map(row =>     // hexa
    row.map(lvl => COLOR_MAP[lvl])
  );

  get reversedMatrixLevels() {         // pour affichage (impact 5 ↘︎ 1)
    return [...this.matrixLevels];
  }
  get reversedMatrixColors() {
    return [...this.matrixColors];
  }

  /* ================================================================ */
  constructor(private dialog: MatDialog) {}

  /** renvoie les styles d’une cellule */
  cellStyle(lvl: RiskLevel){
    return {
      backgroundColor : COLOR_MAP[lvl],
      border          : '1px solid #ccc',
      width           : '60px',
      height          : '60px',
      cursor          : this.modifPlan ? 'pointer' : 'default',
      position        : 'relative'
    };
  }

  /** clic sur une cellule (édition de la couleur) */
  setColor(row:number,col:number){
    if (!this.modifPlan || !this.selectedColor) { return; }
    const lvl = this.colorToLevel(this.selectedColor);
    this.matrixLevels[row][col]  = lvl;
    this.matrixColors[row][col]  = this.selectedColor;
  }

  /** petite aide pour convertir couleur → enum */
  private colorToLevel(color:string):RiskLevel{
    return (Object.entries(COLOR_MAP)
           .find(([_,c])=>c===color)?.[0] as RiskLevel) ?? RiskLevel.MEDIUM;
  }

  /* ========== Gestion des risques contenus dans les cellules ========== */
  /** stockage :  "row,col"  →  risk | risk[] */
  private _risks: Record<string, any|any[]> = {};

  private arrayToMatrixMap(arr:RiskTemplate[]){
    console.log(arr)
    const map: Record<string, any|any[]> = {};

    arr.forEach(risk => {
      // S’il n’a pas .impact /.frequency on regarde la dernière évaluation
      let impact    = 0;
      let frequency = risk.rpc.at(-1)?.probability;

      if (!impact || !frequency) {
        const last = risk.rpc?.at(-1);
        if (last) {
          frequency = Math.ceil(last.probability / 2);             // 1-5
          impact    = RiskLevelScores[last.netLevel as RiskLevel];  // 1-5
        }
      }

      if (impact && frequency) {
        const key = `${impact-1},${frequency-1}`;
        map[key] = map[key]
          ? ([] as any[]).concat(map[key]).concat(risk)
          : risk;
      }
    });

    return map;
  }

  /** retourne { id , name } ou  { id:"+3" , name:"Cliquez…" } */
  cellRiskInfo(row:number,col:number){
    const key = `${row},${col}`;
    const data = this._risks[key];
    if (!data) { return { id:'', name:'' }; }

    if (Array.isArray(data)){
      return { id:'+'+data.length, name:'Cliquez pour voir les risques' };
    }
    return { id:data.reference , name:data.name };
  }

  /** clic sur le “badge” d’une cellule */
  onRiskClick(row:number,col:number){
    const key = `${row},${col}`;
    const data = this._risks[key];
    if (!data) { return; }

    if (Array.isArray(data)){
      /* ouvre la boîte de dialogue pour choisir un risque */
      const ref = this.dialog.open(RiskSelectionDialogComponent,{
        width:'400px',
        data : { risks: data }
      });
      ref.afterClosed().subscribe(risk=>{
        if (risk){ this.selectedRiskEvent.emit(risk); }
      });
    } else {
      this.selectedRiskEvent.emit(data);
    }
  }

  /* ========== utilitaires de gabarit ========== */
/** TrackBy qui se contente de retourner l’index */
  trackByIdx = (index: number, _item: any): number => index;
  displayRowIdx = (i:number)=> this.matrixLevels.length-1-i;
}
