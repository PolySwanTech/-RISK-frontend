import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment'
import { Utilisateur } from '../../models/Utilisateur';
import { UtilisateurProfil } from '../../models/UtilisateurProfil';
import { TeamMember } from '../../models/TeamMember';

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {

  http = inject(HttpClient);
  
  baseUrl = environment.apiUrl + '/users';

  getUsers(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(this.baseUrl);
  }    

  getUser(id: string): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(this.baseUrl + '/' + id);
  }    

  getUserProfiles(): Observable<UtilisateurProfil[]> {
    return this.http.get<UtilisateurProfil[]>(this.baseUrl);
  }  

  updateUser(userId : string, payload: any) {
    return this.http.put<Utilisateur>(`${this.baseUrl}/${userId}`, payload);
  }  

  getUserRoles(id : string | null) {
    let params = new HttpParams();
    if(id){
      params = params.set('id', id);
    }
    return this.http.get<TeamMember[]>(`${this.baseUrl}/roles`, {params : params});
  }

  updateUserRoles(id : string, roles: TeamMember[]) {
    return this.http.put(`${this.baseUrl}/${id}/roles`, roles);
  }
}
