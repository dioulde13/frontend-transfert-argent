import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DepenseService {

  // URL de l'API
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }


   // Méthode pour récupérer les données de l'API
   getCompteDepense(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/depense/compte`);
  }

  // Méthode pour récupérer les données de l'API
  getAllDepense(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/depense/liste`);
  }
  // Méthode pour ajouter un partenaire
  ajoutDepense(creditData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/depense/create`, creditData);
  }

}
