export enum Status {
    ACHIEVED = 'ACHIEVED',
    IN_PROGRESS = 'IN_PROGRESS',
    NOT_ACHIEVED = 'NOT_ACHIEVED',
    NOT_STARTED = 'NOT_STARTED',
    CANCELLED = 'CANCELLED',
}

type StatusLabelsType = Record<Status, string>;

export const statusLabels: StatusLabelsType = {
    [Status.ACHIEVED]: 'Clôturé',
    [Status.IN_PROGRESS]: 'En cours',
    [Status.NOT_ACHIEVED]: 'Non Clôturé',
    [Status.NOT_STARTED]: 'Non Démarré',
    [Status.CANCELLED]: 'Annulé',
}