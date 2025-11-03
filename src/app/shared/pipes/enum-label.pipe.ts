import { Pipe, PipeTransform } from "@angular/core";
import { ReviewStatusLabels } from "../../core/enum/reviewStatus.enum";
import { StatusLabels } from "../../core/enum/status.enum";
import { RiskLevelLabels } from "../../core/enum/riskLevel.enum";
import { StateLabels } from "../../core/enum/state.enum";
import { ControlNatureLabels } from "../../core/enum/ControlNature.enum";
import { ControlTypeLabels } from "../../core/enum/controltype.enum";
import { DegreeLabels } from "../../core/enum/degree.enum";
import { EvaluationLabels } from "../../core/enum/evaluation.enum";
import { EvaluationControlLabels } from "../../core/enum/evaluation-controle.enum";
import { ExecutionModeLabels } from "../../core/enum/exceutionmode.enum";
import { OperatingLossFamilyLabels } from "../../core/enum/operatingLossFamily.enum";
import { OperatingLossStateLabels } from "../../core/enum/operatingLossState.enum";
import { PermissionLabels } from "../../core/enum/permission.enum";
import { PriorityLabels } from "../../core/enum/Priority";
import { RecurrenceLabels } from "../../core/enum/recurrence.enum";
import { RiskImpactTypeLabels } from "../../core/enum/riskImpactType.enum";
import { TargetTypeLabel } from "../../core/enum/targettype.enum";
import { ToDoLabels } from "../../core/enum/to-do.enum";

const LABELS_REGISTRY = {
  riskLevel: RiskLevelLabels,
  status: StatusLabels,
  reviewStatus: ReviewStatusLabels,
  state: StateLabels,
  controlNature: ControlNatureLabels,
  controlType: ControlTypeLabels,
  degree: DegreeLabels,
  evaluation: EvaluationLabels, // pas utilisé ?
  evaluationControl: EvaluationControlLabels,
  executionMode: ExecutionModeLabels,
  operatingLossFamily: OperatingLossFamilyLabels,
  operatingLossState: OperatingLossStateLabels,
  permission: PermissionLabels,
  priority: PriorityLabels,
  recurrence: RecurrenceLabels,
  riskImpactType: RiskImpactTypeLabels,
  targetType: TargetTypeLabel,
  toDo: ToDoLabels,
} as const;

// ✅ On dérive automatiquement les clés possibles
type EnumKey = keyof typeof LABELS_REGISTRY;
type LabelsMap = Record<string, string>;

@Pipe({
  name: 'enumLabel',
  standalone: true
})
export class EnumLabelPipe implements PipeTransform {

  transform(
    value: string | number | null | undefined,
    labelsOrKey: EnumKey | LabelsMap, // ✅ VS CODE va *proposer* les clés ici
    fallback?: string
  ): string {
    if (value === null || value === undefined) return fallback ?? '';

    let labels: LabelsMap | undefined;
    if (typeof labelsOrKey === 'string') {
      labels = LABELS_REGISTRY[labelsOrKey];
    } else if (labelsOrKey && typeof labelsOrKey === 'object') {
      labels = labelsOrKey;
    }

    return labels?.[String(value)] ?? fallback ?? String(value);
  }
}