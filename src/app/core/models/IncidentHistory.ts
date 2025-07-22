export interface IncidentHistory {
  id: string;
  performed_by: string;
  action: string;
  timestamp: string;
  comment?: string;
}