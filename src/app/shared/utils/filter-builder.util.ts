 // adapte selon ton chemin

import { Filter, FilterType } from "../../core/enum/filter.enum";

interface ColumnDefinition {
  columnDef: string;
  header: string;
  filterType: string;
  icon?: string;
  options?: any[];
}

/**
 * Construit un filtre à partir d'une colonne.
 */
export function buildFilterFromColumn(col: ColumnDefinition): Filter {
  const base = {
    key: col.columnDef,
    label: col.header,
    type: col.filterType as FilterType,
    icon: col.icon ? col.icon : '',
  };

  if (col.filterType === 'select') {
    return { ...base, options: col.options };
  }

  return base;
}