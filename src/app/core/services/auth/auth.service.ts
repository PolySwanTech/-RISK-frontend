import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Utilisateur } from '../../models/Utilisateur';
import { environment } from '../../../environments/environment.prod';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  base = environment.apiUrl;
  http = inject(HttpClient);
  router = inject(Router);
  
  isLogin$ = new BehaviorSubject<boolean>(false); // Observable for login status
  
  constructor() { }
  
  register(user : Utilisateur){
    return this.http.post<Utilisateur>(this.base + '/auth/register', user);
  }

  decryptToken(){
    const token = sessionStorage.getItem('token');
    return jwtDecode(token ? token : '');
  }

  isTokenExpired(token: any): boolean {
    if (!token.exp) {
      return true; // Si le token n'a pas d'expiration, considère-le comme invalide
    }
  
    const currentTime = Math.floor(Date.now() / 1000); // Temps actuel en secondes
    return token.exp < currentTime;
  }
  
  login(username : string, mdp : string){
    return this.http.post<any>(this.base + '/auth/login', {username : username, password : mdp})
    .subscribe({
      next: res => {
        sessionStorage.setItem('token', res.token);
        this.isLogin$.next(true)
        this.router.navigate(['/dashboard']);
      },
      error: err => {
        alert("Nom ou mot de passe incorrect")
      }
    });;
  }

  logout() {
    sessionStorage.clear();
    this.isLogin$.next(false);
    this.router.navigate(['auth', 'login'])
  }
}
