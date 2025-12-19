export enum ToDoType {
  ACTION_PLAN = 'ACTION_PLAN',
  CONTROL = 'CONTROL',
  INCIDENT = 'INCIDENT',
  RISK = 'RISK',
}

export const ToDoLabels:  Record<ToDoType, string> = {
  [ToDoType.ACTION_PLAN]: 'Plan d\'action',
  [ToDoType.CONTROL]: 'Contrôle',
  [ToDoType.INCIDENT]: 'Incident',
  [ToDoType.RISK]: 'Risque',
}
