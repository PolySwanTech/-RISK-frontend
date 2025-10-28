export enum ControlType {
    PREVENTIVE = 'PREVENTIVE',
    DETECTIVE = 'DETECTIVE', 
    CORRECTIVE = 'CORRECTIVE', 
    AUTOMATIC = 'AUTOMATIC', 
    MANUAL = 'MANUAL'
}


export const ControlTypeLabels: Record<ControlType, string> = {
    [ControlType.PREVENTIVE]: 'Préventif',
    [ControlType.DETECTIVE]: 'Détectif',
    [ControlType.CORRECTIVE]: 'Correctif',
    [ControlType.AUTOMATIC]: 'Automatique',
    [ControlType.MANUAL]: 'Manuel',
}
