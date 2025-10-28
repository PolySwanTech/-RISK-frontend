import { ProcessDto } from "./Process";

export class BusinessUnit {
    id!: string;
    name!: string;
    lm: boolean = false;
    active: boolean = true;
    parentId?: string | null;
    children: BusinessUnit[] = [];
    process: ProcessDto[] = [];
    niveau?: number;

    constructor(init?: Partial<BusinessUnit>) {
        Object.assign(this, init);
    }
}

export type BusinessUnitDto = Required<
    Pick<BusinessUnit, 'id' | 'name' | 'lm' | 'parentId' | 'process' | 'niveau'>
>;

export interface BusinessUnitWithChildDto
    extends Required<
        Pick<BusinessUnit, 'id' | 'name' | 'lm' | 'parentId' | 'process'>
    > {
    children: BusinessUnitWithChildDto[];
}

export type BusinessUnitCreateDto = Pick<
    Required<BusinessUnit>,
    'name' | 'lm' | 'parentId'
>;

export type BusinessUnitUpdateDto = Partial<
  Omit<BusinessUnit, 'children' | 'process'>
> & { id: string };