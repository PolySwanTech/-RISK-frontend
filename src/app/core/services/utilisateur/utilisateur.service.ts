import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment'
import { Utilisateur } from '../../models/Utilisateur';
import { UtilisateurProfil } from '../../models/UtilisateurProfil';


@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {

  private readonly http: HttpClient = inject(HttpClient);
  
  baseUrl = environment.apiUserUrl + '/user';

  getUsers(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(this.baseUrl);
  }    

  getUserProfiles(): Observable<UtilisateurProfil[]> {
    return this.http.get<UtilisateurProfil[]>(this.baseUrl);
  }  

  updateUserPermissions(userId: string, permissionIds: string[]) {
    return this.http.put(`${this.baseUrl}/${userId}/permissions`, permissionIds);
  }

  updateUser(userId: string, payload: any) {
    return this.http.put(`${this.baseUrl}/${userId}`, payload);
  }  
  
}
