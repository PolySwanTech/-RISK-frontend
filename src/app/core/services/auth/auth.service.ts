import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Utilisateur } from '../../models/Utilisateur';
import { environment } from '../../../environments/environment';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { SnackBarService } from '../snack-bar/snack-bar.service';
// import { SnackBarService } from '../snack-bar/snack-bar.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private authBase = environment.apiAuthUrl;
  private base = environment.apiUrl;
  private http = inject(HttpClient);
  private router = inject(Router);

  isLogin$ = new BehaviorSubject<boolean>(false); // Observable for login status

  private permissions: { [teamId: string]: string[] } = {};
  private snackBarService = inject(SnackBarService);

  constructor() { }

  register(user: Utilisateur) {
    return this.http.post<Utilisateur>(this.authBase + '/auth/register', user);
  }

  decryptToken() {
    const token = sessionStorage.getItem('token');
    return token ? jwtDecode(token) : null;
  }

  isTokenExpired(token: any): boolean {
    if (!token.exp) {
      return true; // Si le token n'a pas d'expiration, considère-le comme invalide
    }

    const currentTime = Math.floor(Date.now() / 1000); // Temps actuel en secondes
    return token.exp < currentTime;
  }

  login(username: string, mdp: string) {
    return this.http.post<any>(this.authBase + '/auth/login', { mail: username, password: mdp })
      .subscribe({
        next: res => {
          this.refreshToken()
        },
        error: err => {
          console.error('Login error:', err);
          this.snackBarService.error("Nom ou mot de passe incorrect")
        }
      });;
  }

  refreshToken() {
    return this.http.get<any>(this.base + '/users/refresh-token')
      .subscribe({
        next: _ => {
          this.isLogin$.next(true)
          this.router.navigate(['dashboard']);
        },
        error: err => {
          console.error('Refresh token error:', err);
          this.logout();
        }
      });
  }

  logout() {
    sessionStorage.clear();
    this.isLogin$.next(false);
    this.router.navigate(['auth', 'login'])
  }

  getUUID(): string | null {
    const token: any = this.decryptToken();
    return token?.uuid || null;
  }

  getName(): string | null {
    const token: any = this.decryptToken();
    return token?.username || null;
  }

  getPermissions(): { [teamId: string]: string[] } {
    if (Object.keys(this.permissions).length > 0) return this.permissions;

    const token: any = this.decryptToken();
    return token?.permissions || {};
  }

  hasPermission(permission: string): boolean {
    const permsByTeam = this.getPermissions();

    for (const teamId in permsByTeam) {
      if (permsByTeam[teamId].includes(permission)) {
        return true;
      }
    }

    return false;
  }

  getPermissionsByTeam(teamId: string): string[] {
    const permsByTeam = this.getPermissions();
    return permsByTeam[teamId] ?? [];
  }

  sameUser(userId: string): boolean {
    const id = this.getUUID();
    return id == userId;
  }

  sameUserName(username: string): boolean {
    const name = this.getName();
    return name == username;
  }

}
