export enum EvaluationControl {
    CONFORME = 'CONFORME',
    NON_CONFORME = 'NON_CONFORME',
    PARTIELLEMENT_CONFORME = 'PARTIELLEMENT_CONFORME'
}

export const EvaluationControlLabels: Record<EvaluationControl, string> = {
  [EvaluationControl.CONFORME]: 'Conforme',
  [EvaluationControl.PARTIELLEMENT_CONFORME]: 'Partiellement conforme',
  [EvaluationControl.NON_CONFORME]: 'Non conforme'
};