export enum Recurrence {
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY',
    QUARTERLY = 'QUARTERLY',
    SEMESTERLY = 'SEMESTERLY',
    YEARLY = 'YEARLY'
}

export const RecurrenceLabels: Record<Recurrence, string> = {
    [Recurrence.DAILY]: 'Quotidien',
    [Recurrence.WEEKLY]: 'Hebdomadaire',
    [Recurrence.MONTHLY]: 'Mensuel',
    [Recurrence.QUARTERLY]: 'Trimestriel',
    [Recurrence.SEMESTERLY]: 'Semestriel',
    [Recurrence.YEARLY]: 'Annuel'
};