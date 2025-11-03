export enum EvaluationFrequency {
    SEMESTER = 'SEMESTER',
    YEARLY = 'YEARLY'
}

export const EvaluationFrequencyLabels: Record<EvaluationFrequency, string> = {
    [EvaluationFrequency.SEMESTER]: 'Semestriel',
    [EvaluationFrequency.YEARLY]: 'Annuel'
};