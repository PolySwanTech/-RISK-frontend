export enum Degree {
    LEVEL_1 = 'LEVEL_1',
    LEVEL_2 = 'LEVEL_2',
    LEVEL_3 = 'LEVEL_3',
}

export const degreeLabels: Record<Degree, string> = {
  [Degree.LEVEL_1]: 'Level 1',
  [Degree.LEVEL_2]: 'Level 2',
  [Degree.LEVEL_3]: 'Level 3',
};