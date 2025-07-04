export enum Priority {
    MINIMAL = 'MINIMAL',
    MEDIUM = 'MEDIUM',
    MAXIMUM = 'MAXIMUM',
}

type PriorityLabelsType = Record<Priority, string>;

export const priorityLabels: PriorityLabelsType = {
    [Priority.MINIMAL]: 'Minimale',
    [Priority.MEDIUM]: 'Moyenne',
    [Priority.MAXIMUM]: 'Maximale',
}