export enum Priority {
    MINIMAL = 'MINIMAL',
    MEDIUM = 'MEDIUM',
    MAXIMUM = 'MAXIMUM',
}

export const PriorityLabels: Record<Priority, string> = {
    [Priority.MINIMAL]: 'Basse',
    [Priority.MEDIUM]: 'Moyenne',
    [Priority.MAXIMUM]: 'Élevée',
}