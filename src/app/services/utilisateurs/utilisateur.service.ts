import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environnement/environnement';

@Injectable({
  providedIn: 'root',
})
export class UtilisateurService {
  constructor(private http: HttpClient) {}


  // private apiUrl = 'https://sfvb-gebbbgbsg-bb44ccvbdnfsdgn3.up.railway.app'; // L'URL de l'API
    // private apiUrl = 'http://localhost:3000'; 
   private apiUrl = environment.apiUrl; 


  // Méthode pour obtenir les utilisateurs
  getUsers(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/api/auth/all`, {headers}).pipe(
      catchError((error) => {
        console.error('Erreur de requête API:', error);
        throw error; // Vous pouvez aussi afficher une erreur plus détaillée
      })
    );
  }
  // Méthode pour ajouter un utilisateur
  addUser(userData: any): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/api/auth/add`, userData, {
        // Corriger l'URL ici
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
      .pipe(
        catchError((error) => {
          console.error("Erreur lors de l'ajout de l'utilisateur:", error);
          throw error; // Vous pouvez aussi afficher une erreur plus détaillée
        })
      );
  }

  // Méthode pour mettre à jour un tirage
  updateStatusUtilisateur(id: number, btEnabled: boolean): Observable<any> {
    console.log(`ID: ${id}, btEnabled: ${btEnabled}`);
    return this.http.put(
      `${this.apiUrl}/api/auth/${id}`,
      { btEnabled },
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      }
    );
  }
}
