export enum Type {
    PREVENTIVE = 'PREVENTIVE',
    DETECTIVE = 'DETECTIVE', 
    CORRECTIVE = 'CORRECTIVE', 
    AUTOMATIC = 'AUTOMATIC', 
    MANUAL = 'MANUAL'
}


export const ControlTypeLabels: Record<Type, string> = {
    [Type.PREVENTIVE]: 'Préventif',
    [Type.DETECTIVE]: 'Détectif',
    [Type.CORRECTIVE]: 'Correctif',
    [Type.AUTOMATIC]: 'Automatique',
    [Type.MANUAL]: 'Manuel',
}
