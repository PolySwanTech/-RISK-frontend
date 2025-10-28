import { RiskTemplate } from "./RiskTemplate";

export class Process {
    id!: string;
    name!: string;
    description?: string;
    actif: boolean = true; // enum côté back (à venir : 'ACTIF' | 'INACTIF' | 'NON_MODIFIABLE')
    parentId?: string | null;
    buName?: string;
    parentName?: string;
    enfants: Process[] = [];
    risks: RiskTemplate[] = [];
    niveau?: number;

    constructor(init?: Partial<Process>) {
        Object.assign(this, init);
    }
}

export interface ProcessDto
    extends Required<
        Pick<
            Process,
            | 'id'
            | 'name'
            | 'description'
            | 'parentId'
            | 'buName'
            | 'parentName'
            | 'risks'
            | 'niveau'
        >
    > {
    enfants: ProcessDto[];
}

export type ProcessCartoDto = Pick<Required<Process>, 'id' | 'name'>;

export type ProcessCreationDto = {
  name: string;
  bu: string;
  parentId?: string | null;
};

export type ProcessUpdateDto = Pick<Required<Process>, 'name' | 'parentId'>;

export type ProcessLightDto = Pick<Process, 'id' | 'name' | 'actif'>;
