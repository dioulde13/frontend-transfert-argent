import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000'; // Base URL de l'API

  constructor(private http: HttpClient) {}

  // Connexion de l'utilisateur
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/auth/login`, { email, password });
  }

  rechargerSolde(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/auth/rechargerSolde`, data);
  }

  // Vérification si l'utilisateur est authentifié
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false; // Pas de token, donc non authentifié
    }

    const expiry = this.getTokenExpiry(token);
    if (expiry === null) {
      return false; // Si l'expiration est null, l'utilisateur n'est pas authentifié
    }
    return expiry > Date.now(); // Vérifie si le token est encore valide
  }

  // Sauvegarder le token dans le stockage local
  saveToken(token: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('token', token);
    }
  }

  // Récupérer le token du stockage local
  getToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('token');
    }
    return null;
  }

  // Déconnexion de l'utilisateur
  logout(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('token');
    }
  }

  // Récupérer les informations de l'utilisateur connecté
  getUserInfo(): Observable<any> {
    const token = this.getToken(); // Récupérer le token depuis le stockage local

    if (!token) {
      return throwError(() => new Error('Utilisateur non authentifié'));
    }

    // Ajouter le token au header Authorization
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    // Effectuer une requête GET à l'API
    return this.http.get(`${this.apiUrl}/api/auth/infoUser`, { headers });
  }

  // Fonction pour récupérer l'expiration du token
  private getTokenExpiry(token: string): number | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // Décodage du payload du JWT
      return payload.exp ? payload.exp * 1000 : null; // L'expiration est en secondes
    } catch (e) {
      return null; // Token invalide
    }
  }
}
