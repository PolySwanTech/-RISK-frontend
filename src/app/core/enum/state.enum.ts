export enum State {
    DRAFT = 'DRAFT',
    VALIDATE = 'VALIDATE', 
    SUBMIT = 'SUBMIT', 
    PROCESS = 'PROCESS', 
    CLOSED = 'CLOSED',
    REJECTED = 'REJECTED',
}

export const StateLabels: Record<State, string> = {
    [State.CLOSED]: 'Clôturé',
    [State.DRAFT]: 'Brouillon',
    [State.PROCESS]: 'En cours',
    [State.REJECTED]: 'Refusé',
    [State.SUBMIT]: 'Soumis',
    [State.VALIDATE]: 'Validé',
  }
