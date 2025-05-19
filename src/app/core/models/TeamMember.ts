export interface Team {
    id: string;
    name: string;
}

export type TeamRole = 'VALIDATEUR' | 'MEMBRE';

export interface TeamMember {
    id: string;
    role: TeamRole;
    team: Team;
}  