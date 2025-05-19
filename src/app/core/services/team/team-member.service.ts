import { Injectable } from '@angular/core';
import { Utilisateur } from '../../models/Utilisateur';

@Injectable({
  providedIn: 'root'
})
export class TeamMemberService {

  constructor() { }

  isValidateurInTeam(user: Utilisateur, teamId: string): boolean {
    if (!user || !user.memberships) return false;

    return user.memberships.some(m =>
      m.team.id === teamId && m.role === 'VALIDATEUR'
    );
  }
}
