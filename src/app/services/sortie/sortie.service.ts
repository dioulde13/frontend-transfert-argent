import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SortieService {
  // URL de l'API
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // Méthode pour récupérer les données de l'API
  getCompteSortie(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/sorties/compte`);
  }

  // Méthode pour récupérer les données de l'API
  getAllSortie(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/sorties/liste`);
  }

  // Méthode pour ajouter une nouvelle entrée
  ajouterSortie(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/sorties/create`, data);
  }

  annulerSortie(code: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/api/sorties/annuler/${code}`, {}); // Ajouter un corps vide
  }

  validerSortie(code: number, data: any): Observable<any> {
    return this.http.put(
      `http://localhost:3000/api/sorties/valider/${code}`,
      data
    );
  }

  ajouterSortieAutres(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/sorties/ajouterAutre`, data);
  }
}
