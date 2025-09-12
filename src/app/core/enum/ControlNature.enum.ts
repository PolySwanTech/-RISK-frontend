export enum ControlNature {
  DOCUMENTAIRE = 'DOCUMENTAIRE',
  PHYSIQUE = 'PHYSIQUE',
  AUTOMATISE = 'AUTOMATISE'
}

export const ControlNatureLabels:  Record<ControlNature, string> = {
  [ControlNature.AUTOMATISE]: 'Automatisé',
  [ControlNature.DOCUMENTAIRE]: 'Documentaire',
  [ControlNature.PHYSIQUE]: 'Physique',
}
