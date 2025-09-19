export enum ReviewStatus{
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REEXAM_REQUESTED = 'REEXAM_REQUESTED',
    REJECTED = 'REJECTED'
}

export const ReviewStatusLabels: Record<ReviewStatus, string> = {
    [ReviewStatus.PENDING]: 'En attente',
    [ReviewStatus.APPROVED]: 'Approuvé',
    [ReviewStatus.REEXAM_REQUESTED]: 'Réexamen demandé',
    [ReviewStatus.REJECTED]: 'Rejeté'
};