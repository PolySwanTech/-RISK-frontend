import { Type } from "./controltype.enum";
import { Degree } from "./degree.enum";
import { Priority, priorityLabels } from "./Priority";
import { Recurence } from "./recurence.enum";
import { RiskLevel, RiskLevelLabels } from "./riskLevel.enum";


export const EnumLabels = {
  type: {
    [Type.PREVENTIVE]: 'Préventif',
    [Type.DETECTIVE]: 'Détectif',
    [Type.CORRECTIVE]: 'Correctif',
    [Type.AUTOMATIC]: 'Automatique',
    [Type.MANUAL]: 'Manuel',
  },
  risk: {
    [RiskLevel.LOW]: 'Faible',
    [RiskLevel.MEDIUM]: 'Moyen',
    [RiskLevel.HIGH]: 'Élevé',
    [RiskLevel.VERY_HIGH]: 'Critique',
  },
  control: {
    [RiskLevelLabels.LOW]: 'Faible',
    [RiskLevelLabels.MEDIUM]: 'Moyen',
    [RiskLevelLabels.HIGH]: 'Fort',
    [RiskLevelLabels.VERY_HIGH]: 'Critique',
  },
  degres: {
    [Degree.LEVEL_1]: '1',
    [Degree.LEVEL_2]: '2',
    [Degree.LEVEL_3]: '3',
  },
  priority: {
    [Priority.MINIMAL]: 'Basse',
    [Priority.MEDIUM]: 'Moyenne',
    [Priority.MAXIMUM]: 'Élevée',
  },
  reccurency: {
    [Recurence.DAILY]: 'Quotidien',
    [Recurence.WEEKLY]: 'Hebdomadaire',
    [Recurence.MONTHLY]: 'Mensuel',
    [Recurence.QUARTERLY]: 'Trimestriel',
    [Recurence.SEMESTERLY]: 'Semestriel',
    [Recurence.YEARLY]: 'Annuel',
  }
};