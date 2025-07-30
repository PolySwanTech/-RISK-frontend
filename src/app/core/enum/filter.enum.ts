export type FilterType = 'text' | 'select' | 'number' | 'date';

export interface Filter {
  key: string;
  label: string;
  type: FilterType;
  options?: string[] | FilterOption[];
  icon?: string;
}

export interface FilterOption {
  value: string;
  label: string;
}