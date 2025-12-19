import { EvaluationFrequency } from "../enum/evaluation-frequency.enum";
import { EvaluationState } from "../enum/evaluation-state.enum";
import { OperatingLossState } from "../enum/operatingLossState.enum";
import { AttenuationMetrics } from "./AttenuationMetrics";
import { ControlTemplate } from "./ControlTemplate";
import { RiskEvaluation } from "./RiskEvaluation";
import { RiskReferentiel } from "./RiskReferentiel";



export interface Dmr {
  controls: ControlTemplate[];
  attenuationMetrics: AttenuationMetrics[];
}

// -------------  MODÈLE PRINCIPAL -------------
export class RiskTemplate {
  id!: string;
  libelle!: string;
  reference!: string;
  buName: string = '';
  buId: string = '';
  creatorName!: string;
  creatorId!: string;
  processId?: string;
  processName: string = '';
  active: boolean = true;
  declaredAt!: Date;
  description?: string | null;
  riskReferentiel!: RiskReferentiel;
  attachmentState: OperatingLossState = OperatingLossState.WAITING;
  riskNet?: RiskEvaluation[];
  riskBrut?: RiskEvaluation[];
  dmr?: Dmr;
  evaluationState?: EvaluationState;

  
  /** constructeur pratique pour Object.assign(new RiskTemplate(), dto) */
  constructor(init?: Partial<RiskTemplate>) {
    Object.assign(this, init);
  }

  computeEvaluationState(currentPeriod: string, frequency: EvaluationFrequency): EvaluationState {
    if (!this.isValidPeriod(currentPeriod, frequency)) {
      throw new Error(`Période d'évaluation invalide pour la fréquence ${frequency}: ${currentPeriod}`);
    }

    const brutDone = this.riskBrut?.some(e => e.evaluationPeriod === currentPeriod) ?? false;
    const netDone = this.riskNet?.some(e => e.evaluationPeriod === currentPeriod) ?? false;

    if (!brutDone && !netDone) return EvaluationState.BRUT;
    if (brutDone && !netDone) return EvaluationState.NET;
    return EvaluationState.COMPLETED;
  }

  private isValidPeriod(period: string, frequency: EvaluationFrequency): boolean {
    if (!period) return false;

    switch (frequency) {
      case EvaluationFrequency.SEMESTER:
        return /^S[1-2] \d{4}$/.test(period);
      case EvaluationFrequency.YEARLY:
        return /^\d{4}$/.test(period);
      default:
        return false;
    }
  }
}

// -------------  DTO -------------
export type RiskTemplateCreateDto = Required<Pick<RiskTemplate, 'libelle' | 'processId'>> 
& Partial<Pick<RiskTemplate, 'description'>> & {
  riskReferentielId: string;
};

export type RiskSimpleDto = Required<Pick<RiskTemplate, 'id' | 'libelle' | 'attachmentState'>> & {
  riskReferentiel: RiskReferentiel;
};

