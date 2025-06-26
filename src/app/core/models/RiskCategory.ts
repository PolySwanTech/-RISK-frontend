export interface RiskCategory {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  type: 'BALOISE' | 'INTERNE';
  niveau: number;
}