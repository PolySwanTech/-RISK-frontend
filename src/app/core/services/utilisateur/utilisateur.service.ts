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

  baseUrl = environment.apiUrl;

  constructor() { }

  getPosts(): Observable<any> {
    return this.http.get(this.baseUrl + '/posts');
  }

  getUsers(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(this.baseUrl + '/user');
  }    

  getUserProfiles(): Observable<UtilisateurProfil[]> {
    return this.http.get<UtilisateurProfil[]>(this.baseUrl + '/user/profiles');
  }  

  updateUserPermissions(userId: string, permissionIds: string[]) {
    return this.http.put(`${this.baseUrl}/user/${userId}/permissions`, permissionIds);
  }
  
}
