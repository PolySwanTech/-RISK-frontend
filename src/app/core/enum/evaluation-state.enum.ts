export enum EvaluationState {
    BRUT = 'BRUT',
    NET = 'NET',
    COMPLETED = 'COMPLETED'
}

export const EvaluationStateLabels: Record<EvaluationState, string> = {
    [EvaluationState.BRUT]: 'Brut',
    [EvaluationState.NET]: 'Net',
    [EvaluationState.COMPLETED]: 'Complété'
};