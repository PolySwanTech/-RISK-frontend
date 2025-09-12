export enum OperatingLossState {
        REJECTED = "REJECTED",
        WAITING = "WAITING",
        VALIDATED = "VALIDATED"
}

export const OperatingLossStateLabels: Record<OperatingLossState, string> = {
    [OperatingLossState.WAITING]: 'En attente',
    [OperatingLossState.VALIDATED]: 'Validé',
    [OperatingLossState.REJECTED]: 'Refusé', 
}