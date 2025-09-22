export enum ExecutionMode {
    CHECK_LIST = 'CHECK_LIST', 
    TEST = 'TEST', 
    REVUE = 'REVUE', 
    ECHANTILLONAGE = 'ECHANTILLONAGE'
}

export const ExecutionModeLabels: Record<ExecutionMode, string> =  {
    [ExecutionMode.CHECK_LIST]: 'Check-list',
    [ExecutionMode.TEST]: 'Test',
    [ExecutionMode.REVUE]: 'Revue',
    [ExecutionMode.ECHANTILLONAGE]: 'Échantillonnage',
  }