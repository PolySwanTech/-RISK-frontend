export enum ControlDegree {
    LEVEL_1 = 'LEVEL_1',
    LEVEL_2 = 'LEVEL_2',
}

export const DegreeLabels: Record<ControlDegree, string> = {
  [ControlDegree.LEVEL_1]: 'Niveau 1',
  [ControlDegree.LEVEL_2]: 'Niveau 2',
}