import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment'
import { Utilisateur } from '../../models/Utilisateur';
import { UtilisateurProfil } from '../../models/UtilisateurProfil';
import { TeamRole } from '../../models/TeamMember';

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {

  http = inject(HttpClient);
  
  baseUrl = environment.apiUrl + '/users';

  getUsers(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(this.baseUrl);
  }    

  getUserProfiles(): Observable<UtilisateurProfil[]> {
    return this.http.get<UtilisateurProfil[]>(this.baseUrl);
  }  

  updateUser(user: Utilisateur) {
    return this.http.put(`${this.baseUrl}/update`, user);
  }  

  getUserRoles(userId : string): Observable<TeamRole[]> {
    return this.http.get<TeamRole[]>(`${this.baseUrl}/${userId}/roles`);
  }
}
