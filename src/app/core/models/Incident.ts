import { State } from "../enum/state.enum";
import { Cause } from "./Cause";
import { OperatingLoss } from "./OperatingLoss";
import { BaloiseCategoryDto } from "./RiskReferentiel";


export interface Incident {
    id: string;
    reference: string

    title: string | null;
    location: string | null;
    commentaire : string

    declaredAt: Date;
    survenueAt: Date ;
    detectedAt: Date ;
    closedAt: Date | null ;

    risk: string;
    riskName : string | null;
    categoryBaloise : BaloiseCategoryDto;
    cause : Cause;
    process: string ;
    processName?: string ;
    teamId?: string;
    teamName?: string;

    impacts: OperatingLoss[];

    state: State;
    consequences: string[];
    intervenantId?: string | null;
    intervenantName?: string | null;
    creatorId?: string | null;
    creatorName?: string | null;

}

export type IncidentListViewDto = Pick<
  Incident,
  | 'id'
  | 'reference'
  | 'title'
  | 'declaredAt'
  | 'survenueAt'
  | 'state'
  | 'processName'
  | 'riskName'
  | 'creatorName'
  | 'closedAt'
  | 'categoryBaloise'
> & {
  'totalLossAmount': number
};

export type IncidentListDto = Pick<
  Incident,
  'id' | 'reference' | 'title' | 'state' | 'declaredAt' | 'survenueAt' | 'closedAt'
> & {
  'totalLossAmount': number
};

export interface IncidentCreateDto {
  reference: string;
  title: string | null;
  location: string | null;
  commentaire: string | null;
  declaredAt: Date;
  survenueAt: Date | null;
  detectedAt: Date | null;
  teamId: string | null;
  riskId: string | null;
  processId: string | null;
  cause: Cause | null;
  intervenant: string | null;
  state?: State | '';
}
