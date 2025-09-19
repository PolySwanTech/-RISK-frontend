export enum ToDoType {
  ACTION_PLAN = 'ACTION_PLAN',
  CONTROL = 'CONTROL',
  INCIDENT = 'INCIDENT'
}

export const ToDoLabels:  Record<ToDoType, string> = {
  [ToDoType.ACTION_PLAN]: 'Plan d\'action',
  [ToDoType.CONTROL]: 'Contrôle',
  [ToDoType.INCIDENT]: 'Incident',
}
