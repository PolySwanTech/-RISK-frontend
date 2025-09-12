export enum Evaluation {
    VERY_LOW = 'VERY_LOW',
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    VERY_HIGH = 'VERY_HIGH' 
}

export const EvaluationLabels: Record<Evaluation, string> = {
    [Evaluation.VERY_LOW]: 'Très faible',
    [Evaluation.LOW]: 'Faible',
    [Evaluation.MEDIUM]: 'Moyen',
    [Evaluation.HIGH]: 'Élevé',
    [Evaluation.VERY_HIGH]:'Critique',
};