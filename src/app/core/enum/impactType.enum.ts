export enum ImpactTypeEnum {
    PROVISION = 'PROVISION',
    RECUPERATION = 'RECUPERATION',
}
    
export const ImpactTypeLabels: Record<ImpactTypeEnum, string> = {
    [ImpactTypeEnum.PROVISION]: 'Provision',
    [ImpactTypeEnum.RECUPERATION]: 'Récupération',
}