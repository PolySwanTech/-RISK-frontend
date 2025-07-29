export enum Recurence {
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY',
    QUARTERLY = 'QUARTERLY',
    SEMESTERLY = 'SEMESTERLY',
    YEARLY = 'YEARLY'
}

export const RecurenceLabels: Record<Recurence, string> = {
    [Recurence.DAILY]: 'Quotidien',
    [Recurence.WEEKLY]: 'Hebdomadaire',
    [Recurence.MONTHLY]: 'Mensuel',
    [Recurence.QUARTERLY]: 'Trimestriel',
    [Recurence.SEMESTERLY]: 'Semestriel',
    [Recurence.YEARLY]: 'Annuel'
};