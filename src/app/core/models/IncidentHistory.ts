export interface IncidentHistory {
  id: string;
  performed_by: string;
  action: string;
  timestamp: string;
  oldSnapshot?: string;
  newSnapshot?: string;
  comment?: string;
}